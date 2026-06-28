# How to update your site

You only ever edit **`data.js`** (for text/links) and the **`assets/`** folder
(for your photo, résumé, and project images). You never touch `index.html`.

If the site is deployed on Vercel, every change works the same way:
**edit → commit to GitHub → Vercel redeploys automatically** (takes ~20 seconds).
You can make all of these edits **directly on github.com** — no computer setup needed:
open the file, click the pencil ✏️, change it, click **Commit**.

---

## File map

```
rishabh_page/
├─ index.html          ← the design/layout. Don't edit this.
├─ data.js             ← all your text + links live here. EDIT THIS.
├─ HOW-TO-EDIT.md      ← this guide.
└─ assets/
   ├─ portrait.png     ← your photo. Overwrite to change it (keep the name).
   ├─ resume.pdf       ← your résumé. Overwrite to change it (keep the name).
   └─ projects/        ← optional project screenshots go here.
```

> ⚠️ **Filenames and folder names are case-sensitive on Vercel.**
> Always use lowercase `assets`, `portrait.png`, `resume.pdf`. Don't rename them.

---

## Update your photo or résumé

Replace the file, keep the **exact same name**:

- New photo → save it as `assets/portrait.png` (replacing the old one).
- New résumé → save it as `assets/resume.pdf` (replacing the old one).

Because the name doesn't change, the page already points to it — nothing else to do.
(On GitHub: go into the `assets` folder → **Add file → Upload files** → upload a file
with the same name → Commit. It overwrites the old one.)

---

## Projects

Open `data.js`, find the `projects: [ ... ]` list. Each project is one block:

```js
{
  confidence: "0.99",
  tag: "kalorie · full-stack",
  title: "Kalorie — AI calorie tracker",
  description: "A calorie tracking app that...",
  tech: ["Next.js", "Gemini API", "Vercel"],
  link: "https://your-live-demo.com",
  linkLabel: "Live demo",
  image: ""
}
```

- **Add a project** → copy a whole `{ ... }` block, paste it into the list, edit the
  fields. Make sure blocks are separated by a comma `,`.
- **Delete a project** → delete its `{ ... }` block (and the comma next to it).
- **Reorder** → move a block up or down. Page order follows list order.
- **Add a screenshot** → put the image in `assets/projects/` (e.g.
  `assets/projects/kalorie.png`) and set `image: "assets/projects/kalorie.png"`.
  Leave `image: ""` for a text-only card.

---

## Writing / roadmaps

Same idea, in the `roadmaps: [ ... ]` list. Each article is one block with
`num`, `badge`, `title`, `blurb`, `source`, `readTime`, and `link`.

To change the "More essays at…" line, edit `mediumProfileUrl` and
`mediumProfileLabel` just below the roadmaps list.

---

## Contact links (footer)

In the `links: [ ... ]` list. Each link is:

```js
{ lk: "GitHub", lv: "@Rishabh-creator601", href: "https://github.com/..." }
```

`lk` = the small label, `lv` = the visible text, `href` = the URL.
For email use `href: "mailto:you@email.com"`.

---

## Two rules that prevent breakage

1. **Keep the quotes and commas.** Every value is in `"quotes"`, and every block
   ends with a comma except the last one in a list.
2. **Don't rename files in `assets/`.** Overwrite them instead.

If the page ever goes blank after an edit, you almost certainly removed a quote,
comma, or `}` — undo your last change and it'll come back.
