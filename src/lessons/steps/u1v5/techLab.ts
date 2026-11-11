// [중1 Ⅰ v5] u1l4 techLab: 「기술을 켜면 무엇이 달라질까?」
// 한 통찰: 첨단 과학기술 네 가지가 저마다 하는 일(겹쳐 보이기, 사물끼리 잇기, 학습해 알아보기, 유전정보 쓰기)을 장면에서 먼저 겪고 이름을 붙인다.
// 조작: 장면 카드 넷 + 기술 끄기와 켜기. 끈 채로는 일이 되지 않는 모습(실패)이 먼저 보인다. 켜면 장면이 바뀌고 그 뒤에 이름이 뜬다.
// 흐름: 네 장면을 모두 켜 본다 → 판정(첨단 바이오 장면을 무대에 남기고 이름을 가린 채 묻는다) → 결론.
// 장면은 교과서의 활용 사례를 따른다(가구 배치 앱, 집 밖에서 가전제품 제어, 맞춤형 치료제). 인공지능은 도입(말을 알아듣는 스피커)과 겹치지 않게 사진 알아보기로 잡았다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "../bio6/b6Lab";

interface TechStep {
  title: string;
  cta?: string;
}

type Key = "ar" | "iot" | "ai" | "bio";
const KEYS: Key[] = ["ar", "iot", "ai", "bio"];

const TECH: Record<Key, { card: string; name: string; off: string; on: string }> = {
  ar: {
    card: "빈 방에 가구 놓기",
    name: "증강 현실",
    off: "폰으로 빈 방을 비추고 있어요. 화면도 빈 방 그대로예요. <b>기술 켜기</b>를 눌러 봐요.",
    on: "실제 방 모습에 <b>가상 소파</b>가 겹쳐 보여요. 이런 기술이 <b>증강 현실</b>이에요.",
  },
  iot: {
    card: "집 밖에서 불 켜기",
    name: "사물 인터넷",
    off: "집 밖에서 폰을 눌러도 전등은 그대로예요. <b>기술 켜기</b>를 눌러 봐요.",
    on: "폰과 전등이 <b>무선 통신</b>으로 이어져 불이 켜졌어요. <b>사물 인터넷</b>이에요.",
  },
  ai: {
    card: "사진 속 동물 알기",
    name: "인공지능",
    off: "컴퓨터가 사진 속 동물을 알아보지 못해요. <b>기술 켜기</b>를 눌러 봐요.",
    on: "수많은 사진으로 <b>학습</b>한 컴퓨터가 동물을 알아봐요. <b>인공지능</b>이에요.",
  },
  bio: {
    card: "내 몸에 맞는 약",
    name: "첨단 바이오",
    off: "두 사람이 똑같은 약을 받았어요. <b>기술 켜기</b>를 눌러 봐요.",
    on: "<b>유전정보</b>를 읽어 사람마다 맞는 약을 만들어요. <b>첨단 바이오</b>예요.",
  },
};

// 방 한 칸(벽, 바닥, 창, 화분). ox, oy는 왼쪽 위, k는 크기 비.
const room = (ox: number, oy: number, w: number, h: number, px = 0.8): string => {
  const fy = oy + h * 0.68;
  return `<rect x="${ox}" y="${oy}" width="${w}" height="${h}" rx="8" fill="#1B2E4C"/>
    <rect x="${ox}" y="${fy}" width="${w}" height="${oy + h - fy}" fill="#2A3F63"/>
    <line x1="${ox}" y1="${fy}" x2="${ox + w}" y2="${fy}" stroke="#4A618A" stroke-width="1.4"/>
    <rect x="${ox + w * 0.12}" y="${oy + h * 0.14}" width="${w * 0.3}" height="${h * 0.3}" rx="3" fill="#8FC5FF" opacity=".75"/>
    <line x1="${ox + w * 0.27}" y1="${oy + h * 0.14}" x2="${ox + w * 0.27}" y2="${oy + h * 0.44}" stroke="#1B2E4C" stroke-width="1.6"/>
    <rect x="${ox + w * px}" y="${fy - 12}" width="12" height="12" rx="2" fill="#C98B5B"/>
    <path d="M${ox + w * px + 6} ${fy - 12} q-9 -12 -2 -22 q2 10 2 22 q0 -12 8 -18 q0 10 -8 18" fill="#3FBF7F"/>`;
};

const SCENE: Record<Key, string> = {
  ar: `
    <text x="84" y="32" text-anchor="middle" class="u1x-lb">실제 방</text>
    ${room(14, 42, 140, 138)}
    <path d="M160 112 h24 m-7 -6 l7 6 l-7 6" fill="none" stroke="#8FA3C2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="196" y="20" width="128" height="192" rx="16" fill="#0A1220" stroke="#C9D5E8" stroke-width="2"/>
    ${room(204, 40, 112, 150, 0.87)}
    <text x="260" y="34" text-anchor="middle" class="u1x-lb sm">폰 화면</text>
    <g class="on" transform="translate(-6 0)">
      <rect x="222" y="112" width="66" height="26" rx="7" fill="#FF8FA3"/>
      <rect x="216" y="124" width="78" height="24" rx="8" fill="#FF6F8B"/>
      <rect x="212" y="118" width="14" height="30" rx="6" fill="#FF8FA3"/>
      <rect x="284" y="118" width="14" height="30" rx="6" fill="#FF8FA3"/>
      <rect x="208" y="106" width="94" height="46" rx="10" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 4"/>
      <text x="255" y="172" text-anchor="middle" class="u1x-lb hi">가상 소파</text>
    </g>
    <g class="off"><text x="260" y="172" text-anchor="middle" class="u1x-lb dim">빈 방 그대로</text></g>`,
  iot: `
    <text x="62" y="52" text-anchor="middle" class="u1x-lb">집 밖</text>
    <rect x="32" y="64" width="60" height="104" rx="11" fill="#0A1220" stroke="#C9D5E8" stroke-width="2"/>
    <circle cx="62" cy="116" r="17" fill="#22344F" stroke="#8FA3C2" stroke-width="1.4"/>
    <path d="M62 105 a7 7 0 0 1 4 12.6 v3.4 h-8 v-3.4 a7 7 0 0 1 4 -12.6 z" fill="#FFD766"/>
    <text x="62" y="152" text-anchor="middle" class="u1x-lb sm">전등 버튼</text>
    <text x="262" y="204" text-anchor="middle" class="u1x-lb">집 안</text>
    <path d="M196 76 L262 28 L328 76 Z" fill="#2A3F63" stroke="#4A618A" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="208" y="76" width="108" height="112" fill="#16263F" stroke="#4A618A" stroke-width="1.6"/>
    <rect class="u1t-win" x="226" y="92" width="72" height="72" rx="4" fill="#0E1A2E" stroke="#4A618A" stroke-width="1.4"/>
    <line x1="262" y1="92" x2="262" y2="110" stroke="#8FA3C2" stroke-width="1.6"/>
    <g class="on">
      <rect x="226" y="92" width="72" height="72" rx="4" fill="#FFD766" opacity=".2"/>
      <circle cx="262" cy="122" r="26" fill="#FFD766" opacity=".28"/>
      <circle cx="262" cy="122" r="11" fill="#FFE08A" stroke="#FFF3B0" stroke-width="1.4"/>
      <path class="u1t-wave w1" d="M108 96 q14 20 0 40" fill="none" stroke="#63B3FF" stroke-width="2.6" stroke-linecap="round"/>
      <path class="u1t-wave w2" d="M134 88 q20 28 0 56" fill="none" stroke="#63B3FF" stroke-width="2.6" stroke-linecap="round"/>
      <path class="u1t-wave w3" d="M162 80 q26 36 0 72" fill="none" stroke="#63B3FF" stroke-width="2.6" stroke-linecap="round"/>
      <text x="146" y="66" text-anchor="middle" class="u1x-lb hi">무선 통신</text>
    </g>
    <g class="off">
      <circle cx="262" cy="122" r="11" fill="#33425C" stroke="#55678A" stroke-width="1.4"/>
      <line x1="104" y1="116" x2="190" y2="116" stroke="#55678A" stroke-width="2" stroke-dasharray="4 6"/>
      <path d="M140 108 l16 16 m0 -16 l-16 16" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round"/>
      <text x="148" y="94" text-anchor="middle" class="u1x-lb dim">이어지지 않음</text>
    </g>`,
  ai: `
    <rect x="18" y="26" width="88" height="80" rx="8" fill="#F1F4F8"/>
    <path d="M44 52 l4 -16 l12 10 z M80 52 l-4 -16 l-12 10 z" fill="#F4A340"/>
    <circle cx="62" cy="66" r="22" fill="#F7B955"/>
    <circle cx="54" cy="62" r="2.6" fill="#2B3440"/><circle cx="70" cy="62" r="2.6" fill="#2B3440"/>
    <path d="M59 70 h6 l-3 4 z" fill="#E0637A"/>
    <path d="M40 70 h12 M40 76 h12 M72 70 h12 M72 76 h12" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
    <rect x="18" y="118" width="88" height="80" rx="8" fill="#F1F4F8"/>
    <ellipse cx="62" cy="160" rx="21" ry="22" fill="#C89B6D"/>
    <ellipse cx="40" cy="156" rx="8" ry="17" fill="#8A5A34"/><ellipse cx="84" cy="156" rx="8" ry="17" fill="#8A5A34"/>
    <circle cx="54" cy="154" r="2.6" fill="#2B3440"/><circle cx="70" cy="154" r="2.6" fill="#2B3440"/>
    <ellipse cx="62" cy="166" rx="9" ry="7" fill="#F1E3D3"/><ellipse cx="62" cy="163" rx="3.6" ry="2.6" fill="#2B3440"/>
    <path d="M112 66 h66 m-7 -6 l7 6 l-7 6 M112 158 h66 m-7 -6 l7 6 l-7 6" fill="none" stroke="#8FA3C2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="188" y="26" width="140" height="150" rx="10" fill="#0A1220" stroke="#C9D5E8" stroke-width="2"/>
    <rect x="244" y="176" width="28" height="12" fill="#8FA3C2"/><rect x="226" y="188" width="64" height="6" rx="3" fill="#C9D5E8"/>
    <rect x="198" y="40" width="120" height="52" rx="8" fill="#16263F"/><rect x="198" y="110" width="120" height="52" rx="8" fill="#16263F"/>
    <g class="on">
      <text x="258" y="73" text-anchor="middle" class="u1x-lb big">고양이</text>
      <text x="258" y="143" text-anchor="middle" class="u1x-lb big">강아지</text>
      <text x="258" y="214" text-anchor="middle" class="u1x-lb hi">사진 수천 장으로 학습함</text>
    </g>
    <g class="off">
      <text x="258" y="75" text-anchor="middle" class="u1x-lb q">?</text>
      <text x="258" y="145" text-anchor="middle" class="u1x-lb q">?</text>
      <text x="258" y="214" text-anchor="middle" class="u1x-lb dim">학습하기 전</text>
    </g>`,
  bio: ["#FF9F43", "#B197FC"]
    .map((c, p) => {
      const x = p === 0 ? 92 : 254;
      const rungs = Array.from({ length: 7 }, (_, i) => {
        const rx = x - 39 + i * 13;
        const special = i === (p === 0 ? 2 : 4);
        return `<line x1="${rx}" y1="96" x2="${rx}" y2="122" stroke="${special ? c : "#63E6BE"}" stroke-width="${special ? 5 : 3.4}" stroke-linecap="round"/>${special ? `<g class="on"><circle cx="${rx}" cy="109" r="16" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 4"/></g>` : ""}`;
      }).join("");
      return `
      <circle cx="${x}" cy="44" r="16" fill="#E8EEF9"/>
      <path d="M${x - 26} 84 q0 -22 26 -22 q26 0 26 22 z" fill="#C9D5E8"/>
      <path d="M${x - 46} 96 q46 -10 92 0 M${x - 46} 122 q46 10 92 0" fill="none" stroke="#8FA3C2" stroke-width="2.2" stroke-linecap="round"/>
      ${rungs}
      <path d="M${x} 134 v20 m-6 -7 l6 7 l6 -7" fill="none" stroke="#8FA3C2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="off"><rect x="${x - 24}" y="164" width="48" height="22" rx="11" fill="#E8EEF9"/><rect x="${x - 24}" y="164" width="24" height="22" rx="11" fill="#A9B6C9"/></g>
      <g class="on"><rect x="${x - 24}" y="164" width="48" height="22" rx="11" fill="#fff"/><rect x="${x - 24}" y="164" width="24" height="22" rx="11" fill="${c}"/></g>`;
    })
    .join("") + `
    <text x="173" y="113" text-anchor="middle" class="u1x-lb">유전정보</text>
    <g class="off"><text x="173" y="180" text-anchor="middle" class="u1x-lb dim">같은 약</text></g>
    <g class="on"><text x="173" y="180" text-anchor="middle" class="u1x-lb hi">맞춤 약</text></g>`,
};

export const techLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TechStep;
  const tm = bvTimers();
  host.classList.add("u1x-step");
  const f = bvFrame(host, { title: s.title, steps: 5, cls: "u1t-stage", qCls: "u1t-q", api });
  f.stage.innerHTML = `<svg viewBox="0 0 346 230" role="img" aria-label="첨단 과학기술을 끄고 켜 보는 장면">${KEYS.map((k) => `<g class="u1t-scene" data-k="${k}">${SCENE[k]}</g>`).join("")}</svg>`;
  const nameEl = el("div", { class: "bv-pill u1t-name" });
  f.stage.appendChild(nameEl);
  const scenes = Object.fromEntries(Array.from(f.stage.querySelectorAll<SVGGElement>(".u1t-scene")).map((g) => [g.dataset.k as Key, g])) as Record<Key, SVGGElement>;

  const on: Record<Key, boolean> = { ar: false, iot: false, ai: false, bio: false };
  let cur: Key = "ar";
  let locked = false;
  let asked = false;
  const cards = Object.fromEntries(KEYS.map((k) => [k, bvCard("u1t-card", { name: TECH[k].card, sub: "아직 켜 보지 않았어요", key: k })])) as Record<Key, BvCard>;
  const offBtn = bvBtn("u1t-off", "기술 끄기");
  const onBtn = bvBtn("u1t-on", "기술 켜기");
  const seg = el("div", { class: "u1x-seg" }, offBtn, onBtn);
  const countDone = (): number => KEYS.filter((k) => cards[k].isDone()).length;

  function paint(hideName = false): void {
    KEYS.forEach((k) => {
      scenes[k].style.display = k === cur ? "" : "none";
      scenes[k].classList.toggle("is-on", on[k]);
      cards[k].on(k === cur);
    });
    offBtn.classList.toggle("main", !on[cur]);
    onBtn.classList.toggle("main", on[cur]);
    offBtn.setAttribute("aria-pressed", String(!on[cur]));
    onBtn.setAttribute("aria-pressed", String(on[cur]));
    nameEl.textContent = on[cur] ? TECH[cur].name : "기술 꺼짐";
    nameEl.classList.toggle("lit", on[cur]);
    nameEl.style.display = hideName ? "none" : "";
    host.dataset.u1Cur = cur;
    host.dataset.u1On = on[cur] ? "1" : "0";
    if (!locked) f.say(on[cur] ? TECH[cur].on : TECH[cur].off);
  }

  function setOn(v: boolean): void {
    if (locked || on[cur] === v) return;
    haptic(HAPTIC.tap);
    on[cur] = v;
    if (v && !cards[cur].isDone()) {
      cards[cur].done();
      cards[cur].sub(TECH[cur].name);
      haptic(HAPTIC.ctaUnlock);
      f.pips(countDone());
    }
    paint();
    if (!asked && countDone() === KEYS.length) {
      asked = true;
      tm.later(askFinal, 2800);
    }
  }
  offBtn.addEventListener("click", () => setOn(false));
  onBtn.addEventListener("click", () => setOn(true));
  KEYS.forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (locked || k === cur) return;
      haptic(HAPTIC.tap);
      cur = k;
      paint();
    }),
  );

  function askFinal(): void {
    locked = true;
    cur = "bio";
    on.bio = true;
    paint(true);
    f.say("네 기술을 모두 켜 봤어요. 무대의 장면을 보고 골라 봐요.");
    f.slot.ask(
      "<b>유전정보</b>를 읽어 사람마다 맞는 약을 만든 기술은?",
      [{ t: "첨단 바이오", ok: true }, { t: "증강 현실" }, { t: "사물 인터넷" }],
      (ok) => api.recordQuiz(ok),
      { why: "생물의 유전정보를 이용하는 기술이 <b>첨단 바이오</b>예요.", onNext: finish },
    );
  }

  function finish(): void {
    f.pips(5);
    paint();
    f.say("체험 끝! 아래에서 네 기술의 이름을 다시 읽어 봐요.");
    f.slot.conclude("<b>증강 현실</b>은 가상 이미지를 겹치고, <b>사물 인터넷</b>은 사물을 잇고, <b>인공지능</b>은 학습하고, <b>첨단 바이오</b>는 유전정보를 써요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.slot.setControls(bvCards(2, cards.ar, cards.iot, cards.ai, cards.bio), seg);
  paint();
  api.setCTA("네 장면에서 기술을 켜 보세요", { enabled: false });
  return () => tm.clear();
};
