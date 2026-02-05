import type { ClashConfig, ClashProxy, SingBoxConfig, SingBoxOutbound } from '../types';
import type { ClashOptions } from '../components/ConfigOptions';

function convertOutboundToProxy(outbound: SingBoxOutbound): ClashProxy | null {
  const getBaseConfig = () => ({
    tls: outbound.tls?.enabled || false,
    'skip-cert-verify': outbound.tls?.insecure || false,
    sni: outbound.tls?.server_name,
    alpn: outbound.tls?.alpn,
  });

  const getTransportConfig = () => {
    const config: Partial<ClashProxy> = {};
    
    if (outbound.transport?.type === 'ws') {
      config.network = 'ws';
      config['ws-opts'] = {
        path: outbound.transport.path,
        headers: outbound.transport.headers,
      };
    }
    
    if (outbound.transport?.type === 'grpc') {
      config.network = 'grpc';
      config['grpc-opts'] = {
        'grpc-service-name': outbound.transport.service_name,
      };
    }
    
    if (outbound.transport?.type === 'http') {
      config.network = 'h2';
      config['h2-opts'] = {
        host: outbound.transport.host,
        path: outbound.transport.path,
      };
    }
    
    return config;
  };

  switch (outbound.type) {
    case 'vmess':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'vmess',
        server: outbound.server,
        port: outbound.server_port,
        uuid: outbound.uuid,
        alterId: outbound.alter_id || 0,
        cipher: outbound.security || 'auto',
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };

    case 'vless':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'vless',
        server: outbound.server,
        port: outbound.server_port,
        uuid: outbound.uuid,
        flow: outbound.flow,
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };

    case 'trojan':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'trojan',
        server: outbound.server,
        port: outbound.server_port,
        password: outbound.password,
        udp: true,
        ...getBaseConfig(),
        ...getTransportConfig(),
      };

    case 'shadowsocks':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'ss',
        server: outbound.server,
        port: outbound.server_port,
        password: outbound.password,
        cipher: outbound.method || 'aes-256-gcm',
        udp: true,
      };

    case 'hysteria2':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'hysteria2',
        server: outbound.server,
        port: outbound.server_port,
        password: outbound.password,
        ...getBaseConfig(),
      };

    case 'socks':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'socks5',
        server: outbound.server,
        port: outbound.server_port,
        udp: true,
      };

    case 'http':
      if (!outbound.server || !outbound.server_port) return null;
      return {
        name: outbound.tag,
        type: 'http',
        server: outbound.server,
        port: outbound.server_port,
      };

    default:
      return null;
  }
}

export function singboxToClash(singboxConfig: SingBoxConfig, options?: ClashOptions): ClashConfig {
  const proxies: ClashProxy[] = [];
  const proxyNames: string[] = [];

  for (const outbound of singboxConfig.outbounds || []) {
    // Skip special outbounds
    if (['direct', 'block', 'dns', 'selector', 'urltest'].includes(outbound.type)) {
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
