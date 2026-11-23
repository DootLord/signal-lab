// Short introductions for topic landing pages (/topics/<tag>). Topics without
// one get a generated sentence instead. Keep them factual and specific: what the
// topic covers and what kind of tools a developer will find on the page.
const INTROS: Record<string, string> = {
  cli: 'Command-line tools that make everyday terminal work faster: finding files and text, reading code, moving around projects and automating chores. Most are single binaries you can install in a minute and keep for years.',
  terminal: 'Tools that improve life inside the terminal itself, from prompts and multiplexers to pagers and viewers that make output easier to read.',
  shell: 'Tools that plug into bash, zsh, fish or PowerShell: smarter history, directory jumping, per-project environments and prompts. Most need one line in your shell config.',
  productivity: 'Small tools that remove friction from daily development work. Each one saves a few seconds or a few keystrokes, many times a day.',
  devops: 'Tools for building, shipping and running software: CI, containers, infrastructure, secrets and operations. Weighted towards things a small team can adopt without a platform department.',
  infrastructure: 'Tools for running services: web servers, proxies, gateways and the plumbing between them.',
  'self-hosted': 'Software you can run on your own server instead of paying for a SaaS: monitoring, notifications, translation and more. Most run as a single Docker container.',
  docker: 'Tools that work with Docker and containers, for local development, testing against real services, and running containers with less overhead.',
  kubernetes: 'Tools that make Kubernetes clusters easier to watch, debug and operate day to day.',
  ci: 'Tools for continuous integration: running pipelines locally, keeping dependencies current and catching problems before they reach the main branch.',
  automation: 'Tools that do repetitive work for you: re-running commands on change, updating dependencies and opening pull requests.',
  testing: 'Testing tools beyond the unit-test runner: HTTP and API tests in plain text, end-to-end browser tests, real databases in containers, and prompt evaluation for LLM apps.',
  api: 'Tools for designing, calling, documenting and testing HTTP APIs, including Git-friendly alternatives to Postman.',
  http: 'Tools for working with HTTP directly: sending and inspecting requests, testing responses and debugging traffic.',
  https: 'Tools that make HTTPS painless, from trusted local certificates to servers that obtain and renew certificates automatically.',
  security: 'Developer-friendly security tools: secrets kept safely in Git, local certificates, secret scanning and dependency hygiene.',
  git: 'Tools that make Git easier to use and review: terminal UIs, better diffs, hooks, worktrees and Git-compatible alternatives.',
  ai: 'AI tools for developers that are useful today: coding agents, review tools, local models, prompt testing and the utilities that grew up around them.',
  llm: 'Tools for building with and running large language models: local inference, command-line access, prompt testing and evaluation.',
  'coding-agent': 'Coding agents and the tools around them: planning, review, memory and running several agents in parallel.',
  'coding-assistant': 'AI assistants that read and edit your code, from terminal pair programmers to full coding agents.',
  'code-review': 'Tools that help review code, whether written by people or agents, with fewer missed issues and less noise.',
  python: 'Tools for Python developers: packaging and environments, plus general developer tools that happen to be written in or for Python.',
  javascript: 'Tools for JavaScript and Node.js developers: runtimes, formatters, linters and test tooling.',
  typescript: 'Tools for TypeScript projects, and developer tools written in TypeScript that are worth knowing whatever your stack.',
  rust: 'Developer tools written in Rust. Most are fast, ship as a single binary and replace an older Unix tool or a slower JavaScript one.',
  go: 'Developer tools written in Go, typically shipped as one static binary with no runtime to install.',
  databases: 'Tools for working with databases in development and production: backups, test containers and local tooling.',
  search: 'Fast search tools for code, files and text, mostly replacements for grep and find that respect .gitignore.',
  environment: 'Tools that manage per-project environments: language versions, environment variables and project-local settings.',
  'local-dev': 'Tools that make local development closer to production, without the setup pain.',
  monitoring: 'Tools for knowing when something breaks: uptime checks, status pages and alerts.',
};

export function topicIntro(tag: string, label: string, count: number) {
  return INTROS[tag] ?? `Developer tools tagged ${label}: ${count === 1 ? 'one tool' : `${count} tools`} reviewed by hand, each with what it replaces, when to reach for it and how to try it.`;
}
