/**
 * Intelligent Orchestrator
 *
 * Analyzes tasks and dynamically organizes agent execution:
 * - Decides foreground vs background execution
 * - Plans parallel vs sequential workflows
 * - Monitors progress and validates outputs
 * - Re-plans on failures
 */

import { ConfigLoader } from './config-loader';
import { MemoryManager } from './memory-manager';
import { TaskPlanner, ExecutionPlan, AgentTask } from './planner';
import {
  PluginContext,
  NewProjectOptions,
  RenderOptions,
  ProjectConfig,
  RenderResult,
  ScriptResult,
  ScenesResult,
  OutputResult,
} from './index';

export class Orchestrator {
  private context: PluginContext;
  private config: ConfigLoader;
  private memory: MemoryManager;
  private planner: TaskPlanner;

  constructor(context: PluginContext, config: ConfigLoader, memory: MemoryManager) {
    this.context = context;
    this.config = config;
    this.memory = memory;
    this.planner = new TaskPlanner(config);
  }

  /**
   * Run initial setup wizard
   */
  async runSetup(): Promise<void> {
    // Setup will be handled interactively by Claude Code
    // This method prepares the environment
    console.log('Video Explainer Setup');
    console.log('=====================');
    console.log('');
    console.log('Please provide the path to your video_explainer installation.');
    console.log('');
    // Actual path collection handled by skill interaction
  }

  /**
   * Create a new video project
   */
  async createProject(name: string, options?: NewProjectOptions): Promise<ProjectConfig> {
    const defaults = this.config.getDefaults();

    const projectConfig: ProjectConfig = {
      id: name,
      title: name,
      source: `input/source.pdf`,
      defaults: {
        brand: options?.brand ?? defaults.brand ?? 'minimal',
        style: options?.style ?? defaults.style ?? 'minimal',
      },
      languages: options?.languages ?? ['en'],
      outputs: [],
    };

    // Generate output configurations based on selected platforms
    const platforms = options?.platforms ?? ['youtube'];
    for (const platform of platforms) {
      const platformConfig = this.config.getPlatform(platform);
      projectConfig.outputs.push({
        id: platform === 'youtube' ? 'main' : platform,
        platform,
        chunking: platformConfig?.chunking?.enabled ? 'auto' : 'none',
      });
    }

    return projectConfig;
  }

  /**
   * Execute full render pipeline
   */
  async executeRender(projectName: string, options?: RenderOptions): Promise<RenderResult> {
    // Create execution plan
    const plan = await this.planner.planRender(projectName, options);

    console.log(`Execution Plan for ${projectName}:`);
    console.log(`  Total outputs: ${plan.totalOutputs}`);
    console.log(`  Foreground tasks: ${plan.foregroundTasks.length}`);
    console.log(`  Background groups: ${plan.backgroundGroups.length}`);

    const results: OutputResult[] = [];
    let version = options?.version ?? `v${Date.now()}`;

    // Execute foreground tasks (user review expected)
    for (const task of plan.foregroundTasks) {
      console.log(`[FOREGROUND] ${task.name}`);
      const result = await this.executeTask(task);
      if (!result.success) {
        return { success: false, outputs: [], version };
      }
    }

    // Execute background groups in parallel
    for (const group of plan.backgroundGroups) {
      console.log(`[BACKGROUND PARALLEL] Starting ${group.tasks.length} tasks`);
      const groupResults = await Promise.all(
        group.tasks.map((task) => this.executeTask(task))
      );

      for (const result of groupResults) {
        if (result.output) {
          results.push(result.output);
        }
      }
    }

    // Record production for learning
    await this.memory.recordProduction(projectName, {
      success: true,
      outputs: results,
      version,
    });

    return {
      success: true,
      outputs: results,
      version,
    };
  }

  /**
   * Execute script generation (foreground, user review expected)
   */
  async executeScript(projectName: string): Promise<ScriptResult> {
    console.log(`Generating script for ${projectName}...`);

    // Load applicable skills
    const skills = await this.loadApplicableSkills('script_generation');
    console.log(`Loaded ${skills.length} technique skills`);

    // TODO: Call video_explainer CLI
    // For now, return placeholder
    return {
      success: true,
      scriptPath: `${projectName}/output/script.json`,
      wordCount: 500,
      estimatedDuration: 180,
    };
  }

  /**
   * Execute scene generation (parallel per aspect ratio)
   */
  async executeScenes(projectName: string): Promise<ScenesResult> {
    console.log(`Generating scenes for ${projectName}...`);

    // Determine which aspect ratios are needed
    const aspectRatios = this.planner.getRequiredAspectRatios(projectName);

    console.log(`Required aspect ratios: ${aspectRatios.join(', ')}`);

    // Run scene generation in parallel for each aspect ratio
    const scenePaths: Record<string, string> = {};
    await Promise.all(
      aspectRatios.map(async (aspectRatio) => {
        console.log(`[PARALLEL] Generating ${aspectRatio} scenes...`);
        scenePaths[aspectRatio] = `${projectName}/output/scenes-${aspectRatio.replace(':', 'x')}.json`;
      })
    );

    return {
      success: true,
      scenePaths,
      sceneCount: Object.keys(scenePaths).length * 10, // placeholder
    };
  }

  /**
   * Apply user feedback and re-render
   */
  async applyFeedback(projectName: string, feedbackText: string): Promise<void> {
    console.log(`Applying feedback to ${projectName}: "${feedbackText}"`);

    // Record feedback for learning
    await this.memory.recordFeedback(projectName, feedbackText);

    // Re-run affected stages
    // (In real implementation, analyze feedback to determine what to re-run)
  }

  /**
   * Execute a single agent task
   */
  private async executeTask(task: AgentTask): Promise<{ success: boolean; output?: OutputResult }> {
    console.log(`  Executing: ${task.name}`);

    // TODO: Implement actual task execution
    // This would spawn subagents or call video_explainer CLI

    return {
      success: true,
      output: task.outputId
        ? {
            id: task.outputId,
            platform: task.platform ?? 'unknown',
            language: task.language ?? 'en',
            path: `output/${task.outputId}.mp4`,
            success: true,
          }
        : undefined,
    };
  }

  /**
   * Load technique skills applicable to current stage
   */
  private async loadApplicableSkills(stage: string): Promise<string[]> {
    // TODO: Load skills from ~/.claude/skills/video-explainer/techniques/
    // Filter by triggers matching current stage
    return ['hooks', 'narrative', 'platform-optimization'];
  }
}
