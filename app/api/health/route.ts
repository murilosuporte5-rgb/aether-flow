export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  let database: 'ok' | 'protected' | 'degraded' = 'degraded';
  try {
    const supabase = await createClient();
    const check = supabase.from('companies').select('id').limit(1);
    const result = await Promise.race([
      check,
      new Promise<{error:Error}>((resolve) => setTimeout(() => resolve({error:new Error('timeout')}), 1200)),
    ]);
    if (!result.error) database = 'ok';
    else if ('code' in result.error && result.error.code === '42501') database = 'protected';
  } catch { /* liveness remains available while readiness is reported below */ }
  return Response.json({status:'ok',product:'Aether Flow',checks:{database}}, {headers:{'Cache-Control':'no-store'}});
}
