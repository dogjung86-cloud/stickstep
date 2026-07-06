// 홈 — 단원을 게임 정복 지도(모험 트레일)로. 지형·구불구불 경로·메달리온 노드·장식.
import { el, clear, afterPaint } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import { getState, currentStreak, isDone, lessonOf } from "../core/store";
import { CURRICULUM, isUnlocked, unitProgress, type Unit } from "../content/curriculum";
import { serpentine, smoothPath, pathUpTo } from "../ui/serpentine";
import { mapDecorArt } from "../ui/mapDecor";
import type { Screen } from "../core/router";

// 단원별 지도/배너 테마 클래스 — 새 단원을 추가하면 여기와 ui.css에 테마를 등록한다.
const UNIT_THEME: Record<string, string> = { u2: "bio", u3: "heat", u4: "matter", u5: "force", u6: "gas", u7: "space" };
// 단원별 보너스 미니게임 — 모든 레슨을 완료하면 지도 끝에 열린다.
const UNIT_GAME: Record<string, { title: string }> = { u3: { title: "단열 디펜스" } };

export function homeScreen(
  onOpenLesson: (id: string) => void,
  onOpenGame: (unitId: string) => void,
  focusUnitId?: string,
): Screen {
  const st = getState();
  // 우선순위: 방금 학습한 단원 → 첫 미완료 단원 → 첫 단원
  let sel = focusUnitId ? CURRICULUM.findIndex((u) => u.id === focusUnitId) : -1;
  if (sel < 0) sel = CURRICULUM.findIndex((u) => unitProgress(u) < 100);
  if (sel < 0) sel = 0;

  const chips = el(
    "div",
    { class: "chips" },
    el("div", { class: "chip streak" }, el("span", { html: icon("flame", 15) }), el("span", { text: `${currentStreak()}일` })),
    el("div", { class: "chip gem" }, el("span", { html: icon("bolt", 15) }), el("span", { text: `${st.totalXp} XP` })),
  );
  const appbar = el("div", { class: "appbar" }, el("div", { class: "brand", text: BRAND.name }), chips);

  const tabs = el("div", { class: "unit-tabs" });
  // 마우스로도 탭을 잡아 끌어 넘길 수 있게(터치는 네이티브 스크롤이 담당)
  // 주의: pointerdown에서 바로 setPointerCapture를 걸면 이후 click이 컨테이너로
  // 재타기팅되어 탭 버튼 클릭이 죽는다 — 진짜 드래그로 판명된 순간에만 캡처한다.
  let tabDrag: { x: number; scroll: number } | null = null;
  let tabMoved = false;
  tabs.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    tabDrag = { x: e.clientX, scroll: tabs.scrollLeft };
    tabMoved = false;
  });
  tabs.addEventListener("pointermove", (e) => {
    if (!tabDrag) return;
    const dx = e.clientX - tabDrag.x;
    if (!tabMoved && Math.abs(dx) > 5) {
      tabMoved = true;
      tabs.setPointerCapture(e.pointerId);
    }
    if (tabMoved) tabs.scrollLeft = tabDrag.scroll - dx;
  });
  const endTabDrag = (): void => {
    tabDrag = null;
  };
  tabs.addEventListener("pointerup", endTabDrag);
  tabs.addEventListener("pointercancel", endTabDrag);
  // 드래그로 끌었을 땐 탭 클릭으로 취급하지 않는다
  tabs.addEventListener(
    "click",
    (e) => {
      if (tabMoved) {
        e.stopPropagation();
        e.preventDefault();
        tabMoved = false;
      }
    },
    true,
  );
  const bandHost = el("div", {});
  const mapHost = el("div", {});
  const scroll = el("div", { class: "scroll" }, tabs, bandHost, mapHost);
  const elm = el("section", { class: "screen", attrs: { id: "sc-home" } }, appbar, scroll);

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  function renderTabs(): void {
    clear(tabs);
    CURRICULUM.forEach((u, i) => {
      const t = el("button", { class: `unit-tab ${i === sel ? "on" : ""}`, text: `${u.roman}. ${u.title}` });
      t.addEventListener("click", () => {
        sel = i;
        haptic(HAPTIC.tap);
        renderAll();
      });
      tabs.appendChild(t);
    });
  }

  function renderBand(u: Unit): void {
    clear(bandHost);
    const theme = UNIT_THEME[u.id] ?? "";
    const pct = unitProgress(u);
    bandHost.appendChild(
      el(
        "div",
        { class: `unit-band ${theme}` },
        el("div", { class: "ub-glow" }),
        el("div", { class: "ub-eyebrow", text: `대단원 ${u.roman}` }),
        el("div", { class: "ub-title", text: u.title }),
        el("div", { class: "ub-desc", text: u.subtitle }),
        u.standard ? el("div", { class: "ub-meta" }, el("span", { html: icon("check", 13) }), el("span", { text: `${u.standard} · ${pct}% 정복` })) : el("span", {}),
        el("div", { class: "ub-prog" }, el("i", { style: `width:${pct}%` })),
      ),
    );
  }

  function renderMap(u: Unit): void {
    clear(mapHost);
    const theme = UNIT_THEME[u.id] ?? "";
    mapHost.appendChild(el("div", { class: "sec-head", text: "레슨 지도" }));

    const gm = el("div", { class: "gamemap" });
    const terrain = el("div", { class: `gm-terrain ${theme}` });
    const decorLayer = el("div", { class: "gm-decor" });
    const nodesLayer = el("div", { class: "gm-nodes" });
    gm.append(terrain, decorLayer, nodesLayer);
    mapHost.appendChild(gm);

    const game = UNIT_GAME[u.id];
    const started = u.lessons.some((l) => isDone(l.id));
    const nodeEls: HTMLElement[] = u.lessons.map((lesson, i) => {
      const unlocked = isUnlocked(u, i);
      const done = isDone(lesson.id);
      const now = unlocked && !done;
      const cls = ["gm-node"];
      if (theme) cls.push(theme);
      cls.push(done ? "done" : now ? "now" : "locked");

      const med = el("div", {
        class: "gm-med",
        attrs: { "aria-hidden": "true" },
        html: done ? icon("check", 34, { sw: 3.4 }) : unlocked ? icon(lesson.icon ?? "book", 34) : icon("lock", 30),
      });
      const stateLabel = done ? "완료" : now ? "학습 시작 가능" : "잠김 · 이전 레슨을 먼저 완료해요";
      const node = el("button", {
        class: cls.join(" "),
        attrs: unlocked
          ? { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}` }
          : { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}`, "aria-disabled": "true" },
      }, med);
      if (now) {
        med.appendChild(el("div", { class: "gm-ring" }));
        node.appendChild(el("div", { class: "gm-ribbon", text: started ? "학습" : "시작" }));
      }
      if (done) {
        const acc = lessonOf(lesson.id).acc ?? 0;
        const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : 1;
        const sb = el("div", { class: "gm-stars" });
        for (let k = 0; k < 3; k++) sb.innerHTML += icon("star", 15, { cls: k < stars ? "" : "empty" });
        node.appendChild(sb);
      }
      node.appendChild(el("div", { class: "gm-label", text: lesson.label ?? lesson.title }));
      node.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        if (!unlocked) {
          snack("이전 레슨을 먼저 완료해요");
          return;
        }
        onOpenLesson(lesson.id);
      });
      nodesLayer.appendChild(node);
      return node;
    });

    // 보너스 미니게임 노드 — 단원 100% 정복 시 해제
    if (game) {
      const gameOpen = unitProgress(u) === 100;
      const med = el("div", {
        class: "gm-med",
        attrs: { "aria-hidden": "true" },
        html: gameOpen ? icon("trophy", 32) : icon("lock", 30),
      });
      const node = el("button", {
        class: `gm-node game ${gameOpen ? "now" : "locked"}`,
        attrs: gameOpen
          ? { "aria-label": `${game.title} — 보너스 게임` }
          : { "aria-label": `${game.title} — 잠김 · 모든 레슨을 완료하면 열려요`, "aria-disabled": "true" },
      }, med);
      if (gameOpen) {
        med.appendChild(el("div", { class: "gm-ring" }));
        node.appendChild(el("div", { class: "gm-ribbon", text: "보너스" }));
      }
      node.appendChild(el("div", { class: "gm-label", text: game.title }));
      node.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        if (!gameOpen) {
          snack("모든 레슨을 완료하면 보너스 게임이 열려요");
          return;
        }
        onOpenGame(u.id);
      });
      nodesLayer.appendChild(node);
      nodeEls.push(node);
    }

    const doneCount = u.lessons.findIndex((l) => !isDone(l.id));
    const conquered = doneCount < 0 ? u.lessons.length : doneCount;

    afterPaint(() => {
      const W = gm.clientWidth || 340;
      const amp = Math.min(102, W * 0.25);
      const { points, height } = serpentine(nodeEls.length, { width: W, gap: 122, top: 66, bottom: 100, amp });
      gm.style.height = `${height}px`;
      // 노드는 폭 대비 %로 배치 → SVG 경로(폭 100%로 신축)와 함께 스케일되어 회전/리사이즈에 강함.
      points.forEach((p, i) => {
        nodeEls[i].style.left = `${(p.x / W) * 100}%`;
        nodeEls[i].style.top = `${p.y}px`;
      });
      const full = smoothPath(points);
      const donePath = pathUpTo(points, conquered);
      const svg =
        `<svg class="gm-path" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" preserveAspectRatio="none">` +
        `<path class="gm-path-base" d="${full}"/>` +
        (conquered > 0 ? `<path class="gm-path-glow ${theme}" d="${donePath}"/><path class="gm-path-done ${theme}" d="${donePath}"/>` : "") +
        `</svg>`;
      terrain.insertAdjacentHTML("afterend", svg);
      placeDecor(decorLayer, points, W, u.id);
    });
  }

  function renderAll(): void {
    renderTabs();
    renderBand(CURRICULUM[sel]);
    renderMap(CURRICULUM[sel]);
  }

  renderAll();
  return { el: elm };
}

// 단원 특색 장식 — 트레일 문법(경로·메달리온)은 그대로, 소품이 단원의 이야기를 만든다.
// seq: 노드 사이 슬롯에 순서대로(순서 자체가 서사 — IV는 고→액→기, VII은 태양에서 먼 행성 순).
// sky: 지도 위쪽 앰비언트 2개(하늘 소품). 등록 안 된 단원은 기본 자연 세트.
const UNIT_DECOR: Record<string, { seq: string[]; sky: [string, string] }> = {
  u1: { seq: ["stones", "palm", "vine", "stones", "flag"], sky: ["cloud", "cloud"] }, // 정글로 가는 징검다리 원정
  u2: { seq: ["bacteria", "amoeba", "fern", "fish", "bird"], sky: ["cloud", "bird"] }, // 미생물 → 새, 생물의 사다리
  u3: { seq: ["campfire", "steamMug", "kettleDeco", "campfire", "sunDeco"], sky: ["cloud", "sunDeco"] },
  u4: { seq: ["iceDeco", "dropDeco", "vaporDeco", "iceDeco", "dropDeco"], sky: ["cloud", "vaporDeco"] }, // 고체 → 액체 → 기체
  u5: { seq: ["appleTree", "springDeco", "crateDeco", "floatDeco", "appleTree"], sky: ["cloud", "cloud"] }, // 중력·탄성·마찰·부력
  u6: { seq: ["balloonsDeco", "bubblesDeco", "hotairDeco", "bubblesDeco", "balloonsDeco"], sky: ["hotairDeco", "cloud"] },
  u7: { seq: ["pMercury", "pVenus", "pMars", "pJupiter", "pSaturn"], sky: ["rocketDeco", "sparkle"] }, // 행성을 밟아 가는 순항
};
const DEFAULT_DECOR: { seq: string[]; sky: [string, string] } = {
  seq: ["tree1", "tree2", "bush", "rock", "grassTuft"],
  sky: ["cloud", "cloud"],
};
const DECOR_SIZE: Record<string, number> = {
  tree1: 56, tree2: 56, bush: 42, rock: 30, grassTuft: 36,
  stones: 46, palm: 58, vine: 50, flag: 46,
  bacteria: 40, amoeba: 42, fern: 46, fish: 44, bird: 42,
  campfire: 46, steamMug: 40, kettleDeco: 44, sunDeco: 44,
  iceDeco: 42, dropDeco: 38, vaporDeco: 44,
  appleTree: 58, springDeco: 42, crateDeco: 42, floatDeco: 46,
  balloonsDeco: 50, hotairDeco: 54, bubblesDeco: 42,
  pMercury: 36, pVenus: 38, pMars: 38, pJupiter: 46, pSaturn: 52, rocketDeco: 46, sparkle: 34,
};

function placeDecor(layer: HTMLElement, points: { x: number; y: number }[], W: number, unitId: string): void {
  const conf = UNIT_DECOR[unitId] ?? DEFAULT_DECOR;
  const add = (key: string, x: number, y: number, w: number, h: number) => {
    layer.appendChild(
      el("div", { class: `gm-deco ${key === "cloud" ? "cloud" : ""}`, style: `left:${((x / W) * 100).toFixed(2)}%;top:${y}px;width:${w}px;height:${h}px`, html: mapDecorArt(key) }),
    );
  };
  for (let i = 0; i < points.length - 1; i++) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    const x = mid.x > W / 2 ? W * 0.13 : W * 0.87;
    const key = conf.seq[i % conf.seq.length];
    const size = DECOR_SIZE[key] ?? 42;
    add(key, x, mid.y + (i % 2 ? 12 : -8), size, size);
  }
  const [skyA, skyB] = conf.sky;
  const skySize = (k: string, big: boolean): [number, number] =>
    k === "cloud" ? (big ? [62, 40] : [52, 34]) : [DECOR_SIZE[k] ?? 44, DECOR_SIZE[k] ?? 44];
  const [wa, ha] = skySize(skyA, true);
  add(skyA, W * 0.8, 30, wa, ha);
  const [wb, hb] = skySize(skyB, false);
  add(skyB, W * 0.22, points[Math.min(1, points.length - 1)].y - 34, wb, hb);
}
