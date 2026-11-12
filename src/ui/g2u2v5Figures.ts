// 중2 Ⅱ v5의 정리 카드 미니 그림(64×64, 평면). 지금 단원의 geoMiniArt에 없는 것만 여기에 둔다.
const NS = `xmlns="http://www.w3.org/2000/svg"`;

const MINI: Record<string, string> = {
  // 지진파가 지구 속을 지나는 쐐기꼴 단면
  wave: `<path d="M32 58 L8 14 A50 50 0 0 1 56 14 Z" fill="#F29A66" stroke="#C4602E" stroke-width="1.6"/>
    <path d="M32 58 L21 38 A23 23 0 0 1 43 38 Z" fill="#FFC85E" stroke="#D99A1E" stroke-width="1.4"/>
    <path d="M12 16 Q32 44 52 16 M16 13 Q32 30 48 13" stroke="#2F8EE0" stroke-width="2.2"/>`,
  // 돋보기 속의 알갱이 셋
  grain: `<circle cx="27" cy="27" r="19" fill="#F3ECE6" stroke="#6B5A52" stroke-width="2.4"/>
    <path d="M17 20 l8 -4 l6 6 l-5 8 l-9 -2 Z" fill="#F2B6A0" stroke="#6B5A52" stroke-width="1.2"/>
    <path d="M30 28 l8 -3 l4 7 l-6 6 l-7 -3 Z" fill="#FFFFFF" stroke="#6B5A52" stroke-width="1.2"/>
    <path d="M18 33 l6 -1 l3 6 l-6 3 Z" fill="#3A3A3F"/><path d="M33 16 l5 2 l-2 5 l-5 -2 Z" fill="#3A3A3F"/>
    <path d="M41 41 L56 56" stroke="#6B5A52" stroke-width="5"/>`,
  // 눌린 방향과 줄무늬
  press: `<rect x="14" y="20" width="36" height="24" rx="4" fill="#D9D2C8" stroke="#7A6F62" stroke-width="1.6"/>
    <path d="M18 27 h28 M18 32 h28 M18 37 h28" stroke="#4A4540" stroke-width="2.2"/>
    <path d="M32 4 v10 M28 10 l4 5 l4 -5 M32 60 v-10 M28 54 l4 -5 l4 5" stroke="#E0503A" stroke-width="2.4"/>`,
  // 틈에 스며든 물이 얼어 바위가 갈라진다
  frost: `<path d="M8 54 L12 22 L30 12 L28 54 Z" fill="#B9AFA4" stroke="#6B6157" stroke-width="1.6"/>
    <path d="M36 54 L34 12 L52 22 L56 54 Z" fill="#B9AFA4" stroke="#6B6157" stroke-width="1.6"/>
    <path d="M30 14 L28 54 L36 54 L34 14 Z" fill="#DDF1FF" stroke="#6FB3E6" stroke-width="1.4"/>
    <path d="M24 34 h-8 M19 31 l-3 3 l3 3 M40 34 h8 M45 31 l3 3 l-3 3" stroke="#2F8EE0" stroke-width="2"/>`,
  // 맞춰 붙인 두 대륙 조각
  fit: `<path d="M10 14 Q26 8 30 18 Q36 26 30 34 Q34 44 26 54 Q14 56 12 42 Q6 28 10 14 Z" fill="#8CC47A" stroke="#4E7A38" stroke-width="1.6"/>
    <path d="M32 18 Q38 26 32 34 Q36 44 30 52 Q44 58 52 44 Q58 28 50 14 Q40 8 32 18 Z" fill="#E8C47A" stroke="#8E6A24" stroke-width="1.6"/>
    <path d="M18 30 h28" stroke="#E0503A" stroke-width="2.4" stroke-dasharray="4 3"/>`,
  // 판: 지각과 맨틀의 윗부분
  slab: `<rect x="6" y="18" width="52" height="10" fill="#C9A27A" stroke="#7A5C3E" stroke-width="1.4"/>
    <rect x="6" y="28" width="52" height="12" fill="#E8915A" stroke="#B5622E" stroke-width="1.4"/>
    <rect x="6" y="40" width="52" height="16" fill="#F6C9A8"/>
    <path d="M32 14 v30" stroke="#2B2B31" stroke-width="2.4" stroke-dasharray="4 3"/>
    <path d="M14 10 h10 M20 6 l5 4 l-5 4 M50 10 h-10 M44 6 l-5 4 l5 4" stroke="#2F8EE0" stroke-width="2"/>`,
};

export function v5Mini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
