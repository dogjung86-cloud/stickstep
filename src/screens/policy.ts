// 개인정보처리방침 화면 — 원본 문서는 public/privacy.html 단 하나(OAuth 콘솔·심사 제출용 단독 URL 겸용).
// 이 화면은 그 파일의 #policy-body를 fetch해 앱 스타일로 렌더한다 — 문서가 두 벌로 갈라지지 않게 한다.
// 진입: 마이 탭 "더 보기" 행 + 로그인 화면 하단 동의 고지 링크(main.ts openPolicy).
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import type { Screen } from "../core/router";

export function policyScreen(onClose: () => void): Screen {
  const back = el("button", { class: "backbtn", attrs: { "aria-label": "뒤로" }, html: icon("back", 22) });
  back.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onClose();
  });
  const head = el(
    "div",
    { class: "obhead" },
    back,
    el("div", { class: "pol-htitle", text: "개인정보처리방침" }),
    el("div", { style: "width:38px" }),
  );

  const body = el("div", { class: "scroll pad policy-doc" }, el("div", { class: "pol-loading", text: "불러오는 중…" }));

  void (async () => {
    try {
      const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "./";
      const res = await fetch(`${base}privacy.html`);
      if (!res.ok) throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const main = doc.querySelector("#policy-body");
      if (!main) throw new Error("policy body missing");
      body.innerHTML = main.innerHTML; // 우리 정적 자산(같은 출처) — 외부 입력 아님
    } catch {
      body.replaceChildren(
        el("div", { class: "pol-loading", text: "문서를 불러오지 못했어요. 네트워크 상태를 확인하고 다시 열어 주세요." }),
      );
    }
  })();

  return { el: el("section", { class: "screen" }, head, body) };
}
