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
    runAfter: string[];
}
export interface ExecutionPlan {
    projectName: string;
    totalOutputs: number;
    foregroundTasks: AgentTask[];
    backgroundGroups: TaskGroup[];
    estimatedTotalDuration: number;
}
export declare class TaskPlanner {
    private config;
    constructor(config: ConfigLoader);
    /**
     * Create execution plan for render operation
     */
    planRender(projectName: string, options?: RenderOptions): Promise<ExecutionPlan>;
    /**
     * Get required aspect ratios for a project
     */
    getRequiredAspectRatios(projectName: string): string[];
    /**
     * Get project outputs based on config and options
     */
    private getProjectOutputs;
    /**
     * Calculate estimated total duration considering parallelization
     */
    private calculateTotalDuration;
}
//# sourceMappingURL=planner.d.ts.map