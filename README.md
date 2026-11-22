# Signal Lab

A private AI research workbench for a TypeScript / Node.js developer. Built with TypeScript, React and Vinext; durable records use Cloudflare D1.

- Research backlog with topic, decision, evidence, search and sort filters.
- Primary-source briefs distinguish findings, evidence limitations and proposed application ideas.
- Saved research and side-by-side comparisons, plus three implementation trade-off guides.
- Linked experiment plans with hypotheses, implementation, success criteria, results and follow-up actions.
- Workspace JSON export, optimistic concurrency protection, and server-side record validation.

The initial research is a curated snapshot reviewed on 21 November 2026. AI Scout adds practical development workflows through a linked cloud researcher; its findings are marked for user review. Discovery preferences and source history persist with the workspace. The original experiment plans have not been run. Experiments run in your own development environment.

For independent hosting, use the included Node.js/SQLite runtime and Dockerfile. See [the Coolify guide](docs/Coolify_Setup_Guide.md) and [discovery contract](docs/DISCOVERY.md). `npm run selfhost:build` builds the shared interface; `npm run selfhost:start` starts the server. `npm run test:scout` verifies the updater and self-hosted API.

## Local development

Use the Sites preview workflow. Generate schema migrations with `npm run db:generate`; migrations contain schema only. The workspace API serves the starter dataset until the first saved edit. Published data persists separately from source and deployments.

## Validation

TypeScript check: `npx tsc --noEmit`. Production build through the Sites build helper. Browser checks cover topic and decision filters, research briefs, persistence after reload, comparison selection, approach guides, experiment saving and completion validation.
