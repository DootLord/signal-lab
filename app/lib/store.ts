import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db';
import { workspaces } from '../../db/schema';
import { emptyWorkspace, hydrateWorkspace } from './domain';
import type { Workspace } from './data';
const key='personal-workspace';
export async function readWorkspace():Promise<Workspace>{const rows=await getDb().select().from(workspaces).where(eq(workspaces.id,key));return rows[0]?hydrateWorkspace({...JSON.parse(rows[0].data),revision:rows[0].updatedAt}):emptyWorkspace();}
export async function writeWorkspace(data:Workspace){const db=getDb(),revision=crypto.randomUUID();const {revision:old,...body}=data;const values={id:key,data:JSON.stringify(body),updatedAt:revision};const rows=old==='initial'?await db.insert(workspaces).values(values).onConflictDoNothing().returning():await db.update(workspaces).set({data:values.data,updatedAt:revision}).where(and(eq(workspaces.id,key),eq(workspaces.updatedAt,old||''))).returning();return rows.length?revision:null;}
