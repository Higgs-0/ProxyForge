import { useState, useCallback } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Sparkles,
  Github,
  FileJson,
  FileCode,
  Zap,
  ChevronDown,
  Settings,
  X
} from 'lucide-react';
import { convert, detectFormat } from './converters';
import type { ConversionFormat } from './types';
import { cn } from './utils/cn';
import { Logo, LogoIcon } from './components/Logo';
import { ConfigOptions, defaultConfigOptions, type ConfigOptionsType } from './components/ConfigOptions';

const formatLabels: Record<ConversionFormat, string> = {
  clash: 'Clash YAML',
  v2ray: 'V2Ray JSON',
  singbox: 'Sing-box JSON',
};

const formatIcons: Record<ConversionFormat, React.ReactNode> = {
  clash: <FileCode className="w-4 h-4" />,
  v2ray: <FileJson className="w-4 h-4" />,
  singbox: <Zap className="w-4 h-4" />,
};

const formatColors: Record<ConversionFormat, string> = {
  clash: 'from-blue-500 to-cyan-500',
  v2ray: 'from-purple-500 to-pink-500',
  singbox: 'from-orange-500 to-amber-500',
};

const sampleConfigs: Record<ConversionFormat, string> = {
  clash: `proxies:
  - name: "vmess-proxy"
    type: vmess
    server: example.com
    port: 443
    uuid: a3482e88-686a-4a58-8126-99c9034c1234
    alterId: 0
    cipher: auto
    tls: true
    network: ws
    ws-opts:
      path: /path
      headers:
        Host: example.com

  - name: "ss-proxy"
    type: ss
    server: ss.example.com
    port: 8388
    password: your-password
    cipher: aes-256-gcm

  - name: "trojan-proxy"
    type: trojan
    server: trojan.example.com
    port: 443
    password: your-password
    sni: trojan.example.com`,
  v2ray: `{
  "outbounds": [
    {
      "tag": "vmess-proxy",
      "protocol": "vmess",
      "settings": {
        "vnext": [{
          "address": "example.com",
          "port": 443,
          "users": [{
            "id": "a3482e88-686a-4a58-8126-99c9034c1234",
            "alterId": 0,
            "security": "auto"
          }]
        }]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "wsSettings": {
          "path": "/path"
        }
      }
    }
  ]
}`,
  singbox: `{
  "outbounds": [
    {
      "type": "vmess",
      "tag": "vmess-proxy",
      "server": "example.com",
      "server_port": 443,
      "uuid": "a3482e88-686a-4a58-8126-99c9034c1234",
      "alter_id": 0,
      "security": "auto",
      "tls": {
        "enabled": true,
        "server_name": "example.com"
      },
      "transport": {
        "type": "ws",
        "path": "/path"
      }
    }
  ]
}`,
};

export function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState<ConversionFormat>('clash');
  const [toFormat, setToFormat] = useState<ConversionFormat>('v2ray');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [configOptions, setConfigOptions] = useState<ConfigOptionsType>(defaultConfigOptions);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter a configuration to convert');
      return;
    }

    setIsConverting(true);
    setError(null);

    // Simulate slight delay for animation
    setTimeout(() => {
      const result = convert(input, fromFormat, toFormat, configOptions);
      
      if (result.success && result.data) {
        setOutput(result.data);
        setError(null);
      } else {
        setError(result.error || 'Conversion failed');
        setOutput('');
      }
      setIsConverting(false);
    }, 300);
  }, [input, fromFormat, toFormat, configOptions]);

  const handleAutoDetect = useCallback(() => {
    const detected = detectFormat(input);
    if (detected) {
      setFromFormat(detected);
      // Set a different target format
      const formats: ConversionFormat[] = ['clash', 'v2ray', 'singbox'];
      const otherFormats = formats.filter(f => f !== detected);
      setToFormat(otherFormats[0]);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (output) {
      const extension = toFormat === 'clash' ? 'yaml' : 'json';
      const mimeType = toFormat === 'clash' ? 'text/yaml' : 'application/json';
      const blob = new Blob([output], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [output, toFormat]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
        
        // Auto-detect format
        const detected = detectFormat(content);
        if (detected) {
          setFromFormat(detected);
          const formats: ConversionFormat[] = ['clash', 'v2ray', 'singbox'];
          const otherFormats = formats.filter(f => f !== detected);
          setToFormat(otherFormats[0]);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const loadSample = useCallback((format: ConversionFormat) => {
    setInput(sampleConfigs[format]);
    setFromFormat(format);
    const formats: ConversionFormat[] = ['clash', 'v2ray', 'singbox'];
    const otherFormats = formats.filter(f => f !== format);
    setToFormat(otherFormats[0]);
  }, []);

  const swapFormats = useCallback(() => {
    setFromFormat(toFormat);
    setToFormat(fromFormat);
    if (output) {
      setInput(output);
      setOutput('');
    }
  }, [fromFormat, toFormat, output]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-4">
            <Logo className="w-16 h-16 md:w-20 md:h-20" />
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
                ProxyForge
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Forge your proxy configurations with precision
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mt-4">
            Convert between Clash, V2Ray, and Sing-box configurations with full customization.
            <br />
            <span className="text-slate-500">Fully client-side, your data never leaves your browser.</span>
          </p>
          
          {/* Deploy buttons */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <a
              href="https://github.com/proxyforge/proxyforge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/proxyforge/proxyforge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-900 border border-slate-700 rounded-lg text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              Deploy to Vercel
            </a>
            <a
              href="https://deploy.workers.cloudflare.com/?url=https://github.com/proxyforge/proxyforge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 0C14.327 0 0 14.327 0 32s14.327 32 32 32 32-14.327 32-32S49.673 0 32 0zm14.127 35.787l-4.96 16.88c-.32 1.093-1.387 1.867-2.547 1.867H15.787c-1.493 0-2.707-1.213-2.707-2.707 0-.24.027-.48.08-.72l4.96-16.88c.32-1.093 1.387-1.867 2.547-1.867h22.833c1.493 0 2.707 1.213 2.707 2.707 0 .24-.027.48-.08.72z" />
              </svg>
              Deploy to Cloudflare
            </a>
          </div>
        </header>

        {/* Sample configs */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <span className="text-slate-500 text-sm">Load sample:</span>
          {(['clash', 'v2ray', 'singbox'] as ConversionFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => loadSample(format)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 hover:text-white"
              )}
            >
              {formatIcons[format]}
              {formatLabels[format]}
            </button>
          ))}
        </div>

        {/* Main converter area */}
        <div className="max-w-7xl mx-auto">
          {/* Format selectors */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <FormatSelector
              value={fromFormat}
              onChange={setFromFormat}
              label="From"
            />
            
            <button
              onClick={swapFormats}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            
            <FormatSelector
              value={toFormat}
              onChange={setToFormat}
              label="To"
            />
          </div>

          {/* Editor panels */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="relative group">
              <div className={cn(
                "absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-50 blur-sm transition-opacity",
                formatColors[fromFormat],
                "group-hover:opacity-75"
              )} />
              <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg bg-gradient-to-r",
                      formatColors[fromFormat]
                    )}>
                      {formatIcons[fromFormat]}
                    </div>
                    <span className="font-medium text-slate-200">Input - {formatLabels[fromFormat]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input
                        type="file"
                        accept=".yaml,.yml,.json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleAutoDetect}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto-detect
                    </button>
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your configuration here..."
                  className="w-full h-96 p-4 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-600"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Output panel */}
            <div className="relative group">
              <div className={cn(
                "absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-50 blur-sm transition-opacity",
                formatColors[toFormat],
                "group-hover:opacity-75"
              )} />
              <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg bg-gradient-to-r",
                      formatColors[toFormat]
                    )}>
                      {formatIcons[toFormat]}
                    </div>
                    <span className="font-medium text-slate-200">Output - {formatLabels[toFormat]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                        output
                          ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                          : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        output
                          ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                          : "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  placeholder="Converted configuration will appear here..."
                  className="w-full h-96 p-4 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-600"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                "border border-slate-700 text-slate-300 hover:text-white",
                showOptions 
                  ? "bg-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700"
              )}
            >
              <Settings className="w-5 h-5" />
              {showOptions ? 'Hide Options' : 'Show Options'}
            </button>
            
            <button
              onClick={handleConvert}
              disabled={isConverting || !input.trim()}
              className={cn(
                "group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all",
                "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500",
                "text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-purple-500/25",
                "hover:scale-105 active:scale-95"
              )}
            >
              {isConverting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <LogoIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  Forge Configuration
                </>
              )}
            </button>
          </div>

          {/* Config Options Panel */}
          {showOptions && (
            <div className="mt-8 relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/50 via-pink-500/50 to-orange-500/50 opacity-30 blur-sm" />
              <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Output Configuration Options</h3>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ConfigOptions
                  format={toFormat}
                  options={configOptions}
                  onChange={setConfigOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Features section */}
        <section className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-12">Supported Formats</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Clash YAML',
                description: 'Clash, ClashX, Clash for Windows, OpenClash, Clash Verge, and all compatible clients',
                gradient: 'from-blue-500 to-cyan-500',
                features: ['Proxy Groups', 'Rule-based Routing', 'DNS Settings', 'Mixed Ports'],
              },
              {
                title: 'V2Ray JSON',
                description: 'V2Ray, Xray-core, V2RayN, V2RayNG, Qv2ray, and compatible clients',
                gradient: 'from-purple-500 to-pink-500',
                features: ['Multiple Inbounds', 'Routing Rules', 'DNS Configuration', 'Transport Settings'],
              },
              {
                title: 'Sing-box JSON',
                description: 'Sing-box, SFI (iOS), SFA (Android), and next-gen proxy clients',
                gradient: 'from-orange-500 to-amber-500',
                features: ['Modern Architecture', 'GeoIP/GeoSite', 'Clash API Support', 'TUN Support'],
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative group"
              >
                <div className={cn(
                  "absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-25 blur-sm transition-opacity group-hover:opacity-50",
                  item.gradient
                )} />
                <div className="relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 h-full">
                  <div className={cn(
                    "inline-flex p-3 rounded-xl bg-gradient-to-r mb-4",
                    item.gradient
                  )}>
                    <FileJson className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 mb-4">{item.description}</p>
                  <ul className="space-y-1">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Protocol Support */}
        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Supported Protocols</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'VMess', color: 'bg-violet-500' },
              { name: 'VLESS', color: 'bg-purple-500' },
              { name: 'Trojan', color: 'bg-blue-500' },
              { name: 'Shadowsocks', color: 'bg-cyan-500' },
              { name: 'Hysteria2', color: 'bg-pink-500' },
              { name: 'SOCKS5', color: 'bg-orange-500' },
              { name: 'HTTP', color: 'bg-amber-500' },
              { name: 'WireGuard', color: 'bg-green-500' },
            ].map((protocol) => (
              <div
                key={protocol.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className={cn("w-3 h-3 rounded-full", protocol.color)} />
                <span className="font-medium text-slate-200">{protocol.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogoIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              ProxyForge
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with React + Vite + Tailwind CSS. 
            Fully open source and deployable to any static hosting.
          </p>
          <p className="mt-2 text-slate-600 text-sm">
            Your configuration data is processed entirely in your browser. 
            Nothing is sent to any server.
          </p>
          <p className="mt-4 text-slate-600 text-xs">
            © {new Date().getFullYear()} ProxyForge. MIT License.
          </p>
        </footer>
      </div>
    </div>
  );
}

// Format selector component
function FormatSelector({
  value,
  onChange,
  label,
}: {
  value: ConversionFormat;
  onChange: (format: ConversionFormat) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <span className="block text-xs text-slate-500 mb-1 text-center">{label}</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[180px]",
          "bg-slate-800 hover:bg-slate-700 border-slate-700",
        )}
      >
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-r",
          formatColors[value]
        )}>
          {formatIcons[value]}
        </div>
        <span className="font-medium text-white flex-1 text-left">{formatLabels[value]}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-20">
            {(['clash', 'v2ray', 'singbox'] as ConversionFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => {
                  onChange(format);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors",
                  value === format && "bg-slate-700/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-r",
                  formatColors[format]
                )}>
                  {formatIcons[format]}
                </div>
                <span className="font-medium text-white">{formatLabels[format]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
