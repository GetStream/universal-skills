# Video rules

What makes a product video read well, whatever the brand. A project's DESIGN.md or brand skill replaces the defaults marked as such.

## Formats

| Use | Size | Safe area (text and logos stay inside) |
|---|---|---|
| Website, YouTube, LinkedIn, talks (default) | 1920×1080, 16:9 | 96px left and right, 64px top and bottom |
| Reels, TikTok, Shorts, Stories | 1080×1920, 9:16 | 72px sides, 240px top and bottom (platform UI covers them) |
| Feed posts | 1080×1080 or 1080×1350 | 72px all round |

- **Lay out each format on purpose.** Don't letterbox one into another. Show phone screens in 9:16 and desktop screens in 16:9.

## Motion

| Token | Value | Use |
|---|---|---|
| Enter | `cubic-bezier(.16, 1, .3, 1)`, 0.6s | Text and UI arriving: fade plus a 32px rise |
| Exit | `cubic-bezier(.7, 0, .84, 0)`, 0.4s | Rarely; prefer a cut |
| Move / zoom | `cubic-bezier(.65, 0, .35, 1)` | Camera push-ins, position changes |
| Stagger | 0.08s | Words of a headline, cards in a row |
| Device entrance | 0.7s, slide 80–120px | A browser or phone frame arriving |

- **Calm and precise.** No bounce, elastic, spin, 3D flips, glitch, particles, glows, lens flares, light sweeps, grain or vignettes. Hard cuts between scenes are fine and usually better than cross-fades.
- **Push-ins** on footage go to 1.06–1.3× on the element the scene is about, never past the footage's resolution (see "Footage").
- **Spotlight:** while zoomed, dim everything else to about a third (a white or black overlay with a hole over the element). It's calmer than an outline or an arrow.

## Timing

- **Reading time:** at least 1.5s on screen plus about 0.3s per word. A 9-word headline needs about 4s.
- **One idea per scene,** 3–6 seconds each.
- **No empty frames after a cut.** The first element is already moving on the cut frame (delay 0–0.05s). Every element starting at 0.2s leaves a flash of bare background.

| Length | Structure |
|---|---|
| 15s | Hook 0–3, product moment 3–11, call to action 11–15 |
| 30s | Hook 0–3, problem 3–7, product 7–20, proof 20–25, call to action 25–30 |
| 45–60s | Hook, two to five product moments, proof, call to action |

## Type

- **Default:** one sans for text, at weights 400 and 500, and one mono for index labels, numbers and URLs. No third face. Hierarchy comes from size and colour, not heavy weights.
- **Sizes at 1080p 16:9:** headline 104–120px, scene title 64–80px, supporting line 40px, labels 28px. Nothing under 28px in any format.
- **At most 7 words a line,** 2–3 lines a block.
- **Captions:** burn them in when there's a voiceover. Most social video plays muted.

## Colour and composition

- **Default:** a solid light stage for product scenes, solid black for the hook and the end card. No gradients, patterns or textures behind the product.
- **One accent moment per scene:** the word naming what the shot shows, a key number, the call to action. Never an accent-coloured background wash.
- **Footage** sits in a device frame: a browser with a ~44px bar, or a phone with a ~56px radius, a 1px border and one soft shadow.
- **Index labels** in the mono face (`01 / ANSWER`) tie the scenes into one sequence.

## Footage

- **Use the real product.** Capture it running ([capture.md](capture.md)). Don't draw fake UI when the real screen exists.
- **Capture at presentation size:** a desktop viewport 1100–1280px wide at 3× (`deviceScaleFactor: 3`), a phone at 390×844 at 3×. A full-width 1440px capture at 2× leaves the UI at 12–16px in a 1080p video: too small to read.
- **Never draw footage above half its captured resolution,** push-ins included. With a 3× capture, that means at most 1.5× the UI's CSS size. Work it out: drawn width ÷ captured width ≤ 0.5.
- **Show the moment, not the screen.** Crop to the panel that matters, centred on the focus element, and push in on it.
- **Live UI beats screenshots** when there's time: the product rebuilt as DOM (typing, counting, toggling) stays sharp under any zoom. Screenshots are the fast path; keep them sharp with the rules above.

## Story and claims

- **The hook names the user's outcome,** not the company.
- **Conversations finish the job.** A question gets its answer, and a handoff ends with the person's reply.
- **Every number is real** and carries its source on screen: "Source: Lighthouse 13.6, mobile, median of three runs, 5 Nov 2026".
- **End card:** hold 3–4 seconds. The logo from the brand's files (never redrawn or recoloured), one line of copy, the call to action as a button shape, and the URL in the mono face.
- **Audio:** no copyrighted music. Use a licensed track you were given, or deliver it silent with captions. Voiceover runs about 2.5 words a second.

## What reads as premium

Restraint and precision: solid surfaces, hairline structure, large well-set type, exact timing, colour only where it carries meaning.

- **Continuity:** nothing just appears. A pill grows into a card; the montage collapses into the logo.
- **One world, one camera:** lay the screens out side by side and pan between them, rather than sliding things on and off.
- **Progressive assembly:** the frame first, then the content, items popping in about 70ms apart.
- **A cursor causes changes** only where a person would act: a click gets a 0.86 press and a thin ring.
- **Holds:** let the key word sit alone for a beat before it moves.

## QA

Before rendering the whole video:

- [ ] A still from the middle of every scene and the first frame after every cut, looked at one by one
- [ ] No empty frames after cuts; all text inside the safe area and at least 28px; reading time respected
- [ ] Footage sharp: captured at presentation size and never drawn above half its resolution
- [ ] Fonts and weights as the brand allows; one accent moment per scene
- [ ] Every number real, with its source on screen
- [ ] After rendering: `ffprobe` shows h264, yuv420p, the right size, fps and duration; one frame pulled from the MP4 looks right

## Export

- **Video:** H.264 High, `yuv420p`, 30fps (60 only for fast scrolling UI), CRF 18, `+faststart`.
- **Audio:** AAC 192k when present, mastered to -14 LUFS integrated with a -1 dB true peak (two-pass `loudnorm`).
- **Size:** a 30s 1080p video should stay under 50 MB.
- **Poster:** one still, from the hook or the end card.

## Improving an existing video

1. **Study it first.** Run `ffprobe` (size, fps, audio), sample a frame every 0.5s into a contact sheet, and pull full-size frames of the key states.
2. **Find the quality ceiling.** If the text is under ~16px at 1080p or the source is below 1080p, rebuild the scenes rather than upscale.
3. **Write the critique as a fix list** before building:
   - legibility at phone size;
   - where the eye should go in each scene;
   - scenes that drag or rush against reading time;
   - empty frames;
   - cuts off the beat;
   - audio that ends before the picture;
   - missing formats.
4. **Keep the story; enforce the rules.** Keep the narrative and pacing the team likes. Translate effects into flat equivalents (a gradient word becomes one solid accent word), and say what you changed and why.
5. **QA as above,** plus loudness measured on the final file.
