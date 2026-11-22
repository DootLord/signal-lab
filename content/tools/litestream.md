---
license: Apache-2.0
language: Go
---

## Features
- Continuous replication: Streams SQLite's write-ahead log (WAL) to object storage, typically within a second or so of each write.
- Many destinations: S3 and S3-compatible storage (Backblaze B2, Cloudflare R2, MinIO), Google Cloud Storage, Azure Blob, SFTP or a local path.
- Point-in-time restore: Restore the latest state or a specific timestamp with one command.
- Snapshots and retention: Periodic snapshots plus WAL segments, with configurable retention.
- Process supervision: `litestream replicate -exec "your-app"` runs your app as a child process and replicates alongside it.
- No app changes: Works with any SQLite database; your code doesn't know it's there.

## Strengths
- Makes "just use SQLite in production" a realistic choice for single-server apps.
- Very cheap: object storage costs pennies, and there's no database server to run.
- Restores are straightforward and easy to test, which most backup setups can't claim.
- Simple to run as a sidecar or as part of your container's entrypoint.

## Watch out for
- It's disaster recovery, not high availability: there's no automatic failover or read replicas.
- Replication is asynchronous, so a crash can lose the last moment of writes.
- Only one Litestream process should replicate a given database, and nothing else should force aggressive WAL checkpoints.
- Test your restore path regularly, as with any backup.

## Alternatives
- LiteFS: From the same author's lineage at Fly.io, offering live replicas across nodes with a FUSE file system; more complex.
- Cron + sqlite3 .backup: Simple periodic snapshots, but you lose everything since the last one.
- Postgres or MySQL: Built-in replication and HA, at the cost of running a database server.
- rqlite / dqlite: Distributed SQLite with Raft for real high availability.

## In depth
### How it works
SQLite in WAL mode writes changes to a separate log file before checkpointing them into the main database. Litestream holds a read transaction to control checkpointing, copies new WAL frames as they appear, and ships them to your replica destination in small segments, plus periodic full snapshots. Restoring means downloading the latest snapshot and replaying the WAL segments after it.

### Configuration

```yaml
# /etc/litestream.yml
dbs:
  - path: /app/data/app.sqlite
    replicas:
      - type: s3
        bucket: my-backups
        path: app.sqlite
        endpoint: https://s3.eu-central-1.amazonaws.com
        retention: 72h
```

Credentials come from the usual `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

### The container pattern
Restore on boot if the database is missing, then run the app under Litestream:

```bash
litestream restore -if-db-not-exists -if-replica-exists /app/data/app.sqlite
exec litestream replicate -exec "node dist/server/entry.mjs"
```

This makes the server effectively disposable: a fresh container rebuilds its database from object storage and carries on.

### Good to know
- Enable WAL mode in your app (`PRAGMA journal_mode = WAL`); Litestream requires it.
- `litestream restore -timestamp 2026-11-01T12:00:00Z ...` restores to a point in time.
