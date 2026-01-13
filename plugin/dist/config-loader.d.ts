/**
 * Configuration Loader
 *
 * Handles hierarchical configuration:
 * System defaults → User configs → Project overrides
 */
export interface BrandConfig {
    name: string;
    display_name: string;
    version?: string;
    voice?: {
        tone: string;
        personality: string[];
        writing_style?: {
            sentence_length: string;
            vocabulary: string;
            perspective: string;
        };
        forbidden_words?: string[];
        preferred_phrases?: string[];
    };
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
        background?: {
            dark: string;
            light: string;
        };
    };
    typography?: {
        fonts: {
            heading: string;
            body: string;
            code?: string;
        };
    };
    assets?: {
        logo?: {
            primary?: string;
            position?: string;
        };
    };
}
export interface PlatformConfig {
    name: string;
    display_name: string;
    aspect_ratio: string;
    resolution?: {
        width: number;
        height: number;
    };
    duration?: {
        max_seconds?: number;
        recommended_seconds?: string;
    };
    fps?: number;
    pacing?: string;
    safe_zones?: {
        top?: number;
        bottom?: number;
    };
    chunking?: {
        enabled: boolean;
        overlap_seconds?: number;
    };
}
export interface StyleConfig {
    name: string;
    display_name: string;
    description?: string;
    animation?: {
        speed_multiplier: number;
        easing_override?: string;
        particles?: boolean;
    };
    pacing?: {
        wpm_adjustment: number;
        transition_speed: string;
    };
}
export interface GlobalConfig {
    video_explainer_path?: string;
    defaults?: {
        brand?: string;
        style?: string;
        voice_provider?: string;
    };
    learning?: {
        enabled: boolean;
        auto_capture: boolean;
    };
}
export declare class ConfigLoader {
    private configDir;
    private globalConfig;
    private brands;
    private platforms;
    private styles;
    constructor(configDir: string);
    /**
     * Load all configurations
     */
    load(): Promise<void>;
    /**
     * Get global defaults
     */
    getDefaults(): {
        brand?: string;
        style?: string;
    };
    /**
     * Get a brand by name
     */
    getBrand(name: string): BrandConfig | undefined;
    /**
     * Get all brands
     */
    getAllBrands(): BrandConfig[];
    /**
     * Get a platform by name
     */
    getPlatform(name: string): PlatformConfig | undefined;
    /**
     * Get all platforms
     */
    getAllPlatforms(): PlatformConfig[];
    /**
     * Get a style by name
     */
    getStyle(name: string): StyleConfig | undefined;
    /**
     * Get all styles
     */
    getAllStyles(): StyleConfig[];
    /**
     * Get video_explainer CLI path
     */
    getVideoExplainerPath(): string | undefined;
    /**
     * Set video_explainer CLI path
     */
    setVideoExplainerPath(path: string): Promise<void>;
    private loadGlobalConfig;
    private saveGlobalConfig;
    private loadBrands;
    private loadPlatforms;
    private loadStyles;
    private parseSimpleYaml;
    private toSimpleYaml;
}
//# sourceMappingURL=config-loader.d.ts.map