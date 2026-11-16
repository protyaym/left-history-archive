# Left history archive

A public reference on the history of the communist movement in the Indian subcontinent, starting with Bengal.

This repository was merged on 17/11/2026 from three: `archive-starter` (now `site/`), `left-history-backend` (now `studio/`) and `left-history-editorial` (now `docs/`). Their history is kept.

| Folder | What it holds |
|---|---|
| `studio/` | Sanity Studio, where all content is edited |
| `site/` | The public website and its JSON snapshot of the content |
| `tools/` | The sync and validation scripts |
| `docs/` | Brief, Bible (the rules), plan, how-it-works, editorial log |

Start with `docs/HOW-IT-WORKS.md`, or open `site/status.html` on the running site for the same explanation with live numbers.

To see the site on your own machine:

```
python -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.
