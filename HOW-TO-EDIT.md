# How to update your site

You have a visual editor — no code, no JSON. It lives in the **`editor/`** folder,
separate from your site content (`data.js`, `assets/`, `index.html`).

## Open the editor

Double-click **`editor/open-editor.bat`**.

- A small black window opens (the editor's local server) and your browser opens the editor.
- **Keep that black window open** while you edit. Close it when you're done.
- If Windows asks about Python, you need Python installed (python.org). It's already on this machine.

## Edit

- **Projects / Skills / Writing / Links** — add, edit, delete, and reorder with the
  on-screen buttons (`↑ ↓ ✕` and `+ Add`).
- **Upload a video** — in a project, click **Browse / Upload**, pick an `.mp4` or `.gif`.
  It saves straight into `assets/videos/` (with a clean filename) and fills the path for you.
  No need to type paths or move files by hand.
- **Photo / résumé** — overwrite `assets/portrait.png` / `assets/resume.pdf` (keep the names).

## Save & publish

1. Click **Save to site ✓** (top right). This writes your changes into `data.js`.
2. In GitHub Desktop (or git): **commit & push**.
3. Vercel redeploys automatically (~20 seconds). Done.

> The **Download** button is a backup: if you're editing without the server (e.g. straight
> on github.com), it downloads `data.js` so you can upload it to GitHub manually.

---

## Folder map

```
rishabh_page/
├─ index.html            ← the live site (design/layout). Don't edit by hand.
├─ data.js               ← your content (the editor writes this).
├─ assets/
│  ├─ portrait.png       ← your photo  (overwrite to change)
│  ├─ resume.pdf         ← your résumé (overwrite to change)
│  └─ videos/            ← project demos (uploads land here)
└─ editor/               ← the editor app (kept separate from content)
   ├─ open-editor.bat    ← double-click to launch
   ├─ admin.html · editor.css · editor.js
   └─ server.py          ← local-only server (never deployed)
```

## Two things to remember

1. **Filenames are case-sensitive on Vercel.** The editor already makes uploaded names
   lowercase and dash-separated, so just use Browse/Upload and you're safe.
2. **The `editor/` folder is a local tool.** It does nothing on Vercel — it only runs on
   your computer when you double-click the `.bat`. Leaving it in the repo is harmless.
