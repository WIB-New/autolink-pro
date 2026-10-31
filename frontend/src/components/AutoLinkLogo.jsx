import React from 'react';
import logoPng from '../logo/logo.png';

/* ─── SVG logo (shield style — AutoLink Pro) ─── */
export function AutoLinkShield({ size = 200 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 440"
      width={size}
      height={size * 1.1}
      aria-label="AutoLink Pro"
    >
      <defs>
        <linearGradient id="alp-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#e0e0e0"/>
          <stop offset="25%"  stopColor="#b0b0b0"/>
          <stop offset="50%"  stopColor="#f4f4f4"/>
          <stop offset="75%"  stopColor="#909090"/>
          <stop offset="100%" stopColor="#d0d0d0"/>
        </linearGradient>
        <linearGradient id="alp-navy" x1="0%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%"   stopColor="#0e1d42"/>
          <stop offset="100%" stopColor="#060c22"/>
        </linearGradient>
        <linearGradient id="alp-banner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#091430"/>
          <stop offset="100%" stopColor="#04091a"/>
        </linearGradient>
        <linearGradient id="alp-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#60b3ff"/>
          <stop offset="100%" stopColor="#1a6ae0"/>
        </linearGradient>
        <linearGradient id="alp-car" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="#1a1a2e"/>
          <stop offset="50%"  stopColor="#0a0a18"/>
          <stop offset="100%" stopColor="#050510"/>
        </linearGradient>
        <linearGradient id="alp-car-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1e2840"/>
          <stop offset="100%" stopColor="#0a0a18"/>
        </linearGradient>
        <radialGradient id="alp-hl" cx="40%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#90c8ff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1060c0" stopOpacity="0"/>
        </radialGradient>
        <filter id="alp-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="alp-glow2">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="alp-clip">
          <path d="M200,415 C175,400 22,320 16,285 L10,85 Q10,10 88,8 L312,8 Q390,10 390,85 L384,285 C378,320 225,400 200,415 Z"/>
        </clipPath>
      </defs>

      {/* ── Outer shield (silver border) ── */}
      <path
        d="M200,428 C172,412 12,328 6,290 L2,82 Q2,2 84,2 L316,2 Q398,2 398,82 L394,290 C388,328 228,412 200,428 Z"
        fill="url(#alp-silver)"
      />
      {/* ── Inner shield (navy) ── */}
      <path
        d="M200,415 C175,400 22,320 16,285 L10,85 Q10,10 88,8 L312,8 Q390,10 390,85 L384,285 C378,320 225,400 200,415 Z"
        fill="url(#alp-navy)"
      />

      {/* ── Content clipped inside shield ── */}
      <g clipPath="url(#alp-clip)">

        {/* Blue arc accents at top */}
        <path d="M 75,28 Q 200,8 325,28" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.65" filter="url(#alp-glow)"/>
        <path d="M 90,38 Q 200,20 310,38" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.45"/>

        {/* Speed / motion lines (left side) */}
        {[200,213,226,239].map((y,i) => (
          <line key={i} x1={10} y1={y} x2={110-i*5} y2={y} stroke="#1e3a8a" strokeWidth={1.5-i*0.2} opacity={0.4-i*0.05}/>
        ))}

        {/* ── ALP Monogram ── */}
        {/* "A" with italic + speed stripe */}
        <text x="100" y="118" fontFamily="'Arial Black','Arial',sans-serif" fontSize="78" fontWeight="900" fontStyle="italic"
          fill="url(#alp-blue)" filter="url(#alp-glow2)">A</text>
        {/* Diagonal stripe cutting through A */}
        <rect x="100" y="82" width="54" height="7" rx="3.5" fill="#060c22" transform="rotate(-18,127,85)"/>
        {/* LP */}
        <text x="175" y="118" fontFamily="'Arial Black','Arial',sans-serif" fontSize="64" fontWeight="900" fontStyle="italic"
          fill="#8ab4d8" opacity="0.88">LP</text>

        {/* ══════ CAR SILHOUETTE ══════ */}

        {/* Main car body */}
        <path d="
          M 52,298
          Q 45,282 50,268
          Q 58,252 72,244
          L 85,212
          Q 92,190 108,178
          L 140,162
          L 268,160
          Q 298,160 318,178
          L 345,212
          L 356,248
          Q 362,262 360,278
          Q 358,292 350,298
          Z
        " fill="url(#alp-car)"/>

        {/* Car roof */}
        <path d="
          M 145,162
          L 155,140
          Q 170,122 194,120
          L 260,120
          Q 282,122 296,140
          L 310,162
          Z
        " fill="url(#alp-car-top)"/>

        {/* Windshield */}
        <path d="
          M 148,162
          L 158,141
          Q 172,124 194,122
          L 260,122
          Q 280,124 293,141
          L 305,162
          Z
        " fill="#1a304a" opacity="0.85"/>
        {/* Windshield reflection */}
        <path d="M 160,162 L 168,143 Q 178,128 196,125 L 230,124 L 222,142 Q 212,158 190,162 Z"
          fill="white" opacity="0.06"/>

        {/* Rear window */}
        <path d="M 145,162 L 148,148 Q 153,135 162,130 L 175,128 L 168,158 Z"
          fill="#1a304a" opacity="0.75"/>

        {/* Door line */}
        <line x1="216" y1="162" x2="220" y2="298" stroke="#1a2a40" strokeWidth="2"/>

        {/* Front hood crease line */}
        <path d="M 305,162 L 338,210 L 348,244" stroke="#1a2a3a" strokeWidth="1.5" fill="none" opacity="0.6"/>

        {/* Hood highlight */}
        <path d="M 280,162 Q 325,175 345,208 L 338,210 Q 316,178 272,166 Z"
          fill="white" opacity="0.05"/>

        {/* Body highlight strip */}
        <path d="M 150,175 Q 220,168 310,172 L 312,178 Q 218,175 150,182 Z"
          fill="white" opacity="0.07"/>

        {/* ── Rear wheel ── */}
        <circle cx="116" cy="285" r="42" fill="#0a0a14"/>
        <circle cx="116" cy="285" r="35" fill="#111120"/>
        <circle cx="116" cy="285" r="27" fill="#0d0d1c"/>
        {/* Spokes */}
        {[0,45,90,135].map((a,i)=>(
          <line key={i}
            x1={116 + Math.cos(a*Math.PI/180)*13} y1={285 + Math.sin(a*Math.PI/180)*13}
            x2={116 + Math.cos(a*Math.PI/180)*33} y2={285 + Math.sin(a*Math.PI/180)*33}
            stroke="#404055" strokeWidth="4"/>
        ))}
        {[0,45,90,135].map((a,i)=>(
          <line key={i+4}
            x1={116 + Math.cos((a+22.5)*Math.PI/180)*14} y1={285 + Math.sin((a+22.5)*Math.PI/180)*14}
            x2={116 + Math.cos((a+22.5)*Math.PI/180)*32} y2={285 + Math.sin((a+22.5)*Math.PI/180)*32}
            stroke="#353548" strokeWidth="3"/>
        ))}
        <circle cx="116" cy="285" r="10" fill="#2a2a3a"/>
        <circle cx="116" cy="285" r="5"  fill="#4a4a5a"/>

        {/* ── Front wheel ── */}
        <circle cx="298" cy="285" r="42" fill="#0a0a14"/>
        <circle cx="298" cy="285" r="35" fill="#111120"/>
        <circle cx="298" cy="285" r="27" fill="#0d0d1c"/>
        {[0,45,90,135].map((a,i)=>(
          <line key={i}
            x1={298 + Math.cos(a*Math.PI/180)*13} y1={285 + Math.sin(a*Math.PI/180)*13}
            x2={298 + Math.cos(a*Math.PI/180)*33} y2={285 + Math.sin(a*Math.PI/180)*33}
            stroke="#404055" strokeWidth="4"/>
        ))}
        {[0,45,90,135].map((a,i)=>(
          <line key={i+4}
            x1={298 + Math.cos((a+22.5)*Math.PI/180)*14} y1={285 + Math.sin((a+22.5)*Math.PI/180)*14}
            x2={298 + Math.cos((a+22.5)*Math.PI/180)*32} y2={285 + Math.sin((a+22.5)*Math.PI/180)*32}
            stroke="#353548" strokeWidth="3"/>
        ))}
        <circle cx="298" cy="285" r="10" fill="#2a2a3a"/>
        <circle cx="298" cy="285" r="5"  fill="#4a4a5a"/>

        {/* Wheel well arches (body colour overlay) */}
        <path d="M 68,298 Q 68,243 116,243 Q 164,243 164,298 Z" fill="url(#alp-car)" opacity="0.7"/>
        <path d="M 252,298 Q 252,243 298,243 Q 344,243 346,298 Z" fill="url(#alp-car)" opacity="0.7"/>

        {/* ── Headlight (front) ── */}
        <ellipse cx="356" cy="248" rx="14" ry="10" fill="#0a2a50"/>
        <ellipse cx="356" cy="248" rx="9"  ry="6"  fill="url(#alp-hl)" filter="url(#alp-glow)"/>
        <line x1="342" y1="246" x2="370" y2="250" stroke="#70c0ff" strokeWidth="1.5" opacity="0.7" filter="url(#alp-glow)"/>

        {/* Taillight (rear) */}
        <rect x="48" y="258" width="18" height="7" rx="3" fill="#3a0a0a"/>
        <rect x="50" y="259" width="14" height="5" rx="2" fill="#ff3030" opacity="0.6"/>

        {/* Grille */}
        <path d="M 347,238 L 358,248 L 358,268 L 344,272 L 340,258 Z" fill="#08080f"/>
        {[0,1,2,3].map(i=>(
          <line key={i} x1={344+i*4} y1={240+i*2} x2={344+i*4} y2={270} stroke="#1a2a3a" strokeWidth="1.5"/>
        ))}

        {/* Front bumper lower lip */}
        <path d="M 52,298 Q 48,308 56,312 L 350,312 Q 358,308 350,298 Z"
          fill="#0a0a18" opacity="0.8"/>

        {/* Car body lower reflection on ground */}
        <ellipse cx="200" cy="315" rx="145" ry="8" fill="#1a50a0" opacity="0.12"/>

        {/* ══════ BOTTOM BANNER ══════ */}
        <path d="M 16,285 L 384,285 L 384,420 Q 200,435 16,420 Z" fill="url(#alp-banner)"/>

        {/* Blue separator line */}
        <line x1="16" y1="285" x2="384" y2="285" stroke="#3b82f6" strokeWidth="2" opacity="0.8"/>

        {/* AUTO LINK PRO */}
        <text x="200" y="330" fontFamily="'Arial Black','Arial',sans-serif" fontSize="38" fontWeight="900"
          textAnchor="middle" letterSpacing="2" fill="white">
          AUTO <tspan fill="url(#alp-blue)">LINK</tspan> PRO
        </text>

        {/* Thin divider */}
        <line x1="75" y1="340" x2="325" y2="340" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5"/>

        {/* Tagline */}
        <text x="200" y="358" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="600"
          textAnchor="middle" letterSpacing="2.5" fill="#c0cde0">
          LOCATION DES VOITURES
        </text>
        <text x="200" y="374" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="600"
          textAnchor="middle" letterSpacing="2.5" fill="#3b82f6">
          PAR EXCELLENCE
        </text>

        {/* Stars */}
        {[-28,-14,0,14,28].map((dx,i) => (
          <text key={i} x={200+dx} y="396" fontFamily="Arial" fontSize={i===2?16:13}
            textAnchor="middle" fill="#3b82f6" opacity={i===2?1:0.8}>★</text>
        ))}
      </g>
    </svg>
  );
}

/* ── Sizes (hauteur du logo) ── */
const H = { xs: 24, sm: 44, md: 84, lg: 84, xl: 128, '2xl': 160 };

export function AutoLinkIcon({ size = 52 }) {
  return <img src={logoPng} alt="AutoLink Pro" style={{ height: size, width: 'auto' }} className="object-contain" />;
}

/* Logo officiel AutoLink (PNG) — affiché tel quel, sans modification. */
export default function AutoLinkLogo({ size = 'md', className = '' }) {
  const h = H[size] || H.md;
  return (
    <img src={logoPng} alt="AutoLink Pro"
      style={{ height: h, width: 'auto' }}
      className={`object-contain shrink-0 ${className} rounded-none`} />
  );
}
