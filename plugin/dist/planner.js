"use strict";
/**
 * Task Planner
 *
 * Analyzes tasks and creates execution plans:
 * - Determines which agents are needed
 * - Identifies dependencies between tasks
 * - Decides foreground vs background execution
 * - Groups parallel tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlanner = void 0;
class TaskPlanner {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Create execution plan for render operation
     */
    async planRender(projectName, options) {
        // TODO: Load project config to get outputs
        const outputs = this.getProjectOutputs(projectName, options);
        const foregroundTasks = [];
        const backgroundGroups = [];
        // Script generation is foreground (user review expected)
        foregroundTasks.push({
            id: 'script',
            name: 'Script Generation',
            type: 'script',
            dependencies: [],
            estimatedDuration: 120,
        });
        // Determine unique aspect ratios and languages needed
        const aspectRatios = new Set();
        const languages = new Set();
        for (const output of outputs) {
            const platform = this.config.getPlatform(output.platform);
            aspectRatios.add(platform?.aspect_ratio ?? '16:9');
            languages.add(output.language ?? 'en');
        }
        // Scene generation - parallel per aspect ratio
        const sceneGroup = {
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
        const voiceoverGroup = {
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
        const renderGroup = {
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
    getRequiredAspectRatios(projectName) {
        // TODO: Load from project config
        return ['16:9', '9:16'];
    }
    /**
     * Get project outputs based on config and options
     */
    getProjectOutputs(projectName, options) {
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
    calculateTotalDuration(foregroundTasks, backgroundGroups) {
        let total = 0;
        // Foreground tasks are sequential
        for (const task of foregroundTasks) {
            total += task.estimatedDuration ?? 60;
        }
        // Background groups: take longest task in each group
        for (const group of backgroundGroups) {
            const maxDuration = Math.max(...group.tasks.map((t) => t.estimatedDuration ?? 60));
            total += maxDuration;
        }
        return total;
    }
}
exports.TaskPlanner = TaskPlanner;
//# sourceMappingURL=planner.js.map