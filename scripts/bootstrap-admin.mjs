import {createClient} from '@supabase/supabase-js';

const email=process.argv[2]?.trim().toLowerCase();
const baseUrl=process.env.APP_BASE_URL;
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SECRET_KEY;
if(!email||!/^\S+@\S+\.\S+$/.test(email)||!baseUrl||!url||!key){
 console.error('Uso: node --env-file=.env.local scripts/bootstrap-admin.mjs voce@aetherworks.com.br');
 process.exit(1);
}
const client=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
let found;
for(let page=1;!found;page++){
 const {data,error}=await client.auth.admin.listUsers({page,perPage:100});
 if(error)throw error;
 found=data.users.find(user=>user.email?.toLowerCase()===email);
 if(data.users.length<100)break;
}
let user=found;
if(!user){
 const {data,error}=await client.auth.admin.inviteUserByEmail(email,{redirectTo:`${baseUrl}/activate`});
 if(error||!data.user)throw error||new Error('Convite sem usuário.');
 user=data.user;
}
const {error}=await client.from('aether_admins').upsert({user_id:user.id});
if(error)throw error;
console.log(found?`Administrador vinculado: ${email}`:`Administrador convidado: ${email}`);
