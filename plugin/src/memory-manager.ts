/**
 * Memory Manager
 *
 * Handles learning memory system:
 * - Records production history
 * - Captures successes and failures
 * - Tracks user preferences
 * - Aggregates patterns over time
 */

import * as fs from 'fs';
import * as path from 'path';

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

export class MemoryManager {
  private configDir: string;
  private memoryDir: string;
  private productionHistory: ProductionRecord[] = [];
  private aggregatedPatterns: AggregatedPatterns = {
    effective_techniques: [],
    common_failures: [],
    user_preferences: [],
  };
  private learnings: LearningInstruction[] = [];

  constructor(configDir: string) {
    this.configDir = configDir;
    this.memoryDir = path.join(configDir, 'memory');
  }

  /**
   * Load memory from disk
   */
  async load(): Promise<void> {
    await this.ensureDirectories();
    await this.loadProductionHistory();
    await this.loadAggregatedPatterns();
    await this.loadLearnings();
  }

  /**
   * Record a completed production
   */
  async recordProduction(
    projectName: string,
    result: { success: boolean; outputs: unknown[]; version: string }
  ): Promise<void> {
    const record: ProductionRecord = {
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
  async recordFeedback(projectName: string, feedback: string): Promise<void> {
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
  async addLearning(instruction: string): Promise<void> {
    const learning: LearningInstruction = {
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
  getLearningSummary(): {
    total_productions: number;
    total_feedback_rounds: number;
    top_techniques: Array<{ name: string; success_rate: number }>;
    user_preferences: string[];
    recent_learnings: string[];
  } {
    const totalFeedback = this.productionHistory.reduce(
      (sum, r) => sum + r.iterations.total_feedback_rounds,
      0
    );

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
  getPatterns(): AggregatedPatterns {
    return this.aggregatedPatterns;
  }

  /**
   * Get user preferences for display
   */
  getPreferences(): string[] {
    return this.aggregatedPatterns.user_preferences;
  }

  /**
   * Get technique effectiveness scores
   */
  getEffectiveness(): Array<{ technique: string; score: number; usage: number }> {
    return this.aggregatedPatterns.effective_techniques.map((t) => ({
      technique: t.technique,
      score: t.success_rate,
      usage: t.usage_count,
    }));
  }

  /**
   * Remove a learned technique/preference
   */
  async forget(item: string): Promise<void> {
    // Remove from learnings
    this.learnings = this.learnings.filter(
      (l) => !l.instruction.toLowerCase().includes(item.toLowerCase())
    );

    // Remove from preferences
    this.aggregatedPatterns.user_preferences =
      this.aggregatedPatterns.user_preferences.filter(
        (p) => !p.toLowerCase().includes(item.toLowerCase())
      );

    await this.saveLearnings();
    await this.saveAggregatedPatterns();

    console.log(`Forgot: "${item}"`);
  }

  private async ensureDirectories(): Promise<void> {
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

  private async loadProductionHistory(): Promise<void> {
    const historyDir = path.join(this.memoryDir, 'production_history');
    if (!fs.existsSync(historyDir)) return;

    const files = fs.readdirSync(historyDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(historyDir, file), 'utf-8');
        const record = JSON.parse(content) as ProductionRecord;
        this.productionHistory.push(record);
      } catch {
        // Skip invalid files
      }
    }

    // Sort by timestamp
    this.productionHistory.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private async loadAggregatedPatterns(): Promise<void> {
    const patternsPath = path.join(this.memoryDir, 'aggregated', 'patterns.json');
    if (fs.existsSync(patternsPath)) {
      try {
        const content = fs.readFileSync(patternsPath, 'utf-8');
        this.aggregatedPatterns = JSON.parse(content);
      } catch {
        // Use defaults
      }
    }
  }

  private async loadLearnings(): Promise<void> {
    const learningsPath = path.join(this.memoryDir, 'aggregated', 'learnings.json');
    if (fs.existsSync(learningsPath)) {
      try {
        const content = fs.readFileSync(learningsPath, 'utf-8');
        this.learnings = JSON.parse(content);
      } catch {
        // Use defaults
      }
    }
  }

  private async saveProductionRecord(record: ProductionRecord): Promise<void> {
    const filename = `${record.timestamp.split('T')[0]}-${record.project}.json`;
    const filepath = path.join(this.memoryDir, 'production_history', filename);
    fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf-8');
  }

  private async saveAggregatedPatterns(): Promise<void> {
    const filepath = path.join(this.memoryDir, 'aggregated', 'patterns.json');
    fs.writeFileSync(filepath, JSON.stringify(this.aggregatedPatterns, null, 2), 'utf-8');
  }

  private async saveLearnings(): Promise<void> {
    const filepath = path.join(this.memoryDir, 'aggregated', 'learnings.json');
    fs.writeFileSync(filepath, JSON.stringify(this.learnings, null, 2), 'utf-8');
  }

  private async updateAggregatedPatterns(): Promise<void> {
    // Aggregate successes by technique
    const techniqueSuccesses = new Map<string, { success: number; total: number }>();

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
    const preferenceCounts = new Map<string, number>();
    for (const pref of allPreferences) {
      preferenceCounts.set(pref, (preferenceCounts.get(pref) ?? 0) + 1);
    }

    this.aggregatedPatterns.user_preferences = Array.from(preferenceCounts.entries())
      .filter(([_, count]) => count >= 2) // Only include recurring preferences
      .sort((a, b) => b[1] - a[1])
      .map(([pref]) => pref);

    await this.saveAggregatedPatterns();
  }

  private analyzeForPreferences(feedback: string): string[] {
    const preferences: string[] = [];
    const lowercaseFeedback = feedback.toLowerCase();

    // Simple pattern matching for preference detection
    const patterns: Array<{ pattern: RegExp; preference: string }> = [
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
