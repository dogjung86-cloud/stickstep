// 홈 — 단원을 게임 정복 지도(모험 트레일)로. 지형·구불구불 경로·메달리온 노드·장식.
import { el, clear, afterPaint } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { BRAND } from "../core/brand";
import { getState, currentStreak, isDone, lessonOf, getViewGrade, setViewGrade, getViewSubject, toggleReviewMode, isReviewMode, examRecordOf } from "../core/store";
import { CURRICULA_OF, GRADE_LABEL, gradeOfUnit, subjectOfUnit, isUnlocked, isPremiumLocked, unitProgress, type Unit, type GradeId, type SubjectId } from "../content/curriculum";
import { examForUnit } from "../content/exams";
import { serpentine, smoothPath, pathUpTo } from "../ui/serpentine";
import { mapDecorArt } from "../ui/mapDecor";
import type { Screen } from "../core/router";

// 단원별 지도/배너 테마 클래스 — 새 단원을 추가하면 여기와 ui.css에 테마를 등록한다.
const UNIT_THEME: Record<string, string> = { u2: "bio", u3: "heat", u4: "matter", u5: "force", u6: "gas", u7: "space", g2u1: "chem", g2u2: "geo", g2u3: "light", g2u4: "atom", g2u5: "plant", g2u7: "elec", g2u8: "star", m1u1: "num", m1u2: "alge", m1u3: "grph", m1u4: "geom", m1u5: "solid", m1u6: "data", m2u1: "calc", m2u2: "ineq", m2u3: "func", m2u4: "prove", m2u5: "sim" };
// 단원별 보너스 미니게임 — 모든 레슨을 완료하면 지도 끝에 열린다.
const UNIT_GAME: Record<string, { title: string }> = { u3: { title: "단열 디펜스" }, m1u1: { title: "별자리 한붓그리기" } };

export function homeScreen(
  onOpenLesson: (id: string) => void,
  onOpenGame: (unitId: string) => void,
  focusUnitId?: string,
  nav2?: { onSubjects?: () => void; onLogin?: () => void; onOpenExam?: (unitId: string) => void },
): Screen {
  const st = getState();
  // 과목·학년 트랙 — 방금 학습한 단원이 있으면 그 단원의 과목·학년으로 따라간다.
  const subject: SubjectId = focusUnitId ? subjectOfUnit(focusUnitId) : getViewSubject();
  const CURRICULA = CURRICULA_OF[subject];
  let grade: GradeId = focusUnitId ? gradeOfUnit(focusUnitId) : getViewGrade();
  let cur = CURRICULA[grade];
  // 우선순위: 방금 학습한 단원 → 첫 미완료 단원 → 첫 단원
  let sel = focusUnitId ? cur.findIndex((u) => u.id === focusUnitId) : -1;
  if (sel < 0) sel = cur.findIndex((u) => !u.comingSoon && unitProgress(u) < 100);
  if (sel < 0) sel = 0;

  const chips = el(
    "div",
    { class: "chips" },
    el("div", { class: "chip streak" }, el("span", { html: icon("flame", 15) }), el("span", { text: `${currentStreak()}일` })),
    el("div", { class: "chip gem" }, el("span", { html: icon("bolt", 15) }), el("span", { text: `${st.totalXp} XP` })),
  );
  // 과목 허브(그리드)·로그인(프로필) 진입 버튼
  const subjBtn = el("button", { class: "abtn", attrs: { "aria-label": "과목 선택" }, html: icon("grid", 19) });
  subjBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    nav2?.onSubjects?.();
  });
  const profBtn = el("button", { class: "abtn", attrs: { "aria-label": "로그인" }, html: icon("user", 19) });
  profBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    nav2?.onLogin?.();
  });
  const brandEl = el("div", { class: `brand ${isReviewMode() ? "review" : ""}`, text: BRAND.name });
  // 검토 모드 — 브랜드 7연타 토글(콘텐츠 검수용: 순차·프리미엄 잠금 전부 해제)
  let brandTaps = 0;
  let brandTapTimer = 0;
  brandEl.addEventListener("click", () => {
    brandTaps += 1;
    window.clearTimeout(brandTapTimer);
    brandTapTimer = window.setTimeout(() => {
      brandTaps = 0;
    }, 1600);
    if (brandTaps >= 7) {
      brandTaps = 0;
      const on = toggleReviewMode();
      haptic(HAPTIC.done);
      brandEl.classList.toggle("review", on);
      snack(on ? "검토 모드 ON — 모든 레슨이 열렸어요" : "검토 모드 OFF — 잠금이 되돌아왔어요");
      renderAll();
    }
  });
  const appbar = el(
    "div",
    { class: "appbar" },
    el("div", { class: "ab-side" }, subjBtn, brandEl),
    el("div", { class: "ab-side" }, chips, profBtn),
  );

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
  // 학년 전환 — 중1 ⇄ 중2 세그먼트. 전환은 저장되어 다음 방문에도 유지된다.
  const gradeSeg = el("div", { class: "grade-seg", attrs: { role: "tablist", "aria-label": "학년 선택" } });
  (Object.keys(CURRICULA) as GradeId[]).forEach((g) => {
    const b = el("button", {
      class: `gseg ${g === grade ? "on" : ""}`,
      text: GRADE_LABEL[g],
      attrs: { role: "tab", "aria-selected": g === grade ? "true" : "false" },
    });
    b.addEventListener("click", () => {
      if (g === grade) return;
      haptic(HAPTIC.tap);
      grade = g;
      setViewGrade(g);
      cur = CURRICULA[g];
      sel = cur.findIndex((u) => !u.comingSoon && unitProgress(u) < 100);
      if (sel < 0) sel = 0;
      gradeSeg.querySelectorAll(".gseg").forEach((x, i) => {
        const on = (Object.keys(CURRICULA) as GradeId[])[i] === g;
        x.classList.toggle("on", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderAll();
    });
    gradeSeg.appendChild(b);
  });
  const gradeRow = el("div", { class: "grade-row" }, gradeSeg, el("div", { class: "grade-hint", text: "최신 개정 교육과정 반영" }));

  const bandHost = el("div", {});
  const mapHost = el("div", {});
  const scroll = el("div", { class: "scroll" }, gradeRow, tabs, bandHost, mapHost);
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
    cur.forEach((u, i) => {
      const t = el("button", { class: `unit-tab ${i === sel ? "on" : ""} ${u.comingSoon ? "soon" : ""}`, text: `${u.roman}. ${u.title}` });
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
        // 모든 학년·단원 공통 표기: "단원 정복률 N%" (교육과정·쪽수 문구는 밴드에 쓰지 않는다)
        u.comingSoon
          ? el("div", { class: "ub-meta" }, el("span", { html: icon("clock", 13) }), el("span", { text: "다음 업데이트에서 열려요" }))
          : el("div", { class: "ub-meta" }, el("span", { html: icon("check", 13) }), el("span", { text: `단원 정복률 ${pct}%` })),
        el("div", { class: "ub-prog" }, el("i", { style: `width:${pct}%` })),
      ),
    );
  }

  function renderMap(u: Unit): void {
    clear(mapHost);
    // 준비 중 단원 — 지도 대신 안내 카드
    if (u.comingSoon) {
      mapHost.appendChild(
        el(
          "div",
          { class: "coming-card" },
          el("div", { class: "cc-med", html: icon(u.icon || "flask", 30) }),
          el("div", { class: "cc-title", text: "열심히 만들고 있어요" }),
          el("div", { class: "cc-desc", text: `${u.title} 단원은 다음 업데이트에서 만나요.` }),
        ),
      );
      return;
    }
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
    let premRibbon = false; // 첫 프리미엄 노드에만 리본을 달아 소음을 줄인다
    const nodeEls: HTMLElement[] = u.lessons.map((lesson, i) => {
      const unlocked = isUnlocked(u, i);
      const done = isDone(lesson.id);
      const prem = !done && isPremiumLocked(lesson); // 완료된 레슨은 그대로 훈장
      const now = unlocked && !done && !prem;
      const cls = ["gm-node"];
      if (theme) cls.push(theme);
      cls.push(done ? "done" : prem ? "prem" : now ? "now" : "locked");

      const med = el("div", {
        class: "gm-med",
        attrs: { "aria-hidden": "true" },
        html: done
          ? icon("check", 34, { sw: 3.4 })
          : prem
            ? icon("crown", 30)
            : unlocked
              ? icon(lesson.icon ?? "book", 34)
              : icon("lock", 30),
      });
      const stateLabel = done
        ? "완료"
        : prem
          ? "프리미엄 · 이용권으로 열려요"
          : now
            ? "학습 시작 가능"
            : "잠김 · 이전 레슨을 먼저 완료해요";
      const node = el("button", {
        class: cls.join(" "),
        attrs: now || done || prem
          ? { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}` }
          : { "aria-label": `${lesson.label ?? lesson.title} — ${stateLabel}`, "aria-disabled": "true" },
      }, med);
      if (now) {
        med.appendChild(el("div", { class: "gm-ring" }));
        node.appendChild(el("div", { class: "gm-ribbon", text: started ? "학습" : "시작" }));
      }
      if (prem && !premRibbon) {
        premRibbon = true;
        node.appendChild(el("div", { class: "gm-ribbon gold", text: "프리미엄" }));
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
        if (prem) {
          // 프리미엄 잠금 — 페이월로 안내(main.ts openLesson이 라우팅)
          onOpenLesson(lesson.id);
          return;
        }
        if (!unlocked) {
          snack("이전 레슨을 먼저 완료해요");
          return;
        }
        onOpenLesson(lesson.id);
      });
      nodesLayer.appendChild(node);
      return node;
    });

    // 단원 종합 평가 노드 — 레슨 진행과 무관하게 항상 열려 있다(레슨 뒤·보너스 게임 앞)
    const exam = examForUnit(u.id);
    if (exam) {
      const rec = examRecordOf(exam.id);
      const med = el("div", { class: "gm-med", attrs: { "aria-hidden": "true" }, html: icon("target", 32) });
      const node = el("button", {
        class: `gm-node exam ${theme} ${rec.conquered ? "conq" : ""}`,
        attrs: { "aria-label": `단원 종합 평가 — ${rec.best > 0 ? `최고 ${rec.best}점` : "언제든 도전 가능"}` },
      }, med);
      if (rec.conquered) node.appendChild(el("div", { class: "gm-ribbon gold", text: "정복 인증" }));
      node.appendChild(el("div", { class: "gm-label", text: "단원 종합 평가" }));
      if (rec.best > 0) node.appendChild(el("div", { class: "gm-exam-best", text: `최고 ${rec.best}점` }));
      node.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        nav2?.onOpenExam?.(u.id);
      });
      nodesLayer.appendChild(node);
      nodeEls.push(node);
    }

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
    renderBand(cur[sel]);
    renderMap(cur[sel]);
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
  g2u1: { seq: ["flaskDeco", "layersDeco", "crystalDeco", "funnelDeco", "alembicDeco"], sky: ["cloud", "sparkle"] }, // 실험대 순례: 측정→층→결정→분리→증류
  g2u2: { seq: ["earthcutDeco", "quartzDeco", "volcanoDeco", "strataDeco", "fossilDeco"], sky: ["cloud", "sparkle"] }, // 지질 원정: 지구 단면→수정→화산→지층→화석
  g2u3: { seq: ["flashlightDeco", "mirrorDeco", "prismDeco", "rgbDeco", "noteDeco"], sky: ["rainbowDeco", "cloud"] }, // 빛의 여행 → 소리의 여행
  g2u4: { seq: ["beakerDeco", "atomDeco", "tableDeco", "moleculeDeco", "ionDeco"], sky: ["atomDeco", "cloud"] }, // 성분에서 입자로 — 원소→원자→주기율표→분자→이온
  g2u5: { seq: ["leafDeco", "stomaDeco", "chloroplastDeco", "flowerDeco", "fruitDeco"], sky: ["sunDeco", "leafDeco"] }, // 잎→기공→엽록체→꽃→열매, 광합성산물의 여정
  g2u7: { seq: ["boltDeco", "batteryDeco", "bulbDeco", "coilDeco", "magnetDeco"], sky: ["boltDeco", "cloud"] }, // 전기 순례: 스파크→전지→전구→코일→자석
  g2u8: { seq: ["starsDeco", "clusterDeco", "galaxyDeco", "telescopeDeco", "rocketDeco"], sky: ["starsDeco", "sparkle"] }, // 별빛 순항: 별→성단→은하→망원경→로켓
  m1u1: { seq: ["pmDeco", "fracDeco", "primeDeco", "opsDeco", "numlineDeco"], sky: ["sparkle", "cloud"] }, // 수와 연산: 부호 타일, 분수 카드, 소수 7 배지, 연산 타일, 수직선 팻말
  m1u2: { seq: ["xDeco", "eqDeco", "scaleDeco", "aDeco", "boxDeco"], sky: ["sparkle", "cloud"] }, // 문자와 식: x 카드, 등호, 양팔저울, a 카드, x 상자
  m1u3: { seq: ["pinDeco", "gridDeco", "zigDeco", "riseDeco", "hyperDeco"], sky: ["sparkle", "cloud"] }, // 좌표평면과 그래프: 점 핀, 좌표평면, 꺾은선, 정비례 직선, 반비례 곡선(단원 여정 순)
  m1u4: { seq: ["pointDeco", "segmentDeco", "protracDeco", "compassDeco", "trisqDeco"], sky: ["sparkle", "cloud"] }, // 기본 도형: 점 → 선분 → 각도기 → 컴퍼스 → 삼각자(도형 여정 순)
  m1u5: { seq: ["pentaDeco", "fanDeco", "diceDeco", "coneDeco", "sphereDeco"], sky: ["sparkle", "cloud"] }, // 평면도형과 입체도형: 오각형 → 부채꼴 → 주사위 → 원뿔 → 구(평면에서 입체로의 여정 순)
  m1u6: { seq: ["seesawDeco", "stemshelfDeco", "histoDeco", "fpolyDeco", "ratioDeco"], sky: ["sparkle", "cloud"] }, // 통계: 평균 시소 → 줄기 선반 → 히스토그램 → 도수분포다각형 → 상대도수 비율(자료 정리의 여정 순)
  m2u1: { seq: ["calcDeco", "tapeDeco", "loopDeco", "powtowerDeco", "termchipDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅰ: 계산기 → 반복 무늬 테이프 → 무한 리본 → 지수 탑 → 항 칩(수의 표현에서 식의 계산으로)
  m2u2: { seq: ["signDeco", "tiltDeco", "rangeDeco", "duoboxDeco", "birdrabbitDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅱ: 제한 표지판 → 기운 저울 → 수직선 범위 → x·y 상자 쌍 → 꿩과 토끼(부등식에서 연립방정식으로)
  m2u3: { seq: ["funcboxDeco", "duolineDeco", "axisdotDeco", "slopetriDeco", "crosspointDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅲ: 함수 기계 → 나란한 두 직선 → 절편 점 → 기울기 세모 → 교점(함수에서 교점까지)
  m2u4: { seq: ["hangerDeco", "sealDeco", "circumDeco", "paraliftDeco", "kiteDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅳ: 이등변 옷걸이 → 증명 도장 → 외접원 → 평행사변형 리프트 → 마름모 연(삼각형에서 사각형으로)
  m2u5: { seq: ["matryoDeco", "trirulerDeco", "foldletterDeco", "trayDeco", "knotropeDeco"], sky: ["sparkle", "cloud"] }, // 중2 Ⅴ: 마트료시카 → 삼각자 → 3단 접기 편지 → 균형 쟁반 → 3·4·5 매듭 밧줄(닮음에서 피타고라스로)
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
  flaskDeco: 46, layersDeco: 44, crystalDeco: 46, funnelDeco: 42, alembicDeco: 48,
  volcanoDeco: 50, quartzDeco: 44, strataDeco: 50, fossilDeco: 42, earthcutDeco: 46,
  flashlightDeco: 48, mirrorDeco: 44, prismDeco: 50, rgbDeco: 44, noteDeco: 38, rainbowDeco: 58,
  beakerDeco: 46, atomDeco: 46, tableDeco: 46, moleculeDeco: 46, ionDeco: 42,
  leafDeco: 46, stomaDeco: 42, chloroplastDeco: 46, flowerDeco: 46, fruitDeco: 44,
  pebblesDeco: 44, sieveDeco: 48, numTreeDeco: 46, vennDeco: 48, numlineDeco: 44,
  pmDeco: 42, fracDeco: 42, primeDeco: 44, opsDeco: 46, xDeco: 44, aDeco: 40, eqDeco: 42, scaleDeco: 46, boxDeco: 44,
  pointDeco: 38, segmentDeco: 46, protracDeco: 48, compassDeco: 46, trisqDeco: 48,
  pentaDeco: 44, fanDeco: 48, diceDeco: 44, coneDeco: 46, sphereDeco: 42,
  seesawDeco: 48, stemshelfDeco: 46, histoDeco: 46, fpolyDeco: 46, ratioDeco: 42,
  calcDeco: 46, tapeDeco: 46, loopDeco: 48, powtowerDeco: 48, termchipDeco: 44,
  signDeco: 44, tiltDeco: 48, rangeDeco: 46, duoboxDeco: 46, birdrabbitDeco: 50,
  funcboxDeco: 46, duolineDeco: 48, axisdotDeco: 44, slopetriDeco: 46, crosspointDeco: 48,
  hangerDeco: 46, sealDeco: 42, circumDeco: 48, paraliftDeco: 48, kiteDeco: 46,
  matryoDeco: 46, trirulerDeco: 46, foldletterDeco: 44, trayDeco: 48, knotropeDeco: 48,
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
