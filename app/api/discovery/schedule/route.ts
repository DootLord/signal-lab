import { readWorkspace, writeWorkspace } from '../../../lib/store';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'Invalid origin'},403);
 try{const s=await request.json() as {label:string;enabled:boolean;automationId?:string};if(typeof s.label!=='string'||s.label.length>200||typeof s.enabled!=='boolean'||(s.automationId!==undefined&&(typeof s.automationId!=='string'||s.automationId.length>200)))return response({error:'Invalid schedule metadata'},400);
 for(let i=0;i<3;i++){const w=await readWorkspace();w.discovery!.schedule=s;const revision=await writeWorkspace(w);if(revision)return response({schedule:s,revision})}return response({error:'Workspace is busy'},409);
 }catch{return response({error:'Schedule metadata could not be saved'},503)}
}
