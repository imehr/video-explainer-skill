/**
 * Video Explainer Plugin - Entry Point
 *
 * Intelligent orchestrator plugin for creating multi-platform explainer videos
 * with parallel agent execution and learning memory.
 */

import { Orchestrator } from './orchestrator';
import { ConfigLoader } from './config-loader';
import { MemoryManager } from './memory-manager';

export interface PluginContext {
  configDir: string;
  projectDir?: string;
  videoExplainerPath: string;
}

export interface VideoExplainerPlugin {
  name: string;
  version: string;
  orchestrator: Orchestrator;
  config: ConfigLoader;
  memory: MemoryManager;

  // Main entry points for skill commands
  setup(): Promise<void>;
  newProject(name: string, options?: NewProjectOptions): Promise<ProjectConfig>;
  render(projectName: string, options?: RenderOptions): Promise<RenderResult>;
  script(projectName: string): Promise<ScriptResult>;
  scenes(projectName: string): Promise<ScenesResult>;
  feedback(projectName: string, feedbackText: string): Promise<void>;
  learn(instruction: string): Promise<void>;
}

export interface NewProjectOptions {
  quick?: boolean;
  brand?: string;
  platforms?: string[];
  style?: string;
  languages?: string[];
}

export interface RenderOptions {
  only?: string[];
  lang?: string;
  version?: string;
}

export interface ProjectConfig {
  id: string;
  title: string;
  source: string;
  defaults: {
    brand: string;
    style: string;
  };
  languages: string[];
  outputs: OutputConfig[];
}

export interface OutputConfig {
  id: string;
  platform: string;
  brand?: string;
  style?: string;
  chunking?: 'auto' | 'none';
  maxParts?: number;
}

export interface RenderResult {
  success: boolean;
  outputs: OutputResult[];
  version: string;
}

export interface OutputResult {
  id: string;
  platform: string;
  language: string;
  path: string;
  success: boolean;
  error?: string;
}

export interface ScriptResult {
  success: boolean;
  scriptPath: string;
  wordCount: number;
  estimatedDuration: number;
}

export interface ScenesResult {
  success: boolean;
  scenePaths: Record<string, string>; // aspectRatio -> path
  sceneCount: number;
}

/**
 * Create and initialize the video explainer plugin
 */
export async function createPlugin(context: PluginContext): Promise<VideoExplainerPlugin> {
  const config = new ConfigLoader(context.configDir);
  const memory = new MemoryManager(context.configDir);
  const orchestrator = new Orchestrator(context, config, memory);

  await config.load();
  await memory.load();

  return {
    name: 'video-explainer',
    version: '0.1.0',
    orchestrator,
    config,
    memory,

    async setup() {
      return orchestrator.runSetup();
    },

    async newProject(name: string, options?: NewProjectOptions) {
      return orchestrator.createProject(name, options);
    },

    async render(projectName: string, options?: RenderOptions) {
      return orchestrator.executeRender(projectName, options);
    },

    async script(projectName: string) {
      return orchestrator.executeScript(projectName);
    },

    async scenes(projectName: string) {
      return orchestrator.executeScenes(projectName);
    },

    async feedback(projectName: string, feedbackText: string) {
      return orchestrator.applyFeedback(projectName, feedbackText);
    },

    async learn(instruction: string) {
      return memory.addLearning(instruction);
    },
  };
}

// Export types and classes for external use
export { Orchestrator } from './orchestrator';
export { ConfigLoader } from './config-loader';
export { MemoryManager } from './memory-manager';
export { TaskPlanner, ExecutionPlan } from './planner';
