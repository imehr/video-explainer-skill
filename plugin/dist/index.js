"use strict";
/**
 * Video Explainer Plugin - Entry Point
 *
 * Intelligent orchestrator plugin for creating multi-platform explainer videos
 * with parallel agent execution and learning memory.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlanner = exports.MemoryManager = exports.ConfigLoader = exports.Orchestrator = void 0;
exports.createPlugin = createPlugin;
const orchestrator_1 = require("./orchestrator");
const config_loader_1 = require("./config-loader");
const memory_manager_1 = require("./memory-manager");
/**
 * Create and initialize the video explainer plugin
 */
async function createPlugin(context) {
    const config = new config_loader_1.ConfigLoader(context.configDir);
    const memory = new memory_manager_1.MemoryManager(context.configDir);
    const orchestrator = new orchestrator_1.Orchestrator(context, config, memory);
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
        async newProject(name, options) {
            return orchestrator.createProject(name, options);
        },
        async render(projectName, options) {
            return orchestrator.executeRender(projectName, options);
        },
        async script(projectName) {
            return orchestrator.executeScript(projectName);
        },
        async scenes(projectName) {
            return orchestrator.executeScenes(projectName);
        },
        async feedback(projectName, feedbackText) {
            return orchestrator.applyFeedback(projectName, feedbackText);
        },
        async learn(instruction) {
            return memory.addLearning(instruction);
        },
    };
}
// Export types and classes for external use
var orchestrator_2 = require("./orchestrator");
Object.defineProperty(exports, "Orchestrator", { enumerable: true, get: function () { return orchestrator_2.Orchestrator; } });
var config_loader_2 = require("./config-loader");
Object.defineProperty(exports, "ConfigLoader", { enumerable: true, get: function () { return config_loader_2.ConfigLoader; } });
var memory_manager_2 = require("./memory-manager");
Object.defineProperty(exports, "MemoryManager", { enumerable: true, get: function () { return memory_manager_2.MemoryManager; } });
var planner_1 = require("./planner");
Object.defineProperty(exports, "TaskPlanner", { enumerable: true, get: function () { return planner_1.TaskPlanner; } });
//# sourceMappingURL=index.js.map