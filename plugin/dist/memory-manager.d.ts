/**
 * Memory Manager
 *
 * Handles learning memory system:
 * - Records production history
 * - Captures successes and failures
 * - Tracks user preferences
 * - Aggregates patterns over time
 */
export interface ProductionRecord {
    project: string;
    timestamp: string;
    sourceType?: string;
    topicDomain?: string;
    duration?: number;
    platforms: string[];
    successes: SuccessRecord[];
    failures: FailureRecord[];
    preferences_detected: string[];
    iterations: {
        script: number;
        scenes: number;
        total_feedback_rounds: number;
    };
}
export interface SuccessRecord {
    component: string;
    technique?: string;
    description: string;
    feedback?: string;
}
export interface FailureRecord {
    component: string;
    issue: string;
    iterations_needed: number;
    fix_applied: string;
}
export interface AggregatedPatterns {
    effective_techniques: Array<{
        technique: string;
        success_rate: number;
        usage_count: number;
    }>;
    common_failures: Array<{
        issue: string;
        frequency: number;
        common_fix: string;
    }>;
    user_preferences: string[];
}
export interface LearningInstruction {
    instruction: string;
    timestamp: string;
    source: 'user' | 'inferred';
    applied: boolean;
}
export declare class MemoryManager {
    private configDir;
    private memoryDir;
    private productionHistory;
    private aggregatedPatterns;
    private learnings;
    constructor(configDir: string);
    /**
     * Load memory from disk
     */
    load(): Promise<void>;
    /**
     * Record a completed production
     */
    recordProduction(projectName: string, result: {
        success: boolean;
        outputs: unknown[];
        version: string;
    }): Promise<void>;
    /**
     * Record user feedback
     */
    recordFeedback(projectName: string, feedback: string): Promise<void>;
    /**
     * Add a learning instruction from user
     */
    addLearning(instruction: string): Promise<void>;
    /**
     * Get learning summary for display
     */
    getLearningSummary(): {
        total_productions: number;
        total_feedback_rounds: number;
        top_techniques: Array<{
            name: string;
            success_rate: number;
        }>;
        user_preferences: string[];
        recent_learnings: string[];
    };
    /**
     * Get patterns for display
     */
    getPatterns(): AggregatedPatterns;
    /**
     * Get user preferences for display
     */
    getPreferences(): string[];
    /**
     * Get technique effectiveness scores
     */
    getEffectiveness(): Array<{
        technique: string;
        score: number;
        usage: number;
    }>;
    /**
     * Remove a learned technique/preference
     */
    forget(item: string): Promise<void>;
    private ensureDirectories;
    private loadProductionHistory;
    private loadAggregatedPatterns;
    private loadLearnings;
    private saveProductionRecord;
    private saveAggregatedPatterns;
    private saveLearnings;
    private updateAggregatedPatterns;
    private analyzeForPreferences;
}
//# sourceMappingURL=memory-manager.d.ts.map