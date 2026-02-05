import type { ClashConfig, ClashProxy, SingBoxConfig, SingBoxOutbound } from '../types';
import type { SingBoxOptions } from '../components/ConfigOptions';

function convertProxyToOutbound(proxy: ClashProxy): SingBoxOutbound | null {
  const baseTls = proxy.tls ? {
    enabled: true,
    server_name: proxy.sni || proxy.server,
    insecure: proxy['skip-cert-verify'] || false,
    alpn: proxy.alpn,
  } : undefined;

  const baseTransport = (() => {
    if (proxy.network === 'ws' && proxy['ws-opts']) {
      return {
        type: 'ws' as const,
        path: proxy['ws-opts'].path || '/',
        headers: proxy['ws-opts'].headers,
      };
    }
    if (proxy.network === 'grpc' && proxy['grpc-opts']) {
      return {
        type: 'grpc' as const,
        service_name: proxy['grpc-opts']['grpc-service-name'] || '',
      };
    }
    if (proxy.network === 'h2' && proxy['h2-opts']) {
      return {
        type: 'http' as const,
        host: proxy['h2-opts'].host,
        path: proxy['h2-opts'].path,
      };
    }
    return undefined;
  })();

  switch (proxy.type) {
    case 'vmess':
      return {
        type: 'vmess',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
        uuid: proxy.uuid,
        alter_id: proxy.alterId || 0,
        security: proxy.cipher || 'auto',
        tls: baseTls,
        transport: baseTransport,
      };

    case 'vless':
      return {
        type: 'vless',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
        uuid: proxy.uuid,
        flow: proxy.flow,
        tls: baseTls,
        transport: baseTransport,
      };

    case 'trojan':
      return {
        type: 'trojan',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
        password: proxy.password,
        tls: {
          enabled: true,
          server_name: proxy.sni || proxy.server,
          insecure: proxy['skip-cert-verify'] || false,
          alpn: proxy.alpn,
        },
        transport: baseTransport,
      };

    case 'ss':
      return {
        type: 'shadowsocks',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
        password: proxy.password,
        method: proxy.cipher || 'aes-256-gcm',
      };

    case 'hysteria2':
      return {
        type: 'hysteria2',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
        password: proxy.password,
        tls: baseTls,
      };

    case 'socks5':
      return {
        type: 'socks',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
      };

    case 'http':
      return {
        type: 'http',
        tag: proxy.name,
        server: proxy.server,
        server_port: proxy.port,
      };

    default:
      return null;
  }
}

export function clashToSingbox(clashConfig: ClashConfig, options?: SingBoxOptions): SingBoxConfig {
  const outbounds: SingBoxOutbound[] = [];
  const proxyTags: string[] = [];

  for (const proxy of clashConfig.proxies || []) {
    const outbound = convertProxyToOutbound(proxy);
    if (outbound) {
      outbounds.push(outbound);
      proxyTags.push(outbound.tag);
    }
  }

  // Add selector if there are proxies
  if (outbounds.length > 0) {
    outbounds.unshift({
      type: 'selector',
      tag: 'proxy',
      // @ts-expect-error - outbounds is valid for selector type
      outbounds: proxyTags,
    });
  }

  // Add direct and block outbounds
  outbounds.push({
    type: 'direct',
    tag: 'direct',
  });

  outbounds.push({
    type: 'block',
    tag: 'block',
  });

  outbounds.push({
    type: 'dns',
    tag: 'dns-out',
  });

  // Use options if provided
  const logLevel = options?.log?.level || 'info';
  const logTimestamp = options?.log?.timestamp ?? true;

  // Build inbounds from options
  const inbounds = options?.inbounds?.map(ib => ({
    type: ib.type,
    tag: `${ib.type}-in`,
    listen: ib.listen,
    listen_port: ib.listenPort,
  })) || [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '127.0.0.1',
      listen_port: 1080,
    },
  ];

  // Build DNS from options
  const dnsServers = options?.dns?.servers || [
    { tag: 'google', address: 'tls://8.8.8.8' },
    { tag: 'cloudflare', address: 'https://1.1.1.1/dns-query' },
    { tag: 'local', address: '223.5.5.5', detour: 'direct' },
  ];

  // Build route from options
  const routeRules = options?.route?.rules?.map(rule => ({
    geoip: rule.geoip,
    geosite: rule.geosite,
    domain: rule.domain,
    outbound: rule.outbound,
  })) || [
    { geoip: ['private'], outbound: 'direct' },
    { geosite: ['cn'], outbound: 'direct' },
    { geoip: ['cn'], outbound: 'direct' },
  ];

  const finalOutbound = options?.route?.final || 'proxy';
  const autoDetectInterface = options?.route?.autoDetectInterface ?? true;

  // Build experimental from options
  const experimental = options?.experimental?.clashApi ? {
    clash_api: {
      external_controller: options.experimental.clashApi.externalController,
      external_ui: options.experimental.clashApi.externalUi,
    },
  } : undefined;

  return {
    log: {
      level: logLevel,
      timestamp: logTimestamp,
    },
    dns: {
      servers: dnsServers.map(s => ({
        tag: s.tag,
        address: s.address,
        detour: s.detour,
      })),
      rules: options?.dns?.rules?.map(r => ({
        domain: r.domain,
        geosite: r.geosite,
        server: r.server,
      })),
    },
    inbounds,
    outbounds,
    route: {
      rules: routeRules,
      geoip: options?.route?.geoip ? {
      download_url: options.route.geoip.downloadUrl,
      download_detour: options.route.geoip.downloadDetour,
    } : {
      download_url: 'https://github.com/SagerNet/sing-geoip/releases/latest/download/geoip.db',
      download_detour: 'proxy',
    },
    geosite: options?.route?.geosite ? {
      download_url: options.route.geosite.downloadUrl,
      download_detour: options.route.geosite.downloadDetour,
    } : {
      download_url: 'https://github.com/SagerNet/sing-geosite/releases/latest/download/geosite.db',
      download_detour: 'proxy',
    },
      final: finalOutbound,
      auto_detect_interface: autoDetectInterface,
    },
    experimental,
  };
}
