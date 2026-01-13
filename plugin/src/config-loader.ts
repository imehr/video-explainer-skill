/**
 * Configuration Loader
 *
 * Handles hierarchical configuration:
 * System defaults → User configs → Project overrides
 */

import * as fs from 'fs';
import * as path from 'path';

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
    background?: { dark: string; light: string };
  };
  typography?: {
    fonts: { heading: string; body: string; code?: string };
  };
  assets?: {
    logo?: { primary?: string; position?: string };
  };
}

export interface PlatformConfig {
  name: string;
  display_name: string;
  aspect_ratio: string;
  resolution?: { width: number; height: number };
  duration?: { max_seconds?: number; recommended_seconds?: string };
  fps?: number;
  pacing?: string;
  safe_zones?: { top?: number; bottom?: number };
  chunking?: { enabled: boolean; overlap_seconds?: number };
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

export class ConfigLoader {
  private configDir: string;
  private globalConfig: GlobalConfig = {};
  private brands: Map<string, BrandConfig> = new Map();
  private platforms: Map<string, PlatformConfig> = new Map();
  private styles: Map<string, StyleConfig> = new Map();

  constructor(configDir: string) {
    this.configDir = configDir;
  }

  /**
   * Load all configurations
   */
  async load(): Promise<void> {
    await this.loadGlobalConfig();
    await this.loadBrands();
    await this.loadPlatforms();
    await this.loadStyles();
  }

  /**
   * Get global defaults
   */
  getDefaults(): { brand?: string; style?: string } {
    return this.globalConfig.defaults ?? {};
  }

  /**
   * Get a brand by name
   */
  getBrand(name: string): BrandConfig | undefined {
    return this.brands.get(name);
  }

  /**
   * Get all brands
   */
  getAllBrands(): BrandConfig[] {
    return Array.from(this.brands.values());
  }

  /**
   * Get a platform by name
   */
  getPlatform(name: string): PlatformConfig | undefined {
    return this.platforms.get(name);
  }

  /**
   * Get all platforms
   */
  getAllPlatforms(): PlatformConfig[] {
    return Array.from(this.platforms.values());
  }

  /**
   * Get a style by name
   */
  getStyle(name: string): StyleConfig | undefined {
    return this.styles.get(name);
  }

  /**
   * Get all styles
   */
  getAllStyles(): StyleConfig[] {
    return Array.from(this.styles.values());
  }

  /**
   * Get video_explainer CLI path
   */
  getVideoExplainerPath(): string | undefined {
    return this.globalConfig.video_explainer_path ?? undefined;
  }

  /**
   * Set video_explainer CLI path
   */
  async setVideoExplainerPath(path: string): Promise<void> {
    this.globalConfig.video_explainer_path = path;
    await this.saveGlobalConfig();
  }

  private async loadGlobalConfig(): Promise<void> {
    const configPath = path.join(this.configDir, 'config.yaml');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      // Simple YAML parsing (in production, use yaml library)
      this.globalConfig = this.parseSimpleYaml(content);
    }
  }

  private async saveGlobalConfig(): Promise<void> {
    const configPath = path.join(this.configDir, 'config.yaml');
    // Simple YAML writing (in production, use yaml library)
    const content = this.toSimpleYaml(this.globalConfig);
    fs.writeFileSync(configPath, content, 'utf-8');
  }

  private async loadBrands(): Promise<void> {
    const brandsDir = path.join(this.configDir, 'brands');
    if (!fs.existsSync(brandsDir)) return;

    const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.yaml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(brandsDir, file), 'utf-8');
      const brands = this.parseSimpleYaml(content);

      for (const [key, value] of Object.entries(brands)) {
        if (key !== '_template' && typeof value === 'object') {
          this.brands.set(key, value as BrandConfig);
        }
      }
    }
  }

  private async loadPlatforms(): Promise<void> {
    const platformsDir = path.join(this.configDir, 'platforms');
    if (!fs.existsSync(platformsDir)) return;

    const files = fs.readdirSync(platformsDir).filter((f) => f.endsWith('.yaml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(platformsDir, file), 'utf-8');
      const platforms = this.parseSimpleYaml(content);

      for (const [key, value] of Object.entries(platforms)) {
        if (typeof value === 'object') {
          this.platforms.set(key, value as PlatformConfig);
        }
      }
    }
  }

  private async loadStyles(): Promise<void> {
    const stylesDir = path.join(this.configDir, 'styles');
    if (!fs.existsSync(stylesDir)) return;

    const files = fs.readdirSync(stylesDir).filter((f) => f.endsWith('.yaml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(stylesDir, file), 'utf-8');
      const styles = this.parseSimpleYaml(content);

      for (const [key, value] of Object.entries(styles)) {
        if (typeof value === 'object') {
          this.styles.set(key, value as StyleConfig);
        }
      }
    }
  }

  // Simple YAML parser (placeholder - use yaml library in production)
  private parseSimpleYaml(content: string): Record<string, unknown> {
    // This is a simplified placeholder
    // In production, use the yaml package
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  // Simple YAML writer (placeholder - use yaml library in production)
  private toSimpleYaml(obj: GlobalConfig): string {
    // This is a simplified placeholder
    // In production, use the yaml package
    return JSON.stringify(obj, null, 2);
  }
}
