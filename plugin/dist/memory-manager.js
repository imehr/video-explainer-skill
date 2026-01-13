"use strict";
/**
 * Memory Manager
 *
 * Handles learning memory system:
 * - Records production history
 * - Captures successes and failures
 * - Tracks user preferences
 * - Aggregates patterns over time
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MemoryManager {
    configDir;
    memoryDir;
    productionHistory = [];
    aggregatedPatterns = {
        effective_techniques: [],
        common_failures: [],
        user_preferences: [],
    };
    learnings = [];
    constructor(configDir) {
        this.configDir = configDir;
        this.memoryDir = path.join(configDir, 'memory');
    }
    /**
     * Load memory from disk
     */
    async load() {
        await this.ensureDirectories();
        await this.loadProductionHistory();
        await this.loadAggregatedPatterns();
        await this.loadLearnings();
    }
    /**
     * Record a completed production
     */
    async recordProduction(projectName, result) {
        const record = {
            project: projectName,
            timestamp: new Date().toISOString(),
            platforms: [],
            successes: [],
            failures: [],
            preferences_detected: [],
            iterations: {
                script: 1,
                scenes: 1,
                total_feedback_rounds: 0,
            },
        };
        this.productionHistory.push(record);
        await this.saveProductionRecord(record);
        // Update aggregated patterns periodically
        if (this.productionHistory.length % 5 === 0) {
            await this.updateAggregatedPatterns();
        }
    }
    /**
     * Record user feedback
     */
    async recordFeedback(projectName, feedback) {
        // Find the most recent record for this project
        const record = this.productionHistory
            .slice()
            .reverse()
            .find((r) => r.project === projectName);
        if (record) {
            record.iterations.total_feedback_rounds++;
            // Analyze feedback for preferences
            const detectedPreferences = this.analyzeForPreferences(feedback);
            record.preferences_detected.push(...detectedPreferences);
            await this.saveProductionRecord(record);
        }
    }
    /**
     * Add a learning instruction from user
     */
    async addLearning(instruction) {
        const learning = {
            instruction,
            timestamp: new Date().toISOString(),
            source: 'user',
            applied: false,
        };
        this.learnings.push(learning);
        await this.saveLearnings();
        console.log(`Learning recorded: "${instruction}"`);
    }
    /**
     * Get learning summary for display
     */
    getLearningSummary() {
        const totalFeedback = this.productionHistory.reduce((sum, r) => sum + r.iterations.total_feedback_rounds, 0);
        return {
            total_productions: this.productionHistory.length,
            total_feedback_rounds: totalFeedback,
            top_techniques: this.aggregatedPatterns.effective_techniques
                .slice(0, 5)
                .map((t) => ({ name: t.technique, success_rate: t.success_rate })),
            user_preferences: this.aggregatedPatterns.user_preferences,
            recent_learnings: this.learnings.slice(-5).map((l) => l.instruction),
        };
    }
    /**
     * Get patterns for display
     */
    getPatterns() {
        return this.aggregatedPatterns;
    }
    /**
     * Get user preferences for display
     */
    getPreferences() {
        return this.aggregatedPatterns.user_preferences;
    }
    /**
     * Get technique effectiveness scores
     */
    getEffectiveness() {
        return this.aggregatedPatterns.effective_techniques.map((t) => ({
            technique: t.technique,
            score: t.success_rate,
            usage: t.usage_count,
        }));
    }
    /**
     * Remove a learned technique/preference
     */
    async forget(item) {
        // Remove from learnings
        this.learnings = this.learnings.filter((l) => !l.instruction.toLowerCase().includes(item.toLowerCase()));
        // Remove from preferences
        this.aggregatedPatterns.user_preferences =
            this.aggregatedPatterns.user_preferences.filter((p) => !p.toLowerCase().includes(item.toLowerCase()));
        await this.saveLearnings();
        await this.saveAggregatedPatterns();
        console.log(`Forgot: "${item}"`);
    }
    async ensureDirectories() {
        const dirs = [
            this.memoryDir,
            path.join(this.memoryDir, 'production_history'),
            path.join(this.memoryDir, 'aggregated'),
        ];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }
    async loadProductionHistory() {
        const historyDir = path.join(this.memoryDir, 'production_history');
        if (!fs.existsSync(historyDir))
            return;
        const files = fs.readdirSync(historyDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(historyDir, file), 'utf-8');
                const record = JSON.parse(content);
                this.productionHistory.push(record);
            }
            catch {
                // Skip invalid files
            }
        }
        // Sort by timestamp
        this.productionHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    async loadAggregatedPatterns() {
        const patternsPath = path.join(this.memoryDir, 'aggregated', 'patterns.json');
        if (fs.existsSync(patternsPath)) {
            try {
                const content = fs.readFileSync(patternsPath, 'utf-8');
                this.aggregatedPatterns = JSON.parse(content);
            }
            catch {
                // Use defaults
            }
        }
    }
    async loadLearnings() {
        const learningsPath = path.join(this.memoryDir, 'aggregated', 'learnings.json');
        if (fs.existsSync(learningsPath)) {
            try {
                const content = fs.readFileSync(learningsPath, 'utf-8');
                this.learnings = JSON.parse(content);
            }
            catch {
                // Use defaults
            }
        }
    }
    async saveProductionRecord(record) {
        const filename = `${record.timestamp.split('T')[0]}-${record.project}.json`;
        const filepath = path.join(this.memoryDir, 'production_history', filename);
        fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf-8');
    }
    async saveAggregatedPatterns() {
        const filepath = path.join(this.memoryDir, 'aggregated', 'patterns.json');
        fs.writeFileSync(filepath, JSON.stringify(this.aggregatedPatterns, null, 2), 'utf-8');
    }
    async saveLearnings() {
        const filepath = path.join(this.memoryDir, 'aggregated', 'learnings.json');
        fs.writeFileSync(filepath, JSON.stringify(this.learnings, null, 2), 'utf-8');
    }
    async updateAggregatedPatterns() {
        // Aggregate successes by technique
        const techniqueSuccesses = new Map();
        for (const record of this.productionHistory) {
            for (const success of record.successes) {
                if (success.technique) {
                    const current = techniqueSuccesses.get(success.technique) ?? { success: 0, total: 0 };
                    current.success++;
                    current.total++;
                    techniqueSuccesses.set(success.technique, current);
                }
            }
        }
        this.aggregatedPatterns.effective_techniques = Array.from(techniqueSuccesses.entries())
            .map(([technique, stats]) => ({
            technique,
            success_rate: stats.success / stats.total,
            usage_count: stats.total,
        }))
            .sort((a, b) => b.success_rate - a.success_rate);
        // Aggregate user preferences
        const allPreferences = this.productionHistory.flatMap((r) => r.preferences_detected);
        const preferenceCounts = new Map();
        for (const pref of allPreferences) {
            preferenceCounts.set(pref, (preferenceCounts.get(pref) ?? 0) + 1);
        }
        this.aggregatedPatterns.user_preferences = Array.from(preferenceCounts.entries())
            .filter(([_, count]) => count >= 2) // Only include recurring preferences
            .sort((a, b) => b[1] - a[1])
            .map(([pref]) => pref);
        await this.saveAggregatedPatterns();
    }
    analyzeForPreferences(feedback) {
        const preferences = [];
        const lowercaseFeedback = feedback.toLowerCase();
        // Simple pattern matching for preference detection
        const patterns = [
            { pattern: /slower|slow down/i, preference: 'prefers_slower_pacing' },
            { pattern: /faster|speed up/i, preference: 'prefers_faster_pacing' },
            { pattern: /less text/i, preference: 'prefers_minimal_text' },
            { pattern: /more visual/i, preference: 'prefers_more_visuals' },
            { pattern: /simpler/i, preference: 'prefers_simpler_explanations' },
            { pattern: /more detail/i, preference: 'prefers_detailed_explanations' },
        ];
        for (const { pattern, preference } of patterns) {
            if (pattern.test(lowercaseFeedback)) {
                preferences.push(preference);
            }
        }
        return preferences;
    }
}
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=memory-manager.js.map