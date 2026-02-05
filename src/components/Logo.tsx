export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        
        {/* Glow effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="url(#logoGradient)"
        opacity="0.1"
      />
      
      {/* Outer ring */}
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      
      {/* Forge anvil shape - stylized */}
      <g filter="url(#shadow)">
        {/* Central hub */}
        <circle
          cx="60"
          cy="60"
          r="18"
          fill="url(#logoGradient)"
        />
        
        {/* Inner circle */}
        <circle
          cx="60"
          cy="60"
          r="10"
          fill="#1E1B4B"
        />
        
        {/* Arrow 1 - top left */}
        <g filter="url(#glow)">
          <path
            d="M35 35 L50 50"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M35 35 L35 45 M35 35 L45 35"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Arrow 2 - top right */}
        <g filter="url(#glow)">
          <path
            d="M85 35 L70 50"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M85 35 L85 45 M85 35 L75 35"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Arrow 3 - bottom left */}
        <g filter="url(#glow)">
          <path
            d="M35 85 L50 70"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M35 85 L35 75 M35 85 L45 85"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Arrow 4 - bottom right */}
        <g filter="url(#glow)">
          <path
            d="M85 85 L70 70"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M85 85 L85 75 M85 85 L75 85"
            stroke="url(#logoGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Orbital dots */}
        <circle cx="60" cy="25" r="4" fill="#8B5CF6" />
        <circle cx="95" cy="60" r="4" fill="#EC4899" />
        <circle cx="60" cy="95" r="4" fill="#F97316" />
        <circle cx="25" cy="60" r="4" fill="#22D3EE" />
      </g>
    </svg>
  );
}

export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      
      {/* Central hub */}
      <circle cx="24" cy="24" r="8" fill="url(#iconGradient)" />
      <circle cx="24" cy="24" r="4" fill="#1E1B4B" />
      
      {/* Arrows */}
      <path d="M10 10 L18 18" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 10 L10 16 M10 10 L16 10" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      
      <path d="M38 10 L30 18" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 10 L38 16 M38 10 L32 10" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      
      <path d="M10 38 L18 30" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 38 L10 32 M10 38 L16 38" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      
      <path d="M38 38 L30 30" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 38 L38 32 M38 38 L32 38" stroke="url(#iconGradient)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
