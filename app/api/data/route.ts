import { createClient } from '@/lib/supabase/server';
import { isRequestOriginAllowed } from '@/lib/request-origin';
import { exportCsv } from '@/lib/csv';
import { validateImport } from '@/lib/import-validation';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return Response.json({error:'Entre na sua conta.'},{status:401});
  const url = new URL(request.url), company = url.searchParams.get('companyId');
  const type = url.searchParams.get('type');
  if (!company || !['contacts','opportunities'].includes(type || '')) return Response.json({error:'Exportação inválida.'},{status:400});
  const { data: member, error } = await s.from('memberships').select('company_id').eq('company_id', company).eq('user_id', user.id).maybeSingle();
  if (error || !member) return Response.json({error:'Empresa não autorizada.'},{status:403});
  const rows: unknown[][] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = type === 'contacts'
      ? await s.from('contacts').select('id,name,phone,organization,created_at').eq('company_id',company).order('id').range(offset,offset+999)
      : await s.from('opportunities').select('id,title,contact_id,estimated_value,status,source,next_action_type,next_action_at,created_at,closed_at').eq('company_id',company).order('id').range(offset,offset+999);
    if (result.error) return Response.json({error:'Exportação falhou. Tente novamente.'},{status:500});
    rows.push(...(result.data || []).map(row => Object.values(row)));
    if ((result.data?.length || 0) < 1000) break;
    if (rows.length >= 50000) return Response.json({error:'Exportação excede 50 mil registros; solicite recuperação assistida.'},{status:413});
  }
  const headers = type === 'contacts' ? ['id','nome','telefone','empresa','criado_em'] : ['id','oportunidade','contato_id','valor','status','origem','próxima_acao','data_proxima_acao','criado_em','fechado_em'];
  return new Response(exportCsv(headers,rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${type}.csv"`,'Cache-Control':'no-store'}});
}
export async function POST(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get('origin'),request.url,process.env.RAILWAY_PUBLIC_DOMAIN)) return Response.json({error:'Origem não permitida.'},{status:403});
  const s = await createClient();
  const {data:{user}} = await s.auth.getUser();
  if (!user) return Response.json({error:'Entre na sua conta.'},{status:401});
  try {
    const raw = await request.text();
    if (raw.length > 1_100_000) return Response.json({error:'Arquivo excede o limite.'},{status:413});
    const body = JSON.parse(raw);
    const {data:stages,error} = await s.from('pipeline_stages').select('id,name,kind').eq('company_id',body.companyId);
    if (error || !stages?.length) return Response.json({error:'Empresa não autorizada.'},{status:403});
    const preview = validateImport(body.csv,stages,body.mapping);
    if (!body.confirm || preview.errors.length) return Response.json(preview,{status:preview.errors.length ? 422 : 200});
    if (typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId)) return Response.json({error:'ID da importação inválido.'},{status:400});
    const result = await s.rpc('import_opportunities',{p_company_id:body.companyId,p_request_id:body.requestId,p_rows:preview.commands});
    if (result.error) return Response.json({error:result.error.code==='42501'?'Acesso de escrita indisponível.':result.error.code==='P0001'?result.error.message:'Importação cancelada; nenhuma linha deste lote foi gravada.'},{status:400});
    return Response.json(result.data);
  } catch { return Response.json({error:'CSV inválido. Confira o formato e o mapeamento.'},{status:400}); }
}
