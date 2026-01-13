# Video Explainer Skill for Claude Code

A Claude Code skill and intelligent agent plugin for creating multi-platform explainer videos.

## Features

- **Multi-platform output**: YouTube, YouTube Shorts, TikTok, Instagram Reels, LinkedIn
- **Brand × Platform × Style matrix**: Fully customizable configuration
- **Intelligent orchestrator**: Dynamically dispatches parallel background agents
- **Learning memory**: Improves over time based on feedback
- **Skill inheritance**: Extends Claude Code's skill architecture

## Prerequisites

This skill wraps the [video_explainer](https://github.com/example/video_explainer) Python CLI tool.

```bash
# Install video_explainer first
git clone <video_explainer-repo>
cd video_explainer && pip install -e .
```

## Installation

```bash
# Install from imehr marketplace
claude plugins install imehr/video-explainer-skill

# Or install manually
./install.sh
```

## Quick Start

```bash
# Configure video_explainer path and create your first brand
/video setup

# Create a new project
/video new my-first-video

# Create and render
/video render my-first-video
```

## Commands

### Project Management
```bash
/video new                    # Interactive wizard
/video new my-proj --quick    # Skip wizard, use defaults
/video list                   # List projects
/video status my-proj         # Show progress
```

### Configuration
```bash
/video brands                 # List brands
/video brands create          # Create new brand
/video platforms              # List platforms
/video styles                 # List styles
```

### Pipeline
```bash
/video script my-proj         # Generate script
/video scenes my-proj         # Generate scenes
/video render my-proj         # Render all outputs
/video render my-proj --only main,tiktok
```

### Iteration
```bash
/video feedback my-proj "make intro faster"
/video compare my-proj main v1 v2
/video promote my-proj main v2
```

### Learning
```bash
/video learn "use more analogies for technical content"
/video memory                 # Show learning summary
/video skills                 # List loaded skills
```

## Configuration Hierarchy

```
System defaults → User configs → Project overrides
```

**User configuration:**
```
~/.config/video-explainer/
├── config.yaml           # Global settings
├── brands/               # Brand definitions
├── platforms/            # Platform profiles
├── styles/               # Style overlays
└── memory/               # Learning data
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│  • Analyzes tasks and plans agent execution                  │
│  • Dispatches parallel background agents                     │
│  • Validates outputs at quality gates                        │
│  • Learns from feedback                                      │
└─────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┬─────────┬─────────────┐
    ▼         ▼         ▼             ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐
│ Script │ │ Scene  │ │Voiceover │ │ Render │
│ Agent  │ │ Agent  │ │  Agent   │ │ Agent  │
└────────┘ └────────┘ └──────────┘ └────────┘
```

## Documentation

- [Design Document](docs/design.md)
- [Usage Guide](docs/usage.md)

## License

MIT
