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
    scenePaths: Record<string, string>;
    sceneCount: number;
}
/**
 * Create and initialize the video explainer plugin
 */
export declare function createPlugin(context: PluginContext): Promise<VideoExplainerPlugin>;
export { Orchestrator } from './orchestrator';
export { ConfigLoader } from './config-loader';
export { MemoryManager } from './memory-manager';
export { TaskPlanner, ExecutionPlan } from './planner';
//# sourceMappingURL=index.d.ts.map