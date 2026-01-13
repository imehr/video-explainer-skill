"use strict";
/**
 * Configuration Loader
 *
 * Handles hierarchical configuration:
 * System defaults → User configs → Project overrides
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
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigLoader {
    configDir;
    globalConfig = {};
    brands = new Map();
    platforms = new Map();
    styles = new Map();
    constructor(configDir) {
        this.configDir = configDir;
    }
    /**
     * Load all configurations
     */
    async load() {
        await this.loadGlobalConfig();
        await this.loadBrands();
        await this.loadPlatforms();
        await this.loadStyles();
    }
    /**
     * Get global defaults
     */
    getDefaults() {
        return this.globalConfig.defaults ?? {};
    }
    /**
     * Get a brand by name
     */
    getBrand(name) {
        return this.brands.get(name);
    }
    /**
     * Get all brands
     */
    getAllBrands() {
        return Array.from(this.brands.values());
    }
    /**
     * Get a platform by name
     */
    getPlatform(name) {
        return this.platforms.get(name);
    }
    /**
     * Get all platforms
     */
    getAllPlatforms() {
        return Array.from(this.platforms.values());
    }
    /**
     * Get a style by name
     */
    getStyle(name) {
        return this.styles.get(name);
    }
    /**
     * Get all styles
     */
    getAllStyles() {
        return Array.from(this.styles.values());
    }
    /**
     * Get video_explainer CLI path
     */
    getVideoExplainerPath() {
        return this.globalConfig.video_explainer_path ?? undefined;
    }
    /**
     * Set video_explainer CLI path
     */
    async setVideoExplainerPath(path) {
        this.globalConfig.video_explainer_path = path;
        await this.saveGlobalConfig();
    }
    async loadGlobalConfig() {
        const configPath = path.join(this.configDir, 'config.yaml');
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf-8');
            // Simple YAML parsing (in production, use yaml library)
            this.globalConfig = this.parseSimpleYaml(content);
        }
    }
    async saveGlobalConfig() {
        const configPath = path.join(this.configDir, 'config.yaml');
        // Simple YAML writing (in production, use yaml library)
        const content = this.toSimpleYaml(this.globalConfig);
        fs.writeFileSync(configPath, content, 'utf-8');
    }
    async loadBrands() {
        const brandsDir = path.join(this.configDir, 'brands');
        if (!fs.existsSync(brandsDir))
            return;
        const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.yaml'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(brandsDir, file), 'utf-8');
            const brands = this.parseSimpleYaml(content);
            for (const [key, value] of Object.entries(brands)) {
                if (key !== '_template' && typeof value === 'object') {
                    this.brands.set(key, value);
                }
            }
        }
    }
    async loadPlatforms() {
        const platformsDir = path.join(this.configDir, 'platforms');
        if (!fs.existsSync(platformsDir))
            return;
        const files = fs.readdirSync(platformsDir).filter((f) => f.endsWith('.yaml'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(platformsDir, file), 'utf-8');
            const platforms = this.parseSimpleYaml(content);
            for (const [key, value] of Object.entries(platforms)) {
                if (typeof value === 'object') {
                    this.platforms.set(key, value);
                }
            }
        }
    }
    async loadStyles() {
        const stylesDir = path.join(this.configDir, 'styles');
        if (!fs.existsSync(stylesDir))
            return;
        const files = fs.readdirSync(stylesDir).filter((f) => f.endsWith('.yaml'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(stylesDir, file), 'utf-8');
            const styles = this.parseSimpleYaml(content);
            for (const [key, value] of Object.entries(styles)) {
                if (typeof value === 'object') {
                    this.styles.set(key, value);
                }
            }
        }
    }
    // Simple YAML parser (placeholder - use yaml library in production)
    parseSimpleYaml(content) {
        // This is a simplified placeholder
        // In production, use the yaml package
        try {
            return JSON.parse(content);
        }
        catch {
            return {};
        }
    }
    // Simple YAML writer (placeholder - use yaml library in production)
    toSimpleYaml(obj) {
        // This is a simplified placeholder
        // In production, use the yaml package
        return JSON.stringify(obj, null, 2);
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config-loader.js.map