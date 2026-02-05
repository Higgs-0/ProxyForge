import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Globe, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn';
import type { ConversionFormat } from '../types';

export interface ClashOptions {
  port: number;
  socksPort: number;
  mixedPort: number;
  allowLan: boolean;
  mode: 'rule' | 'global' | 'direct';
  logLevel: 'silent' | 'error' | 'warning' | 'info' | 'debug';
  ipv6: boolean;
  externalController: string;
  dns: {
    enable: boolean;
    ipv6: boolean;
    listen: string;
    enhancedMode: 'fake-ip' | 'redir-host';
    fakeIpRange: string;
    nameserver: string[];
    fallback: string[];
  };
  rules: string[];
  proxyGroups: Array<{
    name: string;
    type: 'select' | 'url-test' | 'fallback' | 'load-balance';
    proxies: string[];
    url?: string;
    interval?: number;
  }>;
}

export interface V2RayOptions {
  log: {
    loglevel: 'debug' | 'info' | 'warning' | 'error' | 'none';
    access: string;
    error: string;
  };
  inbounds: Array<{
    port: number;
    protocol: 'socks' | 'http' | 'dokodemo-door';
    listen: string;
    sniffing: boolean;
  }>;
  routing: {
    domainStrategy: 'AsIs' | 'IPIfNonMatch' | 'IPOnDemand';
    rules: Array<{
      type: 'field';
      domain?: string[];
      ip?: string[];
      outboundTag: string;
    }>;
  };
  dns: {
    servers: string[];
  };
}

export interface SingBoxOptions {
  log: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'panic';
    timestamp: boolean;
  };
  inbounds: Array<{
    type: 'mixed' | 'socks' | 'http' | 'tun';
    listen: string;
    listenPort: number;
  }>;
  dns: {
    servers: Array<{
      tag: string;
      address: string;
      detour?: string;
    }>;
    rules: Array<{
      domain?: string[];
      geosite?: string[];
      server: string;
    }>;
  };
  route: {
    rules: Array<{
      geoip?: string[];
      geosite?: string[];
      domain?: string[];
      outbound: string;
    }>;
    geoip: {
      downloadUrl: string;
      downloadDetour: string;
    };
    geosite: {
      downloadUrl: string;
      downloadDetour: string;
    };
    final: string;
    autoDetectInterface: boolean;
  };
  experimental?: {
    clashApi?: {
      externalController: string;
      externalUi: string;
    };
  };
}

export type ConfigOptionsType = {
  clash: ClashOptions;
  v2ray: V2RayOptions;
  singbox: SingBoxOptions;
};

const defaultClashOptions: ClashOptions = {
  port: 7890,
  socksPort: 7891,
  mixedPort: 7893,
  allowLan: false,
  mode: 'rule',
  logLevel: 'info',
  ipv6: false,
  externalController: '127.0.0.1:9090',
  dns: {
    enable: true,
    ipv6: false,
    listen: '0.0.0.0:53',
    enhancedMode: 'fake-ip',
    fakeIpRange: '198.18.0.1/16',
    nameserver: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
    fallback: ['https://1.1.1.1/dns-query', 'https://8.8.8.8/dns-query'],
  },
  rules: [
    'DOMAIN-SUFFIX,googleapis.cn,🚀 Proxy',
    'DOMAIN-SUFFIX,google.com,🚀 Proxy',
    'GEOIP,LAN,DIRECT',
    'GEOIP,CN,DIRECT',
    'MATCH,🚀 Proxy',
  ],
  proxyGroups: [
    {
      name: '🚀 Proxy',
      type: 'select',
      proxies: ['♻️ Auto', 'DIRECT'],
    },
    {
      name: '♻️ Auto',
      type: 'url-test',
      proxies: [],
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
  ],
};

const defaultV2RayOptions: V2RayOptions = {
  log: {
    loglevel: 'warning',
    access: '',
    error: '',
  },
  inbounds: [
    { port: 1080, protocol: 'socks', listen: '127.0.0.1', sniffing: true },
    { port: 1081, protocol: 'http', listen: '127.0.0.1', sniffing: true },
  ],
  routing: {
    domainStrategy: 'IPIfNonMatch',
    rules: [
      { type: 'field', domain: ['geosite:category-ads'], outboundTag: 'block' },
      { type: 'field', ip: ['geoip:private'], outboundTag: 'direct' },
      { type: 'field', domain: ['geosite:cn'], outboundTag: 'direct' },
      { type: 'field', ip: ['geoip:cn'], outboundTag: 'direct' },
    ],
  },
  dns: {
    servers: ['8.8.8.8', '8.8.4.4', '1.1.1.1', '223.5.5.5'],
  },
};

const defaultSingBoxOptions: SingBoxOptions = {
  log: {
    level: 'info',
    timestamp: true,
  },
  inbounds: [
    { type: 'mixed', listen: '127.0.0.1', listenPort: 1080 },
  ],
  dns: {
    servers: [
      { tag: 'google', address: 'tls://8.8.8.8' },
      { tag: 'cloudflare', address: 'https://1.1.1.1/dns-query' },
      { tag: 'local', address: '223.5.5.5', detour: 'direct' },
    ],
    rules: [
      { geosite: ['cn'], server: 'local' },
    ],
  },
  route: {
    rules: [
      { geoip: ['private'], outbound: 'direct' },
      { geosite: ['cn'], outbound: 'direct' },
      { geoip: ['cn'], outbound: 'direct' },
    ],
    geoip: {
      downloadUrl: 'https://github.com/SagerNet/sing-geoip/releases/latest/download/geoip.db',
      downloadDetour: 'proxy',
    },
    geosite: {
      downloadUrl: 'https://github.com/SagerNet/sing-geosite/releases/latest/download/geosite.db',
      downloadDetour: 'proxy',
    },
    final: 'proxy',
    autoDetectInterface: true,
  },
  experimental: {
    clashApi: {
      externalController: '127.0.0.1:9090',
      externalUi: 'ui',
    },
  },
};

export const defaultConfigOptions: ConfigOptionsType = {
  clash: defaultClashOptions,
  v2ray: defaultV2RayOptions,
  singbox: defaultSingBoxOptions,
};

interface ConfigOptionsProps {
  format: ConversionFormat;
  options: ConfigOptionsType;
  onChange: (options: ConfigOptionsType) => void;
}

export function ConfigOptions({ format, options, onChange }: ConfigOptionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    dns: false,
    routing: false,
    inbounds: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderClashOptions = () => {
    const clashOpts = options.clash;
    
    return (
      <>
        {/* General Settings */}
        <Section 
          title="General Settings" 
          icon={<Settings className="w-4 h-4" />}
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
        >
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="HTTP Port"
              type="number"
              value={clashOpts.port}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, port: Number(v) } })}
            />
            <InputField
              label="SOCKS Port"
              type="number"
              value={clashOpts.socksPort}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, socksPort: Number(v) } })}
            />
            <InputField
              label="Mixed Port"
              type="number"
              value={clashOpts.mixedPort}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, mixedPort: Number(v) } })}
            />
            <SelectField
              label="Mode"
              value={clashOpts.mode}
              options={[
                { value: 'rule', label: 'Rule' },
                { value: 'global', label: 'Global' },
                { value: 'direct', label: 'Direct' },
              ]}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, mode: v as ClashOptions['mode'] } })}
            />
            <SelectField
              label="Log Level"
              value={clashOpts.logLevel}
              options={[
                { value: 'silent', label: 'Silent' },
                { value: 'error', label: 'Error' },
                { value: 'warning', label: 'Warning' },
                { value: 'info', label: 'Info' },
                { value: 'debug', label: 'Debug' },
              ]}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, logLevel: v as ClashOptions['logLevel'] } })}
            />
            <InputField
              label="External Controller"
              value={clashOpts.externalController}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, externalController: v } })}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <CheckboxField
              label="Allow LAN"
              checked={clashOpts.allowLan}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, allowLan: v } })}
            />
            <CheckboxField
              label="IPv6"
              checked={clashOpts.ipv6}
              onChange={(v) => onChange({ ...options, clash: { ...clashOpts, ipv6: v } })}
            />
          </div>
        </Section>

        {/* DNS Settings */}
        <Section 
          title="DNS Settings" 
          icon={<Globe className="w-4 h-4" />}
          expanded={expandedSections.dns}
          onToggle={() => toggleSection('dns')}
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <CheckboxField
                label="Enable DNS"
                checked={clashOpts.dns.enable}
                onChange={(v) => onChange({ 
                  ...options, 
                  clash: { ...clashOpts, dns: { ...clashOpts.dns, enable: v } } 
                })}
              />
              <CheckboxField
                label="IPv6"
                checked={clashOpts.dns.ipv6}
                onChange={(v) => onChange({ 
                  ...options, 
                  clash: { ...clashOpts, dns: { ...clashOpts.dns, ipv6: v } } 
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Enhanced Mode"
                value={clashOpts.dns.enhancedMode}
                options={[
                  { value: 'fake-ip', label: 'Fake IP' },
                  { value: 'redir-host', label: 'Redir Host' },
                ]}
                onChange={(v) => onChange({ 
                  ...options, 
                  clash: { ...clashOpts, dns: { ...clashOpts.dns, enhancedMode: v as 'fake-ip' | 'redir-host' } } 
                })}
              />
              <InputField
                label="Fake IP Range"
                value={clashOpts.dns.fakeIpRange}
                onChange={(v) => onChange({ 
                  ...options, 
                  clash: { ...clashOpts, dns: { ...clashOpts.dns, fakeIpRange: v } } 
                })}
              />
            </div>
            <ArrayField
              label="Nameservers"
              values={clashOpts.dns.nameserver}
              onChange={(values) => onChange({ 
                ...options, 
                clash: { ...clashOpts, dns: { ...clashOpts.dns, nameserver: values } } 
              })}
              placeholder="https://dns.example.com/dns-query"
            />
            <ArrayField
              label="Fallback DNS"
              values={clashOpts.dns.fallback}
              onChange={(values) => onChange({ 
                ...options, 
                clash: { ...clashOpts, dns: { ...clashOpts.dns, fallback: values } } 
              })}
              placeholder="https://1.1.1.1/dns-query"
            />
          </div>
        </Section>

        {/* Routing Rules */}
        <Section 
          title="Routing Rules" 
          icon={<Shield className="w-4 h-4" />}
          expanded={expandedSections.routing}
          onToggle={() => toggleSection('routing')}
        >
          <ArrayField
            label="Rules"
            values={clashOpts.rules}
            onChange={(values) => onChange({ 
              ...options, 
              clash: { ...clashOpts, rules: values } 
            })}
            placeholder="DOMAIN-SUFFIX,example.com,Proxy"
          />
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-300 mb-1">Rule Format:</p>
                <ul className="space-y-0.5">
                  <li>• DOMAIN,example.com,Proxy</li>
                  <li>• DOMAIN-SUFFIX,google.com,Proxy</li>
                  <li>• DOMAIN-KEYWORD,google,Proxy</li>
                  <li>• IP-CIDR,192.168.0.0/16,DIRECT</li>
                  <li>• GEOIP,CN,DIRECT</li>
                  <li>• MATCH,Proxy (final rule)</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>
      </>
    );
  };

  const renderV2RayOptions = () => {
    const v2rayOpts = options.v2ray;
    
    return (
      <>
        {/* Log Settings */}
        <Section 
          title="Log Settings" 
          icon={<Settings className="w-4 h-4" />}
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
        >
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Log Level"
              value={v2rayOpts.log.loglevel}
              options={[
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' },
                { value: 'none', label: 'None' },
              ]}
              onChange={(v) => onChange({ 
                ...options, 
                v2ray: { ...v2rayOpts, log: { ...v2rayOpts.log, loglevel: v as V2RayOptions['log']['loglevel'] } } 
              })}
            />
          </div>
        </Section>

        {/* Inbounds */}
        <Section 
          title="Inbounds" 
          icon={<Layers className="w-4 h-4" />}
          expanded={expandedSections.inbounds}
          onToggle={() => toggleSection('inbounds')}
        >
          <div className="space-y-4">
            {v2rayOpts.inbounds.map((inbound, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Inbound {idx + 1}</span>
                  <button
                    onClick={() => {
                      const newInbounds = v2rayOpts.inbounds.filter((_, i) => i !== idx);
                      onChange({ ...options, v2ray: { ...v2rayOpts, inbounds: newInbounds } });
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SelectField
                    label="Protocol"
                    value={inbound.protocol}
                    options={[
                      { value: 'socks', label: 'SOCKS' },
                      { value: 'http', label: 'HTTP' },
                      { value: 'dokodemo-door', label: 'Dokodemo' },
                    ]}
                    onChange={(v) => {
                      const newInbounds = [...v2rayOpts.inbounds];
                      newInbounds[idx] = { ...inbound, protocol: v as 'socks' | 'http' | 'dokodemo-door' };
                      onChange({ ...options, v2ray: { ...v2rayOpts, inbounds: newInbounds } });
                    }}
                  />
                  <InputField
                    label="Port"
                    type="number"
                    value={inbound.port}
                    onChange={(v) => {
                      const newInbounds = [...v2rayOpts.inbounds];
                      newInbounds[idx] = { ...inbound, port: Number(v) };
                      onChange({ ...options, v2ray: { ...v2rayOpts, inbounds: newInbounds } });
                    }}
                  />
                  <InputField
                    label="Listen"
                    value={inbound.listen}
                    onChange={(v) => {
                      const newInbounds = [...v2rayOpts.inbounds];
                      newInbounds[idx] = { ...inbound, listen: v };
                      onChange({ ...options, v2ray: { ...v2rayOpts, inbounds: newInbounds } });
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                onChange({ 
                  ...options, 
                  v2ray: { 
                    ...v2rayOpts, 
                    inbounds: [...v2rayOpts.inbounds, { port: 1082, protocol: 'socks', listen: '127.0.0.1', sniffing: true }] 
                  } 
                });
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Inbound
            </button>
          </div>
        </Section>

        {/* Routing */}
        <Section 
          title="Routing Settings" 
          icon={<Shield className="w-4 h-4" />}
          expanded={expandedSections.routing}
          onToggle={() => toggleSection('routing')}
        >
          <SelectField
            label="Domain Strategy"
            value={v2rayOpts.routing.domainStrategy}
            options={[
              { value: 'AsIs', label: 'As Is' },
              { value: 'IPIfNonMatch', label: 'IP If Non Match' },
              { value: 'IPOnDemand', label: 'IP On Demand' },
            ]}
            onChange={(v) => onChange({ 
              ...options, 
              v2ray: { ...v2rayOpts, routing: { ...v2rayOpts.routing, domainStrategy: v as V2RayOptions['routing']['domainStrategy'] } } 
            })}
          />
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-300 mb-1">Predefined Rules:</p>
                <ul className="space-y-0.5">
                  {v2rayOpts.routing.rules.map((rule, idx) => (
                    <li key={idx}>• {rule.domain?.[0] || rule.ip?.[0]} → {rule.outboundTag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* DNS */}
        <Section 
          title="DNS Settings" 
          icon={<Globe className="w-4 h-4" />}
          expanded={expandedSections.dns}
          onToggle={() => toggleSection('dns')}
        >
          <ArrayField
            label="DNS Servers"
            values={v2rayOpts.dns.servers}
            onChange={(values) => onChange({ 
              ...options, 
              v2ray: { ...v2rayOpts, dns: { servers: values } } 
            })}
            placeholder="8.8.8.8"
          />
        </Section>
      </>
    );
  };

  const renderSingBoxOptions = () => {
    const singboxOpts = options.singbox;
    
    return (
      <>
        {/* Log Settings */}
        <Section 
          title="Log Settings" 
          icon={<Settings className="w-4 h-4" />}
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
        >
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Log Level"
              value={singboxOpts.log.level}
              options={[
                { value: 'trace', label: 'Trace' },
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warn', label: 'Warn' },
                { value: 'error', label: 'Error' },
                { value: 'fatal', label: 'Fatal' },
                { value: 'panic', label: 'Panic' },
              ]}
              onChange={(v) => onChange({ 
                ...options, 
                singbox: { ...singboxOpts, log: { ...singboxOpts.log, level: v as SingBoxOptions['log']['level'] } } 
              })}
            />
            <div className="flex items-end pb-1">
              <CheckboxField
                label="Timestamp"
                checked={singboxOpts.log.timestamp}
                onChange={(v) => onChange({ 
                  ...options, 
                  singbox: { ...singboxOpts, log: { ...singboxOpts.log, timestamp: v } } 
                })}
              />
            </div>
          </div>
        </Section>

        {/* Inbounds */}
        <Section 
          title="Inbounds" 
          icon={<Layers className="w-4 h-4" />}
          expanded={expandedSections.inbounds}
          onToggle={() => toggleSection('inbounds')}
        >
          <div className="space-y-4">
            {singboxOpts.inbounds.map((inbound, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Inbound {idx + 1}</span>
                  <button
                    onClick={() => {
                      const newInbounds = singboxOpts.inbounds.filter((_, i) => i !== idx);
                      onChange({ ...options, singbox: { ...singboxOpts, inbounds: newInbounds } });
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SelectField
                    label="Type"
                    value={inbound.type}
                    options={[
                      { value: 'mixed', label: 'Mixed' },
                      { value: 'socks', label: 'SOCKS' },
                      { value: 'http', label: 'HTTP' },
                      { value: 'tun', label: 'TUN' },
                    ]}
                    onChange={(v) => {
                      const newInbounds = [...singboxOpts.inbounds];
                      newInbounds[idx] = { ...inbound, type: v as 'mixed' | 'socks' | 'http' | 'tun' };
                      onChange({ ...options, singbox: { ...singboxOpts, inbounds: newInbounds } });
                    }}
                  />
                  <InputField
                    label="Port"
                    type="number"
                    value={inbound.listenPort}
                    onChange={(v) => {
                      const newInbounds = [...singboxOpts.inbounds];
                      newInbounds[idx] = { ...inbound, listenPort: Number(v) };
                      onChange({ ...options, singbox: { ...singboxOpts, inbounds: newInbounds } });
                    }}
                  />
                  <InputField
                    label="Listen"
                    value={inbound.listen}
                    onChange={(v) => {
                      const newInbounds = [...singboxOpts.inbounds];
                      newInbounds[idx] = { ...inbound, listen: v };
                      onChange({ ...options, singbox: { ...singboxOpts, inbounds: newInbounds } });
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                onChange({ 
                  ...options, 
                  singbox: { 
                    ...singboxOpts, 
                    inbounds: [...singboxOpts.inbounds, { type: 'mixed', listen: '127.0.0.1', listenPort: 1081 }] 
                  } 
                });
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Inbound
            </button>
          </div>
        </Section>

        {/* DNS */}
        <Section 
          title="DNS Settings" 
          icon={<Globe className="w-4 h-4" />}
          expanded={expandedSections.dns}
          onToggle={() => toggleSection('dns')}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">DNS Servers:</p>
            {singboxOpts.dns.servers.map((server, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{server.tag}</span>
                  <button
                    onClick={() => {
                      const newServers = singboxOpts.dns.servers.filter((_, i) => i !== idx);
                      onChange({ ...options, singbox: { ...singboxOpts, dns: { ...singboxOpts.dns, servers: newServers } } });
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Tag"
                    value={server.tag}
                    onChange={(v) => {
                      const newServers = [...singboxOpts.dns.servers];
                      newServers[idx] = { ...server, tag: v };
                      onChange({ ...options, singbox: { ...singboxOpts, dns: { ...singboxOpts.dns, servers: newServers } } });
                    }}
                  />
                  <InputField
                    label="Address"
                    value={server.address}
                    onChange={(v) => {
                      const newServers = [...singboxOpts.dns.servers];
                      newServers[idx] = { ...server, address: v };
                      onChange({ ...options, singbox: { ...singboxOpts, dns: { ...singboxOpts.dns, servers: newServers } } });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Route */}
        <Section 
          title="Route Settings" 
          icon={<Shield className="w-4 h-4" />}
          expanded={expandedSections.routing}
          onToggle={() => toggleSection('routing')}
        >
          <div className="space-y-4">
            <SelectField
              label="Final Outbound"
              value={singboxOpts.route.final}
              options={[
                { value: 'proxy', label: 'Proxy' },
                { value: 'direct', label: 'Direct' },
              ]}
              onChange={(v) => onChange({ 
                ...options, 
                singbox: { ...singboxOpts, route: { ...singboxOpts.route, final: v } } 
              })}
            />
            <CheckboxField
              label="Auto Detect Interface"
              checked={singboxOpts.route.autoDetectInterface}
              onChange={(v) => onChange({ 
                ...options, 
                singbox: { ...singboxOpts, route: { ...singboxOpts.route, autoDetectInterface: v } } 
              })}
            />
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-300 mb-1">Predefined Rules:</p>
                  <ul className="space-y-0.5">
                    {singboxOpts.route.rules.map((rule, idx) => (
                      <li key={idx}>• {rule.geoip?.[0] || rule.geosite?.[0]} → {rule.outbound}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-300 mb-4">
        <Settings className="w-5 h-5" />
        <h3 className="font-semibold">Output Configuration Options</h3>
        <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-400 uppercase">
          {format}
        </span>
      </div>
      
      {format === 'clash' && renderClashOptions()}
      {format === 'v2ray' && renderV2RayOptions()}
      {format === 'singbox' && renderSingBoxOptions()}
    </div>
  );
}

// Helper Components

function Section({ 
  title, 
  icon, 
  expanded, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode;
  expanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-200">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-4 bg-slate-900/50">
          {children}
        </div>
      )}
    </div>
  );
}

function InputField({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder
}: { 
  label: string; 
  value: string | number; 
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}

function SelectField({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}

function ArrayField({ 
  label, 
  values, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  values: string[]; 
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-2">{label}</label>
      <div className="space-y-2">
        {values.map((value, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const newValues = [...values];
                newValues[idx] = e.target.value;
                onChange(newValues);
              }}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...values, ''])}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
          )}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}
