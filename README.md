<p align="center">
  <img src="public/logo.svg" alt="ProxyForge Logo" width="120" height="120">
</p>

<h1 align="center">ProxyForge</h1>

<p align="center">
  <strong>Forge your proxy configurations with precision</strong>
</p>

<p align="center">
  A modern, serverless web application to convert between Clash, V2Ray, and Sing-box proxy configurations with full customization options.
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/higgs-0/proxyforge">
    <img src="https://vercel.com/button" alt="Deploy with Vercel">
  </a>
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/higgs-0/proxyforge">
    <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite" alt="Vite 7">
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5">
</p>

---

## ✨ Features

### 🔄 Bidirectional Conversion
Convert between all supported formats in any direction:
- **Clash YAML** ↔ **V2Ray JSON** ↔ **Sing-box JSON**

### ⚙️ Full Configuration Options
Customize every aspect of your output configuration:

| Clash | V2Ray | Sing-box |
|-------|-------|----------|
| Ports (HTTP, SOCKS, Mixed) | Log Level | Log Level & Timestamp |
| Allow LAN & IPv6 | Inbounds Configuration | Inbounds (Mixed, SOCKS, HTTP, TUN) |
| DNS Settings (Fake-IP, Enhanced Mode) | DNS Servers | DNS Servers & Rules |
| Routing Rules | Routing Rules | GeoIP/GeoSite Rules |
| Proxy Groups (Select, URL-Test, Fallback) | Domain Strategy | Clash API Integration |

### 🔒 Privacy First
All conversions happen entirely in your browser. Your configuration data never leaves your device.

### 🎨 Modern UI
- Beautiful dark theme with gradient accents
- Responsive design for all devices
- Smooth animations and transitions
- One-click copy and download

### 📱 Supported Clients

| Clash | V2Ray | Sing-box |
|-------|-------|----------|
| Clash | V2Ray | Sing-box |
| ClashX | Xray | SFI (iOS) |
| Clash for Windows | V2RayN | SFA (Android) |
| OpenClash | V2RayNG | |
| Clash Verge | Qv2ray | |

## 🚀 Supported Protocols

- ✅ VMess
- ✅ VLESS
- ✅ Trojan
- ✅ Shadowsocks
- ✅ Hysteria2
- ✅ SOCKS5
- ✅ HTTP
- ✅ WireGuard (partial)

## 🛠️ One-Click Deploy

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/higgs-0/proxyforge)

### Deploy to Cloudflare Pages

1. Fork this repository
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages/new/git)
3. Connect your GitHub account and select the forked repository
4. Configure the build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click "Save and Deploy"

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/higgs-0/proxyforge)

### Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings > Pages
3. Set source to "GitHub Actions"
4. The workflow will automatically build and deploy on push

## 💻 Local Development

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/proxyforge/proxyforge.git
cd proxyforge

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Project Structure

```
proxyforge/
├── public/
│   └── logo.svg              # Logo file
├── src/
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── Logo.tsx          # Logo components
│   │   └── ConfigOptions.tsx # Configuration options panel
│   ├── converters/           # Conversion logic
│   │   ├── index.ts          # Main converter functions
│   │   ├── clashToV2ray.ts   # Clash → V2Ray
│   │   ├── clashToSingbox.ts # Clash → Sing-box
│   │   ├── v2rayToClash.ts   # V2Ray → Clash
│   │   └── singboxToClash.ts # Sing-box → Clash
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── utils/
│       └── cn.ts             # Utility functions
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json               # Vercel configuration
├── netlify.toml              # Netlify configuration
├── wrangler.toml             # Cloudflare configuration
└── README.md
```

## ⚙️ Configuration Options

### Clash Output Options
- **General**: Port, SOCKS Port, Mixed Port, Allow LAN, Mode, Log Level, IPv6
- **DNS**: Enable, IPv6, Enhanced Mode, Fake-IP Range, Nameservers, Fallback
- **Rules**: Custom routing rules (DOMAIN, DOMAIN-SUFFIX, GEOIP, etc.)
- **Proxy Groups**: Select, URL-Test, Fallback, Load-Balance

### V2Ray Output Options
- **Log**: Log Level (debug, info, warning, error, none)
- **Inbounds**: Protocol (SOCKS, HTTP, Dokodemo), Port, Listen Address, Sniffing
- **DNS**: DNS Servers list
- **Routing**: Domain Strategy, Custom rules

### Sing-box Output Options
- **Log**: Level, Timestamp
- **Inbounds**: Type (Mixed, SOCKS, HTTP, TUN), Port, Listen Address
- **DNS**: Servers with tags and detour, DNS Rules
- **Route**: GeoIP/GeoSite rules, Final outbound, Auto-detect interface
- **Experimental**: Clash API configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clash](https://github.com/Dreamacro/clash) - A rule-based tunnel
- [V2Ray](https://github.com/v2ray/v2ray-core) - Platform for building proxies
- [Sing-box](https://github.com/SagerNet/sing-box) - The universal proxy platform
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please ensure you have the right to use and convert any proxy configurations. The developers are not responsible for any misuse of this tool.

---

<p align="center">
  Made with ❤️ by Higgs
</p>
