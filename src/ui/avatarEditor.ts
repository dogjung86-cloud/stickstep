// 아바타 꾸미기 편집기(v2, 2026-11): 마이 탭 '아바타 꾸미기' 시트의 본문.
// 구성: 미리보기 무대(되돌리기 · 미리보기 · 랜덤) → 방식 탭(캐릭터 고르기 ⇄ 직접 꾸미기) → 패널.
//
// 두 탭의 상태는 완전히 분리돼 있다(2026-07-15 사용자 확정: 고른 캐릭터를 이어서 꾸미게 하지 않는다).
//  · 캐릭터 고르기 = "지금 누구를 쓸지" 고르는 곳. 완성 캐릭터(프리셋) + 내가 꾸민 스틱맨.
//    프리셋을 골라도 내가 꾸민 조합(avatarCustom)은 그대로 남고, '내 캐릭터' 칸으로 언제든 돌아온다.
//    (화면 문구에는 '스틱맨'을 쓰지 않는다. 남성형으로 읽힌다는 이유로 기본 이름에서 기각된 말이다.)
//  · 직접 꾸미기 = 내 스틱맨을 고치는 곳. 미리보기는 내 스틱맨(초안)을 보여 주고,
//    파츠나 색을 하나라도 누르는 순간 그것이 대표가 된다(setAvatarCustom이 프리셋을 해제).
// 선택은 즉시 저장된다(앱 관례: 저장 버튼 없음). 실수는 되돌리기로 푼다(랜덤이 공들인 조합을 덮을 수 있어서 필수).

import { el, clear } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState, setAvatarCustom, setAvatarPreset, type StickAvatarCfg } from "../core/store";
import { setProfileAvatar } from "./avatar";
import {
  DEFAULT_STICK,
  STICK_PRESETS,
  STICK_SLOTS,
  normPreset,
  normStick,
  randomStick,
  stickAvatarSvg,
  type StickCfg,
  type StickKey,
  type StickSlot,
} from "./stickParts";

export interface AvatarEditor {
  /** 시트 본문에 넣을 요소 */
  el: HTMLElement;
  /** 시트를 열 때마다 호출한다. 저장 상태에 맞춰 시작 탭과 미리보기를 다시 맞춘다. */
  sync(): void;
}

interface Snap {
  custom: StickAvatarCfg | null;
  preset: number | null;
}

/** onChange = 대표 아바타가 바뀔 때마다(프로필 카드·탭바 아이콘 갱신용). */
export function avatarEditor(onChange: () => void): AvatarEditor {
  let mode: "preset" | "custom" = "preset";
  let slotKey: StickKey = STICK_SLOTS[0].key;
  const history: Snap[] = [];

  /** 직접 꾸미기의 작업 대상: 한 번도 꾸민 적이 없으면 기본 캐릭터에서 출발한다. */
  const draft = (): StickCfg => normStick(getState().avatarCustom ?? DEFAULT_STICK);
  /** 지금 프로필에 쓰이는 것이 내가 꾸민 조합인가. */
  const usingCustom = (): boolean => normPreset(getState().avatarPreset) == null && !!getState().avatarCustom;
  const slotOf = (): StickSlot => STICK_SLOTS.find((s) => s.key === slotKey) ?? STICK_SLOTS[0];

  function remember(): void {
    const s = getState();
    history.push({ custom: s.avatarCustom ? { ...s.avatarCustom } : null, preset: s.avatarPreset });
    if (history.length > 30) history.shift();
  }

  // ---- 미리보기 무대 ----
  const ava = el("span", { class: "stick-avatar live" });
  const preview = el("div", { class: "avs-preview", attrs: { "aria-hidden": "true" } }, ava);
  const tag = el("div", { class: "avs-tag", attrs: { "aria-live": "polite" } });
  const undoBtn = el(
    "button",
    { class: "avs-act", attrs: { "aria-label": "방금 바꾼 것 되돌리기" } },
    el("span", { class: "avs-act-ic", html: icon("undo", 19) }),
    el("span", { class: "avs-act-tx", text: "되돌리기" }),
  ) as HTMLButtonElement;
  const diceBtn = el(
    "button",
    { class: "avs-act", attrs: { "aria-label": "랜덤으로 꾸미기" } },
    el("span", { class: "avs-act-ic", html: icon("dice", 19) }),
    el("span", { class: "avs-act-tx", text: "랜덤" }),
  ) as HTMLButtonElement;
  const stage = el("div", { class: "avs-stage" }, undoBtn, preview, diceBtn, tag);

  function renderPreview(pop = false): void {
    const s = getState();
    const p = normPreset(s.avatarPreset);
    if (mode === "custom") {
      ava.classList.remove("full");
      ava.innerHTML = stickAvatarSvg(draft());
      // 다른 캐릭터(프리셋·예전 아바타)를 쓰는 중이면, 여기서 보는 모습이 아직 대표가 아니라는 것을 알려 준다.
      const other = p != null || (!s.avatarCustom && s.avatarId != null);
      tag.textContent = usingCustom() ? "내가 꾸민 캐릭터" : other ? "하나라도 고르면 이 모습으로 바뀌어요" : "마음에 드는 것을 골라 보세요";
    } else {
      setProfileAvatar(ava, s.avatarId, s.avatarCustom, s.avatarPreset);
      tag.textContent = p != null ? STICK_PRESETS[p].name : s.avatarCustom ? "내가 꾸민 캐릭터" : s.avatarId != null ? "지금 아바타" : STICK_PRESETS[0].name;
    }
    undoBtn.disabled = history.length === 0;
    if (pop) {
      preview.classList.remove("pop");
      void preview.offsetWidth; // 같은 클래스를 다시 붙여도 키프레임이 처음부터 돌게 한다
      preview.classList.add("pop");
    }
  }

  // ---- 방식 탭 ----
  const presetBtn = el("button", { class: "avm", text: "캐릭터 고르기", attrs: { role: "tab" } });
  const customBtn = el("button", { class: "avm", text: "직접 꾸미기", attrs: { role: "tab" } });
  const modeSeg = el("div", { class: "ava-mode", attrs: { role: "tablist", "aria-label": "꾸미기 방식" } }, presetBtn, customBtn);

  // ---- 캐릭터 고르기 ----
  const presetGrid = el("div", { class: "avp-grid", attrs: { role: "group", "aria-label": "캐릭터" } });
  const presetPane = el("div", { class: "avp-pane" }, presetGrid);

  function presetTile(name: string, svg: string, on: boolean, mine: boolean, pick: () => void): HTMLElement {
    const b = el(
      "button",
      { class: `avp ${on ? "sel" : ""} ${mine ? "mine" : ""}`, attrs: { "aria-pressed": String(on) } },
      el("span", { class: "avp-ava", html: svg }),
      el("span", { class: "avp-name", text: name }),
    );
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      if (b.classList.contains("sel")) return;
      pick();
    });
    return b;
  }

  function renderPresets(): void {
    const keepTop = presetPane.scrollTop;
    clear(presetGrid);
    const s = getState();
    const cur = normPreset(s.avatarPreset);
    // 아무것도 고른 적 없는 처음 상태는 '기본'과 같은 모습이라 '기본'에 불을 켠다.
    const fresh = cur == null && !s.avatarCustom && s.avatarId == null;
    if (s.avatarCustom) {
      presetGrid.appendChild(
        presetTile("내 캐릭터", stickAvatarSvg(s.avatarCustom), cur == null, true, () => {
          remember();
          setAvatarPreset(null); // 내가 꾸민 조합이 그대로 대표로 돌아온다
          changed();
        }),
      );
    }
    STICK_PRESETS.forEach((p, i) => {
      presetGrid.appendChild(
        presetTile(p.name, stickAvatarSvg(p.cfg), cur === i || (fresh && i === 0), false, () => {
          remember();
          setAvatarPreset(i);
          changed();
        }),
      );
    });
    presetPane.scrollTop = keepTop; // 아래쪽 캐릭터를 골라도 목록이 맨 위로 튀지 않는다
  }

  // ---- 직접 꾸미기 ----
  const cats = el("div", { class: "avc-cats", attrs: { role: "tablist", "aria-label": "꾸미기 항목" } });
  const colorLabel = el("span", { class: "avc-colors-tx" });
  const colorRow = el("div", { class: "avc-colors-row" });
  const colors = el("div", { class: "avc-colors", attrs: { role: "group" } }, colorLabel, colorRow);
  const optGrid = el("div", { class: "avc-grid", attrs: { role: "group" } });
  const optScroll = el("div", { class: "avc-scroll" }, optGrid);
  const customPane = el("div", { class: "avc-pane" }, cats, colors, optScroll);

  const catBtns = new Map<StickKey, HTMLElement>();
  for (const slot of STICK_SLOTS) {
    const b = el("button", { class: "avc-cat", text: slot.label, attrs: { role: "tab" } });
    b.addEventListener("click", () => {
      if (slot.key === slotKey) return;
      haptic(HAPTIC.tap);
      slotKey = slot.key;
      renderCats();
      renderColors();
      renderOptions();
      revealSelected();
      b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    catBtns.set(slot.key, b);
    cats.appendChild(b);
  }

  function renderCats(): void {
    for (const [key, b] of catBtns) {
      const on = key === slotKey;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", String(on));
    }
  }

  /** 내 스틱맨의 한 슬롯을 바꾼다: 만지는 순간 내 스틱맨이 대표가 된다. */
  function setPart(key: StickKey, i: number): void {
    const cfg = draft();
    if (cfg[key] === i && usingCustom()) return; // 이미 그 상태면 기록도 저장도 하지 않는다
    remember();
    setAvatarCustom({ ...cfg, [key]: i });
    changed();
  }

  /** 범주를 새로 열었을 때: 지금 고른 색·파츠가 화면 밖이면 보이는 자리로 당긴다(처음 것부터 다시 찾지 않게). */
  function revealSelected(): void {
    colorRow.scrollLeft = 0;
    optScroll.scrollTop = 0;
    const sw = colorRow.querySelector<HTMLElement>(".avc-sw.sel");
    if (sw) {
      const over = sw.getBoundingClientRect().right - colorRow.getBoundingClientRect().right;
      if (over > -8) colorRow.scrollLeft = over + 48;
    }
    const opt = optGrid.querySelector<HTMLElement>(".avc-opt.sel");
    if (opt) {
      const over = opt.getBoundingClientRect().bottom - optScroll.getBoundingClientRect().bottom;
      if (over > -8) optScroll.scrollTop = over + 28;
    }
  }

  function renderColors(): void {
    const row = slotOf().color;
    const keepLeft = colorRow.scrollLeft;
    colors.classList.toggle("hidden", !row);
    clear(colorRow);
    if (!row) return;
    const cur = draft()[row.key];
    colors.setAttribute("aria-label", row.label);
    colorLabel.textContent = row.label;
    row.swatches.forEach((sw, i) => {
      const on = cur === i;
      const b = el("button", {
        class: `avc-sw ${on ? "sel" : ""}`,
        style: `--sw:${sw.css}`,
        attrs: { "aria-label": `${row.label}: ${sw.name}`, title: sw.name, "aria-pressed": String(on) },
      });
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setPart(row.key, i);
      });
      colorRow.appendChild(b);
    });
    colorRow.scrollLeft = keepLeft; // 다시 그려도 굴려 둔 자리를 지킨다
  }

  function renderOptions(): void {
    const keepTop = optScroll.scrollTop;
    clear(optGrid);
    const slot = slotOf();
    const cfg = draft();
    optGrid.setAttribute("aria-label", slot.label);
    slot.parts.forEach((part, i) => {
      const on = cfg[slot.key] === i;
      const svg = stickAvatarSvg({ ...cfg, [slot.key]: i }, { view: slot.view, hide: slot.hide, bg: !!slot.round });
      const b = el(
        "button",
        { class: `avc-opt ${on ? "sel" : ""}`, attrs: { "aria-label": `${slot.label}: ${part.name}`, "aria-pressed": String(on) } },
        el("span", { class: `avc-thumb ${slot.round ? "round" : ""}`, html: svg }),
        el("span", { class: "avc-name", text: part.name }),
      );
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setPart(slot.key, i);
      });
      optGrid.appendChild(b);
    });
    optScroll.scrollTop = keepTop; // 다시 그려도 보던 자리를 지킨다
  }

  // ---- 공통 갱신 ----
  /** 대표 아바타가 바뀐 뒤: 미리보기를 튕기고 선택 표시를 다시 맞춘 다음 바깥(카드·탭바)에 알린다. */
  function changed(): void {
    renderPreview(true);
    // 보이는 패널만 다시 그린다(안 보이는 쪽은 탭을 넘길 때 그린다).
    if (mode === "preset") renderPresets();
    else {
      renderColors();
      renderOptions();
    }
    onChange();
  }

  function applyMode(): void {
    const custom = mode === "custom";
    presetBtn.classList.toggle("on", !custom);
    customBtn.classList.toggle("on", custom);
    presetBtn.setAttribute("aria-selected", String(!custom));
    customBtn.setAttribute("aria-selected", String(custom));
    presetPane.classList.toggle("hidden", custom);
    customPane.classList.toggle("hidden", !custom);
    diceBtn.setAttribute("aria-label", custom ? "랜덤으로 꾸미기" : "랜덤으로 고르기");
    renderPreview();
  }
  presetBtn.addEventListener("click", () => {
    if (mode === "preset") return;
    haptic(HAPTIC.tap);
    mode = "preset";
    renderPresets();
    applyMode();
  });
  customBtn.addEventListener("click", () => {
    if (mode === "custom") return;
    haptic(HAPTIC.tap);
    mode = "custom";
    renderCats();
    renderColors();
    renderOptions();
    applyMode();
    revealSelected(); // 패널이 보이게 된 뒤에 잰다
  });

  // 랜덤은 지금 보고 있는 탭의 것을 뽑는다: 직접 꾸미기에서는 새 조합, 캐릭터 고르기에서는 다른 완성 캐릭터.
  diceBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    remember();
    if (mode === "custom") setAvatarCustom(randomStick());
    else {
      const cur = normPreset(getState().avatarPreset);
      let i = Math.floor(Math.random() * STICK_PRESETS.length);
      if (i === cur) i = (i + 1) % STICK_PRESETS.length;
      setAvatarPreset(i);
    }
    changed();
    if (mode === "preset") presetGrid.querySelector(".avp.sel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  undoBtn.addEventListener("click", () => {
    const last = history.pop();
    if (!last) return;
    haptic(HAPTIC.tap);
    setAvatarCustom(last.custom); // 조합이 있으면 프리셋을 해제하므로
    setAvatarPreset(last.preset); // 프리셋은 그 뒤에 되살린다
    changed();
  });

  function sync(): void {
    // 시작 탭은 저장 상태가 진실: 내가 꾸민 조합이 대표면 직접 꾸미기에서 연다.
    mode = usingCustom() ? "custom" : "preset";
    renderPresets();
    renderCats();
    renderColors();
    renderOptions();
    applyMode();
    revealSelected();
    preview.classList.remove("pop");
  }
  sync();

  return { el: el("div", { class: "mysheet-body avs" }, stage, modeSeg, presetPane, customPane), sync };
}
