// 학교 랭킹 시트: "학교 순위"(학교별 누적 스텝 합계)와 "우리 학교"(같은 학교 안의 순위) 두 쪽.
// 도전 탭의 랭킹 카드와 마이 탭 학교 시트 두 곳에서 연다. 화면(section.screen) 안에 스크림과 시트를
// 얹었다가 닫으면 치운다. 자료는 core/schoolRank.ts(서버 집계 함수, DEV는 스텁).
// 규칙: 학교 순위는 3명 이상 등록한 학교만, 개인 순위는 내 학교 안에서만 위에서 10명과 내 순위.
// 보이는 것은 닉네임과 누적 스텝뿐이고, 닉네임이 없으면 기본 이름이다. 이름 올리기는 끌 수 있다.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { getState } from "../core/store";
import { SCHOOL_KINDS, SCHOOL_KIND_DEFAULT, schoolAllowed } from "../core/school";
import { RANK_MIN_MEMBERS, fetchMemberBoard, fetchSchoolBoard, setRankHidden, type MemberBoard, type SchoolBoard, type SchoolRankRow } from "../core/schoolRank";

export interface SchoolRankOpts {
  /** 처음 보여 줄 쪽(기본: 학교 순위) */
  tab?: "schools" | "mine";
  /** 로그인이나 학교 등록이 필요할 때 누르는 버튼의 동작(마이 탭으로 보내기 등) */
  onNeedSchool: () => void;
  /** 닫은 뒤 포커스를 돌려줄 곳 */
  from?: HTMLElement;
}

const fmt = (n: number): string => Math.max(0, Math.round(n)).toLocaleString();

/** host(화면 section) 위에 학교 랭킹 시트를 연다. 돌려주는 함수를 부르면 닫힌다. */
export function openSchoolRank(host: HTMLElement, opts: SchoolRankOpts): () => void {
  const scrim = el("div", { class: "scrim srk-scrim" });
  const x = el("button", { class: "mysheet-x", attrs: { "aria-label": "닫기" }, html: icon("x", 15) });
  const tabs = el("div", { class: "seg srk-tabs", attrs: { role: "tablist", "aria-label": "랭킹 종류" } });
  const body = el("div", { class: "mysheet-body srk-body" });
  const sheet = el(
    "div",
    { class: "sheet mysheet srk", attrs: { role: "dialog", "aria-modal": "true", "aria-label": "학교 랭킹" } },
    el(
      "div",
      { class: "mysheet-card" },
      el("div", { class: "mysheet-grip", attrs: { "aria-hidden": "true" } }),
      el("div", { class: "mysheet-head" }, el("div", { class: "mysheet-title", text: "학교 랭킹" }), x),
      tabs,
      body,
    ),
  );

  let closed = false;
  let seq = 0;
  let tab: "schools" | "mine" = opts.tab ?? "schools";
  const my = (): ReturnType<typeof getState>["school"] => (schoolAllowed() ? (getState().school ?? null) : null);
  let kind = my()?.kind && SCHOOL_KINDS.includes(my()!.kind) ? my()!.kind : SCHOOL_KIND_DEFAULT;

  function close(): void {
    if (closed) return;
    closed = true;
    seq += 1;
    document.removeEventListener("keydown", onKey, true);
    sheet.classList.remove("open");
    scrim.classList.remove("open");
    window.setTimeout(() => {
      sheet.remove();
      scrim.remove();
    }, 260);
    opts.from?.focus({ preventScroll: true });
  }
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    close();
  };
  scrim.addEventListener("click", close);
  x.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    close();
  });

  const note = (state: string, msg: string): HTMLElement => {
    body.dataset.state = state;
    return el("div", { class: `sch-note srk-note ${state}`, text: msg });
  };
  const goBtn = (label: string): HTMLElement => {
    const b = el("button", { class: "sch-retry srk-go", text: label });
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      close();
      opts.onNeedSchool();
    });
    return b;
  };
  const retryBtn = (): HTMLElement => {
    const b = el("button", { class: "sch-retry", text: "다시 시도" });
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      void render();
    });
    return b;
  };

  function schoolRow(r: SchoolRankRow, mine: boolean): HTMLElement {
    return el(
      "div",
      { class: `srk-row ${mine ? "me" : ""}`, attrs: { "data-code": r.code } },
      el("span", { class: `srk-rank ${r.rank != null && r.rank <= 3 ? `top${r.rank}` : ""}`, text: r.rank != null ? String(r.rank) : "·" }),
      el(
        "span",
        { class: "srk-who" },
        el("span", { class: "srk-name" }, el("span", { class: "srk-name-t", text: r.name }), mine ? el("i", { class: "srk-pill", text: "우리 학교" }) : null),
        el("span", { class: "srk-sub", text: `${r.region} · ${fmt(r.members)}명` }),
      ),
      el("span", { class: "srk-steps" }, el("b", { text: fmt(r.steps) }), el("span", { text: "스텝" })),
    );
  }

  function renderSchools(b: SchoolBoard): void {
    const kinds = el("div", { class: "srk-kinds", attrs: { "aria-label": "학교급" } });
    SCHOOL_KINDS.forEach((k) => {
      const btn = el("button", { class: k === kind ? "on" : "", text: k, attrs: { "data-kind": k } });
      btn.addEventListener("click", () => {
        if (k === kind) return;
        haptic(HAPTIC.tap);
        kind = k;
        void render();
      });
      kinds.appendChild(btn);
    });
    const out: HTMLElement[] = [kinds];
    const mineCode = b.mine?.code ?? null;
    if (b.mine) {
      const need = RANK_MIN_MEMBERS - b.mine.members;
      out.push(
        el(
          "div",
          { class: "srk-mine" },
          el("div", { class: "srk-mine-cap", text: "우리 학교" }),
          el("div", { class: "srk-mine-name", text: b.mine.name }),
          el("div", {
            class: "srk-mine-stat",
            text:
              b.mine.rank != null
                ? `${fmt(b.mine.rank)}위 · ${fmt(b.mine.steps)}스텝 · ${fmt(b.mine.members)}명`
                : `아직 순위 밖이에요. 친구 ${fmt(Math.max(1, need))}명이 더 등록하면 순위에 올라요.`,
          }),
        ),
      );
    }
    if (!b.top.length) {
      out.push(note("empty", `아직 순위에 오른 학교가 없어요. 같은 학교 친구 ${RANK_MIN_MEMBERS}명이 등록하면 순위에 올라요.`));
    } else {
      body.dataset.state = "schools";
      out.push(el("div", { class: "srk-list" }, ...b.top.map((r) => schoolRow(r, r.code === mineCode))));
    }
    if (!my()) out.push(goBtn(schoolAllowed() ? "우리 학교 등록하기" : "로그인하고 학교 등록하기"));
    out.push(el("div", { class: "srk-foot", text: `학교 친구들의 누적 스텝을 모두 더한 순위예요. ${RANK_MIN_MEMBERS}명 이상 등록한 학교만 보여요.` }));
    body.replaceChildren(...out);
  }

  function renderMembers(b: MemberBoard): void {
    body.dataset.state = "members";
    const out: HTMLElement[] = [
      el("div", { class: "srk-mine" }, el("div", { class: "srk-mine-cap", text: "우리 학교" }), el("div", { class: "srk-mine-name", text: b.school }), el("div", { class: "srk-mine-stat", text: `${fmt(b.members)}명이 함께해요` })),
    ];
    if (b.top.length) {
      out.push(
        el(
          "div",
          { class: "srk-list" },
          ...b.top.map((r) =>
            el(
              "div",
              { class: `srk-row ${r.me ? "me" : ""}` },
              el("span", { class: `srk-rank ${r.rank <= 3 ? `top${r.rank}` : ""}`, text: String(r.rank) }),
              el("span", { class: "srk-who" }, el("span", { class: "srk-name" }, el("span", { class: "srk-name-t", text: r.name }), r.me ? el("i", { class: "srk-pill", text: "나" }) : null)),
              el("span", { class: "srk-steps" }, el("b", { text: fmt(r.steps) }), el("span", { text: "스텝" })),
            ),
          ),
        ),
      );
    }
    if (b.me) {
      const inTop = b.top.some((r) => r.me);
      if (!b.me.hidden && !inTop && b.me.rank != null)
        out.push(el("div", { class: "srk-merow", text: `내 순위 ${fmt(b.me.rank)}위 · ${fmt(b.me.steps)}스텝` }));
      const sw = el("button", { class: `srk-switch ${b.me.hidden ? "" : "on"}`, attrs: { role: "switch", "aria-checked": b.me.hidden ? "false" : "true", "aria-label": "순위에 내 이름 올리기" } }, el("i", {}));
      sw.addEventListener("click", async () => {
        haptic(HAPTIC.tap);
        sw.setAttribute("disabled", "");
        const ok = await setRankHidden(!b.me!.hidden);
        if (closed) return;
        if (!ok) sw.removeAttribute("disabled");
        else void render();
      });
      out.push(
        el(
          "div",
          { class: "srk-opt" },
          el("div", { class: "srk-opt-tx" }, el("b", { text: "순위에 내 이름 올리기" }), el("span", { text: b.me.hidden ? "지금은 내 이름이 순위에 보이지 않아요. 내 스텝은 학교 합계에 그대로 더해져요." : `같은 학교 친구에게 "${b.me.name}"(으)로 보여요.` })),
          sw,
        ),
      );
    }
    out.push(el("div", { class: "srk-foot", text: "같은 학교 친구에게만 보여요. 닉네임과 누적 스텝만 보이고, 위에서 10명까지 나와요." }));
    body.replaceChildren(...out);
  }

  async function render(): Promise<void> {
    const mySeq = ++seq;
    tabs.querySelectorAll("button").forEach((b) => {
      const on = b.getAttribute("data-tab") === tab;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (tab === "mine" && !my()) {
      body.replaceChildren(
        note("need", schoolAllowed() ? "학교를 등록하면 같은 학교 친구들과 스텝 순위를 겨룰 수 있어요." : "로그인하고 학교를 등록하면 같은 학교 친구들과 스텝 순위를 겨룰 수 있어요."),
        goBtn(schoolAllowed() ? "우리 학교 등록하기" : "로그인하고 학교 등록하기"),
      );
      return;
    }
    body.replaceChildren(note("loading", "순위를 불러오는 중이에요"));
    if (tab === "schools") {
      const b = await fetchSchoolBoard(kind);
      if (closed || mySeq !== seq) return;
      if (!b) body.replaceChildren(note("error", "순위를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."), retryBtn());
      else renderSchools(b);
    } else {
      const b = await fetchMemberBoard();
      if (closed || mySeq !== seq) return;
      if (!b) body.replaceChildren(note("error", "순위를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."), retryBtn());
      else renderMembers(b);
    }
  }

  (
    [
      ["schools", "학교 순위"],
      ["mine", "우리 학교"],
    ] as const
  ).forEach(([k, label]) => {
    const b = el("button", { text: label, attrs: { "data-tab": k, role: "tab" } });
    b.addEventListener("click", () => {
      if (tab === k) return;
      haptic(HAPTIC.tap);
      tab = k;
      void render();
    });
    tabs.appendChild(b);
  });

  host.append(scrim, sheet);
  document.addEventListener("keydown", onKey, true);
  void render();
  requestAnimationFrame(() => {
    if (closed) return;
    scrim.classList.add("open");
    sheet.classList.add("open");
    x.focus({ preventScroll: true });
  });
  return close;
}
