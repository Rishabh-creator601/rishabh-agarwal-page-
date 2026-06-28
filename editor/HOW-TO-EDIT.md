# How to edit the site

You don't need to touch any code to update this website. There's a built-in
**visual editor** that lets you change everything by filling in boxes, and then
saves it for you.

---

## What the editor is

All the content on the site — your projects, skills, writing, and contact links —
lives in one file called `data.js`. Instead of editing that file by hand, you use
the editor: a simple page with text boxes and buttons. When you save, the editor
rewrites `data.js` for you.

---

## Opening the editor

1. Go into the `editor` folder.
2. Double-click **`open-editor.bat`**.
3. A black window opens and says the editor is running — **leave that window
   open** the whole time you're editing. (Close it when you're done.)
4. Your browser opens the editor automatically.

If the browser doesn't open on its own, type this address into it:

```
http://127.0.0.1:8799/editor/admin.html
```

> The editor only runs on your own computer. It is never put online, so nobody
> else can see or use it.

---

## How editing works (the 3 steps)

1. **Make your changes** in the editor (add a project, edit a skill, etc.).
2. Click **"Save to site ✓"** at the top right. This writes your changes into
   `data.js`.
3. **Commit & push** the changes to GitHub (in GitHub Desktop, or with git). The
   live site updates by itself a few seconds later.

Buttons at the top:
- **Reload** — throws away unsaved changes and starts again from the saved version.
- **Download** — saves a copy of `data.js` to your computer (a backup).
- **Save to site ✓** — the main one. Writes your changes into the site.

Tip: every section has small buttons on each item — **↑ / ↓** to reorder, and
**✕** to delete. There's an **"+ Add …"** button at the bottom of each section.

---

## Adding a project

In the **Projects** section, click **"+ Add project"**, then fill in:

- **Confidence chip** — the little number shown on the card, e.g. `0.98`.
- **Tag** — the small label, e.g. `flower-yolo · detection`.
- **Title** — the project name.
- **Description** — a sentence or two about what it does.
- **Tech tags** — the tools used, separated by commas, e.g. `YOLOv11, OpenCV, Detection`.
- **Demo video / gif** — click **"Browse / Upload"** and pick an `.mp4` or `.gif`
  from your computer. It's copied into `assets/videos/` automatically and the
  path is filled in for you. (You can also paste a path by hand if you prefer.)
- **Code link** — the GitHub URL for the project. Leave it blank to hide the
  code button.
- **Code button label** — the text on that button, usually `View code`.

---

## Adding a skill

Skills are organized into **groups** (like *Languages*, *Computer Vision*, *NLP*).

- To add a skill to an existing group: find the group, click **"+ Add skill"**,
  and fill in the row:
  - **Name** — what's shown, e.g. `Python`.
  - **Logo slug** — the short icon name from simpleicons.org, e.g. `python`,
    `tensorflow`, `opencv`. Leave it blank if there's no logo.
  - **Badge** — a 2-letter fallback shown when there's no logo, e.g. `PY`.
- To make a brand-new group, click **"+ Add skill group"** at the bottom, give it
  a **Group name**, then add skills to it.
- Use **✕** to remove a skill, or the **↑ / ↓** buttons to reorder groups.

> Not sure of a logo slug? Just fill in the **Name** and a 2-letter **Badge** —
> the site will show the badge instead of a logo, and it still looks clean.

---

## Adding a contact link

In the **Contact links** section, click **"+ Add link"**, then fill in:

- **Label** — the type of link, e.g. `GitHub`, `Email`, `LinkedIn`.
- **Shown text** — what the visitor sees, e.g. `@Rishabh-creator601` or
  `Email me !`.
- **URL** — where it goes. For web links use the full address
  (`https://...`). For email, start with `mailto:`, e.g.
  `mailto:rishabhagarwal1028@gmail.com`.

---

## Other things you can edit

- **Writing / Roadmaps** — your Medium articles (number, badge, title, blurb,
  read time, and link).
- **Medium profile link** — the address and the text shown for your Medium page.

---

## When something doesn't work

- **"Save" downloaded a file instead of saving** — that means the editor server
  isn't running. Close everything, double-click `open-editor.bat` again, and make
  sure the black window stays open while you edit.
- **Video won't preview / upload** — same fix: the editor needs to be opened
  through `open-editor.bat` (not by opening `admin.html` directly).
- **Changes aren't live on the site** — remember the last step: after **Save to
  site**, you still need to **commit & push** to GitHub. The live site only
  updates once the changes are pushed.
