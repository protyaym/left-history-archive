"""Writes docs/source-review-<name>.md from tools/source-review/<name>.json,
so the readable report and the data the script applies can never disagree.

usage: python -I tools/source-review/render.py tools/source-review/2026-11.json
"""
import json, os, sys

src = sys.argv[1]
name = os.path.splitext(os.path.basename(src))[0]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(src))))
plan = json.load(open(src, encoding="utf-8"))
lib = plan["sources"]

out = []
w = out.append
w(f"# {plan['title']}\n")
w(f"Generated from `tools/source-review/{name}.json` by `tools/source-review/render.py`. Edit the JSON, not this file.\n")
w(f"Date: {plan['date']}.\n")
w("## What this is\n")
w("Every entry that rested only on banned sources (Bible E3, E8), or on none, was checked against sources that could be read in full or in part. "
  "Page references were checked against the scanned text. Nothing here has been written to Sanity yet: see **How to apply** at the end.\n")
w("| Result | Entries |\n|---|---|")
w(f"| Re-sourced | {len(plan['entries'])} |")
w(f"| Text corrected or rewritten from the new sources | {sum(1 for e in plan['entries'] if 'text' in e)} |")
w(f"| Held back (taken off the site, not deleted) | {len(plan['holdBack'])} |")
w(f"| Banned sources removed only | {len(plan['alsoRemoveBannedFrom'])} |")
w(f"| Left as is | {len(plan['leftAsIs'])} |\n")

w("## Sources used\n")
w("| Source | Kind | Voice (Bible E1) | How it was read |\n|---|---|---|---|")
for k, s in lib.items():
    cite = f"[{s['citation']}]({s['url']})" if s.get("url") else s["citation"]
    w(f"| {cite} | {s['sourceType']} | {s['voice']} | {s['read']} |")
w("")

w("## Entry by entry\n")
for e in plan["entries"]:
    w(f"### `{e['id']}`\n")
    for r in e["add"]:
        w(f"- **{lib[r['source']]['short']}**, {r['where']}: {r['supports']}")
    if e.get("why"):
        w(f"\n**Text changed.** {e['why']}")
    for field, text in (e.get("text") or {}).items():
        w(f"\n> *{field}:* {text}")
    if e.get("note"):
        w(f"\n**Open question, shown on the entry:** {e['note']}")
    w("")

w("## Held back\n")
w("These have `published` set to false, so they leave the site at the next sync. They stay in Sanity with a note saying why.\n")
for h in plan["holdBack"]:
    w(f"- `{h['id']}`: {h['why']}")
w("")
w("## Banned sources removed, nothing else changed\n")
w("Each of these already had at least one admissible source beside a Wikipedia or study-notes citation.\n")
w(", ".join(f"`{i}`" for i in plan["alsoRemoveBannedFrom"]) + "\n")
w("## Left as is\n")
for x in plan["leftAsIs"]:
    w(f"- `{x['id']}`: {x['why']}")
w("")
w("## Rules applied\n")
w(f"- **Editor notes:** {plan['editorNotes']}")
w(f"- **Contested flag:** {plan['clearContested']['why']} Cleared on: {', '.join('`'+i+'`' for i in plan['clearContested']['ids'])}.")
w("- **One citation per work:** several pages of one book become one citation, so the site counts works, not page references.\n")
w("## How to apply\n")
w("1. On GitHub, open **Actions**, then **Apply source review**, then **Run workflow**. Leave **apply** unticked. This is a dry run: it prints every change and writes nothing.")
w("2. Read the printed changes.")
w("3. In Sanity, create a token: sanity.io/manage, the project, **API**, **Tokens**, **Add API token**, with **Editor** rights. Copy it.")
w("4. On GitHub, open the repository's **Settings**, **Secrets and variables**, **Actions**, **New repository secret**. Name it `SANITY_WRITE_TOKEN` and paste the token.")
w("5. Run **Apply source review** again with **apply** ticked. All changes go in one transaction.")
w("6. Run **Sync content from Sanity**. The site updates about a minute later.\n")
w("With Node installed, the same can be run locally: `node tools/apply-source-review.js tools/source-review/2026-11.json` for the dry run, and with `SANITY_WRITE_TOKEN` set and `--apply` to write.\n")

path = os.path.join(root, "docs", f"source-review-{name}.md")
open(path, "w", encoding="utf-8", newline="\n").write("\n".join(out))
print("wrote", path)
