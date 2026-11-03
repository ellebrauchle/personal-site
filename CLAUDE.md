# Personal site

Elle Brauchle's personal site. Static HTML and CSS, no build step, deployed on
Vercel. The "Curious?" chat is a small Node handler in `api/chat.js` that
answers from `knowledge/`.

## Where the design comes from

The visual direction comes from a Claude Design project, "Portfolio website
wireframe directions" (`6d0c57a0-e901-4aa5-a710-2fb717ea0536`), file
`Portfolio 1a.dc.html` — direction 1a, "Top nav, classic pages". Read it with
the DesignSync tool (`get_file`), not by guessing.

There is no round-trip. Design to code is one-way: the canvas cannot import this
site back, so re-importing an edited design means re-implementing it here.

## Which source wins

**The design is authoritative for form.** Layout, grid, palette, type, component
shapes, which pages exist, nav behaviour, and the look of a card or tile. If the
design changes any of these, change the site to match.

**This repo is authoritative for words.** Every piece of real copy on the site
was written here from sources the design does not have, and must survive a
re-import:

**About Me is one page, not six.** The design has Education, Experience,
Awards, Skills and Interests as separate frames, and this site had them as
separate pages until Elle asked for them inline. The five chips under her name
are now in-page anchors, and `vercel.json` redirects the old `/education`,
`/experience`, `/awards`, `/skills` and `/interests` URLs to the matching
`#section`. A re-import of the design must not split them out again.

**Each project has its own page.** The design's PROJECTS frame has no detail
frame behind the tiles. The four pages — `hackachusetts.html`,
`petal-ping.html`, `envelopes.html`, `task-nest.html` — follow a wireframe Elle
supplied in Nov 2026: back link, title, a chip and a year, the project's own
artwork as a hero, the write-up, then an outbound pill. They are built from the
`case study` styles that were already in `site.css` and unused. Each card on
the index is an `<a>` onto its page. A re-import of the design must not flatten
them back into tiles that go nowhere.

| Content | Lives in | Written from |
| --- | --- | --- |
| About bio, tag row and the five resume sections | `about.html` | Elle's PM resume, Oct 2026 |
| Petal Ping description and page | `projects.html`, `petal-ping.html` | Her Petal Ping product brief, Sept 2026, then edited by Elle |
| Hackachusetts description and page | `projects.html`, `hackachusetts.html` | The team's repo and `docs/idea.md`, Oct 2026 |
| Task Nest and Envelopes blurbs | `projects.html`, and their own pages | The design's HOME frame; Envelopes is a name and nothing more |
| Hero sentence and bio | `index.html` | The design's HOME frame, reworded by Elle |
| Contact details and invitation | `contact.html` | Real addresses |
| Everything the chat widget knows | `knowledge/*.md` | Resume and product brief |

**The design still contains placeholder copy** — "Here is my bio ....", "Your
text here", "Your Name", "Tag · Tag · Year". Never implement those. If a design
frame has placeholder text where this site has real text, the site wins and the
placeholder is ignored without asking.

If a design frame has *new real* copy that conflicts with what is here, do not
silently pick one. Say so and let Elle choose.

## Re-implementing an updated design

1. Read the updated `.dc.html` with DesignSync `get_file`.
2. Diff it against the site by intent, not line by line: what moved, what is new,
   what changed shape.
3. Apply form changes. Carry the existing copy across untouched.
4. Check `knowledge/` still matches whatever the pages now claim.
5. Verify every page in the browser, including at 375px, before reporting done.

## Not on this site, deliberately

The Hackachusetts repo. It is private, so `hackachusetts.html` links the Sundai
event instead of carrying a "View code" pill. Petal Ping's repo
(`ellebrauchle/Cycle-Tracking`) is public and is linked.

Elle's phone number and home address. They are on her resume; they do not belong
on a public page. `knowledge/boundaries.md` also tells the chat widget to refuse
recruiting status, client names, grades and compensation.

## The chat widget's knowledge base

`api/chat.js` splits every `.md` in `knowledge/` at its headings, scores the
chunks by word overlap with the visitor's question, and fills a 6000-character
budget. So:

- Write short sections under specific, keyword-bearing headings.
- Use the words a visitor would use. "Undergrad" had to be added explicitly
  before "where did she go to undergrad" retrieved anything.
- `boundaries.md` is special: never chunked, always sent whole.

After editing `knowledge/`, check retrieval still works before committing.

## Conventions

- No build step and no framework. Keep it that way.
- Palette and spacing are tokens at the top of `site.css`. Restyle there, not in
  the pages.
- Every page carries the same nav, footer, `site.js` and `ask-my-site.js`.
  About Me also loads `albums.js`, which no other page needs.
- The Interests albums are plain files under `assets/photos/<album>/`,
  numbered `01.jpg` upward with thumbnails in `sm/`. The card's
  `data-count` is how many there are; add a photo and raise the count.
- Never print `.env` or any API key.
