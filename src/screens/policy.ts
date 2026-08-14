// 정책 문서 공용 화면 — 원본 문서는 public/의 정적 HTML 단 하나씩(심사·고지 제출용 단독 URL 겸용):
// 개인정보처리방침 privacy.html · 환불 정책 refund.html. 이 화면은 해당 파일의 #policy-body를
// fetch해 앱 스타일로 렌더한다 — 문서가 두 벌로 갈라지지 않게 한다(내용 수정은 public/*.html만).
// 진입: 방침 = 마이 탭 legal 행 + 로그인 동의 고지(main.ts openPolicy), 환불 = 마이 탭(main.ts openRefund).
// 스플래시·페이월의 환불 링크는 앱 화면 밖 사정(부팅 전·prop 9곳)으로 정적 URL을 새 탭으로 직접 연다.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import type { Screen } from "../core/router";

export interface PolicyDocRef {
  file: "privacy.html" | "refund.html";
  title: string;
}

export function policyScreen(
  onClose: () => void,
  doc: PolicyDocRef = { file: "privacy.html", title: "개인정보처리방침" },
): Screen {
  const back = el("button", { class: "backbtn", attrs: { "aria-label": "뒤로" }, html: icon("back", 22) });
  back.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    onClose();
  });
  const head = el(
    "div",
    { class: "obhead" },
    back,
    el("div", { class: "pol-htitle", text: doc.title }),
    el("div", { style: "width:38px" }),
  );

  const body = el("div", { class: "scroll pad policy-doc" }, el("div", { class: "pol-loading", text: "불러오는 중…" }));

  void (async () => {
    try {
      const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "./";
      const res = await fetch(`${base}${doc.file}`);
      if (!res.ok) throw new Error(String(res.status));
      const parsed = new DOMParser().parseFromString(await res.text(), "text/html");
      const main = parsed.querySelector("#policy-body");
      if (!main) throw new Error("policy body missing");
      body.innerHTML = main.innerHTML; // 우리 정적 자산(같은 출처) — 외부 입력 아님
    } catch {
      body.replaceChildren(
        el("div", { class: "pol-loading", text: "문서를 불러오지 못했어요. 네트워크 상태를 확인하고 다시 열어 주세요." }),
      );
    }
  })();

  // id·data-policy-file은 URL 해시 동기(main.ts syncHash — #/refund·#/privacy)의 판별 근거.
  return {
    el: el(
      "section",
      { class: "screen", attrs: { id: "sc-policy", "data-policy-file": doc.file } },
      head,
      body,
    ),
  };
}
