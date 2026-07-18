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
  // ── 중2 VIII. 별과 우주 — 별빛 순항(별→성단→은하→망원경, 로켓은 기존 rocketDeco 재사용) ──
  starsDeco: S(
    `<g>
      <path d="M22 18l2.6 6.2 6.2 2.6-6.2 2.6L22 36l-2.6-6.6-6.2-2.6 6.2-2.6z" fill="url(#sd-a)"/>
      <path d="M44 30l1.9 4.5 4.5 1.9-4.5 1.9L44 43l-1.9-4.7-4.5-1.9 4.5-1.9z" fill="url(#sd-b)"/>
      <path d="M33 44l1.4 3.3 3.3 1.4-3.3 1.4L33 53.6l-1.4-3.5-3.3-1.4 3.3-1.4z" fill="url(#sd-a)" opacity=".85"/>
      <circle cx="46" cy="18" r="1.6" fill="#8FA2E8"/>
      <circle cx="14" cy="44" r="1.3" fill="#8FA2E8" opacity=".8"/>
    </g>`,
    `<linearGradient id="sd-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D8"/><stop offset="1" stop-color="#F2C94C"/></linearGradient>
    <linearGradient id="sd-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4E9FF"/><stop offset="1" stop-color="#8FA2E8"/></linearGradient>`,
  ),
  clusterDeco: S(
    `<g>
      <circle cx="32" cy="30" r="15" fill="url(#cl-h)" opacity=".5"/>
      <circle cx="32" cy="30" r="3.2" fill="#FFF3C8"/>
      <circle cx="25" cy="26" r="2.3" fill="#FFE9A8"/>
      <circle cx="39" cy="25" r="2.1" fill="#FFEEC0"/>
      <circle cx="27" cy="36" r="2" fill="#F8DE9C"/>
      <circle cx="38" cy="35" r="2.4" fill="#FFE9A8"/>
      <circle cx="32" cy="21" r="1.7" fill="#FFF6DC"/>
      <circle cx="21" cy="31" r="1.5" fill="#F2CE7E"/>
      <circle cx="43" cy="30" r="1.5" fill="#F2CE7E"/>
      <circle cx="34" cy="41" r="1.5" fill="#EFC96E"/>
    </g>`,
    `<radialGradient id="cl-h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFEDB8"/><stop offset="1" stop-color="#FFEDB8" stop-opacity="0"/></radialGradient>`,
  ),
  galaxyDeco: S(
    `<g transform="rotate(-18 32 32)">
      <ellipse cx="32" cy="32" rx="21" ry="12" fill="url(#gx-h)" opacity=".45"/>
      <path d="M32 32q-16-4-12-14 2 8 12 9z" fill="url(#gx-a)"/>
      <path d="M32 32q16 4 12 14-2-8-12-9z" fill="url(#gx-a)"/>
      <path d="M32 32q-4-16 8-17-7 5-3 14z" fill="url(#gx-b)" opacity=".85"/>
      <path d="M32 32q4 16-8 17 7-5 3-14z" fill="url(#gx-b)" opacity=".85"/>
      <circle cx="32" cy="32" r="5" fill="url(#gx-c)"/>
      <circle cx="20" cy="25" r="1.1" fill="#fff" opacity=".8"/>
      <circle cx="45" cy="39" r="1.1" fill="#fff" opacity=".8"/>
    </g>`,
    `<radialGradient id="gx-h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#C8D2F8"/><stop offset="1" stop-color="#C8D2F8" stop-opacity="0"/></radialGradient>
    <linearGradient id="gx-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#AFC0F2"/><stop offset="1" stop-color="#5E6BD8"/></linearGradient>
    <linearGradient id="gx-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DCE4FB"/><stop offset="1" stop-color="#8FA2E8"/></linearGradient>
    <radialGradient id="gx-c" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF9E4"/><stop offset="1" stop-color="#F2C94C"/></radialGradient>`,
  ),
  telescopeDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <g transform="rotate(-24 32 30)">
      <rect x="14" y="24" width="30" height="12" rx="6" fill="url(#tel-t)"/>
      <rect x="42" y="26" width="7" height="8" rx="3" fill="url(#tel-e)"/>
      <rect x="11" y="26.5" width="5" height="7" rx="2.5" fill="#DCE6F4"/>
      <rect x="17" y="27" width="16" height="2.6" rx="1.3" fill="#fff" opacity=".5"/>
    </g>
    <path d="M30 38l-7 16M34 38l7 16M32 40v13" stroke="url(#tel-l)" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
    `<linearGradient id="tel-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA2E8"/><stop offset=".55" stop-color="#5E6BD8"/><stop offset="1" stop-color="#3A4494"/></linearGradient>
    <linearGradient id="tel-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#E8B84E"/></linearGradient>
    <linearGradient id="tel-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7A9E"/><stop offset="1" stop-color="#4A5474"/></linearGradient>`,
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
  // ── 수학 공통: 기호·수 타일(단원별 세트가 조합해 쓴다) ──
  pmDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <rect x="12" y="12" width="40" height="40" rx="13" fill="url(#mp-tl)" stroke="#0A87A3" stroke-width="1.6"/>
    <ellipse cx="22" cy="20" rx="7" ry="3.5" fill="#fff" opacity=".45"/>
    <path d="M24 26h16M32 18v16M24 42h16" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round"/>`,
    `<linearGradient id="mp-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset=".55" stop-color="#0DA5C6"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>`,
  ),
  fracDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <rect x="14" y="10" width="36" height="44" rx="10" fill="url(#fr-tl)" stroke="#C79400" stroke-width="1.5"/>
    <ellipse cx="24" cy="17" rx="6" ry="3" fill="#fff" opacity=".5"/>
    <text x="32" y="28" text-anchor="middle" font-size="15" font-weight="900" fill="#7A5800">1</text>
    <path d="M22 32h20" stroke="#7A5800" stroke-width="3" stroke-linecap="round"/>
    <text x="32" y="49" text-anchor="middle" font-size="15" font-weight="900" fill="#7A5800">2</text>`,
    `<linearGradient id="fr-tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".55" stop-color="#FFD44A"/><stop offset="1" stop-color="#F2B430"/></linearGradient>`,
  ),
  primeDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <circle cx="32" cy="32" r="21" fill="url(#pr-bd)" stroke="#0C8A5E" stroke-width="1.8"/>
    <circle cx="32" cy="32" r="26" fill="none" stroke="#26B87E" stroke-width="1.4" opacity=".45" stroke-dasharray="4 6"/>
    <ellipse cx="24" cy="22" rx="7" ry="4" fill="#fff" opacity=".4"/>
    <text x="32" y="41" text-anchor="middle" font-size="24" font-weight="900" fill="#FFFFFF">7</text>`,
    `<radialGradient id="pr-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FE3B8"/><stop offset="1" stop-color="#0CA678"/></radialGradient>`,
  ),
  opsDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <rect x="8" y="16" width="26" height="26" rx="9" fill="url(#op-a)" stroke="#6A55F2" stroke-width="1.4" transform="rotate(-7 21 29)"/>
    <path d="M15 22l10 10M25 22l-10 10" stroke="#fff" stroke-width="3.4" stroke-linecap="round" transform="rotate(-7 21 29)"/>
    <rect x="30" y="26" width="26" height="26" rx="9" fill="url(#op-b)" stroke="#0A87A3" stroke-width="1.4" transform="rotate(6 43 39)"/>
    <g transform="rotate(6 43 39)"><path d="M36 39h14" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="43" cy="33.5" r="2.1" fill="#fff"/><circle cx="43" cy="44.5" r="2.1" fill="#fff"/></g>`,
    `<linearGradient id="op-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9C8CFF"/><stop offset="1" stop-color="#6A55F2"/></linearGradient>
    <linearGradient id="op-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>`,
  ),
  xDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <rect x="13" y="11" width="38" height="42" rx="11" fill="url(#xd-tl)" stroke="#0A87A3" stroke-width="1.6"/>
    <ellipse cx="23" cy="18" rx="6.5" ry="3" fill="#fff" opacity=".45"/>
    <text x="32" y="43" text-anchor="middle" font-size="27" font-weight="900" font-style="italic" fill="#FFFFFF">x</text>`,
    `<linearGradient id="xd-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset=".55" stop-color="#0DA5C6"/><stop offset="1" stop-color="#077E9C"/></linearGradient>`,
  ),
  aDeco: S(
    `${shadow(32, 56, 14, 0.13)}
    <rect x="15" y="13" width="34" height="38" rx="10" fill="url(#ad-tl)" stroke="#6A55F2" stroke-width="1.5"/>
    <ellipse cx="24" cy="19" rx="5.5" ry="2.6" fill="#fff" opacity=".45"/>
    <text x="32" y="42" text-anchor="middle" font-size="23" font-weight="900" font-style="italic" fill="#FFFFFF">a</text>`,
    `<linearGradient id="ad-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9A6F2"/><stop offset=".55" stop-color="#8A6EE0"/><stop offset="1" stop-color="#6A55F2"/></linearGradient>`,
  ),
  eqDeco: S(
    `${shadow(32, 56, 15, 0.12)}
    <circle cx="32" cy="32" r="20" fill="url(#eq-bd)" stroke="#C79400" stroke-width="1.6"/>
    <ellipse cx="25" cy="23" rx="6.5" ry="3.4" fill="#fff" opacity=".5"/>
    <path d="M23 27h18M23 37h18" stroke="#7A5800" stroke-width="4.4" stroke-linecap="round"/>`,
    `<radialGradient id="eq-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#F2B430"/></radialGradient>`,
  ),
  scaleDeco: S(
    `${shadow(32, 57, 17, 0.13)}
    <path d="M32 14v30M22 46h20" stroke="url(#sc-mt)" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M32 16l-14 5M32 16l14 5" stroke="#6E7C8C" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M11 30a7 7 0 0 0 14 0L18 21z" fill="url(#sc-pn)" stroke="#5E6C7C" stroke-width="1.3"/>
    <path d="M39 30a7 7 0 0 0 14 0L46 21z" fill="url(#sc-pn)" stroke="#5E6C7C" stroke-width="1.3"/>
    <circle cx="32" cy="14" r="3" fill="#54677A"/>`,
    `<linearGradient id="sc-mt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset="1" stop-color="#8C99A8"/></linearGradient>
    <linearGradient id="sc-pn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EEF6"/><stop offset="1" stop-color="#AAB8C8"/></linearGradient>`,
  ),
  boxDeco: S(
    `${shadow(32, 56, 15, 0.14)}
    <rect x="14" y="20" width="36" height="30" rx="7" fill="url(#bx-tl)" stroke="#076074" stroke-width="1.6"/>
    <path d="M14 30h36" stroke="#076074" stroke-width="1.3" opacity=".5"/>
    <ellipse cx="23" cy="26" rx="5.5" ry="2.4" fill="#fff" opacity=".4"/>
    <text x="32" y="46" text-anchor="middle" font-size="17" font-weight="900" font-style="italic" fill="#FFFFFF">x</text>
    <path d="M26 20q6-8 12 0" stroke="#076074" stroke-width="2" fill="none"/>`,
    `<linearGradient id="bx-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset=".55" stop-color="#2FA8C4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>`,
  ),
  // ── 수학 Ⅲ. 좌표평면과 그래프 — 점 핀 → 좌표평면 → 꺾은선 → 직선 → 곡선 ──
  pinDeco: S(
    `${shadow(32, 57, 13, 0.14)}
    <path d="M32 54 Q20 38 20 27 a12 12 0 1 1 24 0 Q44 38 32 54z" fill="url(#pn-bd)" stroke="#B03A54" stroke-width="1.6"/>
    <ellipse cx="26" cy="21" rx="5" ry="3.4" fill="#fff" opacity=".45"/>
    <circle cx="32" cy="27" r="5.2" fill="#FFF3F5" stroke="#B03A54" stroke-width="1.4"/>`,
    `<radialGradient id="pn-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FF8FA8"/><stop offset=".6" stop-color="#F25C7E"/><stop offset="1" stop-color="#D93E62"/></radialGradient>`,
  ),
  gridDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <rect x="12" y="12" width="40" height="40" rx="9" fill="url(#gd-tl)" stroke="#077E9C" stroke-width="1.6"/>
    <ellipse cx="22" cy="18" rx="6.5" ry="3" fill="#fff" opacity=".4"/>
    <path d="M22 12v40M42 12v40M12 22h40M12 42h40" stroke="#FFFFFF" stroke-width="1.1" opacity=".38"/>
    <path d="M32 14v36M14 32h36" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>
    <circle cx="42" cy="22" r="3.4" fill="#FFD44A" stroke="#B98A00" stroke-width="1.2"/>`,
    `<linearGradient id="gd-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52CCE4"/><stop offset=".55" stop-color="#0DA5C6"/><stop offset="1" stop-color="#077E9C"/></linearGradient>`,
  ),
  zigDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <rect x="12" y="14" width="40" height="36" rx="9" fill="url(#zg-tl)" stroke="#C6D2DE" stroke-width="1.5"/>
    <ellipse cx="22" cy="20" rx="6" ry="2.8" fill="#fff" opacity=".65"/>
    <path d="M17 44h30M17 44V19" stroke="#8CA0B3" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M17 40 L26 30 L33 35 L45 21" stroke="url(#zg-ln)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="26" cy="30" r="2.2" fill="#F25C7E"/><circle cx="33" cy="35" r="2.2" fill="#F25C7E"/>`,
    `<linearGradient id="zg-tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EEF5"/></linearGradient>
    <linearGradient id="zg-ln" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F2789A"/><stop offset="1" stop-color="#D93E62"/></linearGradient>`,
  ),
  riseDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <rect x="12" y="14" width="40" height="36" rx="9" fill="url(#rs-tl)" stroke="#0A87A3" stroke-width="1.6"/>
    <ellipse cx="22" cy="20" rx="6" ry="2.8" fill="#fff" opacity=".4"/>
    <path d="M17 44h30M17 44V19" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
    <path d="M18 46 L46 20" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <path d="M46 20l-7 1.2M46 20l-1.2 7" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="33" r="2.4" fill="#FFD44A" stroke="#B98A00" stroke-width="1"/>`,
    `<linearGradient id="rs-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset=".55" stop-color="#2FA8C4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>`,
  ),
  hyperDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <rect x="12" y="14" width="40" height="36" rx="9" fill="url(#hy-tl)" stroke="#6A55F2" stroke-width="1.6"/>
    <ellipse cx="22" cy="20" rx="6" ry="2.8" fill="#fff" opacity=".45"/>
    <path d="M32 16v32M14 32h36" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
    <path d="M35 19 Q36 28 45 29 M29 45 Q28 36 19 35" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" fill="none"/>`,
    `<linearGradient id="hy-tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9A6F2"/><stop offset=".55" stop-color="#8A6EE0"/><stop offset="1" stop-color="#6A55F2"/></linearGradient>`,
  ),
  // ── 수학 Ⅳ. 기본 도형 — 점 → 선분 → 각도기 → 컴퍼스 → 삼각자 ──
  pointDeco: S(
    `${shadow(32, 54, 14, 0.13)}
    <circle cx="32" cy="32" r="19" fill="url(#po-bd)" stroke="#C86F00" stroke-width="1.8"/>
    <ellipse cx="25" cy="24" rx="6.5" ry="4" fill="#fff" opacity=".5"/>
    <circle cx="32" cy="32" r="6" fill="#3A4A5C" stroke="#22303F" stroke-width="1.2"/>
    <circle cx="30.2" cy="30.2" r="1.7" fill="#fff" opacity=".55"/>`,
    `<radialGradient id="po-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFD9A0"/><stop offset="1" stop-color="#F0A032"/></radialGradient>`,
  ),
  segmentDeco: S(
    `${shadow(32, 55, 17, 0.12)}
    <rect x="10" y="18" width="44" height="28" rx="9" fill="url(#sg-tl)" stroke="#C6D2DE" stroke-width="1.5"/>
    <ellipse cx="20" cy="23" rx="6" ry="2.6" fill="#fff" opacity=".65"/>
    <line x1="18" y1="32" x2="46" y2="32" stroke="url(#sg-ln)" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="18" cy="32" r="3.5" fill="#F08C00" stroke="#B26200" stroke-width="1.2"/>
    <circle cx="46" cy="32" r="3.5" fill="#F08C00" stroke="#B26200" stroke-width="1.2"/>`,
    `<linearGradient id="sg-tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF2F8"/></linearGradient>
    <linearGradient id="sg-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5C6E80"/><stop offset="1" stop-color="#3A4A5C"/></linearGradient>`,
  ),
  protracDeco: S(
    `${shadow(32, 52, 18, 0.13)}
    <path d="M10 44 a22 22 0 0 1 44 0 z" fill="url(#pt-bd)" stroke="#0E7A92" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M16 44 a16 16 0 0 1 32 0" fill="none" stroke="#FFFFFF" stroke-width="1.3" opacity=".65"/>
    <g stroke="#0E7A92" stroke-width="1.5" stroke-linecap="round">
      <path d="M32 44 L32 29"/><path d="M32 44 L21 33"/><path d="M32 44 L43 33"/>
    </g>
    <circle cx="32" cy="44" r="2.5" fill="#0E7A92"/>
    <ellipse cx="24" cy="29" rx="6" ry="3" fill="#fff" opacity=".45"/>`,
    `<linearGradient id="pt-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDEBF5"/><stop offset="1" stop-color="#5FC0D6"/></linearGradient>`,
  ),
  compassDeco: S(
    `${shadow(32, 57, 16, 0.13)}
    <path d="M21 51 a26 26 0 0 1 22 0" fill="none" stroke="#F0A032" stroke-width="2" stroke-dasharray="3 4" opacity=".85"/>
    <path d="M31 17 L21 49" stroke="url(#cp-lg)" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M33 17 L43 49" stroke="url(#cp-lg2)" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M43 49 l1.6 3.6" stroke="#B26200" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="32" cy="14" r="4.6" fill="url(#cp-hd)" stroke="#7A5800" stroke-width="1.3"/>
    <ellipse cx="30.4" cy="12.4" rx="2" ry="1.2" fill="#fff" opacity=".6"/>`,
    `<radialGradient id="cp-hd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#F2B430"/></radialGradient>
    <linearGradient id="cp-lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2CCD8"/><stop offset="1" stop-color="#8C99A8"/></linearGradient>
    <linearGradient id="cp-lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AEB9C6"/><stop offset="1" stop-color="#7C8998"/></linearGradient>`,
  ),
  trisqDeco: S(
    `${shadow(32, 56, 17, 0.13)}
    <path d="M14 50 L50 50 L14 16 Z" fill="url(#ts-bd)" stroke="#0C8A5E" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M22 44 L37 44 L22 29 Z" fill="#F2FBF7" stroke="#0C8A5E" stroke-width="1.1" opacity=".92"/>
    <path d="M14 44 h6 v6" fill="none" stroke="#0C8A5E" stroke-width="1.4" opacity=".8"/>
    <ellipse cx="20" cy="25" rx="4.5" ry="2.4" fill="#fff" opacity=".5" transform="rotate(45 20 25)"/>`,
    `<linearGradient id="ts-bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FE6C2"/><stop offset=".55" stop-color="#2FC495"/><stop offset="1" stop-color="#12B886"/></linearGradient>`,
  ),
  // ── 수학 Ⅴ. 평면도형과 입체도형 — 오각형 → 부채꼴 → 주사위 → 원뿔 → 구(평면에서 입체로) ──
  pentaDeco: S(
    `${shadow(32, 55, 16, 0.13)}
    <path d="M32 12 L51 26 L44 49 L20 49 L13 26 Z" fill="url(#pn5-bd)" stroke="#1E7A31" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M32 12 L44 49 M32 12 L20 49 M13 26 L44 49 M51 26 L20 49 M13 26 L51 26" stroke="#FFFFFF" stroke-width="1.2" opacity=".55"/>
    <ellipse cx="24" cy="21" rx="6" ry="3.2" fill="#fff" opacity=".5" transform="rotate(-18 24 21)"/>`,
    `<linearGradient id="pn5-bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ADCA0"/><stop offset=".55" stop-color="#3FB556"/><stop offset="1" stop-color="#2F9E44"/></linearGradient>`,
  ),
  fanDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <path d="M32 52 L12 24 A24.4 24.4 0 0 1 52 24 Z" fill="url(#fa-bd)" stroke="#B0662A" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M32 52 L22 19 M32 52 L32 15 M32 52 L42 19" stroke="#8C4E1E" stroke-width="1.3" opacity=".7"/>
    <path d="M14.5 21 A26 26 0 0 1 49.5 21" fill="none" stroke="#FFE3C2" stroke-width="2" opacity=".8"/>
    <circle cx="32" cy="52" r="3" fill="#8C4E1E" stroke="#5F340F" stroke-width="1"/>
    <ellipse cx="24" cy="22" rx="5.5" ry="3" fill="#fff" opacity=".45" transform="rotate(-24 24 22)"/>`,
    `<linearGradient id="fa-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A8"/><stop offset=".55" stop-color="#F2A65A"/><stop offset="1" stop-color="#E08A3C"/></linearGradient>`,
  ),
  diceDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <path d="M32 10 L50 19 L50 41 L32 50 L14 41 L14 19 Z" fill="url(#di-bd)" stroke="#8C1F30" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M14 19 L32 28 L50 19 M32 28 L32 50" stroke="#8C1F30" stroke-width="1.4" opacity=".85"/>
    <path d="M32 10 L50 19 L32 28 L14 19 Z" fill="#FFFFFF" opacity=".28"/>
    <circle cx="32" cy="19" r="2.6" fill="#FFF6F0"/>
    <circle cx="21" cy="33" r="2.2" fill="#FFF6F0"/><circle cx="25" cy="42" r="2.2" fill="#FFF6F0"/>
    <circle cx="43" cy="33" r="2" fill="#FFF6F0"/><circle cx="39" cy="42" r="2" fill="#FFF6F0"/><circle cx="41" cy="37.5" r="2" fill="#FFF6F0"/>`,
    `<linearGradient id="di-bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F27D8E"/><stop offset=".55" stop-color="#D9435C"/><stop offset="1" stop-color="#B62B44"/></linearGradient>`,
  ),
  coneDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <path d="M32 10 L16 46 A16 5.6 0 0 0 48 46 Z" fill="url(#co-bd)" stroke="#0E7A92" stroke-width="1.7" stroke-linejoin="round"/>
    <ellipse cx="32" cy="46" rx="16" ry="5.6" fill="url(#co-tp)" stroke="#0E7A92" stroke-width="1.5"/>
    <path d="M27 18 q-2 10 -4 22" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
    <circle cx="32" cy="10" r="2.4" fill="#FFD44A" stroke="#B98A00" stroke-width="1"/>`,
    `<linearGradient id="co-bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9FE0EF"/><stop offset=".55" stop-color="#3FB2CC"/><stop offset="1" stop-color="#1690AC"/></linearGradient>
    <linearGradient id="co-tp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6F2F8"/><stop offset="1" stop-color="#7FCDDF"/></linearGradient>`,
  ),
  sphereDeco: S(
    `${shadow(32, 56, 15, 0.13)}
    <circle cx="32" cy="33" r="19" fill="url(#sp5-bd)" stroke="#5F42C9" stroke-width="1.7"/>
    <ellipse cx="32" cy="33" rx="19" ry="6.5" fill="none" stroke="#FFFFFF" stroke-width="1.3" opacity=".55"/>
    <path d="M32 14 A19 19 0 0 0 32 52 M32 14 A9 19 0 0 0 32 52 M32 14 A9 19 0 0 1 32 52" fill="none" stroke="#FFFFFF" stroke-width="1.1" opacity=".4"/>
    <ellipse cx="25" cy="24" rx="6.5" ry="4.2" fill="#fff" opacity=".55" transform="rotate(-22 25 24)"/>`,
    `<radialGradient id="sp5-bd" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#C4B2F8"/><stop offset=".55" stop-color="#8A6EE0"/><stop offset="1" stop-color="#6A55F2"/></radialGradient>`,
  ),
  // ── 수학 Ⅵ. 통계 — 평균 시소 → 줄기 선반 → 히스토그램 → 도수분포다각형 → 상대도수 비율 ──
  seesawDeco: S(
    `${shadow(32, 56, 17, 0.13)}
    <path d="M26 50 L32 38 L38 50 Z" fill="url(#ss-tr)" stroke="#8C5A12" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="8" y="32" width="48" height="5" rx="2.5" fill="url(#ss-bd)" stroke="#1F2E8C" stroke-width="1.3" transform="rotate(-8 32 35)"/>
    <circle cx="14" cy="28" r="5" fill="url(#ss-b1)" stroke="#1F2E8C" stroke-width="1.3"/>
    <circle cx="50" cy="33.5" r="7" fill="url(#ss-b2)" stroke="#8C1F30" stroke-width="1.3"/>
    <ellipse cx="12.5" cy="26.5" rx="1.7" ry="1.1" fill="#fff" opacity=".6"/>`,
    `<linearGradient id="ss-tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C468"/><stop offset="1" stop-color="#D89A1E"/></linearGradient>
    <linearGradient id="ss-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient>
    <radialGradient id="ss-b1" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#9FD4F2"/><stop offset="1" stop-color="#3E8FC4"/></radialGradient>
    <radialGradient id="ss-b2" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F27D8E"/><stop offset="1" stop-color="#C93A52"/></radialGradient>`,
  ),
  stemshelfDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <rect x="10" y="12" width="44" height="40" rx="6" fill="url(#sh-bd)" stroke="#8C5A2E" stroke-width="1.6"/>
    <line x1="22" y1="14" x2="22" y2="50" stroke="#8C5A2E" stroke-width="2"/>
    <line x1="12" y1="25" x2="52" y2="25" stroke="#8C5A2E" stroke-width="1.4" opacity=".7"/>
    <line x1="12" y1="38" x2="52" y2="38" stroke="#8C5A2E" stroke-width="1.4" opacity=".7"/>
    <rect x="26" y="17" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="32" y="17" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="38" y="17" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="26" y="30" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="32" y="30" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="26" y="43" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="32" y="43" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="38" y="43" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/><rect x="44" y="43" width="4.6" height="6" rx="1.2" fill="url(#sh-bk)" stroke="#1F2E8C" stroke-width="1"/>
    <ellipse cx="18" cy="17" rx="3" ry="1.6" fill="#fff" opacity=".4"/>`,
    `<linearGradient id="sh-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAD9BC"/><stop offset="1" stop-color="#CDB488"/></linearGradient>
    <linearGradient id="sh-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient>`,
  ),
  histoDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <line x1="10" y1="50" x2="54" y2="50" stroke="#3A4A5C" stroke-width="2" stroke-linecap="round"/>
    <rect x="12" y="38" width="10" height="12" fill="url(#hs-b1)" stroke="#1F2E8C" stroke-width="1.2"/>
    <rect x="22" y="24" width="10" height="26" fill="url(#hs-b2)" stroke="#1F2E8C" stroke-width="1.2"/>
    <rect x="32" y="14" width="10" height="36" fill="url(#hs-b3)" stroke="#1F2E8C" stroke-width="1.2"/>
    <rect x="42" y="30" width="10" height="20" fill="url(#hs-b2)" stroke="#1F2E8C" stroke-width="1.2"/>
    <ellipse cx="36" cy="18" rx="2.6" ry="1.4" fill="#fff" opacity=".5"/>`,
    `<linearGradient id="hs-b1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9C3F5"/><stop offset="1" stop-color="#7787E8"/></linearGradient>
    <linearGradient id="hs-b2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient>
    <linearGradient id="hs-b3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6272E3"/><stop offset="1" stop-color="#2839A0"/></linearGradient>`,
  ),
  fpolyDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <line x1="10" y1="50" x2="54" y2="50" stroke="#3A4A5C" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 50 L18 40 L26 24 L34 16 L42 30 L50 44 L54 50" fill="url(#fp-fl)" fill-opacity=".35" stroke="none"/>
    <path d="M10 50 L18 40 L26 24 L34 16 L42 30 L50 44 L54 50" fill="none" stroke="url(#fp-ln)" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="18" cy="40" r="2.6" fill="#FFFFFF" stroke="#2839A0" stroke-width="1.4"/><circle cx="26" cy="24" r="2.6" fill="#FFFFFF" stroke="#2839A0" stroke-width="1.4"/><circle cx="34" cy="16" r="2.6" fill="#FFFFFF" stroke="#2839A0" stroke-width="1.4"/><circle cx="42" cy="30" r="2.6" fill="#FFFFFF" stroke="#2839A0" stroke-width="1.4"/><circle cx="50" cy="44" r="2.6" fill="#FFFFFF" stroke="#2839A0" stroke-width="1.4"/>`,
    `<linearGradient id="fp-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#E8EBFA"/></linearGradient>
    <linearGradient id="fp-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4759CE"/><stop offset="1" stop-color="#2839A0"/></linearGradient>`,
  ),
  ratioDeco: S(
    `${shadow(32, 55, 15, 0.13)}
    <circle cx="32" cy="32" r="19" fill="url(#rt-a)" stroke="#1F2E8C" stroke-width="1.6"/>
    <path d="M32 32 L32 13 A19 19 0 0 1 50.2 37.4 Z" fill="url(#rt-b)" stroke="#1F2E8C" stroke-width="1.4"/>
    <ellipse cx="25" cy="23" rx="5.5" ry="3.4" fill="#fff" opacity=".45" transform="rotate(-20 25 23)"/>`,
    `<radialGradient id="rt-a" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#B9C3F5"/><stop offset="1" stop-color="#7787E8"/></radialGradient>
    <linearGradient id="rt-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>`,
  ),
  // ── 중2 수학 Ⅰ. 유리수의 표현과 식의 계산 — 계산기 → 반복 테이프 → 무한 리본 → 지수 탑 → 항 칩 ──
  calcDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <rect x="14" y="10" width="36" height="44" rx="7" fill="url(#cc-bd)" stroke="#5E2470" stroke-width="1.6"/>
    <rect x="19" y="15" width="26" height="12" rx="3.5" fill="url(#cc-sc)" stroke="#5E2470" stroke-width="1.2"/>
    <circle cx="27" cy="21" r="1.6" fill="#7D2A93"/><circle cx="32" cy="21" r="1.6" fill="#7D2A93"/><circle cx="37" cy="21" r="1.6" fill="#7D2A93"/>
    <g fill="url(#cc-k)" stroke="#5E2470" stroke-width="1">
      <rect x="19" y="31" width="7.4" height="6.4" rx="2.4"/><rect x="28.3" y="31" width="7.4" height="6.4" rx="2.4"/><rect x="37.6" y="31" width="7.4" height="6.4" rx="2.4"/>
      <rect x="19" y="40" width="7.4" height="6.4" rx="2.4"/><rect x="28.3" y="40" width="7.4" height="6.4" rx="2.4"/>
    </g>
    <rect x="37.6" y="40" width="7.4" height="6.4" rx="2.4" fill="url(#cc-eq)" stroke="#5E2470" stroke-width="1"/>
    <ellipse cx="22" cy="14" rx="4.6" ry="2" fill="#fff" opacity=".5"/>`,
    `<linearGradient id="cc-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77BD6"/><stop offset=".5" stop-color="#9C36B5"/><stop offset="1" stop-color="#7D2A93"/></linearGradient>
    <linearGradient id="cc-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3FD"/><stop offset="1" stop-color="#E8D3EF"/></linearGradient>
    <linearGradient id="cc-k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E4F8"/><stop offset="1" stop-color="#D9B5E4"/></linearGradient>
    <linearGradient id="cc-eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>`,
  ),
  tapeDeco: S(
    `${shadow(30, 56, 18, 0.13)}
    <path d="M14 44 h38 v9 h-38 z" fill="url(#tp-st)" stroke="#5E2470" stroke-width="1.3"/>
    <g stroke="#9C36B5" stroke-width="2.2" opacity=".8"><path d="M19 44 v9"/><path d="M29 44 v9"/><path d="M39 44 v9"/><path d="M49 44 v9"/></g>
    <g stroke="#E8A93E" stroke-width="2.2" opacity=".85"><path d="M24 44 v9"/><path d="M34 44 v9"/><path d="M44 44 v9"/></g>
    <circle cx="30" cy="28" r="16" fill="url(#tp-rl)" stroke="#5E2470" stroke-width="1.6"/>
    <circle cx="30" cy="28" r="6.5" fill="url(#tp-co)" stroke="#5E2470" stroke-width="1.2"/>
    <ellipse cx="24" cy="20" rx="5" ry="3" fill="#fff" opacity=".55" transform="rotate(-24 24 20)"/>`,
    `<radialGradient id="tp-rl" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#E3B9EE"/><stop offset=".55" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></radialGradient>
    <linearGradient id="tp-co" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3FD"/><stop offset="1" stop-color="#E0C4EA"/></linearGradient>
    <linearGradient id="tp-st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCF7FE"/><stop offset="1" stop-color="#EEDDF4"/></linearGradient>`,
  ),
  loopDeco: S(
    `${shadow(32, 54, 17, 0.12)}
    <path d="M18 32 C18 22 30 22 32 30 C34 38 46 38 46 28 C46 20 36 19 32 26 C28 33 18 42 18 32 Z"
      fill="none" stroke="url(#lp-a)" stroke-width="6.5" stroke-linecap="round" opacity=".35"/>
    <path d="M32 30 C30 22 18 22 18 32 C18 42 28 33 32 26 C36 19 46 20 46 28 C46 38 34 38 32 30 Z"
      fill="none" stroke="url(#lp-b)" stroke-width="4.6" stroke-linecap="round"/>
    <circle cx="46" cy="28" r="3.4" fill="url(#lp-dot)" stroke="#8C5A12" stroke-width="1.1"/>
    <ellipse cx="24" cy="24" rx="4.4" ry="2.2" fill="#fff" opacity=".5" transform="rotate(-18 24 24)"/>`,
    `<linearGradient id="lp-a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E3B9EE"/><stop offset="1" stop-color="#C77BD6"/></linearGradient>
    <linearGradient id="lp-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B85CCB"/><stop offset=".5" stop-color="#9C36B5"/><stop offset="1" stop-color="#7D2A93"/></linearGradient>
    <radialGradient id="lp-dot" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),
  powtowerDeco: S(
    `${shadow(32, 57, 18, 0.13)}
    <rect x="24" y="40" width="16" height="14" rx="3.5" fill="url(#pw-a)" stroke="#5E2470" stroke-width="1.5"/>
    <rect x="26.5" y="26" width="11" height="11" rx="3" fill="url(#pw-b)" stroke="#5E2470" stroke-width="1.4"/>
    <rect x="28.6" y="15.5" width="6.8" height="7.5" rx="2.4" fill="url(#pw-c)" stroke="#5E2470" stroke-width="1.2"/>
    <circle cx="43" cy="14" r="5.2" fill="url(#pw-sun)" stroke="#8C5A12" stroke-width="1.2"/>
    <ellipse cx="28" cy="43" rx="4" ry="2" fill="#fff" opacity=".5"/>
    <ellipse cx="41.5" cy="12.4" rx="1.8" ry="1.1" fill="#fff" opacity=".6"/>`,
    `<linearGradient id="pw-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>
    <linearGradient id="pw-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A0E5"/><stop offset="1" stop-color="#B85CCB"/></linearGradient>
    <linearGradient id="pw-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDD3F4"/><stop offset="1" stop-color="#D9A0E5"/></linearGradient>
    <radialGradient id="pw-sun" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A6"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),
  termchipDeco: S(
    `${shadow(32, 55, 17, 0.13)}
    <rect x="12" y="30" width="24" height="17" rx="8.5" fill="url(#tc-a)" stroke="#5E2470" stroke-width="1.5" transform="rotate(-7 24 38)"/>
    <rect x="28" y="22" width="24" height="17" rx="8.5" fill="url(#tc-b)" stroke="#8C5A12" stroke-width="1.5" transform="rotate(6 40 30)"/>
    <text x="24" y="42.5" text-anchor="middle" font-size="11" font-style="italic" font-weight="800" fill="#FFFFFF" transform="rotate(-7 24 38)">a</text>
    <text x="40" y="34.5" text-anchor="middle" font-size="11" font-style="italic" font-weight="800" fill="#7A4A0E" transform="rotate(6 40 30)">a</text>
    <ellipse cx="18" cy="32.5" rx="3.6" ry="1.8" fill="#fff" opacity=".5" transform="rotate(-7 18 32.5)"/>
    <ellipse cx="34" cy="24.5" rx="3.6" ry="1.8" fill="#fff" opacity=".6" transform="rotate(6 34 24.5)"/>`,
    `<linearGradient id="tc-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#8C2FA3"/></linearGradient>
    <linearGradient id="tc-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#EDAF45"/></linearGradient>`,
  ),
  // ── 중2 V. 식물과 에너지 — 잎 → 기공 → 엽록체 → 꽃 → 열매 ──
  leafDeco: S(
    `${shadow(32, 55, 18, 0.12)}
    <path d="M11 43 C13 16 39 8 54 13 C52 35 39 52 13 50 Z" fill="url(#pl-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.6"/>
    <path d="M15 47 C27 36 36 26 50 16" fill="none" stroke="var(--plant-vein)" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M27 36 L23 25 M35 29 L34 19 M37 28 L47 29" fill="none" stroke="var(--plant-vein)" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="23" cy="20" rx="7" ry="3" fill="var(--n0)" opacity=".32" transform="rotate(-28 23 20)"/>`,
    `<linearGradient id="pl-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".55" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>`,
  ),
  stomaDeco: S(
    `${shadow(32, 55, 17, 0.11)}
    <ellipse cx="32" cy="31" rx="25" ry="20" fill="url(#pl-skin)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
    <path d="M29 18 C15 19 14 44 28 45 C35 40 35 24 29 18 Z" fill="url(#pl-guard)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
    <path d="M35 18 C49 19 50 44 36 45 C29 40 29 24 35 18 Z" fill="url(#pl-guard)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
    <ellipse cx="32" cy="31.5" rx="4.2" ry="13" fill="var(--stage)"/>
    <ellipse cx="23" cy="23" rx="4.5" ry="2.3" fill="var(--n0)" opacity=".34" transform="rotate(-24 23 23)"/>`,
    `<linearGradient id="pl-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset="1" stop-color="var(--plant-leaf)"/></linearGradient>
    <linearGradient id="pl-guard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-vein)"/><stop offset="1" stop-color="var(--plant-leaf)"/></linearGradient>`,
  ),
  chloroplastDeco: S(
    `${shadow(32, 55, 18, 0.12)}
    <ellipse cx="32" cy="31" rx="25" ry="18" fill="url(#pl-chl)" stroke="var(--plant-leaf-lo)" stroke-width="1.8"/>
    ${[18, 27, 37, 46].map((x) => `<g fill="var(--plant-leaf-lo)" opacity=".78"><ellipse cx="${x}" cy="27" rx="4.3" ry="2"/><ellipse cx="${x}" cy="31" rx="4.3" ry="2"/><ellipse cx="${x}" cy="35" rx="4.3" ry="2"/></g>`).join("")}
    <path d="M13 31 C20 20 42 18 51 29" fill="none" stroke="var(--plant-vein)" stroke-width="1.3" opacity=".55"/>
    <ellipse cx="24" cy="19" rx="7" ry="3" fill="var(--n0)" opacity=".34" transform="rotate(-12 24 19)"/>`,
    `<radialGradient id="pl-chl" cx=".34" cy=".28" r=".9"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".58" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>`,
  ),
  flowerDeco: S(
    `${shadow(32, 56, 17, 0.11)}
    <path d="M32 51 C31 41 33 32 32 24" fill="none" stroke="var(--plant-leaf-lo)" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M32 40 C21 34 17 39 20 45 C25 44 29 42 32 40 Z" fill="url(#pl-fl)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
    ${[0,72,144,216,288].map((a) => `<ellipse cx="32" cy="20" rx="7" ry="12" fill="var(--n0)" stroke="var(--plant-leaf)" stroke-width="1.2" transform="rotate(${a} 32 28)"/>`).join("")}
    <circle cx="32" cy="28" r="7" fill="var(--plant-sun)" stroke="var(--plant-soil)" stroke-width="1.3"/>
    <ellipse cx="29" cy="25" rx="2.4" ry="1.4" fill="var(--n0)" opacity=".6"/>`,
    `<linearGradient id="pl-fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset="1" stop-color="var(--plant-leaf)"/></linearGradient>`,
  ),
  fruitDeco: S(
    `${shadow(32, 56, 18, 0.13)}
    <path d="M32 18 C31 12 34 9 38 7" fill="none" stroke="var(--plant-leaf-lo)" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 18 C23 12 13 18 13 31 C13 46 23 54 32 54 C41 54 51 46 51 31 C51 18 41 12 32 18 Z" fill="url(#pl-fruit)" stroke="var(--subj-plant-press)" stroke-width="1.6"/>
    <path d="M32 18 l-8 -5 2 8 -7 2 10 3 3 -8 3 8 10 -3 -7 -2 2 -8z" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1"/>
    <ellipse cx="23" cy="28" rx="5" ry="8" fill="var(--n0)" opacity=".32" transform="rotate(28 23 28)"/>`,
    `<radialGradient id="pl-fruit" cx=".32" cy=".25" r=".9"><stop offset="0" stop-color="var(--plant-sun)"/><stop offset=".32" stop-color="var(--red)"/><stop offset="1" stop-color="var(--red-press)"/></radialGradient>`,
  ),
  // ── 중2 VI. 동물과 에너지 — 소화 → 순환 → 호흡 → 배설 → 세포 ──
  stomachDeco: S(
    `${shadow(32, 56, 18, 0.12)}
    <path d="M27 10 C23 20 26 28 20 34 C14 40 15 51 24 54 C36 58 50 49 48 36 C46 27 39 29 36 21 C34 16 35 12 36 8 Z" fill="url(#bd-stomach)" stroke="var(--body-organ-lo)" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M35 12 C30 24 36 32 28 39 C24 43 25 49 30 51" fill="none" stroke="var(--body-tissue-hi)" stroke-width="2.2" stroke-linecap="round" opacity=".72"/>
    <ellipse cx="27" cy="25" rx="6" ry="3" fill="var(--n0)" opacity=".34" transform="rotate(-34 27 25)"/>`,
    `<radialGradient id="bd-stomach" cx=".3" cy=".24" r=".92"><stop offset="0" stop-color="var(--body-organ-hi)"/><stop offset=".56" stop-color="var(--body-organ)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></radialGradient>`,
  ),
  heartDeco: S(
    `${shadow(32, 56, 18, 0.13)}
    <path d="M31 54 C25 46 12 38 12 25 C12 15 25 11 32 21 C39 10 53 15 52 26 C51 38 40 46 31 54 Z" fill="url(#bd-heart)" stroke="var(--body-organ-lo)" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M31 22 C33 31 34 41 31 52" fill="none" stroke="var(--body-organ-lo)" stroke-width="1.2" opacity=".48"/>
    <path d="M31 21 C28 13 29 8 35 6 M39 18 C42 12 44 9 49 9" fill="none" stroke="var(--body-vessel-lo)" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M18 22 C20 17 25 16 28 20" fill="none" stroke="var(--n0)" stroke-width="2.4" stroke-linecap="round" opacity=".48"/>`,
    `<radialGradient id="bd-heart" cx=".3" cy=".22" r=".94"><stop offset="0" stop-color="var(--body-organ-hi)"/><stop offset=".52" stop-color="var(--body-oxygenated)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></radialGradient>`,
  ),
  lungDeco: S(
    `${shadow(32, 56, 20, 0.11)}
    <path d="M30 18 C25 16 18 18 14 26 C10 35 10 49 19 53 C27 56 30 48 30 40 Z" fill="url(#bd-lung-l)" stroke="var(--body-airway-lo)" stroke-width="1.5"/>
    <path d="M34 18 C39 16 46 18 50 26 C54 35 54 49 45 53 C37 56 34 48 34 40 Z" fill="url(#bd-lung-r)" stroke="var(--body-airway-lo)" stroke-width="1.5"/>
    <path d="M32 7 V25 M32 20 L23 30 M32 20 L41 30" fill="none" stroke="var(--body-airway-lo)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 27 C20 22 24 21 27 22" fill="none" stroke="var(--n0)" stroke-width="2.3" stroke-linecap="round" opacity=".52"/>`,
    `<linearGradient id="bd-lung-l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--body-airway-hi)"/><stop offset=".55" stop-color="var(--body-tissue-hi)"/><stop offset="1" stop-color="var(--body-tissue)"/></linearGradient>
    <linearGradient id="bd-lung-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--body-tissue-hi)"/><stop offset=".58" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>`,
  ),
  kidneyDeco: S(
    `${shadow(32, 56, 20, 0.12)}
    <path d="M27 13 C14 10 9 22 12 36 C14 48 23 54 30 47 C35 42 30 35 28 31 C24 24 35 18 27 13 Z" fill="url(#bd-kidney-l)" stroke="var(--body-kidney-lo)" stroke-width="1.6"/>
    <path d="M37 13 C50 10 55 22 52 36 C50 48 41 54 34 47 C29 42 34 35 36 31 C40 24 29 18 37 13 Z" fill="url(#bd-kidney-r)" stroke="var(--body-kidney-lo)" stroke-width="1.6"/>
    <path d="M27 37 C28 43 29 49 29 56 M37 37 C36 43 35 49 35 56" fill="none" stroke="var(--body-urea)" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="19" cy="22" rx="5" ry="2.5" fill="var(--n0)" opacity=".36" transform="rotate(-25 19 22)"/>`,
    `<radialGradient id="bd-kidney-l" cx=".28" cy=".23" r=".94"><stop offset="0" stop-color="var(--body-kidney-hi)"/><stop offset=".58" stop-color="var(--body-kidney)"/><stop offset="1" stop-color="var(--body-kidney-lo)"/></radialGradient>
    <linearGradient id="bd-kidney-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--body-kidney-hi)"/><stop offset=".55" stop-color="var(--body-kidney)"/><stop offset="1" stop-color="var(--body-kidney-lo)"/></linearGradient>`,
  ),
  cellDeco: S(
    `${shadow(32, 56, 20, 0.11)}
    <path d="M10 31 C9 18 19 9 32 10 C47 8 56 20 54 34 C56 47 44 55 31 53 C18 55 8 45 10 31 Z" fill="url(#bd-cell)" stroke="var(--body-cell-lo)" stroke-width="1.6"/>
    <circle cx="29" cy="31" r="8.5" fill="url(#bd-nucleus)" stroke="var(--body-organ-lo)" stroke-width="1.4"/>
    <path d="M39 21 C47 18 50 27 44 30 C38 33 35 25 39 21 Z M39 39 C46 35 50 43 44 47 C38 49 34 43 39 39 Z" fill="var(--body-organ)" stroke="var(--body-organ-lo)" stroke-width="1.2"/>
    <path d="M40 23 C42 25 45 25 47 23 M39 41 C42 43 45 42 47 40" fill="none" stroke="var(--body-tissue-hi)" stroke-width="1" opacity=".72"/>
    <ellipse cx="21" cy="18" rx="7" ry="3" fill="var(--n0)" opacity=".38" transform="rotate(-16 21 18)"/>`,
    `<radialGradient id="bd-cell" cx=".3" cy=".24" r=".95"><stop offset="0" stop-color="var(--body-cell-hi)"/><stop offset=".58" stop-color="var(--body-cell)"/><stop offset="1" stop-color="var(--body-cell-lo)"/></radialGradient>
    <radialGradient id="bd-nucleus" cx=".32" cy=".26" r=".92"><stop offset="0" stop-color="var(--body-protein)"/><stop offset="1" stop-color="var(--body-deoxygenated)"/></radialGradient>`,
  ),
  // ── 중2 수학 Ⅱ. 부등식과 연립방정식 — 제한 표지판 → 기운 저울 → 수직선 범위 → x·y 상자 쌍 → 꿩과 토끼 ──
  signDeco: S(
    `${shadow(32, 57, 14, 0.13)}
    <rect x="29.5" y="30" width="5" height="26" rx="2.5" fill="url(#sg-pole)" stroke="#6B4210" stroke-width="1.2"/>
    <circle cx="32" cy="20" r="15" fill="url(#sg-face)" stroke="#7F4A12" stroke-width="2"/>
    <path d="M39 13 L26 20 L39 27" fill="none" stroke="#7F4A12" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="26" cy="12.5" rx="5" ry="2.6" fill="#fff" opacity=".55" transform="rotate(-18 26 12.5)"/>`,
    `<linearGradient id="sg-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3D"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <radialGradient id="sg-face" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FDF3E4"/><stop offset="1" stop-color="#F2D9AE"/></radialGradient>`,
  ),
  tiltDeco: S(
    `${shadow(32, 57, 17, 0.13)}
    <path d="M26 54 L32 42 L38 54 Z" fill="url(#tl-base)" stroke="#6B4210" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="10" y="30" width="44" height="4.6" rx="2.3" fill="url(#tl-beam)" stroke="#6B4210" stroke-width="1.2" transform="rotate(-12 32 32)"/>
    <path d="M15 24 v6 M12 33 a5.5 3.2 0 0 0 11 0 z" fill="url(#tl-pan)" stroke="#6B4210" stroke-width="1.2" transform="rotate(-12 32 32)"/>
    <path d="M49 24 v6 M46 33 a5.5 3.2 0 0 0 11 0 z" fill="url(#tl-pan)" stroke="#6B4210" stroke-width="1.2" transform="rotate(-12 32 32)"/>
    <circle cx="14.5" cy="27" r="4.6" fill="url(#tl-big)" stroke="#6B4210" stroke-width="1.1"/>
    <circle cx="51" cy="17" r="3" fill="url(#tl-small)" stroke="#8C1F30" stroke-width="1.1"/>
    <ellipse cx="13" cy="25.4" rx="1.6" ry="1" fill="#fff" opacity=".6"/>`,
    `<linearGradient id="tl-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3B476"/><stop offset="1" stop-color="#A9631B"/></linearGradient>
    <linearGradient id="tl-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A45C"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <linearGradient id="tl-pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D9AE"/><stop offset="1" stop-color="#C98A3D"/></linearGradient>
    <radialGradient id="tl-big" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#B7A2E8"/><stop offset="1" stop-color="#7C5CE8"/></radialGradient>
    <radialGradient id="tl-small" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F58C9C"/><stop offset="1" stop-color="#D8465C"/></radialGradient>`,
  ),
  rangeDeco: S(
    `${shadow(32, 54, 18, 0.12)}
    <line x1="8" y1="38" x2="56" y2="38" stroke="#8C5A1E" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M56 38 l-6 -3.4 v6.8 z" fill="#8C5A1E"/>
    ${[16, 26, 36, 46].map((x) => `<line x1="${x}" y1="34.5" x2="${x}" y2="41.5" stroke="#C98A3D" stroke-width="1.6"/>`).join("")}
    <circle cx="26" cy="38" r="4.6" fill="url(#rg-dot)" stroke="#6B4210" stroke-width="1.4"/>
    <path d="M26 27 h22" stroke="url(#rg-arr)" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M48 27 l-5.5 -3.2 v6.4 z" fill="#E8A93E"/>
    <ellipse cx="24.4" cy="36.4" rx="1.6" ry="1" fill="#fff" opacity=".65"/>`,
    `<radialGradient id="rg-dot" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#E3B476"/><stop offset="1" stop-color="#A9631B"/></radialGradient>
    <linearGradient id="rg-arr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2C468"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>`,
  ),
  duoboxDeco: S(
    `${shadow(32, 56, 18, 0.13)}
    <rect x="10" y="28" width="22" height="24" rx="5" fill="url(#db-a)" stroke="#6B4210" stroke-width="1.5"/>
    <rect x="32" y="24" width="24" height="28" rx="5" fill="url(#db-b)" stroke="#27408B" stroke-width="1.5"/>
    <path d="M10 36 h22 M32 33 h24" stroke="#FFFFFF" stroke-width="1.2" opacity=".35"/>
    <text x="21" y="46" text-anchor="middle" font-size="13" font-style="italic" font-weight="800" fill="#FFF7EA">x</text>
    <text x="44" y="44" text-anchor="middle" font-size="13" font-style="italic" font-weight="800" fill="#EAF0FF">y</text>
    <path d="M21 28 q11 -12 23 -4" fill="none" stroke="#8C5A1E" stroke-width="2" stroke-dasharray="3 3"/>
    <ellipse cx="16" cy="31" rx="3.4" ry="1.7" fill="#fff" opacity=".5"/>
    <ellipse cx="38" cy="27.5" rx="3.4" ry="1.7" fill="#fff" opacity=".5"/>`,
    `<linearGradient id="db-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A45C"/><stop offset="1" stop-color="#A9631B"/></linearGradient>
    <linearGradient id="db-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C93E8"/><stop offset="1" stop-color="#3D5BC0"/></linearGradient>`,
  ),
  birdrabbitDeco: S(
    `${shadow(32, 57, 19, 0.13)}
    <path d="M14 40 h36 l-4 16 h-28 z" fill="url(#br-bk)" stroke="#6B4210" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M17 44 h30 M18.5 49 h27" stroke="#8C5A1E" stroke-width="1.2" opacity=".55"/>
    <circle cx="24" cy="34" r="6.5" fill="url(#br-bird)" stroke="#245A38" stroke-width="1.3"/>
    <path d="M30 33 l5 1.6 -5 1.8 z" fill="#E8A93E" stroke="#8C5A1E" stroke-width=".8"/>
    <circle cx="22.6" cy="32.4" r="1" fill="#1E2A38"/>
    <path d="M20 29 q-2.5 -4 0.5 -6.5" fill="none" stroke="#245A38" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="43" cy="35" r="6" fill="url(#br-rab)" stroke="#8C6A4A" stroke-width="1.3"/>
    <path d="M40 30 q-1.4 -7 1.8 -8.5 q1.6 4.5 0.6 8.2 M46 30 q1.4 -7 -1.8 -8.5 q-1.6 4.5 -0.6 8.2" fill="url(#br-ear)" stroke="#8C6A4A" stroke-width="1.1"/>
    <circle cx="41.4" cy="33.6" r="1" fill="#1E2A38"/><circle cx="45" cy="33.6" r="1" fill="#1E2A38"/>
    <ellipse cx="20" cy="42.5" rx="4" ry="1.8" fill="#fff" opacity=".35"/>`,
    `<linearGradient id="br-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3B476"/><stop offset="1" stop-color="#B57226"/></linearGradient>
    <radialGradient id="br-bird" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FC79A"/><stop offset="1" stop-color="#3E8B5E"/></radialGradient>
    <radialGradient id="br-rab" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FBF3E8"/><stop offset="1" stop-color="#DFC5A8"/></radialGradient>
    <linearGradient id="br-ear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3E8"/><stop offset="1" stop-color="#E8CBAF"/></linearGradient>`,
  ),

  // ── 중2 수학 Ⅲ. 일차함수 — 함수 기계에서 교점까지(틸 그린) ──────────
  funcboxDeco: S(
    `${shadow(32, 56, 16, 0.13)}
    <circle cx="20" cy="12" r="5" fill="url(#fb-in)" stroke="#065F46" stroke-width="1.3"/>
    <path d="M24 15 q6 4 8 9" fill="none" stroke="#0CA678" stroke-width="1.8" stroke-dasharray="3 3" stroke-linecap="round"/>
    <rect x="16" y="24" width="32" height="20" rx="6" fill="url(#fb-bd)" stroke="#065F46" stroke-width="1.6"/>
    <text x="32" y="38.5" text-anchor="middle" font-size="13" font-style="italic" font-weight="800" fill="#EAFBF4">f</text>
    <path d="M32 44 v6" stroke="#0CA678" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="32" cy="53" r="4.2" fill="url(#fb-out)" stroke="#065F46" stroke-width="1.3"/>
    <ellipse cx="22" cy="27" rx="5" ry="2" fill="#fff" opacity=".45"/>`,
    `<linearGradient id="fb-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ECBA0"/><stop offset=".55" stop-color="#0CA678"/><stop offset="1" stop-color="#08815D"/></linearGradient>
    <radialGradient id="fb-in" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#BFEFDD"/><stop offset="1" stop-color="#59C8A2"/></radialGradient>
    <radialGradient id="fb-out" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A0"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),
  duolineDeco: S(
    `${shadow(32, 55, 17, 0.12)}
    <line x1="12" y1="50" x2="54" y2="50" stroke="#5E6C78" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="16" y1="54" x2="16" y2="12" stroke="#5E6C78" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 46 L50 18" stroke="url(#dl-a)" stroke-width="4" stroke-linecap="round"/>
    <path d="M12 34 L44 10" stroke="url(#dl-b)" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <path d="M30 30 q-4 -5 -1.5 -9" fill="none" stroke="#E8A93E" stroke-width="2" stroke-dasharray="3 2.4" stroke-linecap="round"/>
    <path d="M28.5 21 l1.6 3 -3.3 .4 z" fill="#E8A93E"/>`,
    `<linearGradient id="dl-a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0CA678"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <linearGradient id="dl-b" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#08815D"/><stop offset="1" stop-color="#0CA678"/></linearGradient>`,
  ),
  axisdotDeco: S(
    `${shadow(32, 55, 16, 0.12)}
    <line x1="8" y1="40" x2="56" y2="40" stroke="#5E6C78" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="22" y1="54" x2="22" y2="8" stroke="#5E6C78" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M10 52 L52 14" stroke="url(#ad-l)" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="35.3" cy="29" r="4.4" fill="url(#ad-x)" stroke="#065F46" stroke-width="1.4" transform="translate(3.4 11)"/>
    <circle cx="22" cy="41.2" r="4.4" fill="url(#ad-y)" stroke="#9C5A10" stroke-width="1.4" transform="translate(0 -20.4)"/>
    <ellipse cx="37.4" cy="38.4" rx="1.5" ry="1" fill="#fff" opacity=".6"/>`,
    `<linearGradient id="ad-l" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#08815D"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <radialGradient id="ad-x" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FE0BD"/><stop offset="1" stop-color="#0CA678"/></radialGradient>
    <radialGradient id="ad-y" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),
  slopetriDeco: S(
    `${shadow(32, 56, 17, 0.12)}
    <path d="M10 52 L54 16" stroke="url(#sp-l)" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 44 h18 v-15" fill="none" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 3"/>
    <circle cx="20" cy="44" r="3.6" fill="url(#sp-d)" stroke="#065F46" stroke-width="1.2"/>
    <circle cx="38" cy="29.2" r="3.6" fill="url(#sp-d)" stroke="#065F46" stroke-width="1.2"/>
    <ellipse cx="19" cy="42.8" rx="1.3" ry=".9" fill="#fff" opacity=".6"/>`,
    `<linearGradient id="sp-l" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#08815D"/><stop offset=".6" stop-color="#0CA678"/><stop offset="1" stop-color="#4ECBA0"/></linearGradient>
    <radialGradient id="sp-d" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FE0BD"/><stop offset="1" stop-color="#0A8F67"/></radialGradient>`,
  ),
  crosspointDeco: S(
    `${shadow(32, 56, 18, 0.12)}
    <path d="M8 18 L56 46" stroke="url(#cp-a)" stroke-width="4" stroke-linecap="round"/>
    <path d="M8 48 L56 14" stroke="url(#cp-b)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32.6" cy="32.4" r="5.6" fill="url(#cp-p)" stroke="#9C5A10" stroke-width="1.6"/>
    <g stroke="#FFD98A" stroke-width="1.6" stroke-linecap="round" opacity=".9">
      <path d="M32.6 22.6 v-3.4"/><path d="M32.6 42.2 v3.4"/><path d="M22.8 32.4 h-3.4"/><path d="M42.4 32.4 h3.4"/>
    </g>
    <ellipse cx="30.8" cy="30.4" rx="1.8" ry="1.2" fill="#fff" opacity=".65"/>`,
    `<linearGradient id="cp-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ECBA0"/><stop offset="1" stop-color="#0CA678"/></linearGradient>
    <linearGradient id="cp-b" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#08815D"/><stop offset="1" stop-color="#2BBA8C"/></linearGradient>
    <radialGradient id="cp-p" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE3A0"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`,
  ),

  // ── 중2 수학 Ⅳ. 삼각형과 사각형의 성질 — 이등변 옷걸이에서 마름모 연까지(블루프린트 코발트) ──
  hangerDeco: S(
    `${shadow(32, 56, 16, 0.12)}
    <path d="M32 10 q6 0 6 5 q0 4 -4 5" fill="none" stroke="#6E7C8C" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="23" r="2.6" fill="url(#hg-knob)" stroke="#0F4674" stroke-width="1.2"/>
    <path d="M32 24 L10 46 L54 46 Z" fill="url(#hg-tri)" stroke="#0F4674" stroke-width="2" stroke-linejoin="round"/>
    <path d="M32 24 L10 46 L54 46 Z" fill="none" stroke="#fff" stroke-width=".8" opacity=".25" transform="translate(0 1.2) scale(.96) translate(1.3 1.4)"/>
    <path d="M20.4 36.6 l2.5 2.4 M21.6 35.4 l2.5 2.4" stroke="#E8A93E" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M41.1 39 l2.5 -2.4 M39.9 37.8 l2.5 -2.4" stroke="#E8A93E" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="24" cy="32" rx="4" ry="1.6" fill="#fff" opacity=".4" transform="rotate(-45 24 32)"/>`,
    `<linearGradient id="hg-tri" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset=".55" stop-color="#1971C2"/><stop offset="1" stop-color="#12579B"/></linearGradient>
    <radialGradient id="hg-knob" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#A9CDF2"/><stop offset="1" stop-color="#4C90D6"/></radialGradient>`,
  ),
  sealDeco: S(
    `${shadow(32, 57, 14, 0.13)}
    <path d="M24 12 q8 -6 16 0 q2 2 0 5 l-3 4 h-10 l-3 -4 q-2 -3 0 -5 z" fill="url(#sl-grip)" stroke="#0F4674" stroke-width="1.8"/>
    <rect x="23" y="21" width="18" height="7" rx="2.4" fill="url(#sl-neck)" stroke="#0F4674" stroke-width="1.5"/>
    <path d="M20 28 h24 l3 10 h-30 z" fill="url(#sl-base)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="14" y="44" width="36" height="12" rx="3" fill="url(#sl-paper)" stroke="#B8C6D6" stroke-width="1.3"/>
    <path d="M27 50 l3.4 3.6 L37.5 46" fill="none" stroke="url(#sl-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="28" cy="13.6" rx="4.6" ry="1.8" fill="#fff" opacity=".45"/>`,
    `<linearGradient id="sl-grip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset="1" stop-color="#1E6AB2"/></linearGradient>
    <linearGradient id="sl-neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C86CC"/><stop offset="1" stop-color="#15619F"/></linearGradient>
    <linearGradient id="sl-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B79C0"/><stop offset="1" stop-color="#114E85"/></linearGradient>
    <linearGradient id="sl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9F0F7"/></linearGradient>
    <linearGradient id="sl-ink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2B79C0"/><stop offset="1" stop-color="#1971C2"/></linearGradient>`,
  ),
  circumDeco: S(
    `${shadow(32, 57, 17, 0.12)}
    <circle cx="32" cy="32" r="22" fill="url(#cc-disk)" stroke="#0F4674" stroke-width="2"/>
    <path d="M32 12.5 L14.6 41 L51 38 Z" fill="url(#cc-tri)" stroke="#0F4674" stroke-width="1.7" stroke-linejoin="round" opacity=".92"/>
    <circle cx="32" cy="33.5" r="2.4" fill="#E8A93E" stroke="#9C5A10" stroke-width="1.1"/>
    <circle cx="32" cy="12.5" r="2.6" fill="url(#cc-v)" stroke="#0F4674" stroke-width="1.2"/>
    <circle cx="14.6" cy="41" r="2.6" fill="url(#cc-v)" stroke="#0F4674" stroke-width="1.2"/>
    <circle cx="51" cy="38" r="2.6" fill="url(#cc-v)" stroke="#0F4674" stroke-width="1.2"/>
    <ellipse cx="24" cy="18" rx="7" ry="3" fill="#fff" opacity=".5"/>`,
    `<radialGradient id="cc-disk" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#D9EAFA"/><stop offset="1" stop-color="#9CC4EC"/></radialGradient>
    <linearGradient id="cc-tri" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset="1" stop-color="#1971C2"/></linearGradient>
    <radialGradient id="cc-v" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#BBD7F2"/></radialGradient>`,
  ),
  paraliftDeco: S(
    `${shadow(32, 58, 18, 0.13)}
    <rect x="12" y="10" width="40" height="8" rx="2.5" fill="url(#pl-top)" stroke="#0F4674" stroke-width="1.6"/>
    <path d="M18 18 L28 40 L48 40 L38 18 Z" fill="url(#pl-para)" stroke="#0F4674" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="18" cy="18" r="2.2" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>
    <circle cx="38" cy="18" r="2.2" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>
    <circle cx="28" cy="40" r="2.2" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>
    <circle cx="48" cy="40" r="2.2" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>
    <rect x="20" y="40" width="36" height="8" rx="2.5" fill="url(#pl-bot)" stroke="#0F4674" stroke-width="1.6"/>
    <circle cx="27" cy="52.5" r="4" fill="url(#pl-wh)" stroke="#33475C" stroke-width="1.4"/>
    <circle cx="47" cy="52.5" r="4" fill="url(#pl-wh)" stroke="#33475C" stroke-width="1.4"/>
    <ellipse cx="22" cy="12.6" rx="6" ry="1.6" fill="#fff" opacity=".45"/>`,
    `<linearGradient id="pl-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset="1" stop-color="#1E6AB2"/></linearGradient>
    <linearGradient id="pl-para" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BBD7F2"/><stop offset="1" stop-color="#77AEE4"/></linearGradient>
    <linearGradient id="pl-bot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B79C0"/><stop offset="1" stop-color="#114E85"/></linearGradient>
    <radialGradient id="pl-wh" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#8FA3B8"/><stop offset="1" stop-color="#4A5E74"/></radialGradient>`,
  ),
  kiteDeco: S(
    `${shadow(30, 58, 13, 0.11)}
    <path d="M30 6 L46 24 L30 46 L14 24 Z" fill="url(#kt-body)" stroke="#0F4674" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 6 V46 M14 24 H46" stroke="#0F4674" stroke-width="1.4" opacity=".5"/>
    <circle cx="30" cy="24" r="2" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>
    <path d="M30 46 q4 5 1 8 q-3 3 1 6" fill="none" stroke="#6E7C8C" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M27.4 51.5 l5 -2 M28.6 58 l5 -2" stroke="#E8A93E" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="24" cy="16" rx="5" ry="2.4" fill="#fff" opacity=".45" transform="rotate(38 24 16)"/>`,
    `<linearGradient id="kt-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5CA4E8"/><stop offset=".55" stop-color="#1971C2"/><stop offset="1" stop-color="#114E85"/></linearGradient>`,
  ),

  // ── 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리 — 마트료시카·삼각자·3단 접기·쟁반·매듭 밧줄 ──
  matryoDeco: S(
    `${shadow(30, 57, 20, 0.13)}
    <path d="M22 56 q-9 -1 -9 -12 q0 -8 5 -13 q-3 -4 -3 -8 q0 -9 9 -9 q9 0 9 9 q0 4 -3 8 q5 5 5 13 q0 11 -9 12 z" fill="url(#mt-body)" stroke="#7A1338" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="24" cy="22" r="6.4" fill="url(#mt-face)" stroke="#7A1338" stroke-width="1.4"/>
    <circle cx="21.8" cy="21.2" r=".9" fill="#5A3A22"/><circle cx="26.2" cy="21.2" r=".9" fill="#5A3A22"/>
    <path d="M22.4 24.6 q1.6 1.3 3.2 0" stroke="#B24A66" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M17 42 q7 -6 14 0" stroke="#8C1843" stroke-width="1.4" fill="none" opacity=".55"/>
    <ellipse cx="18" cy="34" rx="3.4" ry="7" fill="#fff" opacity=".28" transform="rotate(14 18 34)"/>
    <path d="M47 56 q-6 -0.8 -6 -8 q0 -5 3.2 -8.2 q-2 -2.6 -2 -5.2 q0 -6 5.8 -6 q5.8 0 5.8 6 q0 2.6 -2 5.2 q3.2 3.4 3.2 8.2 q0 7.2 -6 8 z" fill="url(#mt-body)" stroke="#7A1338" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="48" cy="35.4" r="4.2" fill="url(#mt-face)" stroke="#7A1338" stroke-width="1.2"/>
    <circle cx="46.6" cy="35" r=".7" fill="#5A3A22"/><circle cx="49.4" cy="35" r=".7" fill="#5A3A22"/>
    <ellipse cx="44.6" cy="46" rx="2.2" ry="4.4" fill="#fff" opacity=".26" transform="rotate(14 44.6 46)"/>`,
    `<linearGradient id="mt-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE7FAC"/><stop offset=".55" stop-color="#C2255C"/><stop offset="1" stop-color="#8C1843"/></linearGradient>
    <radialGradient id="mt-face" cx=".38" cy=".32" r=".95"><stop offset="0" stop-color="#FFEFD9"/><stop offset="1" stop-color="#F2CFA0"/></radialGradient>`,
  ),
  trirulerDeco: S(
    `${shadow(32, 56, 19, 0.12)}
    <path d="M12 52 L52 52 L12 14 Z" fill="url(#tr5-body)" stroke="#7A1338" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M20 46 L38 46 L20 29 Z" fill="#FDF3F7" stroke="#B24A66" stroke-width="1.4" stroke-linejoin="round" opacity=".9"/>
    <path d="M16 52 v-3 M21 52 v-2.2 M26 52 v-3 M31 52 v-2.2 M36 52 v-3 M41 52 v-2.2 M46 52 v-3" stroke="#7A1338" stroke-width="1.2" opacity=".55"/>
    <ellipse cx="20" cy="26" rx="3" ry="8" fill="#fff" opacity=".3" transform="rotate(40 20 26)"/>`,
    `<linearGradient id="tr5-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EE7FAC"/><stop offset=".5" stop-color="#D2427A"/><stop offset="1" stop-color="#A31C4E"/></linearGradient>`,
  ),
  foldletterDeco: S(
    `${shadow(32, 56, 18, 0.12)}
    <path d="M14 18 L38 18 L38 34 L14 34 Z" fill="url(#fl5-p1)" stroke="#8A97A8" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M38 18 L50 26 L50 42 L38 34 Z" fill="url(#fl5-p2)" stroke="#8A97A8" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M50 26 L26 26 L26 42 L50 42 Z" fill="url(#fl5-p3)" stroke="#8A97A8" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M29 31 h14 M29 35.5 h14 M29 40 h9" stroke="#C2255C" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
    <path d="M14 44 h36 M14 50 h36" stroke="#C2255C" stroke-width="2" stroke-linecap="round" opacity=".28"/>
    <ellipse cx="20" cy="21" rx="5" ry="1.8" fill="#fff" opacity=".5"/>`,
    `<linearGradient id="fl5-p1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9EEF5"/></linearGradient>
    <linearGradient id="fl5-p2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8E0EA"/><stop offset="1" stop-color="#C2CCDA"/></linearGradient>
    <linearGradient id="fl5-p3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAFCFE"/><stop offset="1" stop-color="#E2E9F2"/></linearGradient>`,
  ),
  trayDeco: S(
    `${shadow(32, 58, 16, 0.13)}
    <path d="M30.4 44 q1.6 -2 3.2 0 l-0.4 8 q2.8 1 2.8 3 q0 2 -4 2 q-4 0 -4 -2 q0 -2 2.8 -3 z" fill="url(#ty-stand)" stroke="#6B4A2E" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="18" y="26" width="7" height="11" rx="1.6" fill="url(#ty-cup1)" stroke="#0F4674" stroke-width="1.4"/>
    <rect x="30" y="22" width="8" height="15" rx="1.8" fill="url(#ty-cup2)" stroke="#9C5A10" stroke-width="1.4"/>
    <rect x="43" y="28" width="6.4" height="9" rx="1.5" fill="url(#ty-cup3)" stroke="#1E7A31" stroke-width="1.4"/>
    <ellipse cx="22" cy="29" rx="2.4" ry="1" fill="#fff" opacity=".5"/>
    <ellipse cx="32" cy="40" rx="22" ry="6" fill="url(#ty-tray)" stroke="#7A1338" stroke-width="2"/>
    <ellipse cx="32" cy="38.8" rx="18" ry="4" fill="#E86A9C" opacity=".45"/>
    <ellipse cx="26" cy="38.4" rx="6" ry="1.4" fill="#fff" opacity=".35"/>`,
    `<linearGradient id="ty-tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE7FAC"/><stop offset=".55" stop-color="#C2255C"/><stop offset="1" stop-color="#8C1843"/></linearGradient>
    <linearGradient id="ty-stand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A87C"/><stop offset="1" stop-color="#8A6A44"/></linearGradient>
    <linearGradient id="ty-cup1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CDF2"/><stop offset="1" stop-color="#4C90D6"/></linearGradient>
    <linearGradient id="ty-cup2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC98A"/><stop offset="1" stop-color="#D97F26"/></linearGradient>
    <linearGradient id="ty-cup3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FE3AE"/><stop offset="1" stop-color="#2FA45C"/></linearGradient>`,
  ),
  knotropeDeco: S(
    `${shadow(32, 57, 19, 0.12)}
    <path d="M16 52 L48 52 L48 20 Z" fill="none" stroke="url(#kr-rope)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M16 52 L48 52 L48 20 Z" fill="none" stroke="#8C5A20" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity=".22" stroke-dasharray="2.4 4.2"/>
    <circle cx="24" cy="52" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <circle cx="32" cy="52" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <circle cx="40" cy="52" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <circle cx="48" cy="44" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <circle cx="48" cy="36" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <circle cx="48" cy="28" r="2.6" fill="url(#kr-knot)" stroke="#6B4415" stroke-width="1.2"/>
    <path d="M44.6 48.6 h-3.2 v-3.2" fill="none" stroke="#C2255C" stroke-width="1.8"/>
    <ellipse cx="28" cy="50.4" rx="5" ry="1.2" fill="#fff" opacity=".35"/>`,
    `<linearGradient id="kr-rope" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8C48A"/><stop offset=".55" stop-color="#C99B55"/><stop offset="1" stop-color="#A87833"/></linearGradient>
    <radialGradient id="kr-knot" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#E8C48A"/><stop offset="1" stop-color="#B58335"/></radialGradient>`,
  ),

  // ── 중2 수학 Ⅵ. 확률 — 동전에서 원판까지, 우연의 도구들(주사위 레드) ──
  coinDeco: S(
    `${shadow(32, 56, 14, 0.12)}
    <circle cx="32" cy="32" r="17" fill="url(#cn6-gold)" stroke="#8C6A1E" stroke-width="2"/>
    <circle cx="32" cy="32" r="12.5" fill="none" stroke="#B8925C" stroke-width="1.3"/>
    <path d="M32 25 v14 M26.5 29.5 h11 M26.5 34.5 h11" stroke="#8C6A1E" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M14 18 q3 -5 8 -6 M50 18 q-3 -5 -8 -6" stroke="#B7A29A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="26" cy="24" rx="5" ry="2.2" fill="#fff" opacity=".5" transform="rotate(-24 26 24)"/>`,
    `<radialGradient id="cn6-gold" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE08A"/><stop offset=".6" stop-color="#E8B93E"/><stop offset="1" stop-color="#C9962A"/></radialGradient>`,
  ),
  spinnerDeco: S(
    `${shadow(32, 57, 15, 0.12)}
    <circle cx="32" cy="33" r="17" fill="url(#sp6-dud)" stroke="#8F1D1D" stroke-width="2"/>
    <path d="M32 33 L32 16 A17 17 0 0 1 46.7 24.5 Z" fill="url(#sp6-win)" stroke="#8F1D1D" stroke-width="1.4"/>
    <path d="M32 33 L17.3 41.5 A17 17 0 0 1 17.3 24.5 Z" fill="url(#sp6-win)" stroke="#8F1D1D" stroke-width="1.4"/>
    <circle cx="32" cy="33" r="4" fill="url(#sp6-hub)" stroke="#8C6A1E" stroke-width="1.2"/>
    <path d="M32 12 l-4 -6 h8 z" fill="#3A2A2A" stroke="#1E1414" stroke-width="1"/>
    <ellipse cx="26" cy="23" rx="4.6" ry="2" fill="#fff" opacity=".4" transform="rotate(-30 26 23)"/>`,
    `<linearGradient id="sp6-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>
    <linearGradient id="sp6-dud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8FAFD"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>
    <radialGradient id="sp6-hub" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#E8B93E"/></radialGradient>`,
  ),
  branchDeco: S(
    `${shadow(32, 57, 15, 0.11)}
    <circle cx="10" cy="32" r="4" fill="url(#br6-root)" stroke="#8F1D1D" stroke-width="1.4"/>
    <path d="M13 32 C 22 32 22 18 30 18 M13 32 C 22 32 22 46 30 46" stroke="#C92A2A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="18" r="3.4" fill="url(#br6-root)" stroke="#8F1D1D" stroke-width="1.2"/>
    <circle cx="32" cy="46" r="3.4" fill="url(#br6-root)" stroke="#8F1D1D" stroke-width="1.2"/>
    <path d="M35 18 C 42 18 42 10 49 10 M35 18 C 42 18 42 26 49 26 M35 46 C 42 46 42 38 49 38 M35 46 C 42 46 42 54 49 54" stroke="#4A7BE8" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="51" cy="10" r="2.8" fill="url(#br6-leaf)" stroke="#1D4E8F" stroke-width="1.1"/>
    <circle cx="51" cy="26" r="2.8" fill="url(#br6-leaf)" stroke="#1D4E8F" stroke-width="1.1"/>
    <circle cx="51" cy="38" r="2.8" fill="url(#br6-leaf)" stroke="#1D4E8F" stroke-width="1.1"/>
    <circle cx="51" cy="54" r="2.8" fill="url(#br6-leaf)" stroke="#1D4E8F" stroke-width="1.1"/>`,
    `<radialGradient id="br6-root" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F98C7E"/><stop offset="1" stop-color="#C92A2A"/></radialGradient>
    <radialGradient id="br6-leaf" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#8AB4FF"/><stop offset="1" stop-color="#2A57C2"/></radialGradient>`,
  ),
  chanceDeco: S(
    `${shadow(32, 54, 16, 0.11)}
    <rect x="8" y="34" width="48" height="6" rx="3" fill="url(#ch6-bar)" stroke="#8A93A6" stroke-width="1.2"/>
    <line x1="12" y1="30" x2="12" y2="44" stroke="#5A6B7E" stroke-width="2" stroke-linecap="round"/>
    <line x1="32" y1="31" x2="32" y2="43" stroke="#8A93A6" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="52" y1="30" x2="52" y2="44" stroke="#5A6B7E" stroke-width="2" stroke-linecap="round"/>
    <path d="M42 30 l-6 -11 h12 z" fill="url(#ch6-mark)" stroke="#8F1D1D" stroke-width="1.6" stroke-linejoin="round"/>
    <text x="12" y="54" text-anchor="middle" font-size="9" font-weight="900" fill="#5A6B7E">0</text>
    <text x="52" y="54" text-anchor="middle" font-size="9" font-weight="900" fill="#5A6B7E">1</text>`,
    `<linearGradient id="ch6-bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#F9BFB5"/></linearGradient>
    <linearGradient id="ch6-mark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>`,
  ),
  capsuleDeco: S(
    `${shadow(32, 58, 13, 0.12)}
    <path d="M15 32 a17 17 0 0 1 34 0 z" fill="url(#cp6-top)" stroke="#8F1D1D" stroke-width="2"/>
    <path d="M15 32 a17 17 0 0 0 34 0 z" fill="url(#cp6-bot)" stroke="#8A93A6" stroke-width="2"/>
    <rect x="13" y="30" width="38" height="4" rx="2" fill="#FFF" opacity=".5"/>
    <circle cx="32" cy="24" r="4.5" fill="#fff" opacity=".35"/>
    <path d="M26 52 l3 4 M38 52 l-3 4" stroke="#B7A29A" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="24" cy="20" rx="5" ry="2.4" fill="#fff" opacity=".5" transform="rotate(-28 24 20)"/>`,
    `<linearGradient id="cp6-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".6" stop-color="#E85A4E"/><stop offset="1" stop-color="#D8443C"/></linearGradient>
    <linearGradient id="cp6-bot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>`,
  ),

  // ── 사회 Ⅰ. 세계화 시대, 지리의 힘 — 세계 여행 준비물(트래블 오렌지) ──
  globeDeco: S(
    `${shadow(32, 57, 15, 0.13)}
    <path d="M22 52 h20 M32 46 v6" stroke="#8A6A3E" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M46 14 a21 21 0 0 1 -1 32" fill="none" stroke="#B58335" stroke-width="3" stroke-linecap="round"/>
    <circle cx="31" cy="29" r="17" fill="url(#wg1-sea)" stroke="#1E5FA8" stroke-width="1.8"/>
    <path d="M20 21 q5 -5 10 -2 q2 3 -2 5 q-6 1 -8 -3 z M36 17 q6 -1 8 4 q-1 5 -6 4 q-4 -3 -2 -8 z M24 34 q6 -2 9 2 q2 5 -3 7 q-7 0 -6 -9 z" fill="url(#wg1-land)" stroke="#1E7A46" stroke-width="1"/>
    <ellipse cx="24" cy="20" rx="6" ry="3" fill="#fff" opacity=".45" transform="rotate(-24 24 20)"/>`,
    `<radialGradient id="wg1-sea" cx=".34" cy=".28" r="1"><stop offset="0" stop-color="#9CD2FF"/><stop offset=".55" stop-color="#4E9AE8"/><stop offset="1" stop-color="#2B6CC0"/></radialGradient>
    <linearGradient id="wg1-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8EDB8E"/><stop offset="1" stop-color="#3E9E5C"/></linearGradient>`,
  ),
  passportDeco: S(
    `${shadow(32, 56, 14, 0.12)}
    <rect x="17" y="10" width="30" height="42" rx="5" fill="url(#wp1-cov)" stroke="#9E3D08" stroke-width="1.8"/>
    <rect x="20" y="10" width="3" height="42" fill="#B24A0E" opacity=".55"/>
    <circle cx="33" cy="27" r="7.5" fill="none" stroke="#FFD8A8" stroke-width="1.8"/>
    <path d="M25.5 27 h15 M33 19.5 a11 11 0 0 1 0 15 M33 19.5 a11 11 0 0 0 0 15" fill="none" stroke="#FFD8A8" stroke-width="1.3"/>
    <rect x="27" y="40" width="12" height="3" rx="1.5" fill="#FFD8A8" opacity=".85"/>
    <ellipse cx="24" cy="15" rx="5" ry="2.2" fill="#fff" opacity=".35" transform="rotate(-30 24 15)"/>`,
    `<linearGradient id="wp1-cov" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5854A"/><stop offset=".55" stop-color="#E8590C"/><stop offset="1" stop-color="#C2490A"/></linearGradient>`,
  ),
  planeDeco: S(
    `${shadow(32, 55, 17, 0.11)}
    <path d="M8 36 q20 -6 34 -8 l12 -10 q2 -1 3 1 l-7 12 q-2 3 -6 4 l-30 6 q-4 1 -6 -5 z" fill="url(#wa1-body)" stroke="#7A8698" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M30 30 l-6 -9 q-1 -2 2 -2 l10 8 z" fill="url(#wa1-wing)" stroke="#7A8698" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M26 35 l-4 7 q0 2 2 1 l8 -6 z" fill="url(#wa1-wing)" stroke="#7A8698" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="45" cy="24" r="1.6" fill="#4E7CB8"/><circle cx="40" cy="27" r="1.6" fill="#4E7CB8"/><circle cx="35" cy="29.5" r="1.6" fill="#4E7CB8"/>
    <path d="M12 41 q-4 3 -8 3" fill="none" stroke="#C4CFDC" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="46" cy="21" rx="5" ry="2" fill="#fff" opacity=".55" transform="rotate(-24 46 21)"/>`,
    `<linearGradient id="wa1-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E8EEF6"/><stop offset="1" stop-color="#C6D2E0"/></linearGradient>
    <linearGradient id="wa1-wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5854A"/><stop offset="1" stop-color="#D8500B"/></linearGradient>`,
  ),
  compassRoseDeco: S(
    `${shadow(32, 56, 14, 0.12)}
    <circle cx="32" cy="31" r="18" fill="url(#wc1-face)" stroke="#8A6A3E" stroke-width="2.2"/>
    <circle cx="32" cy="31" r="13.5" fill="#FDFCF7" stroke="#C9B98E" stroke-width="1.2"/>
    <path d="M32 21 l3.2 10 -3.2 -2.4 -3.2 2.4 z" fill="url(#wc1-n)" stroke="#8F1D1D" stroke-width="1"/>
    <path d="M32 41 l-3.2 -10 3.2 2.4 3.2 -2.4 z" fill="#E8EEF6" stroke="#8A93A6" stroke-width="1"/>
    <circle cx="32" cy="31" r="2" fill="#5A4A22"/>
    <path d="M32 15.5 v3 M32 43.5 v3 M16.5 31 h3 M44.5 31 h3" stroke="#8A6A3E" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="25" cy="22" rx="5.5" ry="2.4" fill="#fff" opacity=".5" transform="rotate(-30 25 22)"/>`,
    `<radialGradient id="wc1-face" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#F7E9C4"/><stop offset="1" stop-color="#D9BF84"/></radialGradient>
    <linearGradient id="wc1-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset="1" stop-color="#D8443C"/></linearGradient>`,
  ),
  suitcaseDeco: S(
    `${shadow(32, 58, 14, 0.13)}
    <path d="M26 14 v-3 a6 6 0 0 1 12 0 v3" fill="none" stroke="#9E5A18" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="16" y="14" width="32" height="38" rx="7" fill="url(#ws1-body)" stroke="#9E4A08" stroke-width="1.8"/>
    <path d="M23 14 v38 M41 14 v38" stroke="#C2490A" stroke-width="2" opacity=".55"/>
    <circle cx="34" cy="33" r="6.5" fill="url(#ws1-stkr)" stroke="#1E5FA8" stroke-width="1.2" transform="rotate(-12 34 33)"/>
    <path d="M30.5 33 q3.5 -3.5 7 0 M30.5 33.6 q3.5 3.2 7 0" fill="none" stroke="#DCEFFF" stroke-width="1.1"/>
    <circle cx="22" cy="55" r="3" fill="#5A6270"/><circle cx="42" cy="55" r="3" fill="#5A6270"/>
    <ellipse cx="22" cy="19" rx="5" ry="2.2" fill="#fff" opacity=".4" transform="rotate(-26 22 19)"/>`,
    `<linearGradient id="ws1-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5A05C"/><stop offset=".55" stop-color="#E8590C"/><stop offset="1" stop-color="#C2490A"/></linearGradient>
    <radialGradient id="ws1-stkr" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#9CD2FF"/><stop offset="1" stop-color="#3D7FD0"/></radialGradient>`,
  ),

  // ── 사회 Ⅱ. 아시아 — 대륙 횡단 여행(설산 → 벼논 → 낙타 → 홍등 → 돛단배) ──
  asiaMountDeco: S(
    `${shadow(32, 56, 16, 0.12)}
    <path d="M8 52 L24 20 l8 14 8-18 16 36 z" fill="url(#as2-mt)" stroke="#54708C" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M20 28 24 20 l4 7 q-4 4 -8 1 z M36 24 40 16 l4 8 q-4 4 -8 0 z" fill="#F4F8FC"/>
    <path d="M44 12 q3 -4 8 -3" fill="none" stroke="#C4CFDC" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="24" cy="30" rx="5" ry="2.2" fill="#fff" opacity=".4" transform="rotate(-30 24 30)"/>`,
    `<linearGradient id="as2-mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#AEC4DA"/><stop offset=".6" stop-color="#7E9AB8"/><stop offset="1" stop-color="#5A7896"/></linearGradient>`,
  ),
  asiaRiceDeco: S(
    `${shadow(32, 57, 15, 0.12)}
    <ellipse cx="32" cy="50" rx="19" ry="7" fill="url(#as2-paddy)" stroke="#3E7EA6" stroke-width="1.6"/>
    <path d="M24 50 c-1 -8 -1 -14 2 -20 M32 51 c-1 -9 -1 -16 2 -23 M40 50 c-1 -8 -1 -14 2 -20" stroke="#5A9E2E" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M27 30 q-4 -2 -5 -6 4 0 5 6 z M35 28 q-4 -3 -4 -8 4 1 4 8 z M43 30 q4 -3 8 -2 -2 4 -8 2 z" fill="url(#as2-leaf)"/>
    <ellipse cx="34" cy="26" rx="2.4" ry="3.4" fill="#EAD98A" transform="rotate(14 34 26)"/>
    <ellipse cx="26" cy="28" rx="2.1" ry="3" fill="#EAD98A" transform="rotate(-12 26 28)"/>
    <ellipse cx="26" cy="47" rx="6" ry="2" fill="#fff" opacity=".4"/>`,
    `<linearGradient id="as2-paddy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED2F5"/><stop offset="1" stop-color="#4E9AD0"/></linearGradient>
    <linearGradient id="as2-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8D66E"/><stop offset="1" stop-color="#5A9E2E"/></linearGradient>`,
  ),
  asiaCamelDeco: S(
    `${shadow(32, 57, 15, 0.13)}
    <path d="M12 54 q0 -10 6 -12 q1 -8 7 -9 q2 -5 7 -5 q5 0 7 5 q6 1 7 9 q6 2 6 12 h-5 l-2 -8 -3 8 h-4 l-1 -7 -3 7 h-4 l-1 -7 -3 7 h-4 l-2 -8 -2 8 z" fill="url(#as2-cam)" stroke="#8A5A26" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M46 34 q5 -1 6 -6 q2 -1 2 -4 -3 -1 -4 1 -4 0 -5 5" fill="url(#as2-cam)" stroke="#8A5A26" stroke-width="1.6"/>
    <circle cx="50" cy="26" r="1" fill="#4A3010"/>
    <ellipse cx="26" cy="34" rx="5" ry="2.2" fill="#fff" opacity=".35" transform="rotate(-20 26 34)"/>`,
    `<linearGradient id="as2-cam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8B978"/><stop offset=".6" stop-color="#C2843A"/><stop offset="1" stop-color="#9A6528"/></linearGradient>`,
  ),
  asiaLanternDeco: S(
    `${shadow(32, 58, 12, 0.12)}
    <path d="M32 8 v6" stroke="#8A5A26" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="24" y="13" width="16" height="4" rx="2" fill="url(#as2-lidg)"/>
    <path d="M32 17 q-14 0 -14 16 t14 16 q14 0 14 -16 t-14 -16 z" fill="url(#as2-lan)" stroke="#8F1D1D" stroke-width="1.8"/>
    <path d="M24 20 q-3 6 -3 13 t3 13 M40 20 q3 6 3 13 t-3 13 M32 17 v32" stroke="#B02020" stroke-width="1.2" opacity=".6"/>
    <rect x="26" y="49" width="12" height="3.4" rx="1.7" fill="url(#as2-lidg)"/>
    <path d="M30 52.5 v5 M34 52.5 v5" stroke="#D8A020" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="26" cy="24" rx="4.5" ry="2.4" fill="#fff" opacity=".45" transform="rotate(-30 26 24)"/>`,
    `<radialGradient id="as2-lan" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#FF9A6E"/><stop offset=".55" stop-color="#E84A3A"/><stop offset="1" stop-color="#B82020"/></radialGradient>
    <linearGradient id="as2-lidg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C879"/><stop offset="1" stop-color="#C89A2E"/></linearGradient>`,
  ),
  asiaDhowDeco: S(
    `${shadow(32, 57, 16, 0.12)}
    <path d="M14 46 h34 l-6 8 h-22 z" fill="url(#as2-hull)" stroke="#6E4630" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M30 46 V16" stroke="#5A4326" stroke-width="2.2"/>
    <path d="M30 16 q16 8 12 30 z" fill="url(#as2-sail)" stroke="#B09858" stroke-width="1.4"/>
    <path d="M30 20 q-10 8 -8 26 z" fill="#FDFCF5" stroke="#B09858" stroke-width="1.2" opacity=".9"/>
    <path d="M10 57 q6 -3 12 0 M40 58 q6 -3 12 0" stroke="#5BB8E8" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="36" cy="26" rx="4" ry="2" fill="#fff" opacity=".5" transform="rotate(-40 36 26)"/>`,
    `<linearGradient id="as2-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B0764A"/><stop offset="1" stop-color="#7A4E2E"/></linearGradient>
    <linearGradient id="as2-sail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF5"/><stop offset="1" stop-color="#E8D9B0"/></linearGradient>`,
  ),
};

/** 지도 장식 아트 — 단원 특색 세트 → 생물 아이콘(ART_BIO) → 공용(ART_DECOR) 순서로 찾는다. */
export function mapDecorArt(key: string): string {
  return MAP_DECOR[key] || ART_BIO[key] || ART_DECOR[key] || "";
}
