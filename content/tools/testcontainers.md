---
license: MIT
language: TypeScript (Node.js library)
---

## Features
- Real dependencies in tests: Start Postgres, MySQL, Redis, Kafka, MongoDB, LocalStack and many more in Docker, straight from test code.
- Ready-made modules: Pre-configured modules give you a typed container with helpers like connection strings and credentials.
- Wait strategies: Tests only start once the service is actually ready (log message, port, HTTP health check), not just when the container starts.
- Automatic clean-up: A small "reaper" container removes everything after the run, even if your test process crashes.
- Compose support: Spin up an existing docker-compose file for a test run when you need several services together.
- Many languages: The same model and module names across Java, Go, .NET, Node.js, Python, Rust and others.

## Strengths
- Integration tests hit the same database engine and version you run in production, which catches SQL, migration and driver bugs that mocks hide.
- Every test run gets a fresh, isolated environment, so there's no shared test database to drift or clash.
- Works the same on laptops and CI as long as Docker is available.
- Removes hand-written setup scripts and "start the DB first" instructions from READMEs.

## Watch out for
- Needs a Docker-compatible runtime in CI and locally, and Docker-in-Docker setups can take some configuring.
- Container start-up adds seconds per suite; share one container per test file or suite rather than per test.
- First runs pull images, so cache them in CI to keep pipelines fast.
- It's still slower than unit tests, so keep it for the integration layer.

## Alternatives
- docker compose test environment: Start services before the test run. Simpler, but shared state and manual lifecycle.
- In-memory fakes (pg-mem, H2, SQLite): Very fast, but behave differently from the real engine in subtle ways.
- Mocking the data layer: Fast and isolated, but tests the mock rather than your SQL.

## In depth
### How it works
Testcontainers talks to the Docker API from inside your test process. When a test asks for, say, a Postgres container, the library pulls the image if needed, starts it on a random free port, waits until the database is genuinely accepting connections, and hands you the connection details. A small companion container watches your test session and removes everything when it ends, so crashed runs don't leave containers behind.

### A Node.js example with Vitest

```ts
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, expect, test } from 'vitest';
import pg from 'pg';

let container: StartedPostgreSqlContainer;
let client: pg.Client;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  client = new pg.Client({ connectionString: container.getConnectionUri() });
  await client.connect();
  // run your migrations here
}, 60_000);

afterAll(async () => {
  await client.end();
  await container.stop();
});

test('stores and reads a user', async () => {
  await client.query('CREATE TABLE users (id serial PRIMARY KEY, name text)');
  await client.query("INSERT INTO users (name) VALUES ('Ada')");
  const { rows } = await client.query('SELECT name FROM users');
  expect(rows[0].name).toBe('Ada');
});
```

### Tips
- Pin image versions (`postgres:16-alpine`, not `postgres:latest`) so tests are reproducible.
- Run migrations once per container, then wrap each test in a transaction you roll back, which is much faster than recreating tables.
- In GitHub Actions, Docker is available on Ubuntu runners out of the box.
