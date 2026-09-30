import {createClient} from '@/lib/supabase/server';
import {isAetherAdmin} from '@/lib/provision';
export async function POST() {
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return Response.json({error:'Entre na sua conta.'},{status:401});
 if(!await isAetherAdmin(s,user.id))return Response.json({error:'Administrador requerido.'},{status:403});
 return Response.json({error:'Use Criar acesso em /admin com senha inicial. Convites por e-mail foram substituídos.'},{status:410});
}
