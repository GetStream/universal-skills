---
name: present
description: Make a demo, walkthrough or promo video of a product - the script, real product footage, a Remotion build, frame-by-frame QA and the render. Use when asked for a demo or launch video, a product walkthrough, a video of "the most important flows", or to improve an existing video.
---

# Present

A product video earns trust with the real product, readable at video size, cut with restraint. Effects don't.

## Before you start

- **Remotion skill:** install it and follow it for the project and the Studio preview.

  ```sh
  npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices
  ```

- **The look comes from the project.** If there is a DESIGN.md or a brand skill (for example `stream-brand`), its fonts, colours and rules win over the defaults in [video.md](video.md). Without one, use the defaults there.
- **Real numbers only.** A figure in the video is measured, published, or given to you, and the video shows where it came from. If you don't have it, show a placeholder (`[XX ms]`) and say so.

## Workflow

1. **Story.** Pick the structure for the length (video.md, "Timing"), one idea per scene, and write the copy: a hook that names the user's outcome, a sentence per scene, a call to action.
2. **Footage.** Capture the real app at presentation size, driving it through the flows with a script and recording where each focus element sits: [capture.md](capture.md). Prepare the data first, so every flow ends in its payoff.
3. **Build.** Scaffold or reuse a Remotion project and build the scenes: [remotion.md](remotion.md). Open Studio before you edit, and keep it open so the user can watch.
4. **QA.** Render a still from the middle of every scene and the first frame after every cut, and look at each one: video.md, "QA". Fix, then check again.
5. **Render** only when asked, with the export settings in video.md. Verify the file with `ffprobe` and look at one frame from the MP4 itself.

When asked to improve an existing video, follow video.md, "Improving an existing video" before changing anything.
