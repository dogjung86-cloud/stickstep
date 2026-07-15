// 질문하기 — AI 튜터 '스틱쌤' 채팅 화면(프로토타입). 진입 2곳: 복습 탭 카드(일반 질문) ·
// 오답노트 카드 "스틱쌤에게 질문하기"(문항 스냅샷을 그라운딩으로 넘긴다).
// 모델 호출은 core/tutor.ts 단일 창구 — 이 화면은 공급자(Gemini/프록시)를 모른다.
// 답변은 textContent로만 렌더(XSS 차단, 시스템 프롬프트가 마크다운 금지 — pre-wrap으로 줄바꿈만 살린다).

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { askTutor, type TutorImage, type TutorTurn } from "../core/tutor";
import type { WrongNote } from "../core/store";
import { findLesson } from "../content/curriculum";
import { stickAvatar } from "../ui/avatar";
import type { Screen } from "../core/router";

/** HTML 스냅샷 → 순수 텍스트(모델 컨텍스트용). */
function plain(html?: string): string {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent ?? "").replace(/\s+/g, " ").trim();
}
const cut = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n)}…` : s);

function answerText(n: WrongNote): string {
  if (n.type === "num" || n.type === "word") return String(n.answer);
  const opts = n.type === "ox" ? ["O", "X"] : (n.opts ?? []);
  const idx = Array.isArray(n.answer) ? n.answer : [];
  return idx.map((i) => plain(opts[i]) || `${i + 1}번 보기`).join(" / ");
}

/** 오답노트 스냅샷 → 튜터 그라운딩 텍스트. 그림은 스냅샷에 없어 전달 불가를 명시한다. */
function noteContext(n: WrongNote): string {
  const found = findLesson(n.lessonId);
  const src = found
    ? `${found.unit.title} · ${found.lesson.title}${n.kind === "exam" ? " (단원 평가)" : ""}`
    : n.kind === "exam"
      ? "단원 평가"
      : "레슨 퀴즈";
  const ho = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"];
  const lines = [
    "[학생이 틀렸던 문제 — 지금 이 문제에 대해 물어보는 중이에요]",
    `출처: ${src}`,
    `문제: ${cut(plain(n.q), 600)}`,
  ];
  if (n.bogi?.length) lines.push(`<보기> ${n.bogi.map((b, i) => `${ho[i] ?? i + 1}. ${plain(b)}`).join(" / ")}`);
  const opts = n.type === "ox" ? ["O", "X"] : n.opts;
  if (opts?.length) lines.push(`선택지: ${opts.map((o, i) => `${i + 1}) ${cut(plain(o), 120)}`).join(" / ")}`);
  lines.push(`정답: ${answerText(n)}`);
  if (n.explain) lines.push(`해설: ${cut(plain(n.explain), 900)}`);
  if (n.core) lines.push(`핵심: ${plain(n.core)}`);
  if (n.hasFigure) lines.push("(그림이 있는 문제지만 그림은 전달되지 않았어요. 필요하면 그림에 무엇이 보이는지 학생에게 물어보세요.)");
  return lines.join("\n");
}

/** 첨부 사진 → 최대 1280px JPEG base64(전송량 절약). 한 장 정책.
 *  input[type=file] accept="image/*"라 모바일에선 네이티브 선택창이 카메라 촬영·갤러리를 함께 연다
 *  (iOS는 HEIC을 픽커 단계에서 JPEG으로 변환해 준다). */
async function toTutorImage(f: File): Promise<{ img: TutorImage; preview: string }> {
  const url = URL.createObjectURL(f);
  try {
    const im = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("image-decode"));
      i.src = url;
    });
    const scale = Math.min(1, 1280 / Math.max(im.naturalWidth, im.naturalHeight, 1));
    const w = Math.max(1, Math.round(im.naturalWidth * scale));
    const h = Math.max(1, Math.round(im.naturalHeight * scale));
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    if (!ctx) throw new Error("no-canvas");
    ctx.drawImage(im, 0, 0, w, h);
    const dataUrl = cv.toDataURL("image/jpeg", 0.82);
    return { img: { mimeType: "image/jpeg", dataB64: dataUrl.slice(dataUrl.indexOf(",") + 1) }, preview: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function tutorScreen(o: { onClose: () => void; note?: WrongNote }): Screen {
  const turns: TutorTurn[] = [];
  const context = o.note ? noteContext(o.note) : undefined;
  let pending: AbortController | null = null;
  let busy = false;

  // ── 헤더 + AI 고지
  const back = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  back.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onClose();
  });
  const head = el(
    "div",
    { class: "obhead" },
    back,
    el("div", { class: "nb-htitle" }, el("span", { text: "질문하기" }), el("i", { class: "qt-beta", text: "AI 베타" })),
    el("div", { style: "width:38px" }),
  );
  const notice = el("div", { class: "qt-notice", text: "AI가 만드는 답변이라 가끔 틀릴 수 있어요. 중요한 내용은 레슨과 해설에서 꼭 확인해요." });

  // ── 대화 피드
  const feed = el("div", { class: "qt-feed" });
  const scroll = el("div", { class: "scroll" }, el("div", { class: "pad qt-pad" }, feed));
  const toBottom = (): void => {
    scroll.scrollTop = scroll.scrollHeight;
  };

  function tutorRow(): { row: HTMLElement; bub: HTMLElement } {
    const bub = el("div", { class: "qt-bub" });
    const row = el("div", { class: "qt-row" }, el("span", { class: "qt-ava", attrs: { "aria-hidden": "true" } }, stickAvatar("smile")), bub);
    return { row, bub };
  }
  function say(text: string): void {
    const { row, bub } = tutorRow();
    bub.textContent = text;
    feed.appendChild(row);
    toBottom();
  }

  // 오답노트 그라운딩 — 어떤 문제로 왔는지 카드로 보여 준다(원문 HTML 그대로, 수식 마크업 유지)
  if (o.note) {
    feed.appendChild(
      el(
        "div",
        { class: "qt-ctx" },
        el("span", { class: "qt-ctx-k", text: "오답노트에서 가져온 문제" }),
        el("div", { class: "qt-ctx-q", html: o.note.q }),
      ),
    );
  }
  say(
    o.note
      ? "이 문제를 같이 뜯어봐요. 어디가 헷갈렸는지 편하게 물어봐요!"
      : "안녕하세요, 스틱쌤이에요! 과학이나 수학 공부하다 궁금한 게 생기면 뭐든 물어봐요.",
  );

  // 시작 질문 칩 — 첫 질문을 보내면 사라진다
  let chips: HTMLElement | null = el("div", { class: "qt-chips" });
  const starters = o.note
    ? ["왜 이게 정답이에요?", "더 쉽게 설명해 줘요", "비슷한 문제 하나 내 줘요"]
    : ["헷갈리는 개념이 있어요", "문제 푸는 요령을 알려 줘요", "공부 방법이 궁금해요"];
  for (const s of starters) {
    const b = el("button", { class: "qt-chip", text: s });
    b.addEventListener("click", () => void submit(s));
    chips.appendChild(b);
  }
  feed.appendChild(chips);

  // ── 사진 첨부(한 장) — 숨은 파일 입력 + 미리보기 트레이. 스낵은 오류 안내 전용.
  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  function flash(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2200);
  }

  let pendingImg: { img: TutorImage; preview: string } | null = null;
  const tray = el("div", { class: "qt-tray" });
  function setPending(p: { img: TutorImage; preview: string } | null): void {
    pendingImg = p;
    tray.replaceChildren();
    if (!p) return;
    const x = el("button", { class: "qt-tray-x", attrs: { type: "button", "aria-label": "사진 빼기" }, html: icon("x", 13) });
    x.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      setPending(null);
    });
    tray.appendChild(el("span", { class: "qt-tray-thumb" }, el("img", { attrs: { src: p.preview, alt: "첨부한 사진" } }), x));
  }

  const file = el("input", { class: "qt-file", attrs: { type: "file", accept: "image/*", tabindex: "-1", "aria-hidden": "true" } });
  file.addEventListener("change", () => {
    const f = file.files?.[0];
    file.value = ""; // 같은 파일을 다시 골라도 change가 뜨게 초기화
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      flash("사진 파일만 올릴 수 있어요.");
      return;
    }
    void toTutorImage(f).then(
      (p) => setPending(p),
      () => flash("사진을 불러오지 못했어요. 다른 사진으로 다시 시도해 주세요."),
    );
  });
  const attach = el("button", {
    class: "qt-attach",
    attrs: { type: "button", "aria-label": "문제 사진 올리기(카메라·갤러리)" },
    html: icon("camera", 20),
  });
  attach.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    file.click();
  });

  // ── 입력 바
  const input = el("input", {
    class: "qt-input",
    attrs: { type: "text", placeholder: "궁금한 걸 물어봐요", maxlength: 500, enterkeyhint: "send", autocomplete: "off" },
  });
  const send = el("button", { class: "qt-send", attrs: { type: "submit", "aria-label": "질문 보내기" }, html: icon("chevron", 18) });
  const bar = el("form", { class: "qt-bar" }, attach, file, input, send);
  bar.addEventListener("submit", (e) => {
    e.preventDefault();
    void submit();
  });

  async function submit(preset?: string): Promise<void> {
    const text = (preset ?? input.value).trim();
    const img = pendingImg; // 칩으로 시작해도 트레이에 사진이 있으면 함께 보낸다
    if ((!text && !img) || busy) return;
    haptic(HAPTIC.tap);
    input.value = "";
    setPending(null);
    if (chips) {
      chips.remove();
      chips = null;
    }
    const mine = el("div", { class: "qt-bub me" });
    if (img) mine.appendChild(el("img", { class: "qt-photo", attrs: { src: img.preview, alt: "보낸 사진" } }));
    if (text) mine.appendChild(el("span", { text }));
    feed.appendChild(el("div", { class: "qt-row me" }, mine));
    turns.push({ role: "user", text, image: img?.img });

    busy = true;
    send.disabled = true;
    const { row, bub } = tutorRow();
    bub.appendChild(el("span", { class: "qt-dots" }, el("i"), el("i"), el("i")));
    feed.appendChild(row);
    toBottom();

    const ac = new AbortController();
    pending = ac;
    try {
      const reply = await askTutor(turns, {
        context,
        signal: ac.signal,
        onDelta: (full) => {
          bub.textContent = full;
          toBottom();
        },
      });
      bub.textContent = reply || "음, 답이 잘 떠오르지 않았어요. 조금 다르게 물어봐 줄래요?";
      turns.push({ role: "tutor", text: bub.textContent });
    } catch {
      if (!ac.signal.aborted) {
        turns.pop(); // 실패한 질문은 히스토리에서 뺀다 — 재시도 시 그대로 다시 보낼 수 있게
        bub.classList.add("err");
        bub.textContent = "답변을 가져오지 못했어요. 네트워크를 확인하고 다시 한번 물어봐 주세요.";
      }
    } finally {
      if (pending === ac) pending = null;
      busy = false;
      send.disabled = false;
      toBottom();
    }
  }

  const elm = el("section", { class: "screen", attrs: { id: "sc-tutor" } }, head, notice, scroll, tray, bar, snackEl);
  return {
    el: elm,
    onExit: () => pending?.abort(), // 화면 이탈 시 스트림 중단(응답 유실보다 누수 방지가 우선)
  };
}
