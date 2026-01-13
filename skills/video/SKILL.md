---
name: video
description: "Create multi-platform explainer videos (YouTube, Shorts, TikTok, Instagram, LinkedIn) with intelligent orchestration, Brand × Platform × Style configuration, and learning memory"
---

# Video Explainer Skill

Create professional explainer videos across multiple platforms with consistent branding and intelligent automation.

## Configuration

The skill reads configuration from `~/.config/video-explainer/`:
- `config.yaml` - Global settings including video_explainer path
- `brands/` - Brand definitions (voice, colors, typography, assets)
- `platforms/` - Platform profiles (aspect ratio, duration, pacing)
- `styles/` - Style overlays (minimal, energetic, corporate)

## Commands

### Setup & Configuration
- `/video setup` - Configure video_explainer path and initial settings
- `/video brands` - List available brands
- `/video brands create` - Interactive brand creation wizard
- `/video platforms` - List available platform profiles
- `/video styles` - List available style overlays

### Project Management
- `/video new [name]` - Create new video project (wizard or --quick)
- `/video list` - List all video projects
- `/video status [project]` - Show project progress, outputs, versions

### Pipeline Control
- `/video script [project]` - Generate script from source document
- `/video scenes [project]` - Generate scenes from script
- `/video render [project]` - Render all outputs
- `/video render [project] --only main,tiktok` - Specific outputs only

### Iteration & Feedback
- `/video feedback [project] "message"` - Apply feedback and re-render
- `/video compare [project] [output] v1 v2` - Side-by-side version review
- `/video promote [project] [output] [version]` - Promote version to final

### Learning & Skills
- `/video learn "instruction"` - Teach a new preference
- `/video memory` - Show learning summary
- `/video skills` - List loaded technique skills

## Orchestrator

The intelligent orchestrator analyzes tasks and decides:
- **Foreground vs Background** - User-interactive steps run foreground
- **Parallel vs Sequential** - Independent tasks run in parallel
- **Dependencies** - Tracks what each step needs

## Requirements

This skill wraps the `video_explainer` Python CLI tool.
Configure the path via `/video setup` or in `~/.config/video-explainer/config.yaml`.
