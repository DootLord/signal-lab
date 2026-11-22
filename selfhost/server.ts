import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, existsSync, createReadStream } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { emptyWorkspace, hydrateWorkspace, validWorkspace, ingestScan, discoveryBrief } from '../app/lib/domain.ts';
import type { Workspace } from '../app/lib/data.ts';
import type { ScanInput } from '../app/lib/domain.ts';
export type ServerOptions={databasePath:string;staticPath:string;authUser:string;authPassword:string;ingestToken?:string};
const same=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
const contentTypes:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.md':'text/markdown; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2'};
export function createSignalServer(options:ServerOptions){
 mkdirSync(dirname(options.databasePath),{recursive:true});const db=new DatabaseSync(options.databasePath);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL);');
 const read=():Workspace=>{const row=db.prepare('SELECT data,updated_at FROM workspaces WHERE id=?').get('personal-workspace') as {data:string;updated_at:string}|undefined;return row?hydrateWorkspace({...JSON.parse(row.data),revision:row.updated_at}):emptyWorkspace()};
 const write=(w:Workspace)=>{const revision=randomUUID();const {revision:old,...body}=w;const raw=JSON.stringify(body);const result=old==='initial'?db.prepare('INSERT OR IGNORE INTO workspaces (id,data,updated_at) VALUES (?,?,?)').run('personal-workspace',raw,revision):db.prepare('UPDATE workspaces SET data=?,updated_at=? WHERE id=? AND updated_at=?').run(raw,revision,'personal-workspace',old||'');return result.changes?revision:null};
 const server=createServer(async(req,res)=>{
  const reply=(status:number,body:unknown)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body))};
  try{
   const url=new URL(req.url||'/', 'http://localhost'),pathname=url.pathname;
   if(pathname==='/health'){db.prepare('SELECT 1').get();return reply(200,{ok:true})}
   const auth=req.headers.authorization||'';
   const service=!!options.ingestToken&&options.ingestToken.length>=32&&auth.startsWith('Bearer ')&&same(auth.slice(7),options.ingestToken)&&pathname==='/api/discovery';
   let basic=false;
   if(auth.startsWith('Basic ')){const decoded=Buffer.from(auth.slice(6),'base64').toString();const index=decoded.indexOf(':');basic=index>0&&same(decoded.slice(0,index),options.authUser)&&same(decoded.slice(index+1),options.authPassword)}
   if(!basic&&!service){res.setHeader('WWW-Authenticate','Basic realm="Signal Lab", charset="UTF-8"');return reply(401,{error:'Sign in to your private workspace.'})}
   if(req.headers.origin){const expected=req.headers['x-forwarded-host']||req.headers.host;const origin=new URL(req.headers.origin);if(origin.host!==expected)return reply(403,{error:'Invalid request origin.'})}
   if(pathname.startsWith('/api/')){
    const current=read();
    if(req.method==='GET'&&pathname==='/api/workspace')return reply(200,current);
    if(req.method==='GET'&&pathname==='/api/discovery')return reply(200,discoveryBrief(current));
    if(!['PUT','POST'].includes(req.method||''))return reply(405,{error:'Unsupported method.'});
    let raw='';for await(const chunk of req){raw+=chunk.toString();if(raw.length>1500000)return reply(413,{error:'Payload too large.'})}
    let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Invalid JSON.'})}
    if(req.method==='PUT'&&pathname==='/api/workspace'){
     if(!validWorkspace(body))return reply(400,{error:'Invalid workspace.'});
     body.discovery={...current.discovery!,settings:body.discovery?.settings||current.discovery!.settings};
     const revision=write(body);return revision?reply(200,{revision,discovery:body.discovery}):reply(409,{error:'Workspace changed. Reload before saving.'});
    }
    if(req.method==='POST'&&pathname==='/api/discovery'){
     const result=ingestScan(current,body as ScanInput);if(result.replayed)return reply(200,{run:result.run,replayed:true});
     const revision=write(result.workspace);return revision?reply(200,{run:result.run,revision}):reply(409,{error:'Workspace changed. Retry the same runId.'});
    }
    return reply(404,{error:'Not found.'});
   }
   if(req.method!=='GET'&&req.method!=='HEAD')return reply(405,{error:'Unsupported method.'});
   const root=resolve(options.staticPath);let file=resolve(root,'.'+decodeURIComponent(pathname));
   if(file!==root&&!file.startsWith(root+sep))return reply(404,{error:'Not found.'});
   if(pathname==='/')file=resolve(root,'index.html');
   if(!existsSync(file))return reply(404,{error:'Not found.'});
   res.writeHead(200,{'Content-Type':contentTypes[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':pathname.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache','Referrer-Policy':'strict-origin-when-cross-origin'});
   if(req.method==='HEAD')return res.end();createReadStream(file).on('error',()=>res.end()).pipe(res);
  }catch(error){reply(400,{error:error instanceof Error?error.message:'Request failed.'})}
 });
 server.on('close',()=>db.close());
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const {AUTH_USER,AUTH_PASSWORD,SCOUT_INGEST_TOKEN}=process.env;
 if(!AUTH_USER||!AUTH_PASSWORD||AUTH_PASSWORD.length<16)throw Error('Set AUTH_USER and a unique AUTH_PASSWORD of at least 16 characters.');
 if(SCOUT_INGEST_TOKEN&&SCOUT_INGEST_TOKEN.length<32)throw Error('SCOUT_INGEST_TOKEN must have at least 32 characters.');
 const server=createSignalServer({databasePath:process.env.DATABASE_PATH||'/app/data/signal-lab.sqlite',staticPath:fileURLToPath(new URL('../dist-selfhost/site',import.meta.url)),authUser:AUTH_USER,authPassword:AUTH_PASSWORD,ingestToken:SCOUT_INGEST_TOKEN});
 const port=Number(process.env.PORT||3000);server.listen(port,'0.0.0.0',()=>console.log(`Signal Lab listening on port ${port}`));
 process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
}
