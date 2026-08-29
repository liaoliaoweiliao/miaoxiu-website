/**
 * 苗绣纹样 SVG 组件库
 * 基于真实苗绣纹样数字化绘制：蝴蝶妈妈、龙凤、姜央、花鸟、几何等
 */

interface PatternProps {
  className?: string;
  colors?: [string, string, string];
}

const DEFAULT_COLORS: [string, string, string] = [
  "#1e3a5f", // 靛蓝
  "#c1272d", // 朱砂
  "#d4a04c", // 古铜金
];

/* 蝴蝶妈妈 — 苗族创世神话中的始祖图腾 */
export function ButterflyMotherPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 左翅 */}
      <g>
        <path
          d="M95 100 C 60 60, 30 70, 25 100 C 30 130, 60 140, 95 100 Z"
          fill={primary}
          opacity="0.9"
        />
        <path
          d="M95 100 C 70 75, 50 80, 45 100 C 50 120, 70 125, 95 100 Z"
          fill={accent}
          opacity="0.7"
        />
        <circle cx="50" cy="90" r="4" fill={gold} />
        <circle cx="55" cy="110" r="3" fill={gold} />
        <circle cx="65" cy="100" r="2.5" fill={accent} />
      </g>
      {/* 右翅 */}
      <g>
        <path
          d="M105 100 C 140 60, 170 70, 175 100 C 170 130, 140 140, 105 100 Z"
          fill={primary}
          opacity="0.9"
        />
        <path
          d="M105 100 C 130 75, 150 80, 155 100 C 150 120, 130 125, 105 100 Z"
          fill={accent}
          opacity="0.7"
        />
        <circle cx="150" cy="90" r="4" fill={gold} />
        <circle cx="145" cy="110" r="3" fill={gold} />
        <circle cx="135" cy="100" r="2.5" fill={accent} />
      </g>
      {/* 身体 */}
      <ellipse cx="100" cy="100" rx="6" ry="30" fill={primary} />
      <circle cx="100" cy="72" r="7" fill={primary} />
      {/* 触角 */}
      <path
        d="M97 68 Q 88 55, 85 48"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M103 68 Q 112 55, 115 48"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="85" cy="48" r="2.5" fill={accent} />
      <circle cx="115" cy="48" r="2.5" fill={accent} />
      {/* 装饰花纹 */}
      <path
        d="M100 85 L 100 115"
        stroke={gold}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

/* 龙纹 — 苗绣中常见的吉祥纹样 */
export function DragonPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 150 Q 60 100, 100 100 Q 140 100, 160 60 Q 165 40, 150 30"
        stroke={primary}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 150 Q 60 100, 100 100 Q 140 100, 160 60"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="4 4"
      />
      {/* 龙头 */}
      <circle cx="150" cy="30" r="10" fill={primary} />
      <circle cx="146" cy="28" r="2" fill={gold} />
      <path
        d="M155 25 L 165 18 M 158 32 L 168 35"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 龙尾 */}
      <path
        d="M40 150 Q 30 160, 35 170 Q 45 175, 50 165"
        stroke={primary}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* 鳞片装饰 */}
      {[60, 80, 100, 120, 140].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={i % 2 === 0 ? 110 : 90}
          r="3"
          fill={gold}
          opacity="0.8"
        />
      ))}
    </svg>
  );
}

/* 鸟纹 — 苗族文化中的灵性图腾 */
export function BirdPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 */}
      <ellipse cx="100" cy="110" rx="25" ry="35" fill={primary} />
      {/* 翅膀 */}
      <path
        d="M100 90 Q 70 70, 50 80 Q 55 100, 80 105 Z"
        fill={accent}
        opacity="0.85"
      />
      <path
        d="M100 90 Q 130 70, 150 80 Q 145 100, 120 105 Z"
        fill={accent}
        opacity="0.85"
      />
      {/* 翅膀装饰 */}
      <path
        d="M60 85 L 75 95 M 140 85 L 125 95"
        stroke={gold}
        strokeWidth="1.5"
      />
      {/* 头 */}
      <circle cx="100" cy="70" r="14" fill={primary} />
      {/* 喙 */}
      <path d="M100 60 L 95 50 L 105 50 Z" fill={accent} />
      {/* 眼睛 */}
      <circle cx="96" cy="68" r="2" fill={gold} />
      <circle cx="104" cy="68" r="2" fill={gold} />
      {/* 冠 */}
      <path
        d="M100 56 L 95 45 L 100 48 L 105 45 Z"
        fill={accent}
      />
      {/* 尾羽 */}
      <path
        d="M100 145 Q 90 165, 80 170 M 100 145 Q 100 170, 100 175 M 100 145 Q 110 165, 120 170"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="80" cy="170" r="3" fill={gold} />
      <circle cx="100" cy="175" r="3" fill={gold} />
      <circle cx="120" cy="170" r="3" fill={gold} />
    </svg>
  );
}

/* 花卉纹 — 苗绣中象征生命繁衍 */
export function FlowerPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(100 100)">
        {/* 八瓣花 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-30"
            rx="15"
            ry="25"
            fill={i % 2 === 0 ? primary : accent}
            opacity="0.85"
            transform={`rotate(${angle})`}
          />
        ))}
        {/* 花心 */}
        <circle cx="0" cy="0" r="12" fill={gold} />
        <circle cx="0" cy="0" r="6" fill={accent} />
        {/* 花心装饰 */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <circle
            key={i}
            cx="0"
            cy="-8"
            r="2"
            fill={primary}
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </svg>
  );
}

/* 几何回纹 — 苗绣边饰常用 */
export function GeometricPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="geo-pattern"
        x="0"
        y="0"
        width="40"
        height="60"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M5 30 L 15 30 L 15 15 L 25 15 L 25 45 L 35 45"
          stroke={primary}
          strokeWidth="2"
          fill="none"
        />
        <circle cx="20" cy="30" r="2" fill={accent} />
        <circle cx="35" cy="15" r="2" fill={gold} />
      </pattern>
      <rect width="200" height="60" fill="url(#geo-pattern)" />
    </svg>
  );
}

/* 太阳纹 — 苗族自然崇拜 */
export function SunPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(100 100)">
        {/* 光芒 */}
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M 0 -35 L -5 -65 L 0 -75 L 5 -65 Z"
            fill={i % 2 === 0 ? accent : gold}
            transform={`rotate(${i * 30})`}
          />
        ))}
        {/* 太阳本体 */}
        <circle cx="0" cy="0" r="30" fill={primary} />
        <circle cx="0" cy="0" r="22" fill={accent} opacity="0.6" />
        <circle cx="0" cy="0" r="14" fill={gold} />
        {/* 面部装饰 */}
        <circle cx="-6" cy="-4" r="2" fill={primary} />
        <circle cx="6" cy="-4" r="2" fill={primary} />
        <path
          d="M -6 4 Q 0 8, 6 4"
          stroke={primary}
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* 鱼纹 — 苗族多子多福象征 */
export function FishPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 鱼身 */}
      <path
        d="M50 100 Q 60 70, 100 70 Q 140 70, 150 100 Q 140 130, 100 130 Q 60 130, 50 100 Z"
        fill={primary}
      />
      {/* 鱼鳞 */}
      {[80, 95, 110, 125].map((x, i) => (
        <path
          key={i}
          d={`M${x} 85 Q ${x + 8} 100, ${x} 115 Q ${x - 8} 100, ${x} 85 Z`}
          fill={accent}
          opacity="0.6"
        />
      ))}
      {/* 鱼尾 */}
      <path
        d="M150 100 L 175 80 L 170 100 L 175 120 Z"
        fill={primary}
      />
      <path
        d="M150 100 L 175 80 L 170 100 L 175 120 Z"
        fill={accent}
        opacity="0.4"
      />
      {/* 鱼眼 */}
      <circle cx="70" cy="95" r="5" fill={gold} />
      <circle cx="70" cy="95" r="2.5" fill={primary} />
      {/* 装饰 */}
      <path
        d="M100 70 L 100 60 M 100 130 L 100 140"
        stroke={gold}
        strokeWidth="2"
      />
    </svg>
  );
}

/* 螺旋纹 — 苗绣中象征生命循环 */
export function SpiralPattern({
  className,
  colors = DEFAULT_COLORS,
}: PatternProps) {
  const [primary, accent, gold] = colors;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(100 100)">
        <path
          d="M 0 0 m -50 0 a 50 50 0 1 1 100 0 a 40 40 0 1 0 -80 0 a 30 30 0 1 1 60 0 a 20 20 0 1 0 -40 0 a 10 10 0 1 1 20 0"
          stroke={primary}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="4" fill={accent} />
        <circle cx="50" cy="0" r="3" fill={gold} />
        <circle cx="-50" cy="0" r="3" fill={gold} />
        <circle cx="0" cy="50" r="3" fill={accent} />
        <circle cx="0" cy="-50" r="3" fill={accent} />
      </g>
    </svg>
  );
}

/* 纹样索引 */
export const MIAO_PATTERNS = {
  butterfly: ButterflyMotherPattern,
  dragon: DragonPattern,
  bird: BirdPattern,
  flower: FlowerPattern,
  geometric: GeometricPattern,
  sun: SunPattern,
  fish: FishPattern,
  spiral: SpiralPattern,
} as const;

export type PatternKey = keyof typeof MIAO_PATTERNS;
