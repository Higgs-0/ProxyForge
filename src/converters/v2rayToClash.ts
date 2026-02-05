import type { ClashConfig, ClashProxy, V2RayConfig, V2RayOutbound } from '../types';
import type { ClashOptions } from '../components/ConfigOptions';

function convertOutboundToProxy(outbound: V2RayOutbound): ClashProxy | null {
  const streamSettings = outbound.streamSettings;
  
  const getBaseConfig = () => ({
    tls: streamSettings?.security === 'tls' || streamSettings?.security === 'xtls',
    'skip-cert-verify': streamSettings?.tlsSettings?.allowInsecure || false,
    sni: streamSettings?.tlsSettings?.serverName,
    network: streamSettings?.network || 'tcp',
    alpn: streamSettings?.tlsSettings?.alpn,
  });

  const getTransportConfig = () => {
    const config: Partial<ClashProxy> = {};
    
    if (streamSettings?.network === 'ws' && streamSettings.wsSettings) {
      config['ws-opts'] = {
        path: streamSettings.wsSettings.path,
        headers: streamSettings.wsSettings.headers,
      };
    }
    
    if (streamSettings?.network === 'grpc' && streamSettings.grpcSettings) {
      config['grpc-opts'] = {
        'grpc-service-name': streamSettings.grpcSettings.serviceName,
      };
    }
    
    if (streamSettings?.network === 'h2' && streamSettings.httpSettings) {
      config['h2-opts'] = {
        host: streamSettings.httpSettings.host,
        path: streamSettings.httpSettings.path,
      };
    }
    
    return config;
  };

  switch (outbound.protocol) {
    case 'vmess': {
      const vnext = outbound.settings.vnext?.[0];
      const user = vnext?.users?.[0];
      if (!vnext || !user) return null;

      return {
        name: outbound.tag || 'vmess-proxy',
        type: 'vmess',
        server: vnext.address,
        port: vnext.port,
        uuid: user.id,
        alterId: user.alterId || 0,
        cipher: user.security || 'auto',
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };
    }

    case 'vless': {
      const vnext = outbound.settings.vnext?.[0];
      const user = vnext?.users?.[0];
      if (!vnext || !user) return null;

      return {
        name: outbound.tag || 'vless-proxy',
        type: 'vless',
        server: vnext.address,
        port: vnext.port,
        uuid: user.id,
        flow: user.flow,
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };
    }

    case 'trojan': {
      const server = outbound.settings.servers?.[0];
      if (!server) return null;

      return {
        name: outbound.tag || 'trojan-proxy',
        type: 'trojan',
        server: server.address,
        port: server.port,
        password: server.password,
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };
    }

    case 'shadowsocks': {
      const server = outbound.settings.servers?.[0];
      if (!server) return null;

      return {
        name: outbound.tag || 'ss-proxy',
        type: 'ss',
        server: server.address,
        port: server.port,
        password: server.password,
        cipher: server.method || 'aes-256-gcm',
        udp: true,
      };
    }

    default:
      return null;
  }
}

export function v2rayToClash(v2rayConfig: V2RayConfig, options?: ClashOptions): ClashConfig {
  const proxies: ClashProxy[] = [];
  const proxyNames: string[] = [];

  for (const outbound of v2rayConfig.outbounds || []) {
    // Skip special outbounds
    if (['freedom', 'blackhole', 'dns'].includes(outbound.protocol)) {
      continue;
    }

    const proxy = convertOutboundToProxy(outbound);
    if (proxy) {
      proxies.push(proxy);
      proxyNames.push(proxy.name);
    }
  }

  // Use options if provided
  const port = options?.port || 7890;
  const socksPort = options?.socksPort || 7891;
  const mixedPort = options?.mixedPort || 7893;
  const allowLan = options?.allowLan ?? false;
  const mode = options?.mode || 'rule';
  const logLevel = options?.logLevel || 'info';
  const ipv6 = options?.ipv6 ?? false;
  const externalController = options?.externalController || '127.0.0.1:9090';

  // Build DNS config
  const dns = options?.dns ? {
    enable: options.dns.enable,
    ipv6: options.dns.ipv6,
    listen: options.dns.listen,
    'enhanced-mode': options.dns.enhancedMode,
    'fake-ip-range': options.dns.fakeIpRange,
    nameserver: options.dns.nameserver,
    fallback: options.dns.fallback,
  } : {
    enable: true,
    ipv6: false,
    listen: '0.0.0.0:53',
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    nameserver: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
    fallback: ['https://1.1.1.1/dns-query', 'https://8.8.8.8/dns-query'],
  };

  // Build proxy groups
  const defaultProxyGroups = proxyNames.length > 0 ? [
    {
      name: '🚀 Proxy',
      type: 'select',
      proxies: ['♻️ Auto', 'DIRECT', ...proxyNames],
    },
    {
      name: '♻️ Auto',
      type: 'url-test',
      proxies: proxyNames,
      url: 'http://www.gstatic.com/generate_204',
      interval: 300,
    },
  ] : [];

  const proxyGroups = options?.proxyGroups?.map(pg => ({
    name: pg.name,
    type: pg.type,
    proxies: pg.proxies.length > 0 ? pg.proxies : proxyNames,
    url: pg.url,
    interval: pg.interval,
  })) || defaultProxyGroups;

  // Build rules
  const rules = options?.rules || [
    'DOMAIN-SUFFIX,googleapis.cn,🚀 Proxy',
    'DOMAIN-SUFFIX,google.com,🚀 Proxy',
    'GEOIP,LAN,DIRECT',
    'GEOIP,CN,DIRECT',
    'MATCH,🚀 Proxy',
  ];

  return {
    port,
    'socks-port': socksPort,
    'mixed-port': mixedPort,
    'allow-lan': allowLan,
    mode,
    'log-level': logLevel,
    ipv6,
    'external-controller': externalController,
    dns,
    proxies,
    'proxy-groups': proxyGroups,
    rules,
  };
}
