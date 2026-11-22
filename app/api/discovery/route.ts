import { readWorkspace, writeWorkspace } from '../../lib/store';
import { discoveryBrief, ingestScan } from '../../lib/domain';
import type { ScanInput } from '../../lib/domain';
export const dynamic='force-dynamic';
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{return response(discoveryBrief(await readWorkspace()))}catch{return response({error:'Discovery brief could not be loaded.'},503)}}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'Invalid request origin.'},403);
 try{const raw=await request.text();if(raw.length>200000)return response({error:'Report is too large.'},413);const input=JSON.parse(raw) as ScanInput;
  for(let attempt=0;attempt<3;attempt++){const current=await readWorkspace();const result=ingestScan(current,input);if(result.replayed)return response({run:result.run,replayed:true});const revision=await writeWorkspace(result.workspace);if(revision)return response({run:result.run,revision});}
  return response({error:'Workspace is busy. Retry this same runId.'},409);
 }catch(e){return response({error:e instanceof Error?e.message:'Discovery report could not be saved.'},400)}
}
