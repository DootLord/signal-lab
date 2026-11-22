import { readWorkspace, writeWorkspace } from '../../lib/store';
import { validWorkspace } from '../../lib/domain';
import type { Workspace } from '../../lib/data';
export const dynamic='force-dynamic';
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{return response(await readWorkspace())}catch{return response({error:'Your workspace could not be loaded. Please retry.'},503)}}
export async function PUT(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'Invalid request origin.'},403);
 try{const raw=await request.text();if(raw.length>1500000)return response({error:'Workspace is too large.'},413);const data=JSON.parse(raw) as Workspace;if(!validWorkspace(data))return response({error:'Please check the required fields and source URL.'},400);
 const current=await readWorkspace();data.discovery={...current.discovery!,settings:data.discovery?.settings||current.discovery!.settings};
 const revision=await writeWorkspace(data);return revision?response({revision,discovery:data.discovery}):response({error:'This workspace changed in another tab or discovery scan. Reload before saving.'},409);
 }catch{return response({error:'Changes could not be saved. Please retry.'},503)}
}
