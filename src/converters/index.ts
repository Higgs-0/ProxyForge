import yaml from 'js-yaml';
import type { ClashConfig, ConversionFormat, ConversionResult, SingBoxConfig, V2RayConfig } from '../types';
import type { ConfigOptionsType } from '../components/ConfigOptions';
import { clashToSingbox } from './clashToSingbox';
import { clashToV2ray } from './clashToV2ray';
import { singboxToClash } from './singboxToClash';
import { v2rayToClash } from './v2rayToClash';

export function detectFormat(input: string): ConversionFormat | null {
  const trimmed = input.trim();
  
  // Try to detect YAML (Clash)
  if (trimmed.startsWith('proxies:') || 
      trimmed.includes('\nproxies:') || 
      trimmed.startsWith('port:') ||
      trimmed.startsWith('mixed-port:')) {
    return 'clash';
  }
  
  // Try to parse as JSON
  try {
    const json = JSON.parse(trimmed);
    
    // V2Ray detection
    if (json.outbounds && Array.isArray(json.outbounds)) {
      // Sing-box uses 'type' field in outbounds, V2Ray uses 'protocol'
      const firstOutbound = json.outbounds[0];
      if (firstOutbound) {
        if ('protocol' in firstOutbound) {
          return 'v2ray';
        }
        if ('type' in firstOutbound) {
          return 'singbox';
        }
      }
    }
    
    return null;
  } catch {
    // Not valid JSON, try YAML
    try {
      const parsed = yaml.load(trimmed) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object' && 'proxies' in parsed) {
        return 'clash';
      }
    } catch {
      return null;
    }
  }
  
  return null;
}

export function parseInput(input: string, format: ConversionFormat): ClashConfig | V2RayConfig | SingBoxConfig {
  const trimmed = input.trim();
  
  if (format === 'clash') {
    return yaml.load(trimmed) as ClashConfig;
  }
  
  return JSON.parse(trimmed);
}

export function convert(
  input: string,
  fromFormat: ConversionFormat,
  toFormat: ConversionFormat,
  options?: ConfigOptionsType
): ConversionResult {
  try {
    if (fromFormat === toFormat) {
      return { success: true, data: input };
    }

    const parsed = parseInput(input, fromFormat);

    let result: ClashConfig | V2RayConfig | SingBoxConfig;

    // Conversion logic
    if (fromFormat === 'clash') {
      const clashConfig = parsed as ClashConfig;
      if (toFormat === 'v2ray') {
        result = clashToV2ray(clashConfig, options?.v2ray);
      } else {
        result = clashToSingbox(clashConfig, options?.singbox);
      }
    } else if (fromFormat === 'v2ray') {
      const v2rayConfig = parsed as V2RayConfig;
      const clashConfig = v2rayToClash(v2rayConfig, options?.clash);
      if (toFormat === 'clash') {
        result = clashConfig;
      } else {
        result = clashToSingbox(clashConfig, options?.singbox);
      }
    } else {
      const singboxConfig = parsed as SingBoxConfig;
      const clashConfig = singboxToClash(singboxConfig, options?.clash);
      if (toFormat === 'clash') {
        result = clashConfig;
      } else {
        result = clashToV2ray(clashConfig, options?.v2ray);
      }
    }

    // Format output
    let output: string;
    if (toFormat === 'clash') {
      output = yaml.dump(result, { 
        indent: 2, 
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
      });
    } else {
      output = JSON.stringify(result, null, 2);
    }

    return { success: true, data: output };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export { clashToV2ray, clashToSingbox, v2rayToClash, singboxToClash };
