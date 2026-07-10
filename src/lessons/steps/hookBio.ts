// hookBio — II 단원(생물의 구성과 다양성) 훅 장면들(hook.ts가 위임).
//   "cellzoom"  L1 · 매끈해 보이는 팔 피부를 확대하면 작은 방(세포)이 드러난다(발견)
//   "stain"     L2 · 염색액으로 핵을 드러낸 뒤 입안 상피세포와 검정말잎 세포 비교로 연결
//   "bodycount" L3 · 우리 몸은 세포가 몇 개일까? 예측(수십조 개)
//   "fingerprint" L4 · 같은 종류의 생물에서도 개체마다 특징이 다르다 — 변이 발견
//   "batbird"   L5 · 박쥐는 갈매기와 다람쥐 중 누구와 공통점이 더 많을까? 예측
//   "foodweb"   L6 · 먹이 관계에서 한 종류가 사라지면 연결된 개체군은 어떻게 달라질까? 예측
// 파운드리 재질 문법(3스톱 그라데이션·키라이트·접촉 그림자·최암색 외곽선)을 따른다.
// 생물 단원 액센트 = 그린(#12B886). 장면 SVG는 모두 240×170 고정 무대다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";
import "../../styles/bio-hook.css";

interface HookStepLike {
  choices?: string[];
}

// ── L1: 잎 속 작은 방(세포) ─────────────────────────────────
export function renderCellZoom(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio bare" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="czBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F8FBFA"/><stop offset=".52" stop-color="#E7F5EF"/><stop offset="1" stop-color="#CFE9DF"/>
      </linearGradient>
      <linearGradient id="czSkin" x1="0" y1="0" x2=".8" y2="1">
        <stop offset="0" stop-color="#FFD5C1"/><stop offset=".48" stop-color="#EFAF91"/><stop offset="1" stop-color="#C97B62"/>
      </linearGradient>
      <linearGradient id="czSkinDeep" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#D99176"/><stop offset=".55" stop-color="#B65F50"/><stop offset="1" stop-color="#823C39"/>
      </linearGradient>
      <radialGradient id="czCellA" cx=".34" cy=".25" r=".92">
        <stop offset="0" stop-color="#FFD4DB"/><stop offset=".52" stop-color="#E98AA0"/><stop offset="1" stop-color="#B64261"/>
      </radialGradient>
      <radialGradient id="czCellB" cx=".32" cy=".24" r=".92">
        <stop offset="0" stop-color="#F7D2EC"/><stop offset=".5" stop-color="#CF8BC0"/><stop offset="1" stop-color="#8C477F"/>
      </radialGradient>
      <radialGradient id="czNuc" cx=".33" cy=".26" r=".82">
        <stop offset="0" stop-color="#B7A7FF"/><stop offset=".5" stop-color="#7259CF"/><stop offset="1" stop-color="#3E2F83"/>
      </radialGradient>
      <linearGradient id="czMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#EFF5F8"/><stop offset=".46" stop-color="#8897A6"/><stop offset="1" stop-color="#35414D"/>
      </linearGradient>
      <radialGradient id="czLens" cx=".38" cy=".3" r=".8">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".24"/><stop offset=".62" stop-color="#E4F5F3" stop-opacity=".1"/><stop offset="1" stop-color="#7EB6B3" stop-opacity=".24"/>
      </radialGradient>
      <clipPath id="czClip"><circle cx="165" cy="72" r="48"/></clipPath>
      <filter id="czShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#243447" flood-opacity=".25"/></filter>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#czBg)"/>
    <ellipse cx="72" cy="145" rx="61" ry="8" fill="#26384A" opacity=".14"/>
    <!-- 실제 팔: 위팔에서 팔꿈치를 지나 손목으로 굽어진 피부 표면 -->
    <path d="M-6 130C20 125 43 117 63 109C78 103 84 92 94 81L113 60" stroke="url(#czSkinDeep)" stroke-width="34"/>
    <path d="M-5 124C22 120 43 112 62 105C74 100 80 90 89 80L108 57" stroke="url(#czSkin)" stroke-width="28"/>
    <path d="M5 116C29 113 48 106 64 100" stroke="#FFE9DE" stroke-width="5" opacity=".45"/>
    <path d="M62 105c7 4 13 4 20 0" stroke="#A85D4F" stroke-width="1.4" opacity=".55"/>
    <path d="M42 109l-2-5m17 0-1-5m32-17 3-4m-14 14 2-5" stroke="#74443D" stroke-width=".8" opacity=".55"/>
    <g fill="#B96E59" opacity=".45"><circle cx="22" cy="119" r=".9"/><circle cx="34" cy="116" r=".8"/><circle cx="50" cy="109" r=".85"/><circle cx="72" cy="99" r=".8"/><circle cx="91" cy="78" r=".8"/></g>
    <circle cx="91" cy="82" r="6" stroke="#12B886" stroke-width="1.4" stroke-dasharray="2 2"/>
    <path d="M97 77C112 63 123 58 132 55" stroke="#12B886" stroke-width="1.5" stroke-dasharray="4 3"/>
    <!-- 확대경 속 피부 조직과 불규칙 동물세포 -->
    <g class="cz-loupe" filter="url(#czShadow)">
      <circle cx="165" cy="72" r="52" fill="url(#czMetal)"/>
      <circle cx="165" cy="72" r="48" fill="#F7DCE2"/>
      <g clip-path="url(#czClip)">
        <path d="M112 34C133 22 155 25 179 17C198 11 217 23 224 40V122H108Z" fill="#F2BAC4"/>
        <g class="cz-cells">
          <path d="M111 38C119 26 136 25 145 34C151 43 145 57 132 59C119 60 107 51 111 38Z" fill="url(#czCellA)" stroke="#A83F5B" stroke-width="1.4"/>
          <path d="M145 31C155 20 174 23 181 35C185 47 177 58 163 58C151 57 139 44 145 31Z" fill="url(#czCellB)" stroke="#844273" stroke-width="1.4"/>
          <path d="M181 31C195 23 212 31 216 44C216 57 203 64 191 58C179 53 173 40 181 31Z" fill="url(#czCellA)" stroke="#A83F5B" stroke-width="1.4"/>
          <path d="M108 62C119 53 137 55 145 67C149 80 139 92 125 92C111 89 102 75 108 62Z" fill="url(#czCellB)" stroke="#844273" stroke-width="1.4"/>
          <path d="M145 61C156 52 176 55 182 69C186 82 176 94 160 92C147 90 137 73 145 61Z" fill="url(#czCellA)" stroke="#A83F5B" stroke-width="1.4"/>
          <path d="M184 61C197 53 216 61 220 75C219 89 205 98 192 91C180 85 175 69 184 61Z" fill="url(#czCellB)" stroke="#844273" stroke-width="1.4"/>
          <path d="M113 94C125 86 143 92 148 105C150 118 136 128 122 122C109 118 103 103 113 94Z" fill="url(#czCellA)" stroke="#A83F5B" stroke-width="1.4"/>
          <path d="M150 96C163 87 183 93 187 108C188 121 173 130 159 123C146 118 140 104 150 96Z" fill="url(#czCellB)" stroke="#844273" stroke-width="1.4"/>
          <path d="M188 96C200 88 217 96 221 110C220 123 206 130 194 123C182 117 179 104 188 96Z" fill="url(#czCellA)" stroke="#A83F5B" stroke-width="1.4"/>
          <g fill="url(#czNuc)" stroke="#45308A" stroke-width=".8">
            <ellipse cx="130" cy="43" rx="5" ry="4"/><ellipse cx="164" cy="40" rx="5.5" ry="4.2"/><ellipse cx="198" cy="44" rx="5" ry="4"/>
            <ellipse cx="126" cy="73" rx="5.2" ry="4"/><ellipse cx="164" cy="74" rx="5.6" ry="4.3"/><ellipse cx="201" cy="76" rx="5.2" ry="4"/>
            <ellipse cx="127" cy="106" rx="5.2" ry="4"/><ellipse cx="165" cy="108" rx="5.4" ry="4.2"/><ellipse cx="202" cy="109" rx="5" ry="4"/>
          </g>
          <g fill="#FFFFFF" opacity=".35"><ellipse cx="123" cy="33" rx="8" ry="3"/><ellipse cx="155" cy="30" rx="7" ry="2.5"/><ellipse cx="153" cy="63" rx="7" ry="2.5"/></g>
        </g>
      </g>
      <circle cx="165" cy="72" r="48" fill="url(#czLens)"/>
      <circle cx="165" cy="72" r="47" stroke="#FFFFFF" stroke-width="2" opacity=".72"/>
      <path d="M132 42c8-11 18-17 29-19" stroke="#FFFFFF" stroke-width="4" opacity=".56"/>
      <path d="M200 108l24 25" stroke="#35414D" stroke-width="13"/>
      <path d="M200 108l24 25" stroke="url(#czMetal)" stroke-width="8"/>
    </g>
  </svg>`;
  const zoomBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "확대경으로 팔을 들여다보기" }));
  scene.append(el("div", { class: "hk-space-wrap" }, fig), zoomBtn);
  helper.innerHTML = "매끈해 보이는 <b>팔의 피부</b>예요. 그런데 아주 크게 확대하면 뭐가 보일까요? 확대경을 대 봐요!";
  face("curious");

  let done = false;
  zoomBtn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.remove("bare");
    fig.classList.add("zoomed");
    zoomBtn.classList.remove("pulse");
    zoomBtn.classList.add("done-static");
    (zoomBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "우아 — 매끈한 줄 알았던 팔이 <b>작은 방들</b>로 가득 차 있어요! 이 방 하나하나가 바로 <b>세포</b>예요.";
    window.setTimeout(() => {
      face("smile");
      helper.innerHTML = "나도, 너도, 지구의 <b>모든 생물</b>이 이런 세포로 이루어져 있어요. 세포 속으로 더 들어가 볼까요?";
      finish();
    }, 1500);
  });
}

// ── L2: 염색해야 보인다 ─────────────────────────────────────
export function renderStain(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-stain clear" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="stBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#18273A"/><stop offset=".54" stop-color="#0D1727"/><stop offset="1" stop-color="#07101D"/>
      </linearGradient>
      <radialGradient id="stField" cx=".38" cy=".34" r=".72">
        <stop offset="0" stop-color="#F8FCF6"/><stop offset=".62" stop-color="#DDE9DF"/><stop offset="1" stop-color="#8EA59A"/>
      </radialGradient>
      <radialGradient id="stCell" cx=".34" cy=".26" r=".9">
        <stop offset="0" stop-color="#FFF9F1" stop-opacity=".72"/><stop offset=".5" stop-color="#EDD7D0" stop-opacity=".52"/><stop offset="1" stop-color="#BC9BA0" stop-opacity=".38"/>
      </radialGradient>
      <radialGradient id="stNuc" cx=".34" cy=".28" r=".82">
        <stop offset="0" stop-color="#9EB7FF"/><stop offset=".5" stop-color="#4E69CF"/><stop offset="1" stop-color="#263A82"/>
      </radialGradient>
      <linearGradient id="stDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9C2FF"/><stop offset=".5" stop-color="#637DDE"/><stop offset="1" stop-color="#314AAB"/></linearGradient>
      <linearGradient id="stGlass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8FA5BC" stop-opacity=".78"/><stop offset=".45" stop-color="#F7FBFF" stop-opacity=".92"/><stop offset="1" stop-color="#6E849D" stop-opacity=".8"/>
      </linearGradient>
      <linearGradient id="stRubber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7661B8"/><stop offset=".52" stop-color="#49357F"/><stop offset="1" stop-color="#251B47"/>
      </linearGradient>
      <linearGradient id="stSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9F1F6"/><stop offset=".5" stop-color="#738497"/><stop offset="1" stop-color="#263343"/></linearGradient>
      <clipPath id="stClip"><circle cx="108" cy="94" r="66"/></clipPath>
      <filter id="stShadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000A14" flood-opacity=".42"/></filter>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#stBg)"/>
    <!-- 실제 현미경의 원형 시야 -->
    <ellipse cx="108" cy="158" rx="68" ry="6" fill="#000812" opacity=".45"/>
    <circle cx="108" cy="94" r="71" fill="url(#stSteel)" filter="url(#stShadow)"/>
    <circle cx="108" cy="94" r="66" fill="url(#stField)"/>
    <g clip-path="url(#stClip)" class="st-cells">
      <path d="M35 61C50 42 77 42 92 56C104 68 98 88 78 96C54 103 31 88 35 61Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M78 42C96 27 124 31 135 49C143 64 130 83 110 86C88 88 68 61 78 42Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M127 45C145 34 172 43 181 62C188 80 171 96 151 94C131 91 115 59 127 45Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M26 96C42 80 67 83 80 101C89 117 75 136 55 137C34 136 15 113 26 96Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M70 87C90 75 119 86 126 106C132 124 113 142 92 137C70 132 56 98 70 87Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M119 88C139 76 165 88 172 108C176 128 155 143 135 136C116 129 105 99 119 88Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <path d="M158 92C176 80 197 94 202 113C205 131 186 146 170 136C154 127 145 102 158 92Z" fill="url(#stCell)" stroke="#927D84" stroke-width="1.5"/>
      <g class="st-nuc" fill="url(#stNuc)" stroke="#263A82" stroke-width="1">
        <ellipse cx="66" cy="69" rx="7" ry="5.5"/><ellipse cx="108" cy="56" rx="6.5" ry="5.2"/><ellipse cx="151" cy="66" rx="7.2" ry="5.4"/>
        <ellipse cx="52" cy="111" rx="6.8" ry="5.2"/><ellipse cx="96" cy="111" rx="7.4" ry="5.5"/><ellipse cx="143" cy="111" rx="7" ry="5.3"/><ellipse cx="178" cy="116" rx="6.4" ry="5"/>
      </g>
      <g fill="#FFFFFF" opacity=".26"><path d="M44 58c13-10 27-11 38-5" stroke="#fff" stroke-width="3"/><path d="M86 42c12-7 26-7 36 0" stroke="#fff" stroke-width="3"/><path d="M131 50c11-5 23-2 31 5" stroke="#fff" stroke-width="3"/></g>
    </g>
    <circle cx="108" cy="94" r="66" fill="none" stroke="#D9E6EB" stroke-width="2" opacity=".65"/>
    <path d="M63 46c15-14 36-20 55-18" stroke="#FFFFFF" stroke-width="4" opacity=".45"/>
    <!-- 전문 실험용 스포이트: 눈금 유리관·염색액·정밀 팁 -->
    <g class="st-dropper" transform="translate(183 10) rotate(28)" filter="url(#stShadow)">
      <path d="M-10 3C-10-5-5-10 0-10S10-5 10 3C10 10 6 14 6 19H-6C-6 14-10 10-10 3Z" fill="url(#stRubber)" stroke="#17102F" stroke-width="1.4"/>
      <path d="M-7 18H7V24H-7Z" fill="url(#stSteel)" stroke="#35445A" stroke-width="1"/>
      <rect x="-5.5" y="23" width="11" height="49" rx="3" fill="url(#stGlass)" stroke="#70869D" stroke-width="1"/>
      <path d="M-4 45H4V70H-4Z" fill="url(#stDrop)" opacity=".9"/>
      <path d="M-5 72H5L1.8 88A1.9 1.9 0 0 1-1.8 88Z" fill="url(#stGlass)" stroke="#70869D" stroke-width="1"/>
      <path d="M-2.5 76H2.5L1.2 86H-1.2Z" fill="url(#stDrop)" opacity=".8"/>
      <path d="M-8 30h4m-4 8h4m-4 8h4m-4 8h4" stroke="#52677D" stroke-width=".9"/>
      <path d="M-3 26v42" stroke="#FFFFFF" stroke-width="1.7" opacity=".58"/>
      <path class="st-bead" d="M0 90C3 93 4.3 95.4 4.3 98A4.3 4.3 0 0 1-4.3 98C-4.3 95.4-3 93 0 90Z" fill="url(#stDrop)"/>
    </g>
  </svg>`;
  const dropBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "염색액 한 방울 떨어뜨리기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), dropBtn, choicesBox);
  helper.innerHTML = "현미경에 세포를 올렸는데 <b>너무 투명해서</b> 잘 안 보여요. 과학자들은 왜 <b>염색액</b>을 떨어뜨릴까요?";
  face("curious");

  let dropped = false;
  dropBtn.addEventListener("click", () => {
    if (dropped) return;
    dropped = true;
    fig.classList.remove("clear");
    fig.classList.add("stained");
    dropBtn.classList.remove("pulse");
    dropBtn.classList.add("done-static");
    (dropBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "한 방울 떨어뜨리자 <b>핵이 또렷하게</b> 드러났어요! 세포가 커진 걸까요, 투명하던 부분에 색이 들어간 걸까요?";
    window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["특정 부분(핵)을 물들여 잘 보이게 한다", "세포를 더 크게 키운다", "세포를 움직이게 한다"],
        good: "맞아요! 염색액은 세포를 크게 만드는 게 아니라 <b>핵 같은 특정 부분을 물들여</b> 잘 보이게 해요. 이제 <b>입안 상피세포와 검정말잎 세포</b>를 현미경으로 비교해 봐요!",
        bad: "염색액을 넣어도 세포가 커지거나 움직이지 않아요. 투명한 세포의 <b>핵 같은 부분에 색이 들어가</b> 구조가 또렷해져요. 이제 입안 상피세포와 검정말잎 세포를 비교해 봐요.",
        onDone: finish,
      });
    }, 900);
  });
}

// ── L3: 우리 몸은 세포 몇 개? ───────────────────────────────
export function renderBodyCount(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-body" });
  let bodyCells = "";
  for (let y = 16, row = 0; y <= 158; y += 5, row += 1) {
    for (let x = 25, col = 0; x <= 127; x += 5, col += 1) {
      const tone = (row + col) % 3;
      const r = tone === 0 ? 1.45 : tone === 1 ? 1.15 : 1.3;
      bodyCells += `<circle cx="${x + (row % 2 ? 1.7 : 0)}" cy="${y}" r="${r}" fill="${tone === 0 ? "#8BE0D0" : tone === 1 ? "#59B9B3" : "#B7EBDB"}" opacity="${tone === 1 ? ".72" : ".9"}"/>`;
    }
  }
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="bcBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F5FAFB"/><stop offset=".54" stop-color="#DDEDEF"/><stop offset="1" stop-color="#C5DEE2"/>
      </linearGradient>
      <linearGradient id="bcBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#256F78"/><stop offset=".52" stop-color="#164A58"/><stop offset="1" stop-color="#0B2938"/></linearGradient>
      <radialGradient id="bcCellA" cx=".34" cy=".26" r=".92"><stop offset="0" stop-color="#FFDCE1"/><stop offset=".5" stop-color="#E78EA1"/><stop offset="1" stop-color="#A83E5C"/></radialGradient>
      <radialGradient id="bcCellB" cx=".34" cy=".26" r=".92"><stop offset="0" stop-color="#EEDAF8"/><stop offset=".5" stop-color="#B989CF"/><stop offset="1" stop-color="#70458C"/></radialGradient>
      <radialGradient id="bcNuc" cx=".32" cy=".25" r=".82"><stop offset="0" stop-color="#A99BFF"/><stop offset=".5" stop-color="#6957C7"/><stop offset="1" stop-color="#352978"/></radialGradient>
      <linearGradient id="bcRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF8F6"/><stop offset=".48" stop-color="#6BB7B1"/><stop offset="1" stop-color="#205C65"/></linearGradient>
      <clipPath id="bcBodyClip">
        <circle cx="76" cy="27" r="11"/><rect x="72" y="37" width="8" height="8" rx="3"/>
        <path d="M56 45C63 40 69 41 76 41S89 40 96 45L106 79L94 105L91 153H80L76 109L72 153H61L58 105L46 79Z"/>
        <path d="M52 50L31 93" stroke="#000" stroke-width="11"/><path d="M100 50L121 93" stroke="#000" stroke-width="11"/>
      </clipPath>
      <clipPath id="bcZoomClip"><circle cx="183" cy="67" r="39"/></clipPath>
      <filter id="bcShadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#203646" flood-opacity=".28"/></filter>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#bcBg)"/>
    <!-- 성인 인체 실루엣: 수백 개의 세포 점이 몸 전체를 채움 -->
    <ellipse cx="76" cy="158" rx="50" ry="6" fill="#203646" opacity=".16"/>
    <g filter="url(#bcShadow)">
      <circle cx="76" cy="27" r="11" fill="url(#bcBody)" stroke="#0A2A36" stroke-width="1.5"/>
      <rect x="72" y="36" width="8" height="10" rx="3" fill="url(#bcBody)"/>
      <path d="M56 45C63 40 69 41 76 41S89 40 96 45L106 79L94 105L91 153H80L76 109L72 153H61L58 105L46 79Z" fill="url(#bcBody)" stroke="#0A2A36" stroke-width="1.5"/>
      <path d="M52 50L31 93M100 50L121 93" stroke="url(#bcBody)" stroke-width="11"/>
      <g clip-path="url(#bcBodyClip)">${bodyCells}</g>
      <path d="M65 19C70 15 77 14 82 17" stroke="#A6DCD5" stroke-width="2" opacity=".45"/>
      <path d="M59 47C64 43 70 43 74 44" stroke="#C5EFE8" stroke-width="2.5" opacity=".32"/>
    </g>
    <circle cx="102" cy="70" r="5" fill="#E3F8F4" stroke="#12B886" stroke-width="1.5"/>
    <path d="M107 67C127 57 139 52 146 50" stroke="#278E85" stroke-width="1.6" stroke-dasharray="4 3"/>
    <!-- 확대 인셋: 세포벽·엽록체가 없는 불규칙 동물세포 -->
    <g class="bc-zoom" filter="url(#bcShadow)">
      <circle cx="183" cy="67" r="44" fill="url(#bcRing)"/>
      <circle cx="183" cy="67" r="39" fill="#F5DDE3"/>
      <g clip-path="url(#bcZoomClip)">
        <path d="M140 39C149 25 169 25 178 38C184 50 175 62 160 62C146 62 135 50 140 39Z" fill="url(#bcCellA)" stroke="#9B3855" stroke-width="1.3"/>
        <path d="M178 35C190 24 209 29 216 43C219 56 207 67 193 63C180 59 170 45 178 35Z" fill="url(#bcCellB)" stroke="#69407F" stroke-width="1.3"/>
        <path d="M136 65C148 55 168 60 175 74C179 88 165 100 150 95C136 91 126 75 136 65Z" fill="url(#bcCellB)" stroke="#69407F" stroke-width="1.3"/>
        <path d="M174 65C187 54 207 60 214 75C217 90 203 101 188 96C173 91 163 76 174 65Z" fill="url(#bcCellA)" stroke="#9B3855" stroke-width="1.3"/>
        <path d="M145 96C159 86 179 93 184 108C185 121 170 129 156 122C143 116 136 103 145 96Z" fill="url(#bcCellA)" stroke="#9B3855" stroke-width="1.3"/>
        <path d="M184 96C197 87 215 95 219 109C219 122 205 130 193 123C181 117 175 104 184 96Z" fill="url(#bcCellB)" stroke="#69407F" stroke-width="1.3"/>
        <g fill="url(#bcNuc)" stroke="#352978" stroke-width=".8"><ellipse cx="160" cy="45" rx="5" ry="4"/><ellipse cx="196" cy="45" rx="5.5" ry="4"/><ellipse cx="153" cy="78" rx="5.2" ry="4"/><ellipse cx="192" cy="79" rx="5.5" ry="4.2"/><ellipse cx="163" cy="107" rx="5.2" ry="4"/><ellipse cx="200" cy="109" rx="5" ry="4"/></g>
      </g>
      <circle cx="183" cy="67" r="39" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".72"/>
      <path d="M154 42c8-10 18-14 27-14" stroke="#FFFFFF" stroke-width="3.5" opacity=".5"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "우리 몸도 세포로 이루어져 있어요. 그렇다면 <b>사람 한 명의 몸</b>은 세포가 몇 개나 될까요? 예상해 봐요!";
  face("curious");
  ask(choicesBox, helper, {
    choices: s.choices ?? ["수십조 개에 이른다", "한 개뿐이다", "손으로 셀 만큼 몇 개다"],
    good: "맞아요! 사람의 몸은 <b>수십조 개</b>에 이르는 세포로 이루어져 있어요. 이 많은 세포가 아무렇게나 뭉친 게 아니라 <b>차곡차곡 모여</b> 몸을 이루죠.",
    bad: "한두 개나 손으로 셀 정도가 아니에요. 사람의 몸에는 <b>수십조 개</b>에 이르는 세포가 있고, 이 세포들이 <b>단계를 이루며 모여</b> 몸을 만들어요.",
    onDone: () => {
      fig.classList.add("reveal");
      face("surprised");
      finish();
    },
  });
}

// ── L4: 우리 반 지문은 다 다르다(변이) ──────────────────────
// 같은 '사람'인데 지문 무늬가 저마다 다르다 — 변이의 대표 예. 카드를 탭해 스캔.
export function renderFingerprint(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const NS = "http://www.w3.org/2000/svg";
  // 5장의 지문 카드 — 무늬 유형이 제각각(소용돌이·왼고리·아치·오른고리·이중고리)
  const RIDGES: Record<string, string> = {
    whorl: `<ellipse rx="2.6" ry="3.3"/><ellipse rx="5" ry="6.1"/><ellipse rx="7.3" ry="9"/><ellipse rx="9.6" ry="12"/><ellipse rx="11.9" ry="15"/><ellipse rx="14.2" ry="18"/><path d="M-14 7C-10 19 9 22 15 9"/><path d="M-15-6C-10-20 10-22 15-7"/>`,
    loopL: `<path d="M13-19C-8-17-11 17 10 19"/><path d="M13-16C-5-14-7 14 9 16"/><path d="M13-12C-2-11-4 11 8 13"/><path d="M12-8C2-8 0 8 8 9"/><path d="M11-4C5-4 4 4 8 5"/><path d="M-12-16C-17-5-17 7-12 17"/><path d="M-8-19C-13-8-13 9-8 19"/>`,
    arch: `<path d="M-15-9Q0-23 15-9"/><path d="M-16-5Q0-19 16-5"/><path d="M-16 0Q0-14 16 0"/><path d="M-16 5Q0-9 16 5"/><path d="M-15 10Q0-4 15 10"/><path d="M-14 15Q0 2 14 15"/><path d="M-11 19Q0 8 11 19"/>`,
    loopR: `<path d="M-13-19C8-17 11 17-10 19"/><path d="M-13-16C5-14 7 14-9 16"/><path d="M-13-12C2-11 4 11-8 13"/><path d="M-12-8C-2-8 0 8-8 9"/><path d="M-11-4C-5-4-4 4-8 5"/><path d="M12-16C17-5 17 7 12 17"/><path d="M8-19C13-8 13 9 8 19"/>`,
    dloop: `<path d="M-1 0C5-5 11-1 9 6C7 13-5 14-10 7C-16-1-8-12 3-11C15-10 18 4 13 14"/><path d="M1 0C-5-5-11-1-9 6C-7 13 5 14 10 7C16-1 8-12-3-11C-15-10-18 4-13 14"/><path d="M-13-15C-4-22 8-21 15-13"/><path d="M-15 18C-6 23 8 23 15 16"/>`,
  };
  const TYPES = ["whorl", "loopL", "arch", "loopR", "dloop"];
  const card = (i: number): string => {
    const x = 8 + i * 45; // 카드 좌상단 x (폭 42, 간격 3)
    const cx = x + 21, cy = 79; // 지문 오벌 중심
    return `<g class="fp-card fp-${i}" style="cursor:pointer">
      <rect x="${x}" y="25" width="42" height="114" rx="8" fill="url(#fpFrame)" stroke="#07121E" stroke-width="1.4"/>
      <rect x="${x + 3}" y="29" width="36" height="93" rx="6" fill="url(#fpGlass)" stroke="#355264" stroke-width="1"/>
      <ellipse class="fp-pad" cx="${cx}" cy="${cy}" rx="16" ry="22" fill="url(#fpPad)" stroke="#B9C2BE" stroke-width="1.1"/>
      <g class="fp-ridge" clip-path="url(#fpc${i})" transform="translate(${cx} ${cy})" stroke="#1E3F46" stroke-width="1.05" opacity=".96">${RIDGES[TYPES[i]]}</g>
      <path d="M${x + 7} 36h18" stroke="#D7F7F2" stroke-width="2" opacity=".22"/>
      <circle cx="${x + 9}" cy="130" r="2.2" fill="#12B886"/><circle cx="${x + 16}" cy="130" r="2.2" fill="#53718A"/>
      <g class="fp-check"><circle cx="${x + 32}" cy="130" r="6.5" fill="#12B886"/><path d="M${x + 29} 130l2 2 4-4" stroke="#fff" stroke-width="1.8"/></g>
      <line class="fp-scan" x1="${x + 4}" y1="${cy}" x2="${x + 38}" y2="${cy}" stroke="#63F3CE" stroke-width="2"/>
    </g>`;
  };
  const clips = TYPES.map((_, i) => `<clipPath id="fpc${i}"><ellipse cx="0" cy="0" rx="15" ry="21"/></clipPath>`).join("");
  const fig = el("div", { class: "hk-fp" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="${NS}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="fpBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#152535"/><stop offset=".55" stop-color="#091522"/><stop offset="1" stop-color="#050B13"/></linearGradient>
      <linearGradient id="fpFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5D7488"/><stop offset=".48" stop-color="#263B4C"/><stop offset="1" stop-color="#101D29"/></linearGradient>
      <linearGradient id="fpGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173343"/><stop offset=".52" stop-color="#0A202D"/><stop offset="1" stop-color="#06131D"/></linearGradient>
      <radialGradient id="fpPad" cx=".34" cy=".25" r=".9"><stop offset="0" stop-color="#E8F0EC"/><stop offset=".52" stop-color="#B7C9C1"/><stop offset="1" stop-color="#718D86"/></radialGradient>
      <radialGradient id="fpGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2DD4A6" stop-opacity=".22"/><stop offset="1" stop-color="#2DD4A6" stop-opacity="0"/></radialGradient>
      ${clips}
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#fpBg)"/>
    <ellipse cx="120" cy="86" rx="105" ry="73" fill="url(#fpGlow)"/>
    <path d="M18 18H222" stroke="#5A7487" stroke-width="1" opacity=".36"/>
    <path d="M24 14h32" stroke="#B7D0DA" stroke-width="2.5" opacity=".24"/>
    <circle cx="213" cy="16" r="3" fill="#12B886"/><circle cx="203" cy="16" r="3" fill="#D1A642"/>
    ${TYPES.map((_, i) => card(i)).join("")}
    <path d="M18 149H222" stroke="#324B5C" stroke-width="1"/>
    <ellipse cx="120" cy="150" rx="74" ry="5" fill="#000812" opacity=".38"/>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "우리 반 친구 <b>다섯 명</b>의 지문이에요. 모두 같은 종류의 생물인 <b>사람</b>인데 무늬가 조금씩 달라요. 카드를 눌러 스캔해 봐요!";
  face("curious");

  let tapped = 0;
  let asked = false;
  [...fig.querySelectorAll<HTMLElement>(".fp-card")].forEach((c) => {
    c.addEventListener("click", () => {
      if (c.classList.contains("on")) return;
      c.classList.add("on");
      tapped += 1;
      haptic(HAPTIC.tap);
      if (tapped >= 3 && !asked) {
        asked = true;
        face("surprised");
        helper.innerHTML = "봤죠? <b>지문 무늬가 다 달라요!</b> 같은 사람인데도 개체마다 특징이 다른 것 — 이걸 뭐라고 부를까요?";
        ask(choicesBox, helper, {
          choices: ["변이 — 같은 종 안의 차이", "돌연변이 딱 하나", "서로 다른 종이라서"],
          good: "맞아요, <b>변이</b>예요! 지문처럼 <b>같은 종류의 생물</b>에서 개체마다 나타나는 서로 다른 특징을 변이라고 해요. 랩에서 환경과 어떤 관계가 있는지 확인해 봐요.",
          bad: "돌연변이 하나 때문도, 서로 다른 종이기 때문도 아니에요. <b>같은 종류의 생물</b>에서 개체마다 나타나는 특징의 차이가 바로 <b>변이</b>예요.",
          onDone: finish,
        });
      } else if (tapped < 3) {
        helper.innerHTML = `${tapped}명 스캔 — 무늬 모양을 비교해 보세요. 세 명은 눌러 봐요!`;
      }
    });
  });
}

// ── L5: 박쥐는 어느 무리? ───────────────────────────────────
export function renderBatBird(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-night" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="bbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#182447"/><stop offset=".55" stop-color="#66577A"/><stop offset="1" stop-color="#E39A6A"/></linearGradient>
      <linearGradient id="bbWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6D7694"/><stop offset=".5" stop-color="#374B6A"/><stop offset="1" stop-color="#182A43"/></linearGradient>
      <radialGradient id="bbSun" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#FFF5C8"/><stop offset=".5" stop-color="#F9CA78"/><stop offset="1" stop-color="#D77E4D"/></radialGradient>
      <linearGradient id="bbBatWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#756D80"/><stop offset=".5" stop-color="#433D52"/><stop offset="1" stop-color="#201D2A"/></linearGradient>
      <radialGradient id="bbBatFur" cx=".35" cy=".24" r=".9"><stop offset="0" stop-color="#846D66"/><stop offset=".5" stop-color="#54423F"/><stop offset="1" stop-color="#261F24"/></radialGradient>
      <linearGradient id="bbGull" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".52" stop-color="#D9E0E5"/><stop offset="1" stop-color="#8A98A5"/></linearGradient>
      <linearGradient id="bbGullWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C7D0D8"/><stop offset=".5" stop-color="#8795A3"/><stop offset="1" stop-color="#4A5968"/></linearGradient>
      <radialGradient id="bbSquirrel" cx=".32" cy=".25" r=".92"><stop offset="0" stop-color="#D9A268"/><stop offset=".5" stop-color="#A96739"/><stop offset="1" stop-color="#63391F"/></radialGradient>
      <linearGradient id="bbBranch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9B6B44"/><stop offset=".5" stop-color="#68432D"/><stop offset="1" stop-color="#39261C"/></linearGradient>
      <filter id="bbShadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#101626" flood-opacity=".42"/></filter>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#bbSky)"/>
    <circle cx="196" cy="43" r="21" fill="url(#bbSun)" opacity=".92"/>
    <path d="M4 112C31 98 54 102 82 110C109 119 142 108 168 101C196 94 218 99 236 106V166H4Z" fill="url(#bbWater)"/>
    <path d="M4 123C37 117 64 126 95 121C126 117 155 110 190 116C209 119 223 118 236 115" stroke="#D8BDD0" stroke-width="1.4" opacity=".38"/>
    <path d="M4 103C25 93 45 93 64 100C51 102 39 108 29 117L4 119ZM178 101C198 91 219 91 236 98V126C222 116 202 111 178 113Z" fill="#263A38"/>
    <circle cx="31" cy="31" r="1.1" fill="#E8EEFF"/><circle cx="66" cy="21" r="1.4" fill="#E8EEFF"/><circle cx="151" cy="28" r="1.1" fill="#E8EEFF"/>
    <g filter="url(#bbShadow)">
      <path d="M112 65C95 48 77 43 54 50C64 57 64 66 56 78C73 70 84 79 101 91C101 79 107 72 116 70Z" fill="url(#bbBatWing)" stroke="#171620" stroke-width="1.4"/>
      <path d="M128 65C145 48 163 43 186 50C176 57 176 66 184 78C167 70 156 79 139 91C139 79 133 72 124 70Z" fill="url(#bbBatWing)" stroke="#171620" stroke-width="1.4"/>
      <path d="M112 66L78 49M109 71L61 56M106 78L57 76M128 66L162 49M131 71L179 56M134 78L183 76" stroke="#8E8295" stroke-width="1.2" opacity=".72"/>
      <path d="M114 59C114 52 117 47 120 47S126 52 126 59L131 83C129 94 124 101 120 105C116 101 111 94 109 83Z" fill="url(#bbBatFur)" stroke="#211C22" stroke-width="1.4"/>
      <path d="M114 54L112 42L119 49M126 54L128 42L121 49" fill="url(#bbBatFur)" stroke="#211C22" stroke-width="1.3"/>
      <path d="M116 62C118 59 122 59 124 62L122 67H118Z" fill="#A57D73"/>
      <circle cx="117" cy="57" r="1.1" fill="#D5B766"/><circle cx="123" cy="57" r="1.1" fill="#D5B766"/>
      <path d="M115 79l-9 8M125 79l9 8" stroke="#2A2228" stroke-width="2"/>
    </g>
    <g class="bb-side bb-bird" filter="url(#bbShadow)">
      <ellipse cx="39" cy="126" rx="21" ry="9" fill="url(#bbGull)" stroke="#53616E" stroke-width="1.1"/><circle cx="55" cy="120" r="7" fill="url(#bbGull)" stroke="#53616E" stroke-width="1"/>
      <path d="M61 120l12 3-12 3z" fill="#E4A044" stroke="#9B6227" stroke-width=".8"/><path d="M29 124C39 111 50 114 53 125C43 122 37 128 29 124Z" fill="url(#bbGullWing)" stroke="#53616E" stroke-width="1"/><path d="M19 126l-9-4 6 8" fill="#D7E0E5"/>
      <circle cx="57" cy="118" r="1.2" fill="#1A2731"/><path d="M36 135v7m9-7v7m-13 1h8m1 0h8" stroke="#B5793B" stroke-width="1.3"/><ellipse cx="42" cy="147" rx="27" ry="3" fill="#111C2A" opacity=".26"/>
    </g>
    <path d="M168 145C191 139 213 143 236 135" stroke="url(#bbBranch)" stroke-width="9"/><path d="M191 141l-7-14M220 140l9-14" stroke="#543622" stroke-width="3"/>
    <g class="bb-side bb-mouse" filter="url(#bbShadow)">
      <path d="M216 129C231 116 231 94 215 92C201 91 198 105 207 112C213 117 217 111 216 105C225 116 224 126 216 129Z" fill="url(#bbSquirrel)" stroke="#5B341F" stroke-width="1.2"/>
      <ellipse cx="201" cy="130" rx="13" ry="10" fill="url(#bbSquirrel)" stroke="#5B341F" stroke-width="1.2"/><circle cx="190" cy="123" r="7" fill="url(#bbSquirrel)" stroke="#5B341F" stroke-width="1"/>
      <path d="M186 117l1-7 5 6M192 117l4-6 1 8" fill="url(#bbSquirrel)" stroke="#5B341F" stroke-width="1"/><path d="M184 125l-6 2 7 2" fill="#E0B286"/><circle cx="188" cy="122" r="1.2" fill="#1B1A18"/>
      <path d="M195 137l-3 6m15-6 4 5" stroke="#5B341F" stroke-width="2"/><path d="M185 126l-6-3m7 5-7 1" stroke="#E6C9AC" stroke-width=".8"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "<b>박쥐</b>는 날개가 있어 갈매기처럼 날아요. 하지만 털이 있고 새끼를 낳아 젖을 먹이죠. 박쥐는 <b>갈매기와 다람쥐</b> 중 누구와 공통점이 더 많을까요?";
  face("curious");
  ask(choicesBox, helper, {
    choices: s.choices ?? ["털이 있고 새끼에게 젖을 먹이는 다람쥐", "날개가 있고 하늘을 나는 갈매기", "둘과 공통점이 전혀 없다"],
    good: "맞아요. 박쥐와 다람쥐는 <b>털이 있고 새끼를 낳아 젖을 먹이는</b> 공통점이 있어요. 둘 다 <b>포유류</b>이고, 갈매기는 조류예요. 분류할 때는 여러 고유한 특징을 함께 살펴요.",
    bad: "날개 하나만 보면 갈매기와 닮았지만, 박쥐는 <b>털이 있고 새끼를 낳아 젖을 먹여요</b>. 이런 특징을 공유하는 다람쥐와 함께 <b>포유류</b>로 분류해요.",
    onDone: () => {
      face("surprised");
      finish();
    },
  });
}

// ── L6: 먹이그물에서 하나가 빠지면? ─────────────────────────
export function renderFoodWeb(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-web full" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="fwBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0F7F0"/><stop offset=".55" stop-color="#D7E9DE"/><stop offset="1" stop-color="#B9D7C8"/></linearGradient>
      <linearGradient id="fwGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8BBE78"/><stop offset=".5" stop-color="#5D9660"/><stop offset="1" stop-color="#315E46"/></linearGradient>
      <radialGradient id="fwLeaf" cx=".34" cy=".25" r=".9"><stop offset="0" stop-color="#A9E37E"/><stop offset=".5" stop-color="#59B861"/><stop offset="1" stop-color="#246E45"/></radialGradient>
      <linearGradient id="fwHop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D7ED73"/><stop offset=".52" stop-color="#87B942"/><stop offset="1" stop-color="#3E6F26"/></linearGradient>
      <linearGradient id="fwLarva" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8E984"/><stop offset=".5" stop-color="#78B953"/><stop offset="1" stop-color="#386D38"/></linearGradient>
      <radialGradient id="fwFrog" cx=".34" cy=".24" r=".9"><stop offset="0" stop-color="#8DDC8E"/><stop offset=".5" stop-color="#45A76B"/><stop offset="1" stop-color="#1C654A"/></radialGradient>
      <radialGradient id="fwMouse" cx=".34" cy=".24" r=".9"><stop offset="0" stop-color="#CDBDAE"/><stop offset=".5" stop-color="#948173"/><stop offset="1" stop-color="#5B4A43"/></radialGradient>
      <linearGradient id="fwBird" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8EB1C9"/><stop offset=".5" stop-color="#517791"/><stop offset="1" stop-color="#29485D"/></linearGradient>
      <linearGradient id="fwHawk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C69A6E"/><stop offset=".5" stop-color="#805B3B"/><stop offset="1" stop-color="#412D22"/></linearGradient>
      <marker id="fwArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 .5L5 3 0 5.5Z" fill="#537C6F"/></marker>
      <filter id="fwShadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#214234" flood-opacity=".3"/></filter>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#fwBg)"/>
    <path d="M4 130C38 120 70 128 102 124C138 119 171 126 202 118C217 114 227 115 236 118V166H4Z" fill="url(#fwGround)" opacity=".48"/>
    <!-- 화살표는 먹이에서 소비자로 향한다. 첫 두 경로만 메뚜기 제거 시 약해진다. -->
    <g class="fw-links" stroke="#537C6F" stroke-width="1.45" opacity=".76">
      <path d="M28 137Q34 120 42 113" marker-end="url(#fwArr)"/>
      <path d="M49 101Q57 84 67 77" marker-end="url(#fwArr)"/>
      <path d="M86 136Q91 124 97 118" marker-end="url(#fwArr)"/>
      <path d="M149 137Q157 125 162 117" marker-end="url(#fwArr)"/>
      <path d="M92 135Q112 102 130 79" marker-end="url(#fwArr)"/>
      <path d="M104 105Q111 84 130 76" marker-end="url(#fwArr)"/>
      <path d="M104 105Q91 83 78 77" marker-end="url(#fwArr)"/>
      <path d="M171 102Q181 66 194 43" marker-end="url(#fwArr)"/>
      <path d="M80 65Q125 41 190 36" marker-end="url(#fwArr)"/>
      <path d="M145 64Q165 45 190 37" marker-end="url(#fwArr)"/>
    </g>
    <!-- 생산자 세 무리 -->
    <g class="fw-node fw-grass" filter="url(#fwShadow)"><ellipse cx="25" cy="151" rx="17" ry="3" fill="#214234" opacity=".22"/><g stroke="#2C7647" stroke-width="3"><path d="M25 148V128"/><path d="M24 140l-9-8M25 136l8-10M23 145l-11-5M26 143l12-7"/></g><g fill="url(#fwLeaf)"><ellipse cx="16" cy="132" rx="5" ry="2.5" transform="rotate(35 16 132)"/><ellipse cx="34" cy="128" rx="5" ry="2.5" transform="rotate(-40 34 128)"/></g></g>
    <g class="fw-node fw-plant" filter="url(#fwShadow)"><path d="M84 150V126" stroke="#2B7045" stroke-width="3"/><g fill="url(#fwLeaf)" stroke="#2B7045" stroke-width=".7"><ellipse cx="77" cy="132" rx="8" ry="4" transform="rotate(32 77 132)"/><ellipse cx="91" cy="128" rx="8" ry="4" transform="rotate(-34 91 128)"/><ellipse cx="77" cy="142" rx="8" ry="4" transform="rotate(28 77 142)"/><ellipse cx="92" cy="139" rx="8" ry="4" transform="rotate(-30 92 139)"/></g></g>
    <g class="fw-node fw-berries" filter="url(#fwShadow)"><path d="M146 151V127m0 7-8-7m8 11 10-9" stroke="#2B7045" stroke-width="2.5"/><g fill="#B84F55" stroke="#743138" stroke-width=".8"><circle cx="137" cy="126" r="4"/><circle cx="144" cy="122" r="4"/><circle cx="153" cy="127" r="4"/></g><g fill="url(#fwLeaf)"><ellipse cx="137" cy="137" rx="7" ry="3.5" transform="rotate(24 137 137)"/><ellipse cx="156" cy="137" rx="7" ry="3.5" transform="rotate(-28 156 137)"/></g></g>
    <!-- 초식·잡식 생물 -->
    <g class="fw-node fw-hop" filter="url(#fwShadow)"><ellipse cx="44" cy="109" rx="10" ry="5" fill="url(#fwHop)" stroke="#426C25" stroke-width="1"/><circle cx="54" cy="106" r="4.2" fill="url(#fwHop)" stroke="#426C25" stroke-width="1"/><path d="M39 109L27 99M45 112L32 122M50 111l10 9M55 104l8-5M56 103l6-7" stroke="#426C25" stroke-width="1.5"/><path d="M39 105l-6-5 9 1" fill="#B9DC69"/><circle cx="55" cy="105" r=".8" fill="#162318"/></g>
    <g class="fw-node fw-larva" filter="url(#fwShadow)"><g fill="url(#fwLarva)" stroke="#3C6F35" stroke-width=".8"><circle cx="92" cy="112" r="5"/><circle cx="99" cy="111" r="5"/><circle cx="106" cy="110" r="5"/><circle cx="113" cy="108" r="5"/></g><circle cx="115" cy="106" r=".8" fill="#1A2B1D"/><path d="M92 116l-2 4m9-5-1 5m8-6 1 5" stroke="#3C6F35" stroke-width="1"/></g>
    <g class="fw-node fw-mouse" filter="url(#fwShadow)"><ellipse cx="166" cy="109" rx="13" ry="8" fill="url(#fwMouse)" stroke="#584840" stroke-width="1"/><circle cx="177" cy="105" r="6" fill="url(#fwMouse)" stroke="#584840" stroke-width="1"/><circle cx="174" cy="100" r="3" fill="#B8A89C" stroke="#584840" stroke-width=".7"/><path d="M153 109c-13-8-20 4-13 9" stroke="#78665C" stroke-width="1.4"/><path d="M181 106l6 2-6 2" fill="#D4A27D"/><circle cx="179" cy="104" r=".8" fill="#171717"/></g>
    <!-- 포식자와 대체 먹이 경로 -->
    <g class="fw-node fw-frog" filter="url(#fwShadow)"><ellipse cx="74" cy="72" rx="13" ry="9" fill="url(#fwFrog)" stroke="#19583F" stroke-width="1"/><circle cx="67" cy="65" r="4" fill="url(#fwFrog)"/><circle cx="80" cy="65" r="4" fill="url(#fwFrog)"/><circle cx="67" cy="64" r="1" fill="#13241B"/><circle cx="80" cy="64" r="1" fill="#13241B"/><path d="M63 77l-9 6m28-6 9 6M68 79l-5 7m16-7 5 7" stroke="#19583F" stroke-width="2"/></g>
    <g class="fw-node fw-bird" filter="url(#fwShadow)"><ellipse cx="136" cy="70" rx="13" ry="8" fill="url(#fwBird)" stroke="#29485D" stroke-width="1"/><circle cx="146" cy="65" r="5" fill="url(#fwBird)" stroke="#29485D" stroke-width="1"/><path d="M150 65l8 3-8 3z" fill="#D4A03D"/><path d="M128 70l-10-5 6 10" fill="#63879D"/><path d="M132 69c4-7 9-7 11 0" fill="#A3BFCE" opacity=".7"/><circle cx="147" cy="64" r=".8" fill="#101820"/><path d="M135 78v5m5-5v5" stroke="#6B583D" stroke-width="1"/></g>
    <g class="fw-node fw-hawk" filter="url(#fwShadow)"><path d="M197 38C185 26 170 27 161 34C174 32 180 39 187 45C191 51 203 51 208 44C216 36 224 34 234 36C224 27 211 27 202 36Z" fill="url(#fwHawk)" stroke="#412D22" stroke-width="1.2"/><path d="M192 41c4-8 11-9 15-2l-2 11h-12z" fill="#A77B50"/><path d="M205 40l8 3-8 3z" fill="#D69C32"/><circle cx="203" cy="39" r="1" fill="#15110F"/><path d="M195 49l-3 6m9-6 3 6" stroke="#4B382A" stroke-width="1.2"/></g>
  </svg>`;
  const pullBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "메뚜기가 사라진 상황 보기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), pullBtn, choicesBox);
  helper.innerHTML = "식물과 여러 동물이 <b>그물처럼 얽힌 먹이 관계</b>예요. 여기서 메뚜기 한 종류가 사라지면 연결된 생물의 수는 어떻게 달라질 수 있을까요?";
  face("curious");

  let pulled = false;
  pullBtn.addEventListener("click", () => {
    if (pulled) return;
    pulled = true;
    fig.classList.add("collapse");
    pullBtn.classList.remove("pulse");
    pullBtn.classList.add("done-static");
    (pullBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "이 장면은 가능한 변화 중 하나예요. 메뚜기를 먹던 개구리는 먹이가 줄어 <b>개체 수가 감소할 수 있고</b>, 풀과 매의 수도 달라질 수 있어요. 다른 먹이가 있다면 변화의 크기는 달라져요.";
    window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["연결된 여러 개체군의 수가 달라질 수 있다", "다른 생물의 수는 언제나 똑같다"],
        good: "맞아요. 한 종류가 사라지면 <b>연결된 여러 개체군</b>이 영향을 받을 수 있어요. 먹이 종류와 연결이 다양해 <b>대체 먹이</b>가 있는 먹이망은 보통 이런 변화에 더 잘 버텨요.",
        bad: "한 종류의 변화는 먹고 먹히는 관계를 따라 주변 개체군에 영향을 줄 수 있어요. 반드시 모두 무너지는 것은 아니며, <b>대체 먹이 관계</b>가 다양한 먹이망일수록 보통 변화에 더 잘 버텨요.",
        onDone: () => {
          face("smile");
          finish();
        },
      });
    }, 1100);
  });
}
