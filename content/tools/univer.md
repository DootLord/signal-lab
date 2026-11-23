---
license: Apache-2.0
language: TypeScript
---

## Features
- Embeddable spreadsheet: A full editor with formulas, cell styles, merged cells, freeze panes, filtering, sorting, validation and conditional formatting.
- Documents too: Rich-text editing with paragraphs, lists, links and comments.
- Formula engine: Excel-style formulas and defined names, recalculated as data changes.
- Headless mode: Use the same models, commands and calculation in Node.js with no editor.
- Facade API: A high-level API for reading and writing workbooks, sheets and ranges from your app or an agent.
- Plugin architecture: Features are plugins with clear boundaries, combined with undo/redo that spans features.

## Strengths
- A real open-source alternative to expensive commercial grid and spreadsheet components.
- The same engine works in the browser and on the server, so generated workbooks match what users see.
- Good fit for agents: code can fill in a workbook, recalculate it and read the results back.
- Active development, with releases most weeks.

## Watch out for
- The open-source part is the Web SDK core. Real-time collaboration, edit history, and Office file import/export are in the commercial Server SDK.
- Keep all `@univerjs/*` packages on exactly the same version, or things break.
- It's a heavy dependency, far bigger than a simple data grid. Don't use it for a sortable table.
- The demos show commercial features alongside open-source ones; check the feature comparison before you commit.

## Alternatives
- Handsontable or SpreadJS: Mature commercial spreadsheet components.
- AG Grid: A data grid, not a spreadsheet, and the better choice when you don't need formulas.
- Luckysheet: Univer's predecessor from the same team, no longer actively developed.
- SheetJS or ExcelJS: Read and write .xlsx files in code, with no editor.

## In depth
### Add a spreadsheet to a web app

```bash
pnpm add @univerjs/presets @univerjs/preset-sheets-core
```

```ts
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import '@univerjs/preset-sheets-core/lib/index.css';

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS) },
  presets: [UniverSheetsCorePreset({ container: 'app' })],
});

univerAPI.createWorkbook({});
```

This needs a `<div id="app">` on the page and uses only open-source packages.

### Work with the data
The returned `univerAPI` lets your app set values, write formulas and read recalculated results. One example is a quotation sheet where your code updates a quantity and reads the new total. The headless guide shows the same flow in Node.js with no editor, which is useful for generating reports or letting an agent work with a spreadsheet.

### Good to know
- In React or Vue, keep the instance from `createUniver` and call `univer.dispose()` when the component unmounts.
- Presets are the easy path; "plugin mode" gives finer control over what is loaded.
