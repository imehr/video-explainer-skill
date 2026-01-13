---
description: Create multi-platform explainer videos (YouTube, Shorts, TikTok, Instagram, LinkedIn) with intelligent orchestration
location: plugin
---

Use the video-explainer-skill:video skill to create explainer videos.

**Available commands:**

Setup & Configuration:
- `/video setup` - Configure video_explainer path
- `/video brands` - List available brands
- `/video platforms` - List platform profiles
- `/video styles` - List style overlays

Project Management:
- `/video new [name]` - Create new video project
- `/video list` - List all projects
- `/video status [project]` - Show project progress

Pipeline:
- `/video script [project]` - Generate script
- `/video scenes [project]` - Generate scenes
- `/video render [project]` - Render all outputs

Iteration:
- `/video feedback [project] "message"` - Apply feedback
- `/video compare [project] [output] v1 v2` - Compare versions
- `/video promote [project] [output] [version]` - Promote to final

Learning:
- `/video learn "instruction"` - Teach a preference
- `/video memory` - Show learning summary
- `/video skills` - List technique skills

**Configuration location:** `~/.config/video-explainer/`
**Requires:** video_explainer Python CLI tool
