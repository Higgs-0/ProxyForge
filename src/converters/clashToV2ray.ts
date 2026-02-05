import type { ClashConfig, ClashProxy, V2RayConfig, V2RayOutbound } from '../types';
import type { V2RayOptions } from '../components/ConfigOptions';

function convertProxyToOutbound(proxy: ClashProxy): V2RayOutbound | null {
  const baseStreamSettings = {
    network: proxy.network || 'tcp',
    security: proxy.tls ? 'tls' : 'none',
    tlsSettings: proxy.tls ? {
      serverName: proxy.sni || proxy.server,
      allowInsecure: proxy['skip-cert-verify'] || false,
      alpn: proxy.alpn,
    } : undefined,
    wsSettings: proxy.network === 'ws' && proxy['ws-opts'] ? {
      path: proxy['ws-opts'].path || '/',
      headers: proxy['ws-opts'].headers,
    } : undefined,
    grpcSettings: proxy.network === 'grpc' && proxy['grpc-opts'] ? {
      serviceName: proxy['grpc-opts']['grpc-service-name'] || '',
    } : undefined,
    httpSettings: proxy.network === 'h2' && proxy['h2-opts'] ? {
      host: proxy['h2-opts'].host,
      path: proxy['h2-opts'].path,
    } : undefined,
  };

  switch (proxy.type) {
    case 'vmess':
      return {
        tag: proxy.name,
        protocol: 'vmess',
        settings: {
          vnext: [{
            address: proxy.server,
            port: proxy.port,
            users: [{
              id: proxy.uuid || '',
              alterId: proxy.alterId || 0,
              security: proxy.cipher || 'auto',
            }],
          }],
        },
        streamSettings: baseStreamSettings,
      };

    case 'vless':
      return {
        tag: proxy.name,
        protocol: 'vless',
        settings: {
          vnext: [{
            address: proxy.server,
            port: proxy.port,
            users: [{
              id: proxy.uuid || '',
              encryption: 'none',
              flow: proxy.flow,
            }],
          }],
        },
        streamSettings: {
          ...baseStreamSettings,
          security: proxy.tls ? (proxy.flow ? 'xtls' : 'tls') : 'none',
        },
      };

    case 'trojan':
      return {
        tag: proxy.name,
        protocol: 'trojan',
        settings: {
          servers: [{
            address: proxy.server,
            port: proxy.port,
            password: proxy.password || '',
          }],
        },
        streamSettings: {
          ...baseStreamSettings,
          security: 'tls',
        },
      };

    case 'ss':
      return {
        tag: proxy.name,
        protocol: 'shadowsocks',
        settings: {
          servers: [{
            address: proxy.server,
            port: proxy.port,
            password: proxy.password || '',
            method: proxy.cipher || 'aes-256-gcm',
          }],
        },
      };

    default:
      return null;
  }
}

export function clashToV2ray(clashConfig: ClashConfig, options?: V2RayOptions): V2RayConfig {
  const outbounds: V2RayOutbound[] = [];

  for (const proxy of clashConfig.proxies || []) {
    const outbound = convertProxyToOutbound(proxy);
    if (outbound) {
      outbounds.push(outbound);
    }
  }

  // Add direct and block outbounds
  outbounds.push({
    tag: 'direct',
    protocol: 'freedom',
    settings: {},
  });

  outbounds.push({
    tag: 'block',
    protocol: 'blackhole',
    settings: {},
  });

  // Use options if provided
  const logLevel = options?.log?.loglevel || 'warning';
  const dnsServers = options?.dns?.servers || ['8.8.8.8', '8.8.4.4'];
  const domainStrategy = options?.routing?.domainStrategy || 'IPIfNonMatch';

  // Build inbounds from options
  const inbounds = options?.inbounds?.map(ib => ({
    port: ib.port,
    protocol: ib.protocol,
    listen: ib.listen,
    settings: ib.protocol === 'socks' ? { udp: true } : {},
    sniffing: ib.sniffing ? {
      enabled: true,
      destOverride: ['http', 'tls'],
    } : undefined,
  })) || [
    {
      port: 1080,
      protocol: 'socks',
      settings: { udp: true },
    },
    {
      port: 1081,
      protocol: 'http',
    },
  ];

  // Build routing rules from options
  const rules = options?.routing?.rules?.map(rule => ({
    type: 'field' as const,
    domain: rule.domain,
    ip: rule.ip,
    outboundTag: rule.outboundTag,
  })) || [
    {
      type: 'field' as const,
      ip: ['geoip:private'],
      outboundTag: 'direct',
    },
    {
      type: 'field' as const,
      domain: ['geosite:cn'],
      outboundTag: 'direct',
    },
    {
      type: 'field' as const,
      ip: ['geoip:cn'],
      outboundTag: 'direct',
    },
  ];

  return {
    log: {
      loglevel: logLevel,
    },
    dns: {
      servers: dnsServers,
    },
    inbounds,
    outbounds,
    routing: {
      domainStrategy,
      rules,
    },
  };
}
