---
license: MIT
language: TypeScript
---

## Features
- Hand-drawn style: Boxes, arrows and text that look sketched, so a diagram reads as a draft, not a spec.
- No account needed: Open the site and draw; work is saved in your browser.
- Live collaboration: Share a link to draw together, with end-to-end encryption.
- Open file format: Scenes save as `.excalidraw` JSON, and PNG/SVG exports can embed the scene so they stay editable.
- Libraries: Reusable shape sets for cloud architecture, UI wireframes, flowcharts and more.
- Mermaid import: Paste a Mermaid diagram and get an editable Excalidraw version.

## Strengths
- Very quick to use: arrows bind to shapes, and keyboard shortcuts cover almost everything.
- Diagrams can live in your repo next to the code they describe.
- Embeddable as a React component (`@excalidraw/excalidraw`), plus VS Code and Obsidian integrations.
- Free and open source; the paid Excalidraw+ adds team workspaces but isn't needed.

## Watch out for
- The sketchy look isn't right for polished, formal documentation.
- Very large diagrams get sluggish, and there's no real layering or page structure.
- Diagrams aren't linked to data or code, so they go stale like any drawing.
- Browser-local storage is easy to lose; save files somewhere real.

## Alternatives
- draw.io (diagrams.net): More precise shapes and formal notation, with a clunkier feel.
- Mermaid or D2: Diagrams as text, rendered automatically; better for diagrams that change often.
- tldraw: A similar infinite-canvas whiteboard, also embeddable, with a different licence.
- Miro or FigJam: Hosted whiteboards with more workshop features, paid per seat.

## In depth
### Keep diagrams with the code
Save to `docs/architecture.excalidraw` and commit it. Because the file is JSON, diffs show what changed, and anyone can reopen it at excalidraw.com or in the VS Code extension. Exporting to `architecture.excalidraw.svg` with the scene embedded gives you an image that renders in Markdown on GitHub and can still be edited.

### Embed it in a React app

```bash
npm install @excalidraw/excalidraw
```

```tsx
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

export default function Board() {
  return (
    <div style={{ height: 600 }}>
      <Excalidraw onChange={(elements) => save(elements)} />
    </div>
  );
}
```

### Good to know
- Press `?` in the editor for the full shortcut list; number keys pick tools.
- The library browser at libraries.excalidraw.com has free shape packs for AWS, Azure, GCP, Kubernetes and more.
- Self-hosting the editor is a single static app, available as a Docker image.
