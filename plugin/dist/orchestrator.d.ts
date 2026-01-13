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
import { PluginContext, NewProjectOptions, RenderOptions, ProjectConfig, RenderResult, ScriptResult, ScenesResult } from './index';
export declare class Orchestrator {
    private context;
    private config;
    private memory;
    private planner;
    constructor(context: PluginContext, config: ConfigLoader, memory: MemoryManager);
    /**
     * Run initial setup wizard
     */
    runSetup(): Promise<void>;
    /**
     * Create a new video project
     */
    createProject(name: string, options?: NewProjectOptions): Promise<ProjectConfig>;
    /**
     * Execute full render pipeline
     */
    executeRender(projectName: string, options?: RenderOptions): Promise<RenderResult>;
    /**
     * Execute script generation (foreground, user review expected)
     */
    executeScript(projectName: string): Promise<ScriptResult>;
    /**
     * Execute scene generation (parallel per aspect ratio)
     */
    executeScenes(projectName: string): Promise<ScenesResult>;
    /**
     * Apply user feedback and re-render
     */
    applyFeedback(projectName: string, feedbackText: string): Promise<void>;
    /**
     * Execute a single agent task
     */
    private executeTask;
    /**
     * Load technique skills applicable to current stage
     */
    private loadApplicableSkills;
}
//# sourceMappingURL=orchestrator.d.ts.map