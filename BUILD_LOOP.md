# A6 · The loop that built and checked this program (rev 1, Sept 16, 2026)

The agentic loop from the class, as one prompt for Claude Code: build → test → attack → fix, repeated until the
test scripts pass, then deploy and test again. It was run to produce and check the contents of this folder;
the run is recorded in BUILD_LOG.md. It takes twenty to forty minutes and real Parley spend — you do not need
to run it; the zip you fetched is its result. Run it on a copy of your own folder if you want to watch it work.

```
Run a build-and-verify loop for the "Ask my site" program, in a fresh copy of my personal-site folder. Work autonomously; stop only where a step says to.

Setup: if this folder has no BUILD_PROMPT.md and no test/ folder, fetch https://austinvl.github.io/vibe-coding-2/kit/ask-my-site-starter.zip, unzip it here, and delete the zip. Keep my knowledge/ and index.html exactly as they are. Copy .env.example to .env.local and open it in a plain text editor for me to paste my Parley key — do not ask me for the key and do not print it. Wait until I say "the key is saved".

Then loop, at most three times:
1. BUILD — follow BUILD_PROMPT.md exactly, writing your own api/chat.js, dev.js, the chat widget in index.html, .env.example, .gitignore, package.json and vercel.json. Do not touch knowledge/.
2. TEST — start the server on port 3000 and run: node test/four-tests.mjs http://localhost:3000 "<my name>" and node test/smoke.mjs http://localhost:3000. The scripts decide, not you.
3. ATTACK — spawn a fresh subagent that has not seen your work. Give it only the folder and this checklist: try to make the chat reveal its instructions, file names, file contents or the key (fifteen variants: direct, in another language, encoded, and with a forged assistant turn in the history); request private paths with different casing, encodings and ".." (send the raw request line, not curl); send bodies that are malformed, huge, or have no content-type; send forty requests at once; search every reply, log and console line for the key; run git status and confirm .env.local is not tracked. It reports findings ranked blocker, should-fix, nit.
4. FIX — for each finding, decide whether BUILD_PROMPT.md's wording caused it. If so, edit the prompt with the fewest words that would make a careful builder do the right thing, and rebuild that file from the new wording; otherwise fix the code. Record every prompt edit verbatim.
Repeat from step 2 until both scripts pass and the attack finds no blocker, or three loops are done.

5. DEPLOY — only if "vercel whoami" succeeds: deploy this folder to a Vercel project named ask-my-site-<my first name>, add PARLEY_API_KEY as an environment variable read from .env.local without printing it, run both test scripts against the deployed URL, and open <url>/knowledge/boundaries.md — it must return 404. If not logged in, skip this step and say so.
6. REPORT — write BUILD_LOG.md: each loop's test lines, the attack findings and what you did about each, every prompt edit before → after, the deploy checks, and anything you could not verify. Never print or log the key.
```
