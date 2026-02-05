// Clash Proxy Types
export interface ClashProxy {
  name: string;
  type: 'ss' | 'vmess' | 'trojan' | 'ssr' | 'http' | 'socks5' | 'vless' | 'hysteria' | 'hysteria2' | 'tuic';
  server: string;
  port: number;
  password?: string;
  uuid?: string;
  alterId?: number;
  cipher?: string;
  udp?: boolean;
  tls?: boolean;
  'skip-cert-verify'?: boolean;
  sni?: string;
  network?: string;
  'ws-opts'?: {
    path?: string;
    headers?: Record<string, string>;
  };
  'grpc-opts'?: {
    'grpc-service-name'?: string;
  };
  'h2-opts'?: {
    host?: string[];
    path?: string;
  };
  plugin?: string;
  'plugin-opts'?: Record<string, unknown>;
  alpn?: string[];
  flow?: string;
}

export interface ClashConfig {
  port?: number;
  'socks-port'?: number;
  'mixed-port'?: number;
  'allow-lan'?: boolean;
  mode?: string;
  'log-level'?: string;
  ipv6?: boolean;
  'external-controller'?: string;
  dns?: {
    enable?: boolean;
    ipv6?: boolean;
    listen?: string;
    'enhanced-mode'?: string;
    'fake-ip-range'?: string;
    nameserver?: string[];
    fallback?: string[];
  };
  proxies: ClashProxy[];
  'proxy-groups'?: Array<{
    name: string;
    type: string;
    proxies: string[];
    url?: string;
    interval?: number;
  }>;
  rules?: string[];
}

// V2Ray Config Types
export interface V2RayOutbound {
  tag?: string;
  protocol: string;
  settings: {
    vnext?: Array<{
      address: string;
      port: number;
      users: Array<{
        id: string;
        alterId?: number;
        security?: string;
        encryption?: string;
        flow?: string;
      }>;
    }>;
    servers?: Array<{
      address: string;
      port: number;
      password?: string;
      method?: string;
      email?: string;
      level?: number;
    }>;
  };
  streamSettings?: {
    network?: string;
    security?: string;
    tlsSettings?: {
      serverName?: string;
      allowInsecure?: boolean;
      alpn?: string[];
    };
    wsSettings?: {
      path?: string;
      headers?: Record<string, string>;
    };
    grpcSettings?: {
      serviceName?: string;
    };
    httpSettings?: {
      host?: string[];
      path?: string;
    };
    tcpSettings?: {
      header?: {
        type?: string;
        request?: {
          path?: string[];
          headers?: Record<string, string[]>;
        };
      };
    };
  };
}

export interface V2RayConfig {
  log?: {
    loglevel?: string;
    access?: string;
    error?: string;
  };
  dns?: {
    servers?: string[];
  };
  inbounds?: Array<{
    port: number;
    protocol: string;
    listen?: string;
    settings?: Record<string, unknown>;
    sniffing?: {
      enabled?: boolean;
      destOverride?: string[];
    };
  }>;
  outbounds: V2RayOutbound[];
  routing?: {
    domainStrategy?: string;
    rules?: Array<{
      type?: string;
      ip?: string[];
      domain?: string[];
      outboundTag?: string;
    }>;
  };
}

// Sing-box Config Types
export interface SingBoxOutbound {
  type: string;
  tag: string;
  server?: string;
  server_port?: number;
  uuid?: string;
  password?: string;
  method?: string;
  alter_id?: number;
  security?: string;
  flow?: string;
  tls?: {
    enabled?: boolean;
    server_name?: string;
    insecure?: boolean;
    alpn?: string[];
  };
  transport?: {
    type?: string;
    path?: string;
    headers?: Record<string, string>;
    service_name?: string;
    host?: string[];
  };
  network?: string;
}

export interface SingBoxConfig {
  log?: {
    level?: string;
    timestamp?: boolean;
  };
  dns?: {
    servers?: Array<{
      tag?: string;
      address?: string;
      detour?: string;
    }>;
    rules?: Array<{
      domain?: string[];
      geosite?: string[];
      server?: string;
    }>;
  };
  inbounds?: Array<{
    type: string;
    tag?: string;
    listen?: string;
    listen_port?: number;
  }>;
  outbounds: SingBoxOutbound[];
  route?: {
    rules?: Array<{
      geoip?: string[];
      geosite?: string[];
      domain?: string[];
      outbound?: string;
    }>;
    geoip?: {
      download_url?: string;
      download_detour?: string;
    };
    geosite?: {
      download_url?: string;
      download_detour?: string;
    };
    final?: string;
    auto_detect_interface?: boolean;
  };
  experimental?: {
    clash_api?: {
      external_controller?: string;
      external_ui?: string;
    };
  };
}

export type ConversionFormat = 'clash' | 'v2ray' | 'singbox';

export interface ConversionResult {
  success: boolean;
  data?: string;
  error?: string;
}
