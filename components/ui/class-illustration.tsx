/* 반 친구들 단체 사진 일러스트 (코드로 그린 그림, SVG).
   - 굵은 검정 선 + 단순한 면 색의 평평한 일러스트
   - 색은 모두 app/globals.css 의 디자인 토큰을 따릅니다. (--foreground = 선, --skin = 얼굴 ...)
   - 친구를 더 넣거나 빼려면 아래 BACK_ROW / MIDDLE_ROW / FRONT_ROW 목록을 고치면 됩니다. */

const LINE = "var(--foreground)";
const SW = 2.5; // 선 굵기

type Hair = "short" | "long" | "bob" | "spiky";
type Friend = {
  x: number;
  hair: Hair;
  hairColor?: "dark" | "blue";
  glasses?: boolean;
  bouquet?: boolean;
  vSign?: boolean;
};

const BACK_ROW: Friend[] = [
  { x: 62, hair: "long" },
  { x: 106, hair: "short", glasses: true },
  { x: 150, hair: "bob", hairColor: "blue" },
  { x: 200, hair: "spiky", bouquet: true },
  { x: 250, hair: "long", hairColor: "blue" },
  { x: 294, hair: "short" },
  { x: 338, hair: "bob" },
];

const MIDDLE_ROW: Friend[] = [
  { x: 84, hair: "bob", bouquet: true },
  { x: 132, hair: "short", hairColor: "blue", vSign: true },
  { x: 180, hair: "long", glasses: true },
  { x: 228, hair: "spiky" },
  { x: 276, hair: "long", bouquet: true },
  { x: 322, hair: "short", glasses: true },
];

const FRONT_ROW: Friend[] = [
  { x: 92, hair: "spiky", hairColor: "blue" },
  { x: 146, hair: "short", vSign: true },
  { x: 200, hair: "bob", glasses: true, hairColor: "blue" },
  { x: 254, hair: "short" },
  { x: 308, hair: "long", vSign: true },
];

function HairShape({ hair, color }: { hair: Hair; color: string }) {
  const common = { fill: color, stroke: LINE, strokeWidth: SW, strokeLinejoin: "round" as const };
  switch (hair) {
    case "long":
      return <path d="M-17 2 Q-19 -20 0 -20 Q19 -20 17 2 L18 22 L10 22 L11 -4 Q0 -11 -11 -4 L-10 22 L-18 22 Z" {...common} />;
    case "bob":
      return <path d="M-18 8 Q-20 -20 0 -20 Q20 -20 18 8 L11 8 L11 -6 Q0 -10 -11 -6 L-11 8 Z" {...common} />;
    case "spiky":
      return <path d="M-16 -2 L-17 -14 L-10 -12 L-8 -21 L-1 -15 L4 -22 L8 -14 L15 -17 L16 -2 Q6 -10 -4 -9 Q-11 -8 -16 -2 Z" {...common} />;
    default:
      return <path d="M-16 -1 Q-17 -20 0 -20 Q17 -20 16 -1 Q9 -11 -2 -9 Q-10 -9 -16 -1 Z" {...common} />;
  }
}

function Bouquet() {
  return (
    <g transform="translate(12 30)">
      <path d="M-6 0 L6 0 L0 18 Z" fill="var(--yellow)" stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={-5} cy={-4} r={4.5} fill="var(--signal-red)" stroke={LINE} strokeWidth={2} />
      <circle cx={5} cy={-4} r={4.5} fill="var(--signal-red)" stroke={LINE} strokeWidth={2} />
      <circle cx={0} cy={-9} r={4.5} fill="var(--card)" stroke={LINE} strokeWidth={2} />
    </g>
  );
}

function VSign() {
  return (
    <g transform="translate(-24 18)" stroke={LINE} strokeWidth={SW} strokeLinecap="round">
      <line x1={0} y1={0} x2={-3} y2={-12} />
      <line x1={0} y1={0} x2={4} y2={-11} />
      <circle cx={0} cy={2} r={4} fill="var(--skin)" />
    </g>
  );
}

/** 친구 한 명. (0,0) = 얼굴 가운데 */
function Friend({ friend, y, scale = 1, seated }: { friend: Friend; y: number; scale?: number; seated?: boolean }) {
  const hairColor = friend.hairColor === "blue" ? "var(--secondary)" : "var(--foreground)";
  return (
    <g transform={`translate(${friend.x} ${y}) scale(${scale})`}>
      {/* 다리 (앉은 줄만) */}
      {seated ? (
        <g fill="var(--muted-foreground)" stroke={LINE} strokeWidth={SW} strokeLinejoin="round">
          <path d="M-18 52 H-2 V72 H-20 Z" />
          <path d="M2 52 H18 V72 H0 Z" />
          <rect x={-22} y={70} width={14} height={6} rx={3} fill="var(--card)" />
          <rect x={4} y={70} width={14} height={6} rx={3} fill="var(--card)" />
        </g>
      ) : null}
      {/* 몸 (흰 교복) */}
      <path
        d="M-22 56 V30 Q-22 16 -8 16 H8 Q22 16 22 30 V56 Z"
        fill="var(--card)"
        stroke={LINE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M-7 16 L0 26 L7 16" fill="none" stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={8} y={30} width={7} height={5} rx={1} fill="var(--signal-red)" stroke={LINE} strokeWidth={1.5} />
      {/* 얼굴 */}
      <circle r={16} fill="var(--skin)" stroke={LINE} strokeWidth={SW} />
      <HairShape hair={friend.hair} color={hairColor} />
      <circle cx={-6} cy={3} r={1.8} fill={LINE} />
      <circle cx={6} cy={3} r={1.8} fill={LINE} />
      {friend.glasses ? (
        <g fill="none" stroke={LINE} strokeWidth={2}>
          <circle cx={-6} cy={3} r={5} />
          <circle cx={6} cy={3} r={5} />
          <line x1={-1} y1={3} x2={1} y2={3} />
        </g>
      ) : null}
      <circle cx={-10} cy={9} r={2.5} fill="var(--signal-red)" opacity={0.35} />
      <circle cx={10} cy={9} r={2.5} fill="var(--signal-red)" opacity={0.35} />
      <path d="M-4 9 Q0 12.5 4 9" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      {friend.bouquet ? <Bouquet /> : null}
      {friend.vSign ? <VSign /> : null}
    </g>
  );
}

/** label 이 없으면 꾸밈용(배경)으로 보고 화면 읽기 프로그램에서 숨김.
    cover = 상자를 빈틈없이 채우기 (배경으로 쓸 때, 넘치는 부분은 잘림) */
export function ClassIllustration({
  label,
  cover,
  className,
}: {
  label?: string;
  cover?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio={cover ? "xMidYMid slice" : undefined}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={className}
    >
      {/* 벽과 바닥 */}
      <rect width={400} height={300} fill="var(--muted)" />
      <rect y={238} width={400} height={62} fill="var(--window-bar)" />
      <line x1={0} y1={238} x2={400} y2={238} stroke={LINE} strokeWidth={SW} />
      {/* 천장 조명 */}
      <rect x={110} y={10} width={60} height={6} rx={3} fill="var(--card)" stroke={LINE} strokeWidth={2} />
      <rect x={240} y={10} width={60} height={6} rx={3} fill="var(--card)" stroke={LINE} strokeWidth={2} />
      {/* 창문 */}
      <g stroke={LINE} strokeWidth={SW}>
        <rect x={8} y={36} width={30} height={120} fill="var(--card)" />
        <line x1={8} y1={96} x2={38} y2={96} />
      </g>
      {/* 칠판 + 게시물 */}
      <rect x={70} y={34} width={270} height={92} rx={4} fill="var(--secondary)" stroke={LINE} strokeWidth={SW} />
      <g fill="var(--card)" stroke={LINE} strokeWidth={1.5}>
        <rect x={84} y={42} width={30} height={10} rx={2} />
        <rect x={290} y={42} width={36} height={10} rx={2} />
        <rect x={300} y={58} width={14} height={18} />
        <rect x={318} y={58} width={14} height={18} />
        <rect x={300} y={80} width={32} height={14} />
      </g>
      <line x1={70} y1={130} x2={340} y2={130} stroke={LINE} strokeWidth={SW} />

      {BACK_ROW.map((f) => (
        <Friend key={`b${f.x}`} friend={f} y={92} scale={0.82} />
      ))}
      {MIDDLE_ROW.map((f) => (
        <Friend key={`m${f.x}`} friend={f} y={140} scale={0.92} />
      ))}

      {/* 책상 */}
      <g stroke={LINE} strokeWidth={SW}>
        <line x1={52} y1={196} x2={52} y2={238} />
        <line x1={348} y1={196} x2={348} y2={238} />
        <rect x={34} y={186} width={332} height={12} rx={3} fill="var(--orange)" />
      </g>

      {FRONT_ROW.map((f) => (
        <Friend key={`f${f.x}`} friend={f} y={190} seated />
      ))}
    </svg>
  );
}
