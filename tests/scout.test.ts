import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { initialWorkspace, defaultDiscovery } from '../app/lib/data.ts';
import type { Research, Workspace } from '../app/lib/data.ts';
import { hydrateWorkspace, ingestScan, validWorkspace } from '../app/lib/domain.ts';
import { createSignalServer } from '../selfhost/server.ts';
const candidate:Research={...structuredClone(initialWorkspace.research[0]),id:'new-workflow',title:'A practical new workflow',source:'https://example.org/original-workflow',discovery:{task:'Testing & QA',approach:'Verification loop fixture',before:'Manually repeat the same checks.',after:'Run bounded tool checks with an agent.',benefit:'Hypothesis: fewer repeated manual steps.',caveats:'Requires review; no measured savings yet.',foundAt:'',reviewed:false}};
const report={runId:'run-id',examined:1,summary:'One new practical workflow.',sources:[{title:'Original workflow',url:candidate.source}],items:[candidate]};
test('new scan adds a reviewable discovery without altering existing decisions or experiment results',()=>{const before=hydrateWorkspace(structuredClone(initialWorkspace));before.experiments[0].results='Preserve this observation';const result=ingestScan(before,report);assert.equal(result.run.added,1);assert.equal(result.workspace.research[0].discovery?.reviewed,false);assert.ok(result.workspace.research[0].discovery?.foundAt);assert.deepEqual(result.workspace.research.slice(1),before.research);assert.equal(result.workspace.experiments[0].results,'Preserve this observation')});
test('same run is idempotent and tracking URL variants do not produce duplicate ideas',()=>{const first=ingestScan(initialWorkspace,report);const replay=ingestScan(first.workspace,report);assert.equal(replay.replayed,true);assert.equal(replay.workspace.research.length,first.workspace.research.length);const duplicate=ingestScan(first.workspace,{...report,runId:'second-run',items:[{...candidate,id:'other',source:candidate.source+'?utm_source=feed'}]});assert.equal(duplicate.run.added,0);assert.equal(duplicate.run.duplicates,1)});
test('paused scans and unsupported source protocols cannot write',()=>{const w=hydrateWorkspace(initialWorkspace);w.discovery={...structuredClone(defaultDiscovery),settings:{...defaultDiscovery.settings,enabled:false}};assert.throws(()=>ingestScan(w,report),/paused/);assert.throws(()=>ingestScan(initialWorkspace,{...report,items:[{...candidate,source:'javascript:alert(1)'}]}));});
test('completing an experiment requires recorded results and next steps on the server',()=>{const w=structuredClone(initialWorkspace);w.experiments[0].status='Completed';assert.equal(validWorkspace(w),false);w.experiments[0].results='Measured result';w.experiments[0].followup='Keep or reject based on measurements';assert.equal(validWorkspace(w),true)});
test('self-host API enforces auth, persists scan state after restart, detects stale edits and scopes scanner access',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'signal-lab-test-'));const databasePath=join(dir,'workspace.sqlite');const authUser='test-user',authPassword='unique-test-only-password',ingestToken='test-token-with-at-least-32-characters';
 const options={databasePath,staticPath:resolve('dist-selfhost/site'),authUser,authPassword,ingestToken};
 let server=createSignalServer(options);const listen=()=>new Promise<string>(resolve=>server.listen(0,'127.0.0.1',()=>{const a=server.address() as {port:number};resolve('http://127.0.0.1:'+a.port)}));
 let base=await listen();const basic='Basic '+Buffer.from(authUser+':'+authPassword).toString('base64');
 const request=(path:string,method='GET',body?:unknown,authorization=basic)=>fetch(base+path,{method,headers:{Authorization:authorization,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 try{
  assert.equal((await fetch(base+'/api/workspace')).status,401);
  assert.equal((await request('/health','GET',undefined,'')).status,200);
  assert.equal((await request('/','GET')).status,200);
  const before=await (await request('/api/workspace')).json() as Workspace;
  const scan=await request('/api/discovery','POST',report,'Bearer '+ingestToken);assert.equal(scan.status,200);assert.equal(((await scan.json()) as {run:{added:number}}).run.added,1);
  assert.equal((await request('/api/workspace','GET',undefined,'Bearer '+ingestToken)).status,401);
  assert.equal((await request('/api/workspace','PUT',before)).status,409);
  const replay=await (await request('/api/discovery','POST',report,'Bearer '+ingestToken)).json() as {replayed:boolean};assert.equal(replay.replayed,true);
  const live=await (await request('/api/workspace')).json() as Workspace;live.research[0].decision='Skip';const saved=await request('/api/workspace','PUT',live);assert.equal(saved.status,200);
  await new Promise<void>(r=>server.close(()=>r()));server=createSignalServer(options);base=await listen();
  const restored=await (await request('/api/workspace')).json() as Workspace;assert.equal(restored.research[0].decision,'Skip');assert.equal(restored.discovery?.runs.length,1);
  const broken=await (await request('/api/discovery','POST',{...report,runId:'broken',items:[{...candidate,source:'javascript:alert(1)'}]})).status;assert.equal(broken,400);
 }finally{await new Promise<void>(r=>server.close(()=>r()));rmSync(dir,{recursive:true,force:true})}
});
