---
license: Apache-2.0
language: TypeScript
---

## Features
- Three engines: Chromium, Firefox and WebKit (Safari's engine) from one API, plus mobile emulation.
- Auto-waiting: Actions wait for elements to be visible, stable and enabled, which removes most manual sleeps.
- User-facing locators: `getByRole`, `getByLabel` and `getByText` target what users see, not brittle CSS paths.
- Trace viewer: Replay a failed run step by step, with DOM snapshots, network, console and screenshots.
- Codegen and UI mode: Record tests by clicking, and run and debug them in a watch-mode UI.
- Built-in runner: Parallel workers, retries, sharding across CI machines, fixtures and HTML reports.

## Strengths
- Far less flaky than Selenium-era tests, mainly thanks to auto-waiting and test isolation.
- Debugging CI failures is practical: download the trace and see exactly what happened.
- Also handles API testing, network mocking, multiple tabs, iframes and file downloads.
- Official bindings for Python, Java and .NET as well as TypeScript/JavaScript.

## Watch out for
- Browser downloads are several hundred MB; cache them in CI and use `--with-deps` on Linux.
- End-to-end suites are still slower and more expensive than unit tests, so keep them focused.
- "WebKit" is not the same as real Safari on macOS or iOS; edge cases can differ.
- Component testing exists but is still marked experimental.

## Alternatives
- Cypress: A polished developer experience, but runs inside the browser, with limits on tabs, origins and browsers.
- Selenium / WebDriver: The long-standing standard, with the widest language and grid support, and more boilerplate.
- Vitest browser mode: For component-level tests in a real browser.
- agent-browser and Playwright MCP: Let AI agents drive a browser, using Playwright-style automation underneath.

## In depth
### A first test

```ts
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

### Commands you'll use

```bash
npx playwright test                 # run everything, in parallel
npx playwright test --ui            # interactive watch mode
npx playwright test --project=webkit
npx playwright codegen localhost:3000
npx playwright show-trace trace.zip
npx playwright test --shard=1/4     # split across CI machines
```

### Good to know
- Set `trace: 'on-first-retry'` in `playwright.config.ts` to record traces only when a test fails.
- Save a logged-in `storageState` once in a setup project and reuse it, so every test doesn't log in.
- `webServer` in the config starts your dev server before the tests run.
