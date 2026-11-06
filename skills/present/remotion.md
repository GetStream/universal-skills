# Building it in Remotion

The `remotion-best-practices` skill has the full API. These are the rules and patterns that matter for a product video.

## Project

- **New project:** `npx create-video@latest --yes --blank --no-tailwind video`, then `npm i`. Use a subfolder (`video/`) in an existing repo.
- **Pin versions:** every `remotion` and `@remotion/*` package on the same version. Add packages with `npx remotion add @remotion/google-fonts` so they match.
- **Preview first:** `npx remotion studio --no-open`, then open the printed URL (`/<CompositionId>`) in the browser. Keep it running while you build.
- **Layout:** one file of brand constants (fonts, colours, easing, `sec()`, formats with safe areas and type sizes), one of motion helpers, one per scene type, and the timeline that orders them. The timeline reads scene lengths from one array, and the composition's duration is computed from it, so they never disagree.

## Rules

- **Drive all motion from `useCurrentFrame()`** with `interpolate(frame, [a, b], [from, to], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`. CSS transitions, CSS animations, `setTimeout` and `requestAnimationFrame` don't render: Remotion renders frames out of order.
- **Times in seconds** through a `sec(s) = Math.round(s * fps)` helper, so the code reads like the storyboard. Inside a `<Sequence>`, frame 0 is the scene's start.
- **`spring()` only with high damping** (`{damping: 200}`): a settle with no overshoot.
- **Fonts through `@remotion/google-fonts`** (`loadFont('normal', {weights: ['400', '500'], subsets: ['latin']})`), never a `<link>` tag, so renders wait for them.
- **Images through `<Img src={staticFile(...)}>`** from `public/`, so frames wait for them. Size them in pixels from the crop maths; set `maxWidth: 'none'` when an image is drawn wider than its box.
- **Prefer `scale`, `translate` and `rotate`** style properties to `transform` strings. Keep `interpolate()` inline in `style`, so Studio can edit it.
- **Data from JSON:** keep measured numbers in `src/data/*.json` copied from where they were measured, and import them. Don't retype them.

## Scenes in sequence

- **Hard cuts:** `<Series>` with one `<Series.Sequence name=… durationInFrames={sec(n)}>` per scene.
- **Transitions:** `<TransitionSeries>` from `@remotion/transitions`. Its children must be its own `Sequence`, `Transition` or `Overlay` elements, written inline: a wrapper component around a `Transition` throws. Each transition shortens the total by its length.
- **One continuous world:** for a camera that pans across several screens, render them all in one absolutely positioned world and animate the world's `translate` and `scale` from a keyframe list. Measure camera targets once from the layout.

## Footage in a frame

For a screenshot of `W×H` captured pixels, a crop `{x, y, w, h}` and a frame `frameWidth` wide:

```tsx
const s = frameWidth / crop.w;                       // must stay ≤ 0.5, push-in included
const fx = (focus.x - crop.x + focus.w / 2) * s;     // push-in origin: the focus element's centre
const fy = (focus.y - crop.y + focus.h / 2) * s;
<div style={{width: frameWidth, height: crop.h * s, overflow: 'hidden', position: 'relative'}}>
  <div style={{position: 'absolute', inset: 0, scale: String(zoom), transformOrigin: `${fx}px ${fy}px`}}>
    <Img src={staticFile('shots/x.png')} style={{position: 'absolute', left: -crop.x * s, top: -crop.y * s, width: W * s, height: H * s, maxWidth: 'none'}} />
    {/* Spotlight: a box over the focus element whose huge shadow dims the rest. */}
    <div style={{position: 'absolute', left: (focus.x - crop.x) * s - 8, top: (focus.y - crop.y) * s - 8,
      width: focus.w * s + 16, height: focus.h * s + 16, borderRadius: 14,
      boxShadow: `0 0 0 4000px rgba(255,255,255,${dim})`}} />
  </div>
</div>
```

Take `crop` and `focus` from the rects the capture script records (capture.md). Hand-measured coordinates break when the UI moves.

## Checking and rendering

```sh
npx remotion still src/index.ts <Id> out/qa.png --frame=<n> --scale=0.5   # one QA frame
npx remotion render src/index.ts <Id> out/video.mp4 --codec=h264 --crf=18
npx remotion ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,codec_name out/video.mp4
npx remotion ffmpeg -y -ss 20 -i out/video.mp4 -frames:v 1 out/check.png     # a frame from the file itself
```

- **Typecheck before stills:** `npx tsc --noEmit`. A scene that fails to compile shows up as a blank render.
- **Render only when asked.** The user reviews in Studio; render when they say export, render or "give me the MP4".
- **Another session may be editing the same project.** If files change under you that you didn't change, stop and ask before overwriting.
