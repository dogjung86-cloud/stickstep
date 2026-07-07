// mapDecor — 게임 지도 "단원 특색" 장식. 트레일·메달리온 문법은 그대로 두고
// 장식 소품만 단원 이야기로 바꾼다(I 정글 원정 · II 생물 · III 열 · IV 상태 · V 힘 · VI 기체 · VII 행성).
// 파운드리 재질 문법: 근-동조 그라데이션 + 키라이트 + 접촉 그림자 + 최암색 외곽선.
// u2 생물 아이콘은 art.generated의 ART_BIO를 재사용한다.

import { ART_BIO, ART_DECOR } from "./art.generated";

const S = (inner: string, defs = ""): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;
const shadow = (cx = 32, cy = 56, rx = 18, o = 0.16): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4" fill="#2A3A5E" opacity="${o}"/>`;

const MAP_DECOR: Record<string, string> = {
  // ── I. 탐구 — 정글 원정 ──────────────────────────────────
  stones: S(
    `${shadow(32, 55, 22, 0.12)}
    <ellipse cx="17" cy="48" rx="11" ry="6" fill="url(#st-a)"/><ellipse cx="17" cy="46.6" rx="11" ry="5" fill="url(#st-b)"/>
    <ellipse cx="38" cy="40" rx="12" ry="6.6" fill="url(#st-a)"/><ellipse cx="38" cy="38.4" rx="12" ry="5.5" fill="url(#st-b)"/>
    <ellipse cx="52" cy="28" rx="9" ry="5" fill="url(#st-a)"/><ellipse cx="52" cy="26.8" rx="9" ry="4.2" fill="url(#st-b)"/>
    <ellipse cx="34" cy="37" rx="4" ry="1.6" fill="#fff" opacity=".4"/>`,
    `<linearGradient id="st-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa0b0"/><stop offset="1" stop-color="#5e6c78"/></linearGradient>
    <linearGradient id="st-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5dde6"/><stop offset="1" stop-color="#9dabb8"/></linearGradient>`,
  ),
  palm: S(
    `${shadow(30, 57, 16, 0.14)}
    <path d="M30 56c-1-12-2-24 3-34" stroke="url(#pa-t)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M33 22c-9-6-18-5-24 1 8-1 16 1 21 5z" fill="url(#pa-l)"/>
    <path d="M33 22c9-6 19-4 24 3-8-2-16 0-21 4z" fill="url(#pa-l2)"/>
    <path d="M33 22c-2-9 2-16 9-19-4 7-4 13-2 18z" fill="url(#pa-l)"/>
    <path d="M33 22c-8 1-14 7-15 14 5-6 10-8 16-8z" fill="url(#pa-l2)"/>
    <circle cx="30" cy="26" r="2.6" fill="#B4763B"/><circle cx="35" cy="27" r="2.4" fill="#96612F"/>`,
    `<linearGradient id="pa-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a97a4c"/><stop offset="1" stop-color="#7c552e"/></linearGradient>
    <linearGradient id="pa-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc98e"/><stop offset="1" stop-color="#3f9a5c"/></linearGradient>
    <linearGradient id="pa-l2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb072"/><stop offset="1" stop-color="#2d7a44"/></linearGradient>`,
  ),
  vine: S(
    `<path d="M8 6q12 4 10 18M56 4q-8 6-4 18M32 2q2 8-2 14" stroke="#3f9a5c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="18" cy="28" rx="9" ry="12" fill="url(#vi-a)" transform="rotate(-18 18 28)"/>
    <ellipse cx="46" cy="30" rx="10" ry="14" fill="url(#vi-b)" transform="rotate(14 46 30)"/>
    <ellipse cx="31" cy="22" rx="7" ry="10" fill="url(#vi-a)" transform="rotate(4 31 22)"/>
    <path d="M18 18v18M46 18v22" stroke="#2d7a44" stroke-width="1.2" opacity=".55"/>
    <ellipse cx="15" cy="22" rx="3" ry="4" fill="#c9f0cf" opacity=".5"/>`,
    `<linearGradient id="vi-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86cc78"/><stop offset="1" stop-color="#3a8a42"/></linearGradient>
    <linearGradient id="vi-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fbd7f"/><stop offset="1" stop-color="#2d7a44"/></linearGradient>`,
  ),
  // ── III. 열 ──────────────────────────────────────────────
  campfire: S(
    `${shadow(32, 56, 18, 0.15)}
    <path d="M14 52l14-6M50 52l-14-6M18 46l28 8M46 46l-28 8" stroke="url(#cf-log)" stroke-width="6" stroke-linecap="round"/>
    <path d="M32 14c7 8 12 13 12 21a12 12 0 0 1-24 0c0-8 5-13 12-21z" fill="url(#cf-f1)"/>
    <path d="M32 24c4 5 7 8 7 13a7 7 0 0 1-14 0c0-5 3-8 7-13z" fill="url(#cf-f2)"/>
    <circle cx="32" cy="38" r="3" fill="#FFF6D8"/>`,
    `<linearGradient id="cf-log" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c6b40"/><stop offset="1" stop-color="#6d4526"/></linearGradient>
    <linearGradient id="cf-f1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9E3D"/><stop offset="1" stop-color="#F25C2A"/></linearGradient>
    <linearGradient id="cf-f2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#FFB03A"/></linearGradient>`,
  ),
  steamMug: S(
    `${shadow(32, 56, 15, 0.14)}
    <path d="M20 46q-3-4 1-7t1-6M30 44q-3-4 1-7t1-6M40 46q-3-4 1-7t1-6" stroke="#B9C8DC" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M18 46h26v3a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8z" fill="url(#mu-b)"/>
    <path d="M44 47h4a5 5 0 0 1 0 10h-4v-3h3.4a2.2 2.2 0 0 0 0-4.4H44z" fill="url(#mu-b)"/>
    <ellipse cx="31" cy="46.6" rx="13" ry="3" fill="#8a4a2c"/>
    <path d="M20 49q1 4 4 6" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>
    <path d="M18 46h26" stroke="#B05E3C" stroke-width="1.2" opacity=".6"/>`,
    `<linearGradient id="mu-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A97E"/><stop offset="1" stop-color="#C96B3E"/></linearGradient>`,
  ),
  kettleDeco: S(
    `${shadow(32, 57, 17, 0.14)}
    <path d="M44 22q4-5 9-4-3 4-3 8z" fill="#B9C8DC" opacity=".85"/>
    <path d="M18 34a14 12 0 0 1 28 0l-2 14a6 6 0 0 1-6 5H26a6 6 0 0 1-6-5z" fill="url(#ke-b)"/>
    <path d="M18 36l-6-6q3-4 8-2" fill="url(#ke-b)"/>
    <path d="M26 20q6-4 12 0" stroke="#5A6C82" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="26" cy="30" rx="4" ry="6" fill="#fff" opacity=".35"/>
    <path d="M18 34a14 12 0 0 1 28 0" stroke="#41506C" stroke-width="1.3" fill="none" opacity=".6"/>`,
    `<linearGradient id="ke-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8D4E4"/><stop offset=".5" stop-color="#93A6BE"/><stop offset="1" stop-color="#5F7290"/></linearGradient>`,
  ),
  sunDeco: S(
    `<g stroke="#FFC24E" stroke-width="3" stroke-linecap="round" opacity=".9">
      <path d="M32 6v7M32 51v7M6 32h7M51 32h7M13 13l5 5M46 46l5 5M51 13l-5 5M18 46l-5 5"/>
    </g>
    <circle cx="32" cy="32" r="14" fill="url(#su-c)"/>
    <circle cx="32" cy="32" r="14" stroke="#E08414" stroke-width="1.4" fill="none"/>
    <circle cx="27" cy="27" r="4" fill="#FFF6D8" opacity=".7"/>`,
    `<radialGradient id="su-c" cx=".4" cy=".38" r=".7"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F5A028"/></radialGradient>`,
  ),
  // ── IV. 물질의 상태 ──────────────────────────────────────
  iceDeco: S(
    `${shadow(32, 55, 15, 0.12)}
    <g transform="rotate(8 32 34)">
      <path d="M20 26l24-6 4 18-22 10-8-8z" fill="url(#ic-a)"/>
      <path d="M20 26l24-6-2 14-16 6z" fill="url(#ic-b)" opacity=".8"/>
      <path d="M20 26l24-6 4 18-22 10-8-8z" stroke="#5E8CC8" stroke-width="1.4" fill="none"/>
      <path d="M24 28l6 5M38 24l4 8" stroke="#fff" stroke-width="1.6" opacity=".7"/>
    </g>`,
    `<linearGradient id="ic-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEFFF"/><stop offset="1" stop-color="#8FBCEC"/></linearGradient>
    <linearGradient id="ic-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#BBDCF8"/></linearGradient>`,
  ),
  dropDeco: S(
    `${shadow(32, 56, 13, 0.12)}
    <path d="M32 10c8 11 14 18 14 26a14 14 0 0 1-28 0c0-8 6-15 14-26z" fill="url(#dr-a)"/>
    <path d="M32 10c8 11 14 18 14 26a14 14 0 0 1-28 0c0-8 6-15 14-26z" stroke="#2A6BC8" stroke-width="1.4" fill="none"/>
    <path d="M25 34q-1 7 4 11" stroke="#fff" stroke-width="2.4" fill="none" opacity=".65" stroke-linecap="round"/>`,
    `<linearGradient id="dr-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD0FF"/><stop offset=".6" stop-color="#4D95E8"/><stop offset="1" stop-color="#2E6FD4"/></linearGradient>`,
  ),
  vaporDeco: S(
    `<g opacity=".95">
      <circle cx="22" cy="40" r="9" fill="url(#va-a)"/>
      <circle cx="36" cy="36" r="12" fill="url(#va-a)"/>
      <circle cx="46" cy="42" r="8" fill="url(#va-a)"/>
      <circle cx="30" cy="22" r="7" fill="url(#va-b)"/>
      <circle cx="42" cy="16" r="5" fill="url(#va-b)"/>
      <circle cx="50" cy="10" r="3.4" fill="url(#va-b)"/>
    </g>
    <ellipse cx="32" cy="34" rx="8" ry="4" fill="#fff" opacity=".5"/>`,
    `<radialGradient id="va-a" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#F4F9FF"/><stop offset="1" stop-color="#BCD2EC"/></radialGradient>
    <radialGradient id="va-b" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CFDFF2"/></radialGradient>`,
  ),
  // ── V. 힘 ────────────────────────────────────────────────
  appleTree: S(
    `${shadow(30, 57, 18, 0.15)}
    <path d="M28 40h7l1.4 16h-9.4z" fill="url(#at-t)"/>
    <ellipse cx="31" cy="24" rx="18" ry="15" fill="url(#at-c)"/>
    <ellipse cx="31" cy="24" rx="18" ry="15" stroke="#357f3d" stroke-width="0.8" opacity=".5" fill="none"/>
    <ellipse cx="25" cy="17" rx="7" ry="5" fill="#eafbe0" opacity=".6"/>
    <circle cx="24" cy="26" r="3" fill="url(#at-ap)"/><circle cx="38" cy="20" r="3" fill="url(#at-ap)"/>
    <circle cx="52" cy="42" r="3.4" fill="url(#at-ap)"/>
    <path d="M52 30v6M52 50v4" stroke="#E0506E" stroke-width="1.2" opacity=".55" stroke-dasharray="2 3"/>`,
    `<radialGradient id="at-c" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="#8ed17a"/><stop offset=".6" stop-color="#5bb45a"/><stop offset="1" stop-color="#3d8f45"/></radialGradient>
    <linearGradient id="at-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a9764a"/><stop offset="1" stop-color="#6d4526"/></linearGradient>
    <radialGradient id="at-ap" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff9db0"/><stop offset="1" stop-color="#e0506e"/></radialGradient>`,
  ),
  springDeco: S(
    `${shadow(32, 57, 15, 0.14)}
    <circle cx="32" cy="16" r="8" fill="url(#sp-ball)"/>
    <circle cx="29" cy="13" r="2.6" fill="#fff" opacity=".7"/>
    <path d="M22 26q10 5 20 0M22 33q10 5 20 0M22 40q10 5 20 0M22 47q10 5 20 0" stroke="url(#sp-c)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M20 54h24" stroke="#5A6C82" stroke-width="4" stroke-linecap="round"/>`,
    `<linearGradient id="sp-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C8D4E4"/><stop offset=".5" stop-color="#8FA2BC"/><stop offset="1" stop-color="#5F7290"/></linearGradient>
    <radialGradient id="sp-ball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFD98F"/><stop offset="1" stop-color="#F0A422"/></radialGradient>`,
  ),
  crateDeco: S(
    `${shadow(34, 55, 17, 0.15)}
    <path d="M8 50q6-2 12-1M6 44q5-1 9 0" stroke="#8A97AC" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    <rect x="22" y="26" width="26" height="26" rx="3" fill="url(#cr-b)"/>
    <rect x="22" y="26" width="26" height="26" rx="3" stroke="#7c552e" stroke-width="1.4" fill="none"/>
    <path d="M22 34h26M34 26v26" stroke="#96632f" stroke-width="1.6" opacity=".7"/>
    <path d="M25 29l6 4" stroke="#e8c9a0" stroke-width="2" opacity=".6" stroke-linecap="round"/>`,
    `<linearGradient id="cr-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9AF7C"/><stop offset="1" stop-color="#A9764A"/></linearGradient>`,
  ),
  floatDeco: S(
    `<path d="M4 50q8-4 14 0t14 0 14 0 14 0v8H4z" fill="url(#fl-w)" opacity=".9"/>
    <g transform="rotate(-10 32 36)">
      <circle cx="32" cy="36" r="15" fill="url(#fl-r)"/>
      <circle cx="32" cy="36" r="7" fill="#F6FAFF"/>
      <circle cx="32" cy="36" r="15" stroke="#C43A4E" stroke-width="1.4" fill="none"/>
      <path d="M20 30a15 15 0 0 1 8-8" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round" fill="none"/>
      <path d="M19 42h26M32 21v30" stroke="#F6FAFF" stroke-width="4" opacity=".9"/>
    </g>`,
    `<linearGradient id="fl-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC6F4"/><stop offset="1" stop-color="#4D95E8"/></linearGradient>
    <radialGradient id="fl-r" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FF8FA0"/><stop offset="1" stop-color="#E0506E"/></radialGradient>`,
  ),
  // ── VI. 기체 ─────────────────────────────────────────────
  balloonsDeco: S(
    `${shadow(32, 58, 10, 0.12)}
    <path d="M24 34q-2 12 6 22M34 32q4 12-2 24M42 36q0 10-8 20" stroke="#8A97AC" stroke-width="1.3" fill="none" opacity=".7"/>
    <ellipse cx="22" cy="24" rx="9" ry="11" fill="url(#ba-a)"/>
    <ellipse cx="42" cy="22" rx="8" ry="10" fill="url(#ba-b)"/>
    <ellipse cx="32" cy="16" rx="9" ry="11" fill="url(#ba-c)"/>
    <ellipse cx="29" cy="11" rx="3" ry="4" fill="#fff" opacity=".65"/>
    <ellipse cx="19" cy="19" rx="2.4" ry="3.4" fill="#fff" opacity=".55"/>`,
    `<radialGradient id="ba-a" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#9FD0FF"/><stop offset="1" stop-color="#3D7BDC"/></radialGradient>
    <radialGradient id="ba-b" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#B7F0D4"/><stop offset="1" stop-color="#12B886"/></radialGradient>
    <radialGradient id="ba-c" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFD1DB"/><stop offset="1" stop-color="#F0507A"/></radialGradient>`,
  ),
  hotairDeco: S(
    `${shadow(32, 58, 11, 0.12)}
    <path d="M32 6c12 0 18 8 18 17 0 10-9 15-12 20H26c-3-5-12-10-12-20 0-9 6-17 18-17z" fill="url(#ha-b)"/>
    <path d="M26 6.8Q20 22 26 43M38 6.8Q44 22 38 43" stroke="#C43A4E" stroke-width="1.2" fill="none" opacity=".5"/>
    <path d="M32 6c-5 0-8 17 0 37" stroke="#FFE2A8" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M26 43l-2 6h16l-2-6" stroke="#8A97AC" stroke-width="1.3" fill="none"/>
    <rect x="26" y="49" width="12" height="8" rx="2.4" fill="url(#ha-k)"/>
    <ellipse cx="26" cy="14" rx="4" ry="6" fill="#fff" opacity=".4"/>`,
    `<linearGradient id="ha-b" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#FF9DB0"/><stop offset=".5" stop-color="#F0507A"/><stop offset="1" stop-color="#C43A4E"/></linearGradient>
    <linearGradient id="ha-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9AF7C"/><stop offset="1" stop-color="#96632f"/></linearGradient>`,
  ),
  bubblesDeco: S(
    `<g stroke-width="1.6" fill="none">
      <circle cx="20" cy="44" r="9" fill="url(#bu-a)" stroke="#7FB2E8"/>
      <circle cx="40" cy="32" r="12" fill="url(#bu-a)" stroke="#7FB2E8"/>
      <circle cx="26" cy="16" r="6.5" fill="url(#bu-a)" stroke="#7FB2E8"/>
      <circle cx="48" cy="12" r="4" fill="url(#bu-a)" stroke="#7FB2E8"/>
    </g>
    <path d="M35 25a9 9 0 0 1 6-2M17 39a6 6 0 0 1 4-1.6" stroke="#fff" stroke-width="2.2" fill="none" opacity=".8" stroke-linecap="round"/>`,
    `<radialGradient id="bu-a" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#EAF4FF" stop-opacity=".9"/><stop offset="1" stop-color="#B7D6F4" stop-opacity=".45"/></radialGradient>`,
  ),
  // ── VII. 우주 — 트레일을 따라 만나는 행성들 ─────────────
  pMercury: S(
    `<circle cx="32" cy="32" r="15" fill="url(#pm-a)"/>
    <circle cx="26" cy="28" r="3" fill="rgba(74,70,72,.5)"/><circle cx="37" cy="38" r="2.4" fill="rgba(74,70,72,.45)"/><circle cx="36" cy="25" r="1.8" fill="rgba(74,70,72,.4)"/>
    <circle cx="32" cy="32" r="15" stroke="#5E5A58" stroke-width="1.3" fill="none"/>
    <ellipse cx="26" cy="25" rx="5" ry="4" fill="#fff" opacity=".28"/>`,
    `<radialGradient id="pm-a" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#C9C4C0"/><stop offset="1" stop-color="#7E7A78"/></radialGradient>`,
  ),
  pVenus: S(
    `<circle cx="32" cy="32" r="16" fill="url(#pv-a)"/>
    <path d="M18 27q14 5 28 0M17 35q15 6 30 0M21 42q11 4 22 0" stroke="#C79A5C" stroke-width="2.6" fill="none" opacity=".55"/>
    <circle cx="32" cy="32" r="16" stroke="#A87E44" stroke-width="1.3" fill="none"/>
    <ellipse cx="26" cy="24" rx="5.5" ry="4.5" fill="#FFF7E2" opacity=".55"/>`,
    `<radialGradient id="pv-a" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#F2DCA8"/><stop offset="1" stop-color="#D2A566"/></radialGradient>`,
  ),
  pMars: S(
    `<circle cx="32" cy="32" r="15" fill="url(#pr-a)"/>
    <ellipse cx="32" cy="19.5" rx="7" ry="2.6" fill="#F6FAFF" opacity=".92"/>
    <ellipse cx="26" cy="34" rx="4.5" ry="3" fill="rgba(92,44,30,.5)"/><ellipse cx="39" cy="28" rx="3" ry="2.2" fill="rgba(92,44,30,.42)"/>
    <circle cx="32" cy="32" r="15" stroke="#8E3A24" stroke-width="1.3" fill="none"/>
    <ellipse cx="26" cy="25" rx="5" ry="4" fill="#F8B590" opacity=".4"/>`,
    `<radialGradient id="pr-a" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#E8916E"/><stop offset="1" stop-color="#B24A2E"/></radialGradient>`,
  ),
  pJupiter: S(
    `<circle cx="32" cy="32" r="18" fill="url(#pj-a)"/>
    <path d="M15 25q17 6 34 0M14 33q18 7 36 0M17 42q15 6 30 0" stroke="#B57B50" stroke-width="3.4" fill="none" opacity=".55"/>
    <ellipse cx="39" cy="39" rx="4.6" ry="3" fill="#C4553E"/>
    <circle cx="32" cy="32" r="18" stroke="#7C4E33" stroke-width="1.4" fill="none"/>
    <ellipse cx="25" cy="23" rx="6" ry="5" fill="#FFF7E2" opacity=".5"/>`,
    `<radialGradient id="pj-a" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#EADFC6"/><stop offset=".55" stop-color="#D3AC7C"/><stop offset="1" stop-color="#A9714C"/></radialGradient>`,
  ),
  pSaturn: S(
    `<g transform="rotate(-16 32 32)">
      <ellipse cx="32" cy="32" rx="26" ry="8" stroke="url(#ps-r)" stroke-width="4" fill="none" opacity=".92"/>
      <circle cx="32" cy="32" r="13" fill="url(#ps-a)"/>
      <path d="M20 28q12 4 24 0" stroke="#C08A5C" stroke-width="2.2" fill="none" opacity=".5"/>
      <circle cx="32" cy="32" r="13" stroke="#B08D58" stroke-width="1.3" fill="none"/>
      <ellipse cx="27" cy="25" rx="4.5" ry="3.6" fill="#FFF7E2" opacity=".55"/>
    </g>`,
    `<radialGradient id="ps-a" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#F4E8C4"/><stop offset="1" stop-color="#C89A62"/></radialGradient>
    <linearGradient id="ps-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8D3A0"/><stop offset="1" stop-color="#B08D58"/></linearGradient>`,
  ),
  rocketDeco: S(
    `<g transform="rotate(38 32 32)">
      <path d="M32 6c7 7 9 18 9 27l-9 8-9-8c0-9 2-20 9-27z" fill="url(#rk-b)"/>
      <circle cx="32" cy="22" r="4.4" fill="url(#rk-w)"/>
      <circle cx="32" cy="22" r="4.4" stroke="#2E5FA8" stroke-width="1.2" fill="none"/>
      <path d="M23 33l-6 10 9-3M41 33l6 10-9-3" fill="url(#rk-f)"/>
      <path d="M32 41v0q-4 8 0 15 4-7 0-15z" fill="url(#rk-fl)"/>
      <path d="M28 10q-3 10-3 22" stroke="#fff" stroke-width="1.6" opacity=".55" fill="none"/>
    </g>`,
    `<linearGradient id="rk-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4F8FE"/><stop offset=".55" stop-color="#DCE6F2"/><stop offset="1" stop-color="#AFC0D6"/></linearGradient>
    <radialGradient id="rk-w" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#BFE0FF"/><stop offset="1" stop-color="#5E9CE0"/></radialGradient>
    <linearGradient id="rk-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8FA0"/><stop offset="1" stop-color="#D6455E"/></linearGradient>
    <linearGradient id="rk-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#FF9E3D"/></linearGradient>`,
  ),
  // ── 중2 III. 빛과 파동 — 빛의 여행(손전등→거울→프리즘→삼원색) 끝에 음표 ──
  flashlightDeco: S(
    `${shadow(30, 56, 17, 0.14)}
    <g transform="rotate(-32 32 32)">
      <path d="M40 26l16-9v26l-16-9z" fill="url(#fl-beam)" opacity=".85"/>
      <rect x="14" y="24" width="20" height="16" rx="5" fill="url(#fl-body)"/>
      <rect x="34" y="22" width="6" height="20" rx="2.5" fill="url(#fl-head)"/>
      <rect x="16.5" y="27" width="13" height="3.4" rx="1.7" fill="#fff" opacity=".45"/>
      <circle cx="21" cy="35.5" r="2" fill="#3E4B60"/>
      <rect x="14" y="24" width="20" height="16" rx="5" stroke="#2E3A4E" stroke-width="1.4" fill="none"/>
    </g>`,
    `<linearGradient id="fl-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></linearGradient>
    <linearGradient id="fl-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E92AE"/><stop offset=".5" stop-color="#5A6C86"/><stop offset="1" stop-color="#3E4B60"/></linearGradient>
    <linearGradient id="fl-head" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8C6D8"/><stop offset="1" stop-color="#75879E"/></linearGradient>`,
  ),
  mirrorDeco: S(
    `${shadow(32, 57, 14, 0.14)}
    <ellipse cx="32" cy="26" rx="15" ry="18" fill="url(#mr-fr)"/>
    <ellipse cx="32" cy="26" rx="11" ry="14" fill="url(#mr-gl)"/>
    <path d="M26 17q-3 6-1 13" stroke="#fff" stroke-width="2.6" opacity=".8" fill="none"/>
    <path d="M36 15l3 3" stroke="#fff" stroke-width="2" opacity=".6"/>
    <ellipse cx="32" cy="26" rx="11" ry="14" stroke="#8FB2D8" stroke-width="1.2" fill="none"/>
    <path d="M32 44v9" stroke="url(#mr-hd)" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="32" cy="26" rx="15" ry="18" stroke="#9A6FB4" stroke-width="1.4" fill="none"/>`,
    `<linearGradient id="mr-fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7C7F2"/><stop offset=".5" stop-color="#C99ADC"/><stop offset="1" stop-color="#A472C0"/></linearGradient>
    <linearGradient id="mr-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F9FF"/><stop offset=".55" stop-color="#CFE4F8"/><stop offset="1" stop-color="#A8C6E8"/></linearGradient>
    <linearGradient id="mr-hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C99ADC"/><stop offset="1" stop-color="#9A6FB4"/></linearGradient>`,
  ),
  prismDeco: S(
    `${shadow(32, 55, 18, 0.14)}
    <path d="M6 26h16" stroke="#F5E6A8" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
    <path d="M32 12L50 48H14z" fill="url(#pz-g)"/>
    <path d="M32 12L50 48H14z" stroke="#7FA6CC" stroke-width="1.4" fill="none"/>
    <path d="M30 20l-8 20" stroke="#fff" stroke-width="2.4" opacity=".65" fill="none"/>
    <path d="M44 36l14-5" stroke="#F25C54" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M46 40l14-1" stroke="#FFC24D" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M47 44l13 3" stroke="#4DA8F0" stroke-width="2.8" stroke-linecap="round"/>`,
    `<linearGradient id="pz-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4FAFF"/><stop offset=".5" stop-color="#D8EAF8"/><stop offset="1" stop-color="#AECDE8"/></linearGradient>`,
  ),
  rgbDeco: S(
    `<circle cx="32" cy="24" r="13" fill="url(#rgb-r)" opacity=".88"/>
    <circle cx="24" cy="37" r="13" fill="url(#rgb-g)" opacity=".82" style="mix-blend-mode:screen"/>
    <circle cx="40" cy="37" r="13" fill="url(#rgb-b)" opacity=".82" style="mix-blend-mode:screen"/>
    <circle cx="27" cy="19" r="3.5" fill="#fff" opacity=".5"/>`,
    `<radialGradient id="rgb-r" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FF8A80"/><stop offset="1" stop-color="#E5322E"/></radialGradient>
    <radialGradient id="rgb-g" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#7FE29A"/><stop offset="1" stop-color="#12A84E"/></radialGradient>
    <radialGradient id="rgb-b" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#7FB4FF"/><stop offset="1" stop-color="#2454D8"/></radialGradient>`,
  ),
  noteDeco: S(
    `${shadow(30, 55, 14, 0.13)}
    <path d="M24 46V14l22-5v30" stroke="url(#nt-s)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="19" cy="46" rx="6.5" ry="5" fill="url(#nt-h)" transform="rotate(-14 19 46)"/>
    <ellipse cx="41" cy="39" rx="6.5" ry="5" fill="url(#nt-h)" transform="rotate(-14 41 39)"/>
    <ellipse cx="17" cy="44" rx="2.2" ry="1.4" fill="#fff" opacity=".45" transform="rotate(-14 17 44)"/>`,
    `<linearGradient id="nt-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A64C8"/><stop offset="1" stop-color="#5E3E96"/></linearGradient>
    <linearGradient id="nt-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A74D8"/><stop offset="1" stop-color="#5E3E96"/></linearGradient>`,
  ),
  rainbowDeco: S(
    `<g fill="none" stroke-linecap="round">
      <path d="M8 46a24 24 0 0 1 48 0" stroke="#F25C54" stroke-width="4.6"/>
      <path d="M13 46a19 19 0 0 1 38 0" stroke="#FFC24D" stroke-width="4.6"/>
      <path d="M18 46a14 14 0 0 1 28 0" stroke="#6FCB8B" stroke-width="4.6"/>
      <path d="M23 46a9 9 0 0 1 18 0" stroke="#5AA2F8" stroke-width="4.6"/>
    </g>
    <ellipse cx="12" cy="46" rx="7" ry="4.6" fill="#fff" opacity=".92"/>
    <ellipse cx="52" cy="46" rx="7" ry="4.6" fill="#fff" opacity=".92"/>
    <ellipse cx="9" cy="44" rx="3.4" ry="2.4" fill="#fff"/>
    <ellipse cx="55" cy="44" rx="3.4" ry="2.4" fill="#fff"/>`,
  ),
};

/** 지도 장식 아트 — 단원 특색 세트 → 생물 아이콘(ART_BIO) → 공용(ART_DECOR) 순서로 찾는다. */
export function mapDecorArt(key: string): string {
  return MAP_DECOR[key] || ART_BIO[key] || ART_DECOR[key] || "";
}
