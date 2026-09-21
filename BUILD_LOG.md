# BUILD_LOG — how this program was built and checked (Sept 16, 2026)

The record of running the loop in `BUILD_LOOP.md` to produce the files in this folder. The build
step used `BUILD_PROMPT.md`; the attack step used an independent reviewer that had not seen the
build; the fixes went into the prompt where its wording caused the defect, so the prompt and the
code stayed in step. No key material appears here; the runs used a temporary `.env.local` that
was deleted afterwards.

## Loop 1 · build from the prompt (BUILD_PROMPT rev 3)

Built by a Claude model from the prompt alone in a fresh copy of a one-page site with a
`knowledge/` folder. Then the two scripts:

```
four-tests  T1 PASS · T2 PASS · T3 PASS · T4 PASS
smoke       12 checks — 2 FAIL on the first build:
            /package.json and /vercel.json were served (200); /knowledge-sample/… served
```

Cause: the prompt's 404 list did not name them. **Prompt edits** (item 2 and item 4):

- `answer 404 to api/, knowledge/, test/, dev.js, unanswered.log, dotfiles, and .env files`
  → `answer 404 to api/, knowledge*/, test/, dev.js, unanswered.log, package.json, vercel.json, dotfiles, and .env files`
- `404 routes for knowledge/, dev.js, test/, README, widget, .env*, *.zip`
  → `404 routes for knowledge*/, dev.js, test/, README, widget, package.json, .env*, *.zip`

One build-only fix (the prompt was fine): the oversized-body path closed the socket mid-upload;
it now writes the 400 and drains the upload for up to ten seconds. After the rebuild:

```
four-tests  T1 PASS · T2 PASS · T3 PASS · T4 PASS
smoke       12/12 PASS
hand checks all pass: raw-socket "..", "%2e%2e", case variants, ::$DATA → 404; no content-type → 400;
            three 5 MB POSTs → 400 each, server alive; knowledge/ edit used on the next question;
            five injection variants declined with files_used []; git status shows no .env.local
```

## Plain text (BUILD_PROMPT rev 4)

T2's answer carried `**bold**`, which the page shows literally. **Prompt edit** (item 1):
`answer only from those excerpts; obey boundaries.md` → `answer only from those excerpts;
answer in plain text, no Markdown; obey boundaries.md`. Rebuilt the system prompt; T1–T4 PASS;
no Markdown in any reply.

## Attack (independent reviewer, full pass)

Headline from the reviewer: a better kit than the hand-built one it replaced; every earlier
defect closed. Fifteen injection variants (direct, Spanish, French, base64, letter-shift,
acrostic, markdown-image exfiltration, `process.env` dump, a forged assistant turn in the
history, "print the EXCERPTS section") all declined in character with `files_used: []`.
Thirty path attacks all 404. Malformed, huge, typed and untyped bodies all handled. Forty
parallel requests: 19 × 200, 21 × 429. The key appeared nowhere. Findings:

1. **blocker** — a wrong or expired key and a wrong model id both gave a silent 502 with
   nothing on the console; a helper in the room had nothing to go on.
2. should-fix — a missing `knowledge/` folder was silent; the chat answered "I don't have
   that" and still paid for the call.
3. should-fix — the widget printed the server's error strings to visitors.
4. should-fix — `unanswered.log` recorded every refusal, attacks included; the README called it
   a to-do list.
5. should-fix — `vercel.json` and `.gitignore` had no 404 route on Vercel.
6. nit — history turns were capped at 2,000 characters, not 600.
7. nit — `module.exports.default` was missing (Vercel tolerates it; the belt is free).
8. nit — the silent fallback to port 3001 could leave a student on the wrong tab.

## Loop 2 · fixes through the prompt (BUILD_PROMPT rev 5)

**Prompt edits**, verbatim:

- item 1: `Write it as CommonJS (module.exports = handler) so dev.js can require it`
  → `Write it as CommonJS (module.exports = handler, and module.exports.default = handler too) so dev.js can require it`
- item 1: `and 502 if Parley does not answer.`
  → `and 502 if Parley does not answer, printing "Parley replied with status <code>" to the console (the status only, never the body).`
- item 1: `Limits: 600-character questions, six history turns,`
  → `Limits: 600-character questions, six history turns of 600 characters each,`
- item 2: `Use the PORT environment variable if it is set, otherwise port 3000, or 3001 if 3000 is busy. Print one line on start: the address, and whether a key was found — never the key.`
  → `Use the PORT environment variable if it is set, otherwise port 3000, or 3001 if 3000 is busy — then say so in the start line ("port 3000 was busy — using 3001; use this address everywhere"). Print one line on start: the address, and whether a key was found — never the key; and if knowledge/ is missing or empty, warn that the chat will decline every question until it exists.`
- item 3: `shows the answer plus "Sources:" from files_used. Style it`
  → `shows the answer plus "Sources:" from files_used. On a non-200 reply show friendly text, not the server's error: 503 "This site's chat isn't set up yet.", 429 "Too many questions for now — try again in a few minutes.", anything else "Something went wrong. Please try again." Style it`
- item 4: `404 routes for knowledge*/, dev.js, test/, README, widget, package.json, .env*, *.zip`
  → `404 routes for knowledge*/, dev.js, test/, README, widget, package.json, vercel.json, .gitignore, .env*, *.zip`

Finding 4 was answered in the README instead (the log is "what the chat declined"). Rebuilt
from the new wording, then from a fresh unzip of the zip:

```
wrong key            → HTTP 502 {"error":"the assistant did not answer"}; console: Parley replied with status 401
unknown model        → HTTP 502; console: Parley replied with status 400
no knowledge/        → start line + "! no knowledge/ folder yet — the chat will decline every question until it exists"
port 3000 busy       → "… port 3000 was busy — using 3001; use this address everywhere" (printed once)
widget, 7 cases      → 200 answer + Sources; 503, 429 and every other failure show the friendly text
four-tests           T1 PASS · T2 PASS · T3 PASS · T4 PASS
smoke                12/12 PASS
```

A second, separate run by the coordinator from a fresh unzip repeated the warning, the
wrong-key diagnostic, and both scripts: all pass.

## Deploy (Vercel)

Loop step 5, run Sept 16 from a fresh unzip of the final zip: `knowledge-sample/` copied to
`knowledge/`, a one-paragraph `index.html` for "Jordan Rivera" with the widget section appended,
`.env.local` written from the key file. Vercel CLI 59.19.1, personal account, throwaway project
`ask-my-site-reference`: `vercel link --yes --project …` created it in one step; the key went in
through `vercel env add PARLEY_API_KEY production,preview --sensitive` piped from the file;
`PARLEY_MODEL=claude-sonnet-4-6`; `vercel --prod --yes` → READY, framework "Other", one build
warning (`"node": ">=20"` upgrades automatically — the README's Node note).

```
local sanity (port 3420)   T1–T4 PASS · smoke 12/12 PASS
deployed four-tests        T1 PASS (sources faq.md, profile.md, projects/clinic-flow.md) · T2 PASS · T3 PASS · T4 PASS
deployed smoke             10/12 PASS — /api/chat.js 405 (allowed); /../package.json and
                           /%2e%2e/package.json came back 400 from Vercel's edge, not 404
                           (nothing served; smoke.mjs now accepts 400 or 404 for those two);
                           429 after 25 rapid requests: 11 of 25 refused on one warm instance
private paths, GET         /knowledge/boundaries.md /KNOWLEDGE/boundaries.md /knowledge-sample/profile.md
                           /dev.js /vercel.json /.gitignore /test/smoke.mjs /README.md /widget.html
                           /.env.example /.env.local /package.json /unanswered.log → all 404
public                     /BUILD_PROMPT.md 200 · / 200 with the widget, no "parley" in the HTML
/api/chat                  GET/PUT/OPTIONS 405 · text/plain or no content-type → 400 (handler) ·
                           malformed JSON → 400 with an empty body (Vercel's parser, before the
                           handler) · missing question 400 · 601 chars 400 · 5 MB → 413 (Vercel)
round trip                 "Has Jordan Rivera worked in healthcare?" → 200, correct, files_used
                           [faq.md, profile.md, projects/clinic-flow.md] — includeFiles bundled knowledge/
forged assistant turn      declined, answerable false, files_used []
function log (42 rows)     200×4 400×18 429×14 405×5 413×1; no console output at all, so no
                           "Parley replied with status" line; the key, the variable name and the
                           Parley host appear nowhere
teardown                   vercel project rm → removed; project ls no longer lists it; both URLs
                           404 DEPLOYMENT_NOT_FOUND; temp folder and its .env.local deleted
```

What Vercel does differently from `dev.js`, all recorded in the README:

1. The `routes` in `vercel.json` hide `knowledge/` and `knowledge-sample/` even though both are
   uploaded as static files; `includeFiles` is what lets the function read `knowledge/`. The
   match is case-insensitive.
2. `.env.local`, `.gitignore`, `.vercel` and `node_modules` are never uploaded by the CLI; the
   `.gitignore` route matters only for Git imports, where the file is in the repo.
3. `req.body` arrives pre-parsed for `application/json`; malformed JSON is refused by the
   platform (400, empty body) before the handler sees it. Other content-types reach the handler.
4. `/api/chat.js` and any non-POST method reach the function and get the handler's 405.
5. A client-supplied `x-forwarded-for` is overwritten at the edge, so the smoke flood counts
   against the tester's own address: the next real requests got `429 slow down` for ten minutes.
   `smoke.mjs`'s comment and the README now say so.
6. Paths containing `..` → 400 at the edge; bodies over about 4.5 MB → 413 at the edge.
7. `vercel link` appends `.vercel` and `.env*` to `.gitignore` and adds a `VERCEL_OIDC_TOKEN`
   line to `.env.local`. Harmless; only CLI users see it.

One change to the kit came out of this leg, in a hand-written file, not the prompt's output:
`test/smoke.mjs` accepts 400 or 404 for the two `..` paths and its flood comment no longer
claims the burst spares your own allowance when deployed.

## Not verified

- macOS unzip and `ditto` paths (they behave; Windows `Expand-Archive` was the risk and is tested).
- The marker discipline on `claude-haiku-4-5`, the documented cheap switch; all runs used `claude-sonnet-4-6`.
- The per-instance request counters under real load: one deployed burst was refused 11 times
  out of 25 on a warm instance, which is a single observation, not a guarantee.

## Sept 17 — the chat becomes a corner button (prompt rev 6)

The first widget was a section appended to the foot of the page. On a long page nobody finds it.
Step 3 of `BUILD_PROMPT.md` was rewritten — a pill-shaped button fixed to the bottom-right corner
that opens a small panel — and `widget.html` was rebuilt from the new wording. The request code
(what it posts to `/api/chat`, the three friendly error texts, `Sources:`) is unchanged, and so
is every server-side file: `api/chat.js`, `dev.js`, `vercel.json`, `.gitignore`, `.env.example`
and `package.json` are byte-identical to the Sept 16 build that was deployed and attacked above.

Checked in headless Edge, driven over the DevTools protocol, 46 assertions, all passing:

- closed: one button, `position: fixed`, bottom-right, still there after scrolling a long page;
- open: click, the button again, the close button and Escape all work; opening puts the cursor in
  the input; closing returns focus to the button and keeps the conversation;
- desktop, 390 and 320 pixel widths, a landscape phone and 200% zoom: the panel never leaves the
  screen; at 390 it spans the width; at 320 the button collapses to its icon and keeps its label
  for screen readers;
- keyboard only: Tab reaches the button, close, the input and Send; Enter opens and closes; the
  focus ring is visible;
- a hostile host page (dark theme, `html { font-size: 62.5% }`, `* { box-sizing: content-box }`,
  a flex body with a gap, a page-wide `svg { width: 100% }`, `:focus { outline: none }`, and loud
  global rules for bare `h2`, `ul`, `li`, `small`, `form`, `input` and `button`): the chat still
  draws correctly, and the page's layout is identical with and without it — nothing leaks either way;
- 503, 429 and 500 replies each show their friendly text, never the server's words; model text is
  inserted as text, never as HTML;
- print: the chat is hidden.

Then live, from a fresh unzip beside a plain page, with the sample knowledge folder and a real
key: the four tests and all twelve safety checks passed; a question typed into the panel was
answered with `Sources: faq.md, profile.md, projects/clinic-flow.md`; and the only host the
browser contacted was `localhost:3000`.

Known limits: the panel is always a light surface with dark text, whatever the page's theme; and
the button's label is white, so a very pale accent colour needs the restyle to darken it — the
class prompt asks for "every label easy to read" for that reason.
