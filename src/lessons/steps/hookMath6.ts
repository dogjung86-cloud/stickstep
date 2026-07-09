// hookMath6, Ⅵ 통계 훅 장면 7종. hookMath.ts의 mathHook이 디스패치한다.
// 장면 계약: (scene, helper, finish, face, choices?), 공용 hookAsk.ask()만 사용,
// choices[0]=정답, good≠bad(오개념 교정), 소재명·설정은 도입(helper/narrator)에서 소개.
// 조작 먼저 → 예측 나중. 상태 변화는 인라인 스타일 트랜지션 + setTimeout(rAF 금지).
// SVG 파운드리 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자(#2A3A5E) + 재질별 최암색 외곽선.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type SceneFn = (scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face, choices?: string[]) => void;

const SHADOW = (cx: number, cy: number, rx: number, o = 0.11): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

const mkBtn = (label: string, pulse = true): HTMLButtonElement =>
  el("button", { class: `swapbtn${pulse ? " pulse" : ""}`, attrs: { type: "button" } }, el("span", { text: label }));

const NAVY = "#364FC7";
const NAVY_D = "#2839A0";

/* ── 1 lunchavg, 먹방 친구와 밥값 평균(대푯값) ──────────────────── */
export const renderLunchavg: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 영수증 5장: 7, 8, 8, 9천 원 + 물음표(먹방 친구) → 공개 시 33천 원
  const receipt = (x: number, label: string, cls = "", tall = false): string =>
    `<g class="${cls}" transform="translate(${x} 0)">
      ${SHADOW(30, tall ? 184 : 168, 24, 0.12)}
      <rect x="6" y="${tall ? 44 : 92}" width="48" height="${tall ? 136 : 72}" rx="5" fill="url(#la-pp)" stroke="#C9D2DC" stroke-width="1.4"/>
      <path d="M10 ${tall ? 52 : 100} h40 M10 ${tall ? 60 : 108} h28" stroke="#C9D2DC" stroke-width="1.6"/>
      <rect x="${tall ? 8 : 12}" y="${tall ? 152 : 140}" width="${tall ? 44 : 36}" height="14" rx="7" fill="url(#la-tag)"/>
      <text x="30" y="${tall ? 163 : 151}" text-anchor="middle" font-size="${tall ? 9.5 : 10.5}" font-weight="900" fill="#FFFFFF">${label}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#la-bg)"/>
    ${receipt(22, "7천 원")}${receipt(84, "8천 원")}${receipt(146, "8천 원")}${receipt(208, "9천 원")}
    <g class="la-mystery">${receipt(270, "?", "", true)}</g>
    <g class="la-big" style="opacity:0; transition: opacity .6s">${receipt(270, "3만 3천", "", true)}</g>`,
    `<linearGradient id="la-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#E2E7F5"/></linearGradient>
    <linearGradient id="la-pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF1F7"/></linearGradient>
    <linearGradient id="la-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6272E3"/><stop offset="1" stop-color="#364FC7"/></linearGradient>`,
  );
  const btn = mkBtn("마지막 영수증 공개");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "친구 5명이 점심을 먹고 <b>평균으로 나눠 내기</b>로 했어요. 네 명은 7~9천 원. 그런데 마지막 한 명이 <b>먹방 유튜버</b>인데요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".la-mystery") as SVGGElement).style.opacity = "0";
    (fig.querySelector(".la-mystery") as SVGGElement).style.transition = "opacity .4s";
    (fig.querySelector(".la-big") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "먹방 친구는 <b>3만 3천 원</b>어치! 천 원 단위로 평균을 내면 (7+8+8+9+33)÷5 = 13, 1인당 <b>1만 3천 원</b>. 그런데 뭔가 이상하지 않나요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "1만 3천 원어치를 먹은 사람은 아무도 없는데 그게 평균이에요",
            "계산이 잘못됐어요, 평균은 8천 원이에요",
            "평균이니까 1만 3천 원씩 내는 게 가장 공평해요",
          ],
          good: "바로 그거예요! 평균 1만 3천 원은 <b>한 명의 극단값</b>에 끌려간 숫자라 다섯 명 중 누구도 대표하지 못해요. 그럼 이런 자료의 진짜 대표는 누가 맡아야 할까요? 이번 레슨에서 차근차근 밝혀내요!",
          bad: "계산은 맞고(65÷5=13), 공평해 보이지만 네 명은 9천 원도 안 먹었는데 1만 3천 원을 내야 해요! 극단값 하나가 평균을 <b>끌고 가 버린</b> 거죠. 이 미스터리, 이번 레슨에서 차근차근 풀어 봐요!",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};

/* ── 2 penstock, 문구점 볼펜 발주(최빈값) ───────────────────────── */
export const renderPenstock: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const pen = (x: number, y: number, color: string): string =>
    `<g transform="translate(${x} ${y}) rotate(12)"><rect x="-3" y="-20" width="6" height="34" rx="3" fill="${color}" stroke="#22303F" stroke-width="1"/><path d="M-3 14 L0 22 L3 14 Z" fill="${color}" stroke="#22303F" stroke-width="1"/></g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#ps-bg)"/>
    ${SHADOW(180, 186, 120, 0.12)}
    <rect x="40" y="60" width="280" height="118" rx="10" fill="url(#ps-wd)" stroke="#8C5A2E" stroke-width="1.8"/>
    <line x1="40" y1="100" x2="320" y2="100" stroke="#8C5A2E" stroke-width="1.6" opacity=".7"/>
    <line x1="40" y1="140" x2="320" y2="140" stroke="#8C5A2E" stroke-width="1.6" opacity=".7"/>
    <g class="ps-sold" style="opacity:0; transition: opacity .6s">
      ${[0, 1, 2, 3, 4].map((i) => pen(70 + i * 22, 84, "#2A3040")).join("")}
      ${[0, 1, 2].map((i) => pen(70 + i * 22, 124, "#3E6FD8")).join("")}
      ${[0, 1].map((i) => pen(70 + i * 22, 164, "#D9435C")).join("")}
      <text x="255" y="88" font-size="11" font-weight="800" fill="#5C6E80">어제 5자루</text>
      <text x="255" y="128" font-size="11" font-weight="800" fill="#5C6E80">어제 3자루</text>
      <text x="255" y="168" font-size="11" font-weight="800" fill="#5C6E80">어제 2자루</text>
    </g>
    <text x="180" y="40" text-anchor="middle" font-size="13" font-weight="900" fill="#2839A0">내일 뭘 채워 놓지?</text>`,
    `<linearGradient id="ps-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF8F0"/><stop offset="1" stop-color="#F2E8D6"/></linearGradient>
    <linearGradient id="ps-wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAD9BC"/><stop offset=".5" stop-color="#DFC9A4"/><stop offset="1" stop-color="#CDB488"/></linearGradient>`,
  );
  const btn = mkBtn("판매 기록 펼치기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "문구점 사장님의 고민이에요. 볼펜 진열대를 채워야 하는데 <b>무슨 색을 가장 많이</b> 주문해야 할까요? 어제의 판매 기록을 봐요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ps-sold") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "검정 5, 파랑 3, 빨강 2! 사장님에게 필요한 대표는 뭘까요? 참고로 <b>색깔은 더해서 나눌 수 없어요</b>(평균 불가!).";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "가장 많이 팔린 값, 검정이 이 자료의 대표예요",
            "세 색의 중간인 파랑이 대표예요",
            "색을 섞은 평균 색으로 주문해요",
          ],
          good: "정확해요! <b>가장 많이(자주) 나타난 값</b>이 대표가 되는 상황이죠. 이런 대푯값의 정식 이름을 랩에서 타워를 쌓으며 만나요!",
          bad: "색깔은 크기순으로 줄 세울 수도(중간?), 더해서 나눌 수도(평균?) 없어요! 이런 자료의 대표는 <b>가장 많이 나타난 값</b>, 검정뿐이에요. 그 정식 이름을 랩에서 만나요!",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};

/* ── 3 marathon, 마라톤 접수처의 나이 명단(줄기와 잎 — 교과서 도입 소재 계승, 수치는 자체 제작) ── */
export const renderMarathon: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 참가자 나이 9명: 10대 1 · 20대 3 · 30대 4(최다) · 40대 1
  const AGES: [number, number, number][] = [
    // [나이, 뒤죽박죽 x, 뒤죽박죽 y] — 명단 제목 띠(y 20~44)를 덮지 않게 전부 y≥58 아래에 흩는다.
    [17, 96, 64], [24, 176, 72], [31, 250, 70], [38, 128, 106], [26, 214, 112],
    [33, 74, 148], [45, 292, 128], [35, 156, 158], [29, 262, 164],
  ];
  const chip = (v: number, x: number, y: number): string =>
    `<g transform="translate(${x} ${y})"><rect x="-16" y="-12" width="32" height="24" rx="8" fill="url(#mr-ch)" stroke="#1F2E8C" stroke-width="1.4"/><text x="0" y="4.5" text-anchor="middle" font-size="11.5" font-weight="900" fill="#FFFFFF">${v}</text></g>`;
  const DECADES = [10, 20, 30, 40];
  const rows = DECADES.map((d, ri) => {
    const members = AGES.filter(([v]) => Math.floor(v / 10) === d / 10).map(([v]) => v).sort((a, b) => a - b);
    const y = 58 + ri * 34;
    return (
      `<text x="66" y="${y + 4}" text-anchor="end" font-size="11" font-weight="900" fill="#5C6E80">${d}대</text>` +
      `<line x1="76" y1="${y - 14}" x2="76" y2="${y + 14}" stroke="#8B95A6" stroke-width="1.6"/>` +
      members.map((v, k) => chip(v, 100 + k * 38, y)).join("")
    );
  }).join("");
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#mr-bg)"/>
    ${SHADOW(180, 188, 128, 0.12)}
    <rect x="26" y="20" width="308" height="24" rx="8" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="1.4"/>
    <text x="180" y="37" text-anchor="middle" font-size="11.5" font-weight="900" fill="#2839A0">동네 마라톤 참가 신청 명단 (나이)</text>
    <g class="mr-messy" style="transition: opacity .5s">${AGES.map(([v, x, y]) => chip(v, x, y)).join("")}</g>
    <g class="mr-rows" style="opacity:0; transition: opacity .7s">${rows}
      <text class="mq6-pop" x="268" y="128" font-size="11.5" font-weight="800" fill="#C0355C">30대가 제일 많네!</text>
    </g>`,
    `<linearGradient id="mr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#E2E7F5"/></linearGradient>
    <linearGradient id="mr-ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient>`,
  );
  const btn = mkBtn("나이 앞자리로 묶기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "동네 마라톤 대회 접수처예요. 기념품 티셔츠를 준비하려면 <b>어느 연령대 참가자가 가장 많은지</b> 알아야 하는데, 명단의 나이가 뒤죽박죽이네요!";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".mr-messy") as SVGGElement).style.opacity = "0";
    (fig.querySelector(".mr-rows") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "나이의 <b>앞자리(십의 자리)</b>로 묶었더니 30대 줄이 가장 긴 게 한눈에! 그냥 묶었을 뿐인데 왜 이렇게 잘 보일까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "앞자리가 같은 사람끼리 모이니 각 줄의 길이가 곧 인원수라서예요",
            "나이가 어린 사람부터 세워서예요",
            "우연히 그렇게 보일 뿐이에요",
          ],
          good: "정확해요! <b>앞자리(십의 자리)로 묶고 뒷자리를 나란히</b> 두면 줄의 길이가 곧 개수가 되어 분포가 그림처럼 보여요. 이 정리법의 수학 이름을 랩에서 직접 만들며 배워요!",
          bad: "순서도 우연도 아니에요. <b>앞자리가 같은 것끼리 모으면</b> 각 줄의 길이가 곧 인원수라, 묶기만 했는데 분포가 공짜로 보이는 거죠! 랩에서 이 정리법을 직접 만들어 봐요.",
          onDone: finish,
        });
      }, 1000);
    }, 900);
  });
};

/* ── 4 weightclass, 태권도 체급표(도수분포표) ───────────────────── */
export const renderWeightclass: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const rows = [
    ["핀급", "45 미만"],
    ["플라이급", "45 이상 ~ 48 미만"],
    ["밴텀급", "48 이상 ~ 51 미만"],
    ["페더급", "51 이상 ~ 55 미만"],
  ];
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#wc-bg)"/>
    ${SHADOW(110, 188, 60, 0.14)}
    <g transform="translate(58 52)">
      <circle cx="52" cy="14" r="12" fill="#F2C9A0" stroke="#B0662A" stroke-width="1.4"/>
      <rect x="30" y="28" width="44" height="52" rx="9" fill="url(#wc-do)" stroke="#8A9AAC" stroke-width="1.4"/>
      <path d="M30 40 L74 40" stroke="#2A3040" stroke-width="5"/>
      <path d="M40 80 L36 116 M64 80 L68 116" stroke="url(#wc-do)" stroke-width="13" stroke-linecap="round"/>
    </g>
    <rect x="170" y="34" width="164" height="140" rx="10" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="1.6"/>
    <text x="252" y="56" text-anchor="middle" font-size="12" font-weight="900" fill="${NAVY_D}">대회 체급표 (kg)</text>
    ${rows.map((r, i) =>
      `<text x="182" y="${80 + i * 24}" font-size="10.5" font-weight="900" fill="#2A3040">${r[0]}</text>` +
      `<text x="238" y="${80 + i * 24}" font-size="10" font-weight="700" fill="#5C6E80">${r[1]}</text>`,
    ).join("")}
    <g class="wc-me" style="opacity:0; transition: opacity .5s">
      <rect x="174" y="139" width="156" height="18" rx="6" fill="${NAVY}" opacity=".14"/>
      <text x="252" y="168" text-anchor="middle" font-size="10" font-weight="800" fill="${NAVY_D}">나: 51.0 kg → 페더급!</text>
    </g>`,
    `<linearGradient id="wc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#DFE5F4"/></linearGradient>
    <linearGradient id="wc-do" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDE5EE"/></linearGradient>`,
  );
  const btn = mkBtn("내 체급 찾기 (51.0 kg)");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "태권도 대회 신청서를 쓰는 날! 몸무게에 따라 <b>체급</b>이 나뉘어요. 그런데 급마다 <b>이상~미만</b>이라는 말이 붙어 있네요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".wc-me") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "51.0kg인 나는 밴텀급(48이상~51<b>미만</b>)이 아니라 <b>페더급(51이상~)</b>! 딱 경계의 몸무게인데 헷갈리지 않는 이유는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "이상은 포함, 미만은 불포함이라 모든 값이 딱 한 구간에만 들어가요",
            "심판이 그때그때 판단해 줘요",
            "경계면 두 체급 중 아무 데나 골라도 돼요",
          ],
          good: "정확해요! <b>이상(포함)~미만(불포함)</b> 약속 덕분에 어떤 몸무게든 소속이 하나로 정해져요. 자료를 이런 구간으로 나눠 세는 표, 랩에서 직접 만들어 봐요!",
          bad: "판단도 선택도 아니에요. <b>이상은 포함, 미만은 불포함</b>이라는 수학 약속 덕분에 51.0kg의 소속은 페더급 하나로 자동 확정! 이 구간 나누기로 표를 만드는 법을 랩에서 배워요.",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};

/* ── 5 camerahisto, 카메라 앱의 산 모양 그래프(히스토그램) ──────── */
export const renderCamerahisto: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const bars = [3, 7, 14, 22, 30, 24, 15, 8, 4];
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#ch-bg)"/>
    <rect x="34" y="24" width="292" height="152" rx="12" fill="#10161F" stroke="#2A3648" stroke-width="2"/>
    <path d="M60 150 L110 96 L150 122 L205 74 L262 128 L300 108 L300 150 Z" fill="url(#ch-mt)" opacity=".9"/>
    <circle cx="272" cy="56" r="13" fill="url(#ch-sun)"/>
    <g class="ch-histo" style="opacity:0; transition: opacity .6s">
      <rect x="212" y="34" width="104" height="58" rx="6" fill="#0B1018" stroke="#3A4A5E" stroke-width="1.2" opacity=".92"/>
      ${bars.map((h, i) => `<rect x="${218 + i * 10.4}" y="${86 - h * 1.5}" width="8.4" height="${h * 1.5}" fill="url(#ch-bar)"/>`).join("")}
    </g>
    <circle cx="180" cy="188" r="0" fill="none"/>`,
    `<linearGradient id="ch-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#Eef2F8"/><stop offset="1" stop-color="#D8E0EC"/></linearGradient>
    <linearGradient id="ch-mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A6284"/><stop offset="1" stop-color="#22334C"/></linearGradient>
    <radialGradient id="ch-sun" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#FFF2C4"/><stop offset="1" stop-color="#F2B430"/></radialGradient>
    <linearGradient id="ch-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD4F2"/><stop offset="1" stop-color="#3E8FC4"/></linearGradient>`,
  );
  const btn = mkBtn("프로 모드 켜기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "스마트폰 카메라로 노을을 찍는 중이에요. 설정에서 <b>프로 모드</b>를 켜면 화면 구석에 뭔가 떠요.";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".ch-histo") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "화면 구석에 <b>산 모양 막대 그래프</b>가 떴어요! 사진작가들이 이걸 보며 밝기를 조절한대요. 이 그래프의 정체는 뭘까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "밝기 구간마다 화소가 몇 개인지 센 분포 그래프예요",
            "사진 속 산의 실루엣을 그대로 딴 그림이에요",
            "배터리와 저장 공간을 보여 주는 표시예요",
          ],
          good: "정확해요! 어두움부터 밝음까지 <b>구간을 나누고 각 구간의 화소 수</b>를 막대로 세운 분포 그래프죠. 이름은 히스토그램! 오늘 여러분이 직접 세워 봅니다.",
          bad: "실루엣도 배터리도 아니에요. 어두움~밝음을 <b>구간으로 나눠 각 구간의 화소 수</b>를 막대 높이로 세운 그래프예요. 이름은 히스토그램, 오늘 직접 세워 봐요!",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};

/* ── 6 likeratio, 구독자 대비 좋아요(상대도수) ──────────────────── */
export const renderLikeratio: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  const card = (x: number, name: string, subs: string, likes: string, color: string): string =>
    `<g transform="translate(${x} 0)">
      ${SHADOW(70, 174, 56, 0.12)}
      <rect x="10" y="36" width="120" height="132" rx="12" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="1.6"/>
      <circle cx="70" cy="66" r="16" fill="${color}"/>
      <path d="M62 66 a8 8 0 0 1 16 0 q0 7 -8 11 q-8 -4 -8 -11" fill="#FFFFFF" opacity=".9"/>
      <text x="70" y="100" text-anchor="middle" font-size="11" font-weight="900" fill="#2A3040">${name}</text>
      <text x="70" y="118" text-anchor="middle" font-size="10" font-weight="700" fill="#5C6E80">구독자 ${subs}</text>
      <text x="70" y="146" text-anchor="middle" font-size="11.5" font-weight="900" fill="${NAVY_D}">좋아요 ${likes}</text>
    </g>`;
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#lr-bg)"/>
    ${card(30, "왕큰 채널", "100만 명", "1만 개", "#D9435C")}
    ${card(190, "아담 채널", "1만 명", "5천 개", "#2F9E44")}
    <text x="180" y="28" text-anchor="middle" font-size="12.5" font-weight="900" fill="${NAVY_D}">누가 더 사랑받는 영상일까?</text>`,
    `<linearGradient id="lr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#E2E7F5"/></linearGradient>`,
  );
  const btn = mkBtn("비율로 다시 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "같은 주제의 영상 두 개! <b>왕큰 채널</b>은 좋아요 1만 개, <b>아담 채널</b>은 5천 개예요. 좋아요 수만 보면 왕큰 채널의 승리 같은데요?";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    face("curious");
    helper.innerHTML = "구독자 <b>100만 중 1만</b>이 누른 것과 <b>1만 중 5천</b>이 누른 것. 전체에서 차지하는 비율로 보면 누가 더 사랑받았을까요?";
    window.setTimeout(() => {
      ask(box, helper, {
        choices: choices ?? [
          "아담 채널, 절반(0.5)이 눌렀으니 1%(0.01)보다 훨씬 진해요",
          "왕큰 채널, 1만 개가 5천 개보다 많으니까요",
          "좋아요 수가 다르니 비교 자체가 불가능해요",
        ],
        good: "정확해요! 개수(도수)는 왕큰 채널이 커도 <b>전체 대비 비율</b>은 0.5 대 0.01로 아담 채널의 압승! 전체가 다른 두 집단은 비율로 비교해야 해요. 이 비율의 수학 이름을 랩에서 만나요.",
        bad: "개수만 보면 속아요! 전체(구독자)가 다르니까요. 1만÷100만=0.01, 5천÷1만=<b>0.5</b>, 비율로는 아담 채널의 압승이에요. 이렇게 비율로 비교하는 법을 랩에서 배워요!",
        onDone: finish,
      });
    }, 1100);
  });
};

/* ── 7 fakegraph, 눈금 조작 그래프(통계적 문제해결) ─────────────── */
export const renderFakegraph: SceneFn = (scene, helper, finish, face, choices) => {
  const fig = el("div", {});
  // 같은 자료(24 → 22): 왼쪽(세로축 0~25)은 완만, 오른쪽(21.5~24.5 확대)은 폭락처럼
  fig.innerHTML = wrapSvg(
    `<rect x="10" y="8" width="340" height="184" rx="16" fill="url(#fg-bg)"/>
    <rect x="24" y="26" width="150" height="150" rx="10" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="1.6"/>
    <text x="99" y="46" text-anchor="middle" font-size="11" font-weight="900" fill="#2A3040">뉴스 A의 그래프</text>
    <line x1="44" y1="160" x2="160" y2="160" stroke="#8093A8" stroke-width="1.6"/>
    <line x1="44" y1="160" x2="44" y2="56" stroke="#8093A8" stroke-width="1.6"/>
    <path d="M60 84 L100 88 L140 91" stroke="${NAVY}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[60, 100, 140].map((x, i) => `<circle cx="${x}" cy="${[84, 88, 91][i]}" r="3.4" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>`).join("")}
    <text x="36" y="62" font-size="8.5" font-weight="700" fill="#8093A8">25</text>
    <text x="40" y="163" font-size="8.5" font-weight="700" fill="#8093A8">0</text>
    <g class="fg-b" style="opacity:0; transition: opacity .6s">
      <rect x="186" y="26" width="150" height="150" rx="10" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="1.6"/>
      <text x="261" y="46" text-anchor="middle" font-size="11" font-weight="900" fill="#8C1F30">뉴스 B의 그래프</text>
      <line x1="206" y1="160" x2="322" y2="160" stroke="#8093A8" stroke-width="1.6"/>
      <line x1="206" y1="160" x2="206" y2="56" stroke="#8093A8" stroke-width="1.6"/>
      <path d="M222 66 L262 108 L302 148" stroke="#D9435C" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${[222, 262, 302].map((x, i) => `<circle cx="${x}" cy="${[66, 108, 148][i]}" r="3.4" fill="#FFFFFF" stroke="#D9435C" stroke-width="2"/>`).join("")}
      <text x="192" y="62" font-size="8" font-weight="700" fill="#8093A8">24.5</text>
      <text x="192" y="163" font-size="8" font-weight="700" fill="#8093A8">21.5</text>
      <path d="M198 152 l6 -5 v10 Z" fill="#D9435C"/>
      <text x="261" y="174" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8C1F30">"대폭락!"</text>
    </g>`,
    `<linearGradient id="fg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#E2E7F5"/></linearGradient>`,
  );
  const btn = mkBtn("다른 뉴스 그래프 보기");
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  helper.innerHTML = "같은 조사 결과(24 → 23 → 22)를 두 뉴스가 그래프로 보도했어요. 뉴스 A의 그래프는 <b>완만한 변화</b>로 보이는데...";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.classList.remove("pulse");
    haptic(HAPTIC.select);
    (fig.querySelector(".fg-b") as SVGGElement).style.opacity = "1";
    window.setTimeout(() => {
      face("surprised");
      helper.innerHTML = "뉴스 B는 <b>대폭락</b>처럼 보여요! 똑같은 숫자인데 어떻게 이렇게 다를까요?";
      window.setTimeout(() => {
        ask(box, helper, {
          choices: choices ?? [
            "세로축을 0이 아닌 21.5부터 확대해 그려서 그래요",
            "뉴스 B가 자료 숫자를 몰래 바꿨어요",
            "그래프 프로그램의 오류예요",
          ],
          good: "날카로워요! 숫자는 그대로인데 <b>세로축 눈금</b>을 잘라 확대하면 작은 변화가 폭락처럼 보여요. 그래프 사기의 단골 수법! 이번 레슨에서 이런 함정을 걸러내는 탐정이 됩니다.",
          bad: "숫자도 프로그램도 멀쩡해요. 범인은 <b>세로축 눈금</b>! 0부터가 아니라 21.5부터 확대해 그리면 같은 자료도 폭락처럼 보이죠. 이 사기 수법을 걸러내는 눈, 이번 레슨에서 완성해요!",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};
