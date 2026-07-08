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
  // ── 중2 IV. 물질의 구성 — 비커→원자→주기율표→분자→이온 ──
  beakerDeco: S(
    `${shadow(32, 56, 15, 0.14)}
    <path d="M22 12v14L12 46a6 6 0 0 0 5.5 8h29A6 6 0 0 0 52 46L42 26V12z" fill="url(#bk-g)"/>
    <path d="M22 12v14L12 46a6 6 0 0 0 5.5 8h29A6 6 0 0 0 52 46L42 26V12z" stroke="#7E92AC" stroke-width="1.8" fill="none"/>
    <path d="M18 40h28l6 8a4 4 0 0 1-4 5h-32a4 4 0 0 1-4-5z" fill="url(#bk-liq)"/>
    <circle cx="26" cy="46" r="2.2" fill="#D6F09A"/><circle cx="37" cy="49" r="1.8" fill="#D6F09A"/>
    <path d="M25 15v10" stroke="#FFFFFF" stroke-width="2.6" opacity=".7"/>
    <rect x="19" y="9" width="26" height="4.5" rx="2.2" fill="#B9C8DC"/>`,
    `<linearGradient id="bk-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4FAFF"/><stop offset="1" stop-color="#CBDCEE" stop-opacity=".7"/></linearGradient>
    <linearGradient id="bk-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4DE62"/><stop offset="1" stop-color="#7CB024"/></linearGradient>`,
  ),
  atomDeco: S(
    `<circle cx="32" cy="32" r="6" fill="url(#at-n)"/>
    <ellipse cx="32" cy="32" rx="24" ry="10" stroke="#7E92AC" stroke-width="2" fill="none"/>
    <ellipse cx="32" cy="32" rx="24" ry="10" stroke="#9FB6D0" stroke-width="2" fill="none" transform="rotate(62 32 32)"/>
    <circle cx="54" cy="27" r="3.4" fill="url(#at-e)"/>
    <circle cx="24" cy="53" r="3.4" fill="url(#at-e)"/>
    <circle cx="29.5" cy="29.5" r="1.8" fill="#FFF" opacity=".7"/>`,
    `<radialGradient id="at-n" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FF9A80"/><stop offset="1" stop-color="#E0452E"/></radialGradient>
    <radialGradient id="at-e" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#8FC4FF"/><stop offset="1" stop-color="#2E6DB4"/></radialGradient>`,
  ),
  tableDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <rect x="10" y="14" width="44" height="36" rx="6" fill="url(#tb-g)" stroke="#5A8E0E" stroke-width="1.6"/>
    <path d="M10 26h44M10 38h44M25 14v36M40 14v36" stroke="#FFFFFF" stroke-width="1.8" opacity=".6"/>
    <rect x="25" y="26" width="15" height="12" fill="#FFFFFF" opacity=".35"/>
    <rect x="12.5" y="16.5" width="9" height="7" rx="2" fill="#FFF" opacity=".5"/>`,
    `<linearGradient id="tb-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8E070"/><stop offset="1" stop-color="#7CB024"/></linearGradient>`,
  ),
  moleculeDeco: S(
    `${shadow(32, 57, 15, 0.13)}
    <path d="M20 40L32 26M44 40L32 26" stroke="#8B95A1" stroke-width="3"/>
    <circle cx="32" cy="24" r="11" fill="url(#mo-o)"/>
    <circle cx="28.5" cy="20.5" r="3.4" fill="#FFF" opacity=".6"/>
    <circle cx="18" cy="44" r="8" fill="url(#mo-h)"/>
    <circle cx="46" cy="44" r="8" fill="url(#mo-h)"/>
    <circle cx="15.5" cy="41.5" r="2.4" fill="#FFF" opacity=".8"/>`,
    `<radialGradient id="mo-o" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FF8A76"/><stop offset="1" stop-color="#D63A24"/></radialGradient>
    <radialGradient id="mo-h" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C6D2E0"/></radialGradient>`,
  ),
  ionDeco: S(
    `<circle cx="24" cy="30" r="13" fill="url(#io-p)"/>
    <path d="M19 30h10M24 25v10" stroke="#FFF" stroke-width="2.6"/>
    <circle cx="45" cy="42" r="10" fill="url(#io-m)"/>
    <path d="M40.5 42h9" stroke="#FFF" stroke-width="2.4"/>
    <circle cx="20.5" cy="26" r="2.6" fill="#FFF" opacity=".55"/>`,
    `<radialGradient id="io-p" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FF9A80"/><stop offset="1" stop-color="#E0452E"/></radialGradient>
    <radialGradient id="io-m" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#8FC4FF"/><stop offset="1" stop-color="#2E6DB4"/></radialGradient>`,
  ),
  // ── 중2 VII. 전기와 자기 — 전기 순례(스파크→전지→전구→코일→자석) ──
  boltDeco: S(
    `${shadow(32, 57, 12, 0.14)}
    <path d="M36 8L20 36h9l-4 20 19-30h-10z" fill="url(#bo-g)" stroke="#B8860B" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M33 13l-8 15" stroke="#FFF3C0" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`,
    `<linearGradient id="bo-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset=".55" stop-color="#F5C400"/><stop offset="1" stop-color="#D69C00"/></linearGradient>`,
  ),
  batteryDeco: S(
    `${shadow(32, 57, 13, 0.14)}
    <rect x="18" y="18" width="28" height="38" rx="6" fill="url(#ba-g)" stroke="#3E4B66" stroke-width="1.5"/>
    <rect x="26" y="12" width="12" height="7" rx="2.5" fill="#D8B04A" stroke="#8A6A1E" stroke-width="1.2"/>
    <path d="M28 30h8M32 26v8" stroke="#FFF" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M28 46h8" stroke="#FFF" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M22 22v30" stroke="#FFF" stroke-width="1.8" opacity=".4"/>`,
    `<linearGradient id="ba-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8C6DA"/><stop offset=".5" stop-color="#8FA0B8"/><stop offset="1" stop-color="#5E7090"/></linearGradient>`,
  ),
  bulbDeco: S(
    `${shadow(32, 58, 12, 0.14)}
    <circle cx="32" cy="28" r="15" fill="url(#bu-g)" stroke="#C8A23E" stroke-width="1.4"/>
    <path d="M26 30q3-6 6-1t6-1" stroke="#E8963E" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="26" y="42" width="12" height="9" rx="2.5" fill="#8C99AC" stroke="#4E5A70" stroke-width="1.2"/>
    <path d="M26 45h12M26 48h12" stroke="#5E6C84" stroke-width="1.1"/>
    <circle cx="27" cy="22" r="3.4" fill="#FFF" opacity=".75"/>
    <path d="M12 16l4 4M52 16l-4 4M32 6v6" stroke="#F5C400" stroke-width="2.2" stroke-linecap="round"/>`,
    `<radialGradient id="bu-g" cx=".4" cy=".32" r=".95"><stop offset="0" stop-color="#FFF7D8"/><stop offset=".6" stop-color="#FFDF8A"/><stop offset="1" stop-color="#F0B84A"/></radialGradient>`,
  ),
  coilDeco: S(
    `${shadow(32, 57, 14, 0.14)}
    <path d="M12 40q4-14 10 0t10 0 10 0 10 0" stroke="url(#co-g)" stroke-width="4.6" fill="none" stroke-linecap="round"/>
    <path d="M8 40h6M50 40h6" stroke="#8FA4C2" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="17" cy="31" r="1.8" fill="#FFF" opacity=".7"/>`,
    `<linearGradient id="co-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8A05A"/><stop offset=".5" stop-color="#C97F3A"/><stop offset="1" stop-color="#A05E22"/></linearGradient>`,
  ),
  magnetDeco: S(
    `${shadow(32, 57, 14, 0.14)}
    <path d="M20 14a12 12 0 0 1 24 0v22a12 12 0 0 1-24 0z" fill="none"/>
    <path d="M20 14v22a12 12 0 0 0 24 0V14" stroke="#8B2E1E" stroke-width="9" fill="none" stroke-linecap="butt"/>
    <path d="M20 14v22a12 12 0 0 0 24 0V14" stroke="url(#mg-g)" stroke-width="7" fill="none" stroke-linecap="butt"/>
    <rect x="15.5" y="10" width="9" height="9" rx="1.5" fill="#E8EEF6" stroke="#8C99A8" stroke-width="1.2"/>
    <rect x="39.5" y="10" width="9" height="9" rx="1.5" fill="#E8EEF6" stroke="#8C99A8" stroke-width="1.2"/>
    <path d="M12 54l3-3M52 54l-3-3M32 60v-4" stroke="#F5C400" stroke-width="2" stroke-linecap="round"/>`,
    `<linearGradient id="mg-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF8A70"/><stop offset=".5" stop-color="#E0452E"/><stop offset="1" stop-color="#4A6CD8"/></linearGradient>`,
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

  // ── 중2 I. 물질의 특성 — 실험대 순례(측정→용해→결정→분리→증류) ──
  flaskDeco: S(
    `${shadow(32, 57, 15, 0.14)}
    <path d="M27 12h10v12l10 20a7 7 0 0 1-6.4 10H23.4A7 7 0 0 1 17 44l10-20z" fill="url(#fk-g)"/>
    <path d="M27 12h10v12l10 20a7 7 0 0 1-6.4 10H23.4A7 7 0 0 1 17 44l10-20z" stroke="#7E93A8" stroke-width="1.5" fill="none"/>
    <path d="M21.5 42l10.5-2 11 2 2.4 5a4 4 0 0 1-3.7 6H22.8a4 4 0 0 1-3.7-6z" fill="url(#fk-l)"/>
    <ellipse cx="27" cy="26" rx="2.6" ry="7" fill="#fff" opacity=".5" transform="rotate(8 27 26)"/>
    <rect x="26" y="8" width="12" height="5" rx="2" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.2"/>`,
    `<linearGradient id="fk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F9FF" stop-opacity=".5"/><stop offset="1" stop-color="#C8DCEE" stop-opacity=".65"/></linearGradient>
    <linearGradient id="fk-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8FB4"/><stop offset="1" stop-color="#D6336C"/></linearGradient>`,
  ),
  layersDeco: S(
    `${shadow(32, 57, 13, 0.14)}
    <path d="M24 14h16v6l4 6v24a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6V26l4-6z" fill="url(#ly-g)" stroke="#7E93A8" stroke-width="1.5"/>
    <path d="M21 34h22v16a5 5 0 0 1-5 5H26a5 5 0 0 1-5-5z" fill="url(#ly-w)"/>
    <path d="M21 26h22v8H21z" fill="url(#ly-o)"/>
    <path d="M21 34h22" stroke="#FFF0C0" stroke-width="1.4" opacity=".9"/>
    <ellipse cx="27" cy="24" rx="2" ry="6" fill="#fff" opacity=".45" transform="rotate(8 27 24)"/>
    <rect x="23" y="10" width="18" height="6" rx="2.4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.2"/>`,
    `<linearGradient id="ly-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F9FF" stop-opacity=".45"/><stop offset="1" stop-color="#C8DCEE" stop-opacity=".55"/></linearGradient>
    <linearGradient id="ly-o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2C14E"/></linearGradient>
    <linearGradient id="ly-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD0F5"/><stop offset="1" stop-color="#5E9CD8"/></linearGradient>`,
  ),
  crystalDeco: S(
    `${shadow(32, 57, 16, 0.14)}
    <path d="M32 12l9 16-9 26-9-26z" fill="url(#cr-a)" stroke="#B4488A" stroke-width="1.4"/>
    <path d="M18 34l6 10-4 10-7-9z" fill="url(#cr-b)" stroke="#B4488A" stroke-width="1.2"/>
    <path d="M46 34l7 11-6 9-5-10z" fill="url(#cr-b)" stroke="#B4488A" stroke-width="1.2"/>
    <path d="M32 12l4 16-4 22" stroke="#fff" stroke-width="1.2" opacity=".55" fill="none"/>
    <path d="M50 16l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z" fill="#FFD7E8"/>`,
    `<linearGradient id="cr-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3F0"/><stop offset=".5" stop-color="#F78FBB"/><stop offset="1" stop-color="#D6336C"/></linearGradient>
    <linearGradient id="cr-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD7E8"/><stop offset="1" stop-color="#E64980"/></linearGradient>`,
  ),
  funnelDeco: S(
    `${shadow(32, 58, 12, 0.14)}
    <path d="M20 14h24l-9 22v10h-6V36z" fill="url(#fn-g)" stroke="#7E93A8" stroke-width="1.5"/>
    <path d="M22 18h20l-3.4 8H25.4z" fill="url(#fn-o)"/>
    <path d="M26.5 27h11l-2.5 6.6v6h-6v-6z" fill="url(#fn-w)"/>
    <rect x="28" y="46" width="8" height="6" rx="2" fill="#8B99AC" stroke="#5E6B7E" stroke-width="1"/>
    <path d="M32 52q-1 4 0 7" stroke="#7FB8F2" stroke-width="2.4"/>
    <ellipse cx="26" cy="20" rx="1.6" ry="4" fill="#fff" opacity=".5" transform="rotate(14 26 20)"/>`,
    `<linearGradient id="fn-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F9FF" stop-opacity=".45"/><stop offset="1" stop-color="#C8DCEE" stop-opacity=".55"/></linearGradient>
    <linearGradient id="fn-o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2C14E"/></linearGradient>
    <linearGradient id="fn-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CD0F5"/><stop offset="1" stop-color="#5E9CD8"/></linearGradient>`,
  ),
  alembicDeco: S(
    `${shadow(28, 57, 15, 0.14)}
    <path d="M20 22a12 12 0 0 1 16 0l-2 6H22z" fill="url(#al-c)" stroke="#A8763E" stroke-width="1.4"/>
    <path d="M18 28h20l4 14a12 12 0 0 1-28 0z" fill="url(#al-b)" stroke="#A8763E" stroke-width="1.5"/>
    <path d="M36 24q10 2 12 12 1 6-2 12" stroke="#C9D4E0" stroke-width="3" fill="none"/>
    <circle cx="46" cy="52" r="2.4" fill="#7FB8F2"/>
    <ellipse cx="24" cy="36" rx="2.4" ry="6" fill="#fff" opacity=".35" transform="rotate(10 24 36)"/>
    <path d="M24 14q2-4 4 0M30 12q2-4 4 0" stroke="#D8E4F0" stroke-width="1.8" fill="none" opacity=".8"/>`,
    `<linearGradient id="al-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFC98E"/><stop offset="1" stop-color="#C89454"/></linearGradient>
    <linearGradient id="al-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2D5A4"/><stop offset=".5" stop-color="#D8A868"/><stop offset="1" stop-color="#B07E3E"/></linearGradient>`,
  ),

  // ── 중2 II. 지권의 변화 — 지질 원정(화산→수정→지층→화석→지구 단면) ──
  volcanoDeco: S(
    `${shadow(32, 57, 18, 0.14)}
    <path d="M32 14 L50 52 H14 Z" fill="url(#vc-b)" stroke="#5E3A22" stroke-width="1.6"/>
    <path d="M26 26 q6 4 12 0 l-2 -8 h-8 z" fill="url(#vc-l)"/>
    <path d="M28 14 q4 -6 8 0 q-1 3 -4 3 t-4 -3z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.2"/>
    <path d="M24 34 q8 5 16 0 M20 44 q12 6 24 0" stroke="#7A4A26" stroke-width="1.6" opacity=".6"/>
    <ellipse cx="26" cy="30" rx="2" ry="6" fill="#fff" opacity=".25" transform="rotate(16 26 30)"/>`,
    `<linearGradient id="vc-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A97A4E"/><stop offset=".55" stop-color="#7E5430"/><stop offset="1" stop-color="#5E3A22"/></linearGradient>
    <linearGradient id="vc-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#E8642A"/></linearGradient>`,
  ),
  quartzDeco: S(
    `${shadow(32, 57, 15, 0.14)}
    <path d="M26 50 L20 26 L28 14 L32 24 z" fill="url(#qz-a)" stroke="#8C7A4E" stroke-width="1.3"/>
    <path d="M32 50 L30 22 L38 10 L44 24 L40 50 z" fill="url(#qz-b)" stroke="#8C7A4E" stroke-width="1.4"/>
    <path d="M44 50 L44 30 L52 24 L54 38 z" fill="url(#qz-a)" stroke="#8C7A4E" stroke-width="1.2"/>
    <path d="M34 20 L37 14 M46 32 L50 27" stroke="#FFFDF4" stroke-width="1.4" opacity=".8"/>
    <path d="M18 52 h30" stroke="#8C7A4E" stroke-width="2"/>`,
    `<linearGradient id="qz-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF8E2"/><stop offset="1" stop-color="#E0C888"/></linearGradient>
    <linearGradient id="qz-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF2"/><stop offset=".5" stop-color="#F2E2B0"/><stop offset="1" stop-color="#CBAE6E"/></linearGradient>`,
  ),
  strataDeco: S(
    `${shadow(32, 57, 19, 0.13)}
    <path d="M12 52 Q14 30 32 26 Q50 30 52 52 Z" fill="url(#st2-a)" stroke="#7E5430" stroke-width="1.5"/>
    <path d="M15 46 Q32 40 49 46 M18 40 Q32 34 46 40 M22 34 Q32 30 42 34" stroke="#FFF2DC" stroke-width="2.2" opacity=".7"/>
    <path d="M15 46 Q32 40 49 46" stroke="#B0703C" stroke-width="1" opacity=".5"/>
    <ellipse cx="24" cy="32" rx="2" ry="5" fill="#fff" opacity=".3" transform="rotate(18 24 32)"/>`,
    `<linearGradient id="st2-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8AA70"/><stop offset=".5" stop-color="#BE8A50"/><stop offset="1" stop-color="#9A6B3A"/></linearGradient>`,
  ),
  fossilDeco: S(
    `${shadow(32, 57, 15, 0.14)}
    <circle cx="32" cy="34" r="19" fill="url(#fs-a)" stroke="#8C6A42" stroke-width="1.5"/>
    <path d="M32 34 m-12 0 a12 12 0 1 1 24 0 a9 9 0 1 1 -18 0 a6 6 0 1 1 12 0 a3 3 0 1 1 -6 0" fill="none" stroke="#6B4A26" stroke-width="2.2"/>
    <path d="M20 26 q4 -5 9 -6" stroke="#FFF2DC" stroke-width="1.6" opacity=".6"/>`,
    `<radialGradient id="fs-a" cx=".38" cy=".32" r=".9"><stop offset="0" stop-color="#F2DCB4"/><stop offset="1" stop-color="#C79A62"/></radialGradient>`,
  ),
  earthcutDeco: S(
    `${shadow(32, 57, 16, 0.14)}
    <circle cx="32" cy="34" r="20" fill="url(#ec2-sea)" stroke="#2E5FA8" stroke-width="1.4"/>
    <path d="M32 34 L32 14 A20 20 0 0 1 52 34 Z" fill="url(#ec2-sec)" stroke="#8C5A28" stroke-width="1.2"/>
    <circle cx="32" cy="34" r="4.5" fill="#FFE9A0"/>
    <path d="M24 22 q4 -3 8 -2 M20 36 q3 6 8 8" stroke="#7FD49E" stroke-width="3" stroke-linecap="round" opacity=".85"/>`,
    `<radialGradient id="ec2-sea" cx=".38" cy=".32" r=".9"><stop offset="0" stop-color="#7FB2F0"/><stop offset="1" stop-color="#2E5FA8"/></radialGradient>
    <radialGradient id="ec2-sec" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".4" stop-color="#F5A93E"/><stop offset=".75" stop-color="#B84A26"/><stop offset="1" stop-color="#7E9E5E"/></radialGradient>`,
  ),

  // ── 수학 Ⅰ. 수와 연산 — 수의 계곡 등반(조약돌→체→인수 나무→벤→수직선 팻말) ──
  pebblesDeco: S(
    `${shadow(32, 55, 20, 0.12)}
    <ellipse cx="17" cy="47" rx="10" ry="7" fill="url(#pb-a)" stroke="#4E6070" stroke-width="1.3"/>
    <ellipse cx="38" cy="44" rx="12" ry="8.4" fill="url(#pb-b)" stroke="#4E6070" stroke-width="1.4"/>
    <ellipse cx="53" cy="49" rx="8" ry="6" fill="url(#pb-a)" stroke="#4E6070" stroke-width="1.2"/>
    <circle cx="17" cy="46" r="1.8" fill="#3A4A58"/>
    <circle cx="34" cy="42" r="1.8" fill="#3A4A58"/><circle cx="42" cy="45" r="1.8" fill="#3A4A58"/>
    <circle cx="50" cy="47" r="1.5" fill="#3A4A58"/><circle cx="56" cy="49" r="1.5" fill="#3A4A58"/><circle cx="53" cy="52" r="1.5" fill="#3A4A58"/>
    <ellipse cx="34" cy="39.5" rx="4.5" ry="1.7" fill="#fff" opacity=".42"/>`,
    `<linearGradient id="pb-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E2EC"/><stop offset="1" stop-color="#93A5B6"/></linearGradient>
    <linearGradient id="pb-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C5F0F6"/><stop offset="1" stop-color="#5FB8C8"/></linearGradient>`,
  ),
  sieveDeco: S(
    `${shadow(30, 57, 16, 0.13)}
    <circle cx="30" cy="34" r="17" fill="url(#sv-a)" stroke="#7E6238" stroke-width="2.2"/>
    <path d="M18 28h24M16 34h28M18 40h24M24 20v28M30 18v32M36 20v28" stroke="#A8895A" stroke-width="1.2" opacity=".7"/>
    <path d="M45 22l12-10" stroke="url(#sv-h)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="26" cy="28" r="2.6" fill="url(#sv-g)"/><circle cx="34" cy="36" r="2.6" fill="url(#sv-g)"/>
    <circle cx="24" cy="54" r="1.7" fill="#9FB2C4"/><circle cx="33" cy="57" r="1.7" fill="#9FB2C4"/>
    <path d="M20 24q4-4 9-4" stroke="#FFF6DC" stroke-width="1.6" fill="none" opacity=".7"/>`,
    `<radialGradient id="sv-a" cx=".38" cy=".32" r=".95"><stop offset="0" stop-color="#F2E2C0"/><stop offset="1" stop-color="#C8A468"/></radialGradient>
    <linearGradient id="sv-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A97A4C"/><stop offset="1" stop-color="#7C552E"/></linearGradient>
    <radialGradient id="sv-g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),
  numTreeDeco: S(
    `${shadow(32, 57, 17, 0.13)}
    <path d="M32 16v10M32 26l-12 10M32 26l12 10M20 36v8M44 36l-8 9" stroke="url(#nt-b)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="14" r="8" fill="url(#nt-n)" stroke="#0E7A92" stroke-width="1.5"/>
    <circle cx="20" cy="46" r="6.4" fill="url(#nt-p)" stroke="#0C8A5E" stroke-width="1.4"/>
    <circle cx="44" cy="36" r="6.4" fill="url(#nt-p)" stroke="#0C8A5E" stroke-width="1.4"/>
    <circle cx="35" cy="47" r="6.4" fill="url(#nt-p)" stroke="#0C8A5E" stroke-width="1.4"/>
    <ellipse cx="29.5" cy="11.5" rx="3" ry="1.6" fill="#fff" opacity=".5"/>`,
    `<linearGradient id="nt-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FB2C4"/><stop offset="1" stop-color="#6E8296"/></linearGradient>
    <radialGradient id="nt-n" cx=".38" cy=".32" r=".95"><stop offset="0" stop-color="#B8ECF6"/><stop offset="1" stop-color="#2FA8C4"/></radialGradient>
    <radialGradient id="nt-p" cx=".38" cy=".32" r=".95"><stop offset="0" stop-color="#B6F0D2"/><stop offset="1" stop-color="#26B87E"/></radialGradient>`,
  ),
  vennDeco: S(
    `${shadow(32, 55, 19, 0.12)}
    <circle cx="24" cy="34" r="16" fill="url(#vn-a)" stroke="#2FA8C4" stroke-width="1.8" opacity=".92"/>
    <circle cx="40" cy="34" r="16" fill="url(#vn-b)" stroke="#8A6EE0" stroke-width="1.8" opacity=".92"/>
    <path d="M32 21.4a16 16 0 0 1 0 25.2 16 16 0 0 1 0-25.2z" fill="url(#vn-c)"/>
    <circle cx="32" cy="30" r="2.6" fill="#FFE9A0" stroke="#D8952E" stroke-width="1"/>
    <circle cx="32" cy="39" r="2.6" fill="#FFE9A0" stroke="#D8952E" stroke-width="1"/>
    <ellipse cx="18" cy="26" rx="4" ry="2" fill="#fff" opacity=".45" transform="rotate(-24 18 26)"/>`,
    `<radialGradient id="vn-a" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#C5F0F6" stop-opacity=".9"/><stop offset="1" stop-color="#5FB8C8" stop-opacity=".55"/></radialGradient>
    <radialGradient id="vn-b" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#E2D8FA" stop-opacity=".9"/><stop offset="1" stop-color="#9A82E0" stop-opacity=".55"/></radialGradient>
    <linearGradient id="vn-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE0D2" stop-opacity=".85"/><stop offset="1" stop-color="#3FB8A8" stop-opacity=".7"/></linearGradient>`,
  ),
  numlineDeco: S(
    `${shadow(32, 57, 18, 0.13)}
    <path d="M30 20v34" stroke="url(#nl-p)" stroke-width="4" stroke-linecap="round"/>
    <path d="M12 26h40l-6-8H18z" fill="url(#nl-s)" stroke="#0E7A92" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M16 22h8M28 22h8M40 22h8" stroke="#E8FBFF" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="36" cy="22" r="2.2" fill="#FFD98A" stroke="#D8952E" stroke-width="1"/>
    <path d="M14 20q4-2 8-2" stroke="#fff" stroke-width="1.4" opacity=".5" fill="none"/>`,
    `<linearGradient id="nl-p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A97A4C"/><stop offset="1" stop-color="#7C552E"/></linearGradient>
    <linearGradient id="nl-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FC4DC"/><stop offset="1" stop-color="#1690AC"/></linearGradient>`,
  ),
};

/** 지도 장식 아트 — 단원 특색 세트 → 생물 아이콘(ART_BIO) → 공용(ART_DECOR) 순서로 찾는다. */
export function mapDecorArt(key: string): string {
  return MAP_DECOR[key] || ART_BIO[key] || ART_DECOR[key] || "";
}
