/**
 * Task Planner
 *
 * Analyzes tasks and creates execution plans:
 * - Determines which agents are needed
 * - Identifies dependencies between tasks
 * - Decides foreground vs background execution
 * - Groups parallel tasks
 */

import { ConfigLoader } from './config-loader';
import { RenderOptions } from './index';

export interface AgentTask {
  id: string;
  name: string;
  type: 'script' | 'scene' | 'voiceover' | 'render' | 'validate';
  dependencies: string[];
  platform?: string;
  language?: string;
  aspectRatio?: string;
  outputId?: string;
  estimatedDuration?: number;
}

export interface TaskGroup {
  id: string;
  tasks: AgentTask[];
  runAfter: string[]; // IDs of tasks/groups this depends on
}

export interface ExecutionPlan {
  projectName: string;
  totalOutputs: number;
  foregroundTasks: AgentTask[];
  backgroundGroups: TaskGroup[];
  estimatedTotalDuration: number;
}

export class TaskPlanner {
  private config: ConfigLoader;

  constructor(config: ConfigLoader) {
    this.config = config;
  }

  /**
   * Create execution plan for render operation
   */
  async planRender(projectName: string, options?: RenderOptions): Promise<ExecutionPlan> {
    // TODO: Load project config to get outputs
    const outputs = this.getProjectOutputs(projectName, options);

    const foregroundTasks: AgentTask[] = [];
    const backgroundGroups: TaskGroup[] = [];

    // Script generation is foreground (user review expected)
    foregroundTasks.push({
      id: 'script',
      name: 'Script Generation',
      type: 'script',
      dependencies: [],
      estimatedDuration: 120,
    });

    // Determine unique aspect ratios and languages needed
    const aspectRatios = new Set<string>();
    const languages = new Set<string>();

    for (const output of outputs) {
      const platform = this.config.getPlatform(output.platform);
      aspectRatios.add(platform?.aspect_ratio ?? '16:9');
      languages.add(output.language ?? 'en');
    }

    // Scene generation - parallel per aspect ratio
    const sceneGroup: TaskGroup = {
      id: 'scenes',
      tasks: [],
      runAfter: ['script'],
    };

    for (const aspectRatio of aspectRatios) {
      sceneGroup.tasks.push({
        id: `scene-${aspectRatio.replace(':', 'x')}`,
        name: `Scene Generation (${aspectRatio})`,
        type: 'scene',
        dependencies: ['script'],
        aspectRatio,
        estimatedDuration: 180,
      });
    }

    // Voiceover generation - parallel per language
    const voiceoverGroup: TaskGroup = {
      id: 'voiceovers',
      tasks: [],
      runAfter: ['script'], // Can run alongside scenes
    };

    for (const language of languages) {
      voiceoverGroup.tasks.push({
        id: `voiceover-${language}`,
        name: `Voiceover (${language})`,
        type: 'voiceover',
        dependencies: ['script'],
        language,
        estimatedDuration: 60,
      });
    }

    backgroundGroups.push(sceneGroup, voiceoverGroup);

    // Render tasks - parallel, but each depends on specific scene + voiceover
    const renderGroup: TaskGroup = {
      id: 'renders',
      tasks: [],
      runAfter: ['scenes', 'voiceovers'],
    };

    for (const output of outputs) {
      const platform = this.config.getPlatform(output.platform);
      const aspectRatio = platform?.aspect_ratio ?? '16:9';

      renderGroup.tasks.push({
        id: `render-${output.id}-${output.language ?? 'en'}`,
        name: `Render ${output.platform} (${output.language ?? 'en'})`,
        type: 'render',
        dependencies: [
          `scene-${aspectRatio.replace(':', 'x')}`,
          `voiceover-${output.language ?? 'en'}`,
        ],
        platform: output.platform,
        language: output.language ?? 'en',
        outputId: output.id,
        estimatedDuration: 300,
      });
    }

    backgroundGroups.push(renderGroup);

    return {
      projectName,
      totalOutputs: outputs.length,
      foregroundTasks,
      backgroundGroups,
      estimatedTotalDuration: this.calculateTotalDuration(foregroundTasks, backgroundGroups),
    };
  }

  /**
   * Get required aspect ratios for a project
   */
  getRequiredAspectRatios(projectName: string): string[] {
    // TODO: Load from project config
    return ['16:9', '9:16'];
  }

  /**
   * Get project outputs based on config and options
   */
  private getProjectOutputs(
    projectName: string,
    options?: RenderOptions
  ): Array<{ id: string; platform: string; language?: string }> {
    // TODO: Load from project config
    // For now, return placeholder
    const outputs = [
      { id: 'main', platform: 'youtube', language: 'en' },
      { id: 'tiktok', platform: 'tiktok', language: 'en' },
    ];

    if (options?.only) {
      return outputs.filter((o) => options.only?.includes(o.id));
    }

    if (options?.lang) {
      return outputs.filter((o) => o.language === options.lang);
    }

    return outputs;
  }

  /**
   * Calculate estimated total duration considering parallelization
   */
  private calculateTotalDuration(
    foregroundTasks: AgentTask[],
    backgroundGroups: TaskGroup[]
  ): number {
    let total = 0;

    // Foreground tasks are sequential
    for (const task of foregroundTasks) {
      total += task.estimatedDuration ?? 60;
    }

    // Background groups: take longest task in each group
    for (const group of backgroundGroups) {
      const maxDuration = Math.max(
        ...group.tasks.map((t) => t.estimatedDuration ?? 60)
      );
      total += maxDuration;
    }

    return total;
  }
}
