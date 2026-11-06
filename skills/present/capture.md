# Capturing product footage

Drive the real, running app through the flows with a script, and screenshot each moment at presentation size. Record where each shot's panel and focus element sit, so the video can crop and push in on them exactly.

Start from [capture.mjs](capture.mjs): copy it to a scratch folder, install `puppeteer-core` there (`npm i puppeteer-core`), and replace the example flow with the app's own. It uses the installed Chrome; nothing else is downloaded.

```sh
node capture.mjs <out-dir>        # writes <name>.png per shot and rects.json
```

## Rules

- **Presentation size:** a viewport 1100–1280px wide at `deviceScaleFactor: 3` for desktop, 390×844 at 3× for phone. The screenshots are 3600px wide and stay sharp at up to 1.5× the UI's CSS size in the video.
- **Record the rects.** For every shot, name the panel to crop to and the element the scene is about as CSS selectors. The script saves their boxes, in screenshot pixels, to `rects.json`. Copy that file into the video's `src/data/`.
- **One browser context per person.** A customer and a staff member are separate contexts, so each has its own storage and session, as in real life.
- **Wait for state, not time.**
  - Wait for the text or element that proves the moment happened (`waitText`).
  - For streamed replies, wait until the text has stopped changing (`settle`).
  - A fixed sleep is only for animations to finish before a shot.
- **Make sure a step landed where you meant.** After "New conversation", wait until the old conversation is gone before asking the next question, or the question goes into the old one.
- **Pick the right item, not the first.** Lists may hold leftovers from earlier runs. Find yours by something unique (the guest's name, an id) instead of clicking the first row.
- **Prepare the data.** Each flow needs data that leads to its payoff: an order over the refund limit that isn't refunded yet, a customer with history. Reset only local demo data, and say what you reset.
- **Sign in the way the app allows in development** (a dev sign-in link, a seeded test account). Never type a real password into the script.

## Then look

Open every screenshot before using it. Check that the moment is the one the scene describes, the text is legible, and nothing private or embarrassing is on screen, such as other people's test data or real names.
