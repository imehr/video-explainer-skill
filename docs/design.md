# Video Explainer Skill & Agent Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a global Claude Code skill and intelligent agent for video explainer creation with multi-platform output, learning capabilities, and extensible skill system.

**Architecture:** Intelligent orchestrator agent that dynamically dispatches parallel workers, with a hierarchical configuration system (Brand × Platform × Style) and a learning memory that improves over time.

**Tech Stack:** TypeScript (plugin), Markdown + YAML (skills), Python CLI (video_explainer), JSON/YAML (configs)

**Repository:** `imehr/video-explainer-skill` (standalone wrapper, does not fork video_explainer)

---

## 0. Repository Architecture (Wrapper Approach)

**Key Decision:** This skill/plugin wraps the existing `video_explainer` tool without forking it.

**Why wrapper approach:**
- Clean separation between core tool and Claude Code integration
- Can update `video_explainer` independently
- Easier to publish to marketplace
- No fork maintenance burden

**Repository structure:**

```
imehr/video-explainer-skill/
├── README.md
├── package.json                 # npm/marketplace publishable
├── install.sh                   # One-command setup
│
├── skill/
│   ├── video.md                 # Main /video skill
│   └── techniques/              # Technique sub-skills
│       ├── hooks.md
│       ├── narrative.md
│       └── platform-optimization.md
│
├── plugin/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             # Plugin entry
│       ├── orchestrator.ts      # Intelligent orchestrator
│       ├── planner.ts           # Task analysis
│       ├── agents/
│       │   ├── script-agent.ts
│       │   ├── scene-agent.ts
│       │   ├── voiceover-agent.ts
│       │   └── render-agent.ts
│       └── validators/
│           ├── script-validator.ts
│           └── output-validator.ts
│
├── defaults/
│   ├── brands/
│   │   └── _defaults.yaml
│   ├── platforms/
│   │   └── _defaults.yaml       # youtube, shorts, tiktok, etc.
│   ├── styles/
│   │   └── _defaults.yaml       # minimal, energetic, corporate
│   └── techniques/
│       ├── storytelling/
│       └── content-strategy/
│
└── docs/
    ├── design.md                # This document
    └── usage.md
```

**User installation:**

```bash
# 1. Install video_explainer (original tool - external dependency)
git clone <original-video_explainer-repo>
cd video_explainer && pip install -e .

# 2. Install skill wrapper (from imehr marketplace)
claude plugins install imehr/video-explainer-skill

# 3. Configure path to video_explainer
/video setup
```

**Marketplace entry (`imehr/imehr-marketplace`):**

```yaml
plugins:
  - name: video-explainer-skill
    repo: imehr/video-explainer-skill
    description: "Create explainer videos with multi-platform output, learning memory, and intelligent orchestration"
    category: content-creation
    requires:
      external:
        - name: video_explainer
          install: "pip install -e <repo>"
```

---

## Table of Contents

1. [Configuration Architecture](#1-configuration-architecture)
2. [Platform Profiles](#2-platform-profiles)
3. [Brand as Design System](#3-brand-as-design-system)
4. [Style Overlays](#4-style-overlays)
5. [Project Output Profiles](#5-project-output-profiles)
6. [Naming Convention](#6-naming-convention)
7. [Skill & Agent Interface](#7-skill--agent-interface)
8. [Intelligent Orchestrator](#8-intelligent-orchestrator)
9. [Quality & Accuracy Assurance](#9-quality--accuracy-assurance)
10. [Learning Memory System](#10-learning-memory-system)
11. [Hidden Skills - Storytelling & Content Strategy](#11-hidden-skills---storytelling--content-strategy)
12. [Skill Inheritance from Claude Code](#12-skill-inheritance-from-claude-code)
13. [Creator Control - Teaching New Skills](#13-creator-control---teaching-new-skills)
14. [File Structure](#14-file-structure)
15. [Installation](#15-installation)

---

## 1. Configuration Architecture

**Three independent axes stored hierarchically:**

```
~/.config/video-explainer/
├── brands/
│   ├── _defaults.yaml          # System defaults (fallback)
│   ├── personal.yaml           # Your personal brand
│   └── techcorp.yaml           # Client brand
├── platforms/
│   ├── _defaults.yaml          # System: youtube, shorts, tiktok, instagram, etc.
│   └── custom-square.yaml      # User-defined 1:1 format
├── styles/
│   ├── _defaults.yaml          # System: minimal, energetic, corporate, playful
│   └── my-style.yaml           # User-defined style
└── config.yaml                 # Global settings (video_explainer path, default TTS, etc.)
```

**Project-level overrides:**
```
my-project/
├── config.json                 # Project config with output profiles
├── brands/local-brand.yaml     # Project-specific brand (optional)
└── input/source.pdf
```

**Resolution order:** Project → User → System defaults

---

## 2. Platform Profiles

Each platform profile defines technical constraints:

```yaml
# platforms/youtube-short.yaml
name: youtube-short
display_name: "YouTube Shorts"
aspect_ratio: 9:16
resolution:
  width: 1080
  height: 1920
duration:
  max_seconds: 60
  recommended_seconds: 30-45
fps: 30
pacing: fast              # affects script generation (shorter sentences, quicker cuts)
safe_zones:               # areas to avoid for UI overlays
  top: 120px
  bottom: 100px
chunking:
  enabled: true           # allow auto-split of long content
  overlap_seconds: 2      # brief recap between parts
```

**Built-in platforms (system defaults):**

| Platform | Aspect | Max Duration | Pacing |
|----------|--------|--------------|--------|
| youtube | 16:9 | unlimited | normal |
| youtube-short | 9:16 | 60s | fast |
| tiktok | 9:16 | 180s | fast |
| instagram-reel | 9:16 | 90s | fast |
| instagram-story | 9:16 | 60s | fast |
| linkedin | 16:9 | 600s | normal |

---

## 3. Brand as Design System

Brand is a comprehensive, scalable design system:

```yaml
# brands/techcorp.yaml
name: techcorp
display_name: "TechCorp Inc"
version: "1.0"

# === VOICE & CONTENT ===
voice:
  tone: professional-friendly    # professional, casual, academic, playful
  personality: ["authoritative", "approachable", "concise"]
  writing_style:
    sentence_length: short       # short, medium, long
    vocabulary: technical        # simple, technical, academic
    perspective: first-plural    # "we explain" vs "this video explains"
  forbidden_words: ["basically", "simply", "just"]
  preferred_phrases:
    - "Here's the key insight"
    - "Let's break this down"

# === VISUAL IDENTITY ===
colors:
  primary: "#00d9ff"
  secondary: "#ff6b35"
  accent: "#00ff88"
  background:
    dark: "#0a0a1a"
    light: "#f5f5f7"
  semantic:
    success: "#00ff88"
    warning: "#ffcc00"
    error: "#ff4757"
    info: "#00d9ff"

typography:
  scale: 1.25              # modular scale ratio
  fonts:
    display: "Outfit"
    heading: "Inter"
    body: "Inter"
    code: "JetBrains Mono"
  weights:
    heading: 700
    body: 400
    emphasis: 600

# === GRAPHIC SYSTEM ===
graphics:
  corner_radius: 12px
  border_width: 2px
  shadow_style: glow       # none, subtle, glow, hard
  icon_style: outlined     # outlined, filled, duotone

animation:
  default_easing: ease-out
  default_duration: 0.3s
  entrance: fade-up
  exit: fade-down

# === ASSETS ===
assets:
  logo:
    primary: "assets/logo-primary.svg"
    monochrome: "assets/logo-mono.svg"
    position: top-right
  watermark:
    enabled: true
    opacity: 0.2
  intro_animation: "assets/intro.json"  # optional Lottie
  outro_animation: "assets/outro.json"

# === EXTENSIBILITY ===
extends: null              # can extend another brand
custom:                    # arbitrary key-values for future use
  client_id: "TC-001"
```

---

## 4. Style Overlays

Style is a lightweight "mood" modifier (independent of brand):

```yaml
# styles/energetic.yaml
name: energetic
display_name: "Energetic"
animation:
  speed_multiplier: 1.3
  easing_override: spring
  particles: true
pacing:
  wpm_adjustment: +20
  transition_speed: fast
```

**Usage:** `--brand techcorp --platform tiktok --style energetic`

---

## 5. Project Output Profiles

Project config defines which outputs to generate:

```json
{
  "id": "llm-explainer",
  "title": "How LLM Inference Works",
  "source": "input/paper.pdf",

  "defaults": {
    "brand": "techcorp",
    "style": "energetic"
  },

  "languages": ["en", "es", "fr"],
  "default_language": "en",

  "outputs": [
    {
      "id": "main",
      "platform": "youtube",
      "brand": "techcorp",
      "style": "minimal",
      "duration_target": 300,
      "languages": ["en", "es"],
      "voice_per_language": {
        "en": "elevenlabs:adam",
        "es": "elevenlabs:carlos"
      }
    },
    {
      "id": "shorts-series",
      "platform": "youtube-short",
      "chunking": "auto",
      "max_parts": 5
    },
    {
      "id": "tiktok",
      "platform": "tiktok",
      "style": "energetic",
      "chunking": "auto"
    },
    {
      "id": "linkedin",
      "platform": "linkedin",
      "style": "corporate",
      "duration_target": 120
    }
  ]
}
```

---

## 6. Naming Convention

**Pattern:** `{project}-{platform}-{lang}-{version}[-{part}].mp4`

**Output structure with languages and versions:**

```
my-project/output/
├── main/
│   ├── v1/                              # iteration 1
│   │   ├── en/
│   │   │   └── llm-explainer-youtube-en-v1.mp4
│   │   └── es/
│   │       └── llm-explainer-youtube-es-v1.mp4
│   ├── v2/                              # iteration 2 (after feedback)
│   │   └── ...
│   └── final/                           # promoted version
│       ├── en/
│       │   └── llm-explainer-youtube-en.mp4
│       └── es/
│           └── llm-explainer-youtube-es.mp4
└── shorts-series/
    └── v1/
        └── en/
            ├── llm-explainer-short-en-v1-part1.mp4
            ├── llm-explainer-short-en-v1-part2.mp4
            └── llm-explainer-short-en-v1-part3.mp4
```

**Commands:**

```bash
/video render my-proj                        # all outputs, all languages, new version
/video render my-proj --lang en              # english only
/video render my-proj --version v3           # specific version number
/video promote my-proj main v2               # promote v2 → final
/video compare my-proj main v1 v2            # side-by-side review
```

---

## 7. Skill & Agent Interface

**The `/video` skill provides interactive commands:**

```bash
# === PROJECT MANAGEMENT ===
/video new                          # wizard: asks platforms, brand, style, languages
/video new my-proj --quick          # skip wizard, use defaults
/video list                         # list all projects
/video status my-proj               # show progress, outputs, versions

# === CONFIGURATION ===
/video brands                       # list available brands
/video brands create                # interactive brand creation
/video platforms                    # list available platforms
/video styles                       # list available styles
/video config my-proj               # show/edit project config

# === PIPELINE STAGES (manual control) ===
/video script my-proj               # generate script only
/video scenes my-proj               # generate scenes only
/video render my-proj               # render all outputs
/video render my-proj --only main,tiktok   # specific outputs

# === ITERATION ===
/video feedback my-proj "make intro faster"
/video compare my-proj main v1 v2   # review versions
/video promote my-proj main v2      # promote to final

# === LEARNING ===
/video learn "use more analogies when explaining technical concepts"
/video memory                       # show learning summary
/video skills                       # list loaded skills

# === EXPORT ===
/video export my-proj --zip         # package final outputs for delivery
```

---

## 8. Intelligent Orchestrator

The orchestrator analyzes tasks and dynamically organizes agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                            │
│                                                                  │
│  Responsibilities:                                               │
│  1. Analyze task requirements                                    │
│  2. Plan which agents needed & their dependencies                │
│  3. Decide: foreground vs background, parallel vs sequential     │
│  4. Dispatch agents with proper context                          │
│  5. Monitor, validate, re-plan if failures                       │
│  6. Aggregate results and report                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Orchestrator decision example:**

```yaml
task: "Create explainer for YouTube + TikTok in en/es"

planning:
  total_outputs: 4 (youtube-en, youtube-es, tiktok-en, tiktok-es)

  analysis:
    - script generation: ~2 min, must be first, FOREGROUND (user may want to review)
    - scene generation: ~3 min each, 2 aspect ratios needed
        → run 16:9 and 9:16 IN PARALLEL, BACKGROUND
    - voiceover: ~1 min each, 2 languages needed
        → run en and es IN PARALLEL, BACKGROUND
        → can start WHILE scenes still generating (no dependency)
    - rendering: ~5 min each, 4 outputs
        → run all 4 IN PARALLEL, BACKGROUND
        → must wait for scenes + voiceover of same language/aspect

  decision:
    foreground_agents:
      - script-generator (user reviews before continuing)

    background_parallel_group_1:  # starts after script approved
      - scene-generator-16x9
      - scene-generator-9x16
      - voiceover-en
      - voiceover-es

    background_parallel_group_2:  # starts when dependencies ready
      - render-youtube-en (needs: 16x9 scenes + en voiceover)
      - render-youtube-es (needs: 16x9 scenes + es voiceover)
      - render-tiktok-en (needs: 9x16 scenes + en voiceover)
      - render-tiktok-es (needs: 9x16 scenes + es voiceover)
```

**Orchestrator adapts to context:**

| Situation | Orchestrator Decision |
|-----------|----------------------|
| User on slow machine | Reduce parallel agents to 2 |
| Only 1 output requested | Skip parallelization overhead |
| Previous render failed | Re-run only failed agent, reuse cached work |
| User says "quick preview" | Run single 480p render foreground, skip others |
| Large PDF input | Run ingestion in background, notify when ready |

---

## 9. Quality & Accuracy Assurance

**Quality gates in orchestrator:**

```yaml
validation:
  concept_coverage:
    - Extract key concepts from source document
    - Verify each concept appears in script
    - Score: "8/10 concepts covered"
    - Flag: "Missing: attention mechanism explanation"

  audio_sync:
    - Verify voiceover duration matches scene duration
    - Check for awkward pauses (> 2s silence)
    - Verify music doesn't overpower narration
    - Check audio levels (voiceover -6dB, music -18dB)

  narrative_flow:
    - Hook present in first 5 seconds?
    - Clear transitions between concepts?
    - Call-to-action at end?

  fact_check:
    - Run existing factcheck against source
    - Flag claims not supported by source material
```

---

## 10. Learning Memory System

**Storage structure:**

```
~/.config/video-explainer/memory/

production_history/
├── 2026-01-13-llm-explainer.yaml    # Per-project learnings
├── 2026-01-10-react-hooks.yaml
└── ...

aggregated/
├── patterns.yaml                     # What works across projects
├── failures.yaml                     # What to avoid
└── user_preferences.yaml             # Inferred from feedback
```

**Per-production capture:**

```yaml
# production_history/2026-01-13-llm-explainer.yaml
project: llm-explainer
source_type: pdf
topic_domain: machine-learning
duration: 300s
platforms: [youtube, tiktok]

# === WHAT WORKED ===
successes:
  hook:
    technique: "provocative question"
    text: "What if I told you GPT processes tokens slower than you read?"
    engagement_signal: user_approved_first_draft

  scene_3:
    visual_technique: "side-by-side comparison"
    concept: "prefill vs decode"
    feedback: "user said 'perfect visualization'"

# === WHAT DIDN'T WORK ===
failures:
  scene_5:
    issue: "too much text on screen"
    iterations_needed: 3
    fix_applied: "split into 2 scenes"

  voiceover:
    issue: "pacing too fast for technical content"
    user_feedback: "slow down the KV cache explanation"
    fix_applied: "reduced WPM from 160 to 140 for technical sections"

# === METRICS ===
iterations:
  script: 2
  scenes: 4
  total_feedback_rounds: 3

time_spent:
  script_generation: 180s
  scene_generation: 420s
  user_review_time: 900s

# === INFERRED PREFERENCES ===
preferences_detected:
  - prefers_minimal_text_on_screen
  - likes_side_by_side_comparisons
  - wants_slower_pacing_for_technical
```

---

## 11. Hidden Skills - Storytelling & Content Strategy

**Skills directory structure:**

```
~/.config/video-explainer/skills/

storytelling/
├── hooks.yaml                # Opening techniques
├── narrative-structures.yaml # Story arcs
├── transitions.yaml          # Scene-to-scene flow
└── closings.yaml            # CTAs, endings

content-strategy/
├── audience-retention.yaml   # Keep viewers watching
├── platform-algorithms.yaml  # What platforms favor
├── thumbnail-titles.yaml     # Click-worthy framing
└── series-planning.yaml      # Multi-part content

domain-knowledge/
├── technical-explainers.yaml # How to explain tech
├── tutorials.yaml            # Step-by-step teaching
└── thought-leadership.yaml   # Opinion/insight pieces
```

**Example skill file:**

```yaml
# skills/storytelling/hooks.yaml
name: hooks
description: Techniques for grabbing attention in first 5 seconds

techniques:
  - id: provocative-question
    description: "Ask something counterintuitive"
    example: "What if everything you know about X is wrong?"
    when_to_use: ["myth-busting", "surprising-insights"]
    effectiveness_score: 0.85  # learned from feedback

  - id: bold-claim
    description: "State a surprising fact"
    example: "This one change made our system 10x faster"
    when_to_use: ["case-studies", "tutorials"]
    effectiveness_score: 0.78

  - id: pain-point
    description: "Describe a relatable frustration"
    example: "Ever spent hours debugging only to find..."
    when_to_use: ["problem-solving", "tutorials"]
    effectiveness_score: 0.82

  - id: visual-hook
    description: "Start with striking visual, no narration"
    example: "Show dramatic before/after"
    when_to_use: ["short-form", "visual-heavy"]
    effectiveness_score: 0.91

last_updated: 2026-01-13
learned_from_projects: ["llm-explainer", "react-hooks", "python-tips"]
```

---

## 12. Skill Inheritance from Claude Code

**Extends Claude Code's skill pattern with technique modules:**

```
~/.claude/skills/video-explainer/
├── video.md                      # Main skill (commands)
│
├── techniques/                   # Inherited skill pattern
│   ├── _loader.md               # Meta-skill that loads techniques
│   ├── hooks.md                 # Storytelling hooks
│   ├── narrative-structures.md  # Story arcs
│   └── platform-optimization.md # Platform-specific tips
│
└── learned/                      # Auto-generated from production
    ├── user-preferences.md       # Inferred from feedback
    └── effective-patterns.md     # High-success patterns
```

**Technique skill file (inherits Claude Code skill format):**

```markdown
---
name: video-hooks
description: Opening techniques for video explainers
parent: video                        # Inherits from main video skill
type: technique                      # Not a command, a knowledge module
auto_apply: true                     # Orchestrator loads automatically
triggers:
  - script_generation
  - hook_scene_creation
---

# Video Hook Techniques

When generating the opening of a video explainer, select from these techniques:

## Provocative Question
Ask something counterintuitive that challenges assumptions.

**When to use:** Technical content, myth-busting, surprising insights
**Effectiveness:** 85% (based on 12 productions)

**Example:**
> "What if I told you that 90% of your GPU sits idle during LLM inference?"
```

**Orchestrator loads skills dynamically:**

```typescript
// orchestrator.ts
async function loadApplicableSkills(context: ProductionContext) {
  const skills = await glob('~/.claude/skills/video-explainer/**/*.md');

  return skills.filter(skill => {
    const meta = parseYamlFrontmatter(skill);
    return meta.triggers?.some(t => t === context.currentStage);
  });
}
```

---

## 13. Creator Control - Teaching New Skills

**Learning configuration:**

```yaml
# ~/.config/video-explainer/learning.yaml

# === SKILL SOURCES ===
skill_sources:
  - type: local
    path: ~/.claude/skills/video-explainer/techniques/

  - type: git
    url: https://github.com/yourname/video-skills
    branch: main
    sync: weekly

  - type: marketplace
    publisher: yourname
    packages: ["storytelling-pro", "youtube-optimization"]

# === LEARNING INTERVALS ===
learning:
  after_each_production:
    - extract_successes_failures
    - update_effectiveness_scores
    - detect_user_preferences

  weekly:
    - aggregate_patterns_across_projects
    - generate_learned_skills_summary
    - prune_low_effectiveness_techniques

  monthly:
    - prompt: "Review learning summary and approve skill updates?"
    - generate_skill_improvement_report
    - suggest_new_techniques_to_try

# === SKILL INJECTION RULES ===
injection:
  mandatory:
    - hooks
    - brand-voice

  contextual:
    - skill: platform-optimization
      when: platform != "youtube"
    - skill: technical-pacing
      when: domain in ["ml", "programming", "engineering"]

  experimental:
    - skill: new-transition-style
      apply_probability: 0.3
      track_effectiveness: true

# === TEACHING INPUTS ===
teaching:
  technique_inbox: ~/.config/video-explainer/inbox/

  feedback_commands:
    - "/video learn 'always use visual hooks for short-form'"
    - "/video forget 'bold-claim technique'"
    - "/video prefer 'slower pacing' for domain:technical"
```

**Teaching commands:**

```bash
# === TEACHING ===
/video learn "use more analogies when explaining technical concepts"
/video learn --from-url https://example.com/storytelling-tips
/video learn --from-file ./my-new-technique.md

# === REVIEWING WHAT IT LEARNED ===
/video memory                           # Show learning summary
/video memory --patterns                # Show discovered patterns
/video memory --preferences             # Show inferred preferences
/video memory --effectiveness           # Show technique scores

# === ADJUSTING ===
/video forget "bold-claim technique"    # Remove a technique
/video prefer "minimal text" --always   # Set strong preference
/video experiment "new-hook" --rate 0.2 # Try new technique 20% of time

# === SKILL MANAGEMENT ===
/video skills                           # List all loaded skills
/video skills sync                      # Pull from git sources
/video skills publish storytelling      # Share a skill package
/video skills import user/package       # Import from marketplace
```

**Monthly learning report:**

```
📊 Video Explainer Learning Report - January 2026

Productions this month: 12
Total feedback rounds: 34

🎯 Most Effective Techniques:
1. visual-hook (94% success) - especially for short-form
2. problem-solution structure (88%)
3. side-by-side comparisons (85%)

📉 Underperforming:
1. bold-claim hook (62%) - often feels clickbait-y
   → Suggestion: Retire or restrict to specific contexts?

🆕 Patterns Discovered:
- User prefers 30% less text on screen than default
- Technical topics need 15% slower pacing
- Spanish voiceovers preferred "carlos" voice over "sofia"

💡 Suggested New Skills to Try:
- "cold-open" technique (no intro, straight to content)
- "chapter-markers" for long-form (detected: user often seeks)

Actions: [Apply suggestions] [Review details] [Dismiss]
```

---

## 14. File Structure

**User-level installation:**

```
~/.claude/
├── skills/
│   └── video-explainer/
│       ├── video.md                 # Main skill file
│       ├── techniques/              # Technique skill modules
│       │   ├── hooks.md
│       │   ├── narrative-structures.md
│       │   └── platform-optimization.md
│       └── learned/                 # Auto-generated
│           ├── user-preferences.md
│           └── effective-patterns.md
│
└── plugins/
    └── video-explainer/
        ├── package.json
        ├── src/
        │   ├── index.ts             # Plugin entry
        │   ├── orchestrator.ts      # Intelligent orchestrator
        │   ├── agents/
        │   │   ├── script-agent.ts
        │   │   ├── scene-agent.ts
        │   │   ├── voiceover-agent.ts
        │   │   └── render-agent.ts
        │   ├── validators/
        │   │   ├── script-validator.ts
        │   │   ├── scene-validator.ts
        │   │   └── output-validator.ts
        │   └── planner.ts           # Task analysis & planning
        └── dist/

~/.config/video-explainer/
├── config.yaml                      # Global settings
├── learning.yaml                    # Learning configuration
├── brands/
│   ├── _defaults.yaml
│   └── personal.yaml
├── platforms/
│   └── _defaults.yaml
├── styles/
│   └── _defaults.yaml
├── skills/                          # YAML technique definitions
│   ├── storytelling/
│   ├── content-strategy/
│   └── domain-knowledge/
├── memory/
│   ├── production_history/
│   └── aggregated/
└── assets/
```

**Repository additions:**

```
video_explainer/
├── claude-code/
│   ├── skills/
│   │   ├── video.md
│   │   └── techniques/
│   ├── plugin/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   └── defaults/
│       ├── brands/
│       ├── platforms/
│       ├── styles/
│       └── skills/
├── scripts/
│   └── install-claude-code-integration.sh
└── docs/
    └── claude-code-integration.md
```

---

## 15. Installation

```bash
# From video_explainer repo
./scripts/install-claude-code-integration.sh

# Creates:
# - ~/.claude/skills/video-explainer/
# - ~/.claude/plugins/video-explainer/
# - ~/.config/video-explainer/ (with defaults)
```

**First-time usage:**

```bash
/video setup                    # Configure video_explainer path
/video brands create            # Create your first brand
/video new my-first-video       # Wizard walks through setup
```

---

## Summary

This design creates:

| Component | Description |
|-----------|-------------|
| **Config Matrix** | Brand × Platform × Style (hierarchical: System → User → Project) |
| **Brand System** | Comprehensive design system with voice, visuals, assets |
| **Platform Profiles** | Technical constraints + pacing for each platform |
| **Output Profiles** | Multi-platform, multi-language, versioned outputs |
| **Intelligent Orchestrator** | Dynamically plans parallel/background agent execution |
| **Quality Gates** | Concept coverage, audio sync, narrative flow, fact-check |
| **Learning Memory** | Captures successes, failures, preferences per production |
| **Skill System** | Inherits Claude Code skill architecture, auto-applies techniques |
| **Creator Control** | Teach, review, adjust learning; skill sources & injection rules |
