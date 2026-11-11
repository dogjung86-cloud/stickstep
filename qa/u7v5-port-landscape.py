# 중1 Ⅶ v5: 가로 화면 3D 랩 둘(태양계 순항, 일식과 월식)을 정본에서 옮겨 적는 도구.
# 정본(steps/solarTour.ts, steps/eclipse3d.ts)은 고치지 않는다. 3D 무대 코드는 그대로 두고
# 세로 화면의 틀(제목, 할 일, 찾을 것 목록, 판정, 결론)과 가로 화면의 안내만 바꿔 끼운 사본을 steps/u7v5/에 쓴다.
# 정본의 무대가 바뀌면 이 도구를 다시 돌린다: python qa/u7v5-port-landscape.py
# 바꿔 끼울 자리를 찾지 못하면 멈춘다(정본이 달라졌다는 뜻이다).
import io, re, sys

SRC = "src/lessons/steps/"
OUT = "src/lessons/steps/u7v5/"
END = "  // ---- 가로 스테이지 + 3D ----\n"


def read(p):
    return io.open(p, encoding="utf-8").read().replace("\r\n", "\n")


def once(s, old, new, what):
    if s.count(old) != 1:
        sys.exit(f"[port] {what}: 바꿀 자리 {s.count(old)}곳")
    return s.replace(old, new)


def between(s, start, end, new, what):
    a = s.find(start)
    b = s.find(end, a)
    if a < 0 or b < 0:
        sys.exit(f"[port] {what}: 구간을 찾지 못함")
    return s[:a] + new + s[b:]


def common(s):
    s = s.replace('from "../../core/', 'from "../../../core/').replace('from "../../ui/', 'from "../../../ui/').replace('from "../types"', 'from "../../types"')
    s = s.replace('import("../../ui/', 'import("../../../ui/')
    # 주석의 대시를 걷는다(이 저장소의 글 규칙)
    s = re.sub(r"\s+—\s+", ": ", s)
    return s


# ───────── 태양계 순항 ─────────
TOUR_HEAD = '''  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-enter", api });
  const doneCta = s.cta ?? "개념 정리하기";
  const enterBtn = el("button", { class: "u7x-enterbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 출발하기" })) as HTMLButtonElement;
  f.stage.append(el("div", { class: "u7x-enter-art", html: tourArtSvg() }), enterBtn, el("div", { class: "u7x-credit", text: "행성 표면: Solar System Scope(CC BY 4.0) · 사진: NASA" }));
  const goalsUi = u7Goals(3, KINDS.map((k) => ({ id: k.id, name: k.name, sub: "찾아 누르기" })));
  f.slot.setControls(el("div", { class: "u7x-cap", text: "여섯 가지 천체를 하나씩 만나요" }), goalsUi.el);
  f.say("가로 화면에서 태양계를 돌려 보며 아래 <b>여섯 가지 천체</b>를 찾아 눌러 보세요.");
  f.pips(1);
  host.dataset.u7Phase = "tour";

  const visited = new Set<string>();
  let finished = false;
  let asked = false;
  let missionEl: HTMLElement | null = null;
  let doneBar: HTMLElement | null = null;

  function syncMission(): void {
    for (const k of KINDS) {
      const chip = missionEl?.querySelector(`[data-g="${k.id}"]`) as HTMLElement | null;
      if (chip) chip.classList.toggle("on", goalsUi.has(k.id));
    }
    if (finished && rot && !doneBar) {
      // 가로 화면 안에서 끝을 알린다(세로 화면으로 돌아가야 정리가 이어진다)
      const back = el("button", { class: "u7x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
      back.addEventListener("click", () => rot?.leave());
      doneBar = el("div", { class: "u7x-rotdone" }, el("span", { text: "여섯 가지 천체를 모두 만났어요" }), back);
      rot.stage.appendChild(doneBar);
    }
  }

  function checkGoals(): void {
    for (const k of KINDS) {
      if (!goalsUi.has(k.id) && k.keys.some((x) => visited.has(x))) {
        goalsUi.done(k.id, k.found);
        haptic(HAPTIC.ctaUnlock);
      }
    }
    host.dataset.u7Found = String(goalsUi.count());
    if (goalsUi.count() === KINDS.length) finished = true;
    syncMission();
  }

  // 돌아온 뒤: 교과서 탐구의 특징 표를 채운다(특징마다 해당하는 천체를 모두 고른다. 틀리면 본 것을 짚어 주고 다시 고르게 한다)
  function startTable(): void {
    asked = true;
    host.dataset.u7Phase = "table";
    f.pips(2);
    api.setCTA("특징 표를 채워 보세요", { enabled: false });
    const cells = new Map<string, HTMLElement>();
    const grid = el("div", { class: "u7x-ftable" }, el("i"), ...FEATURES.map((ft) => el("b", { text: ft.head })));
    for (const k of KINDS) {
      grid.appendChild(el("span", { text: k.name }));
      for (const ft of FEATURES) {
        const c = el("em", { dataset: { f: ft.id, k: k.id } });
        cells.set(`${ft.id}:${k.id}`, c);
        grid.appendChild(c);
      }
    }
    f.stage.replaceChildren(grid);
    f.stage.classList.add("u7x-tablestage");
    const picked = new Set<string>();
    const chips = KINDS.map((k) => {
      const b = el("button", { class: "u7x-segbtn", attrs: { type: "button", "aria-pressed": "false" }, dataset: { k: k.id } }, el("span", { text: k.name })) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (picked.has(k.id)) picked.delete(k.id);
        else picked.add(k.id);
        b.classList.toggle("on", picked.has(k.id));
        b.setAttribute("aria-pressed", String(picked.has(k.id)));
        haptic(HAPTIC.tap);
      });
      return b;
    });
    const row = el("div", { class: "u7x-seg three" }, ...chips);
    const confirm = el("button", { class: "bv-btn main", attrs: { type: "button" }, text: "표에 적기" }) as HTMLButtonElement;
    f.slot.setControls(row, confirm);
    let fi = 0;
    let graded = false;
    const show = (): void => {
      picked.clear();
      chips.forEach((b) => {
        b.classList.remove("on");
        b.setAttribute("aria-pressed", "false");
      });
      host.dataset.u7Feature = String(fi);
      f.say(FEATURES[fi].q);
    };
    confirm.addEventListener("click", () => {
      const ft = FEATURES[fi];
      const right = picked.size === ft.ok.length && ft.ok.every((x) => picked.has(x));
      if (!graded) {
        graded = true;
        api.recordQuiz(right); // 채점은 첫 특징의 첫 답 한 번
      }
      if (!right) {
        haptic(HAPTIC.wrong);
        f.stage.classList.remove("u7x-shake");
        void f.stage.offsetWidth;
        f.stage.classList.add("u7x-shake");
        f.say(ft.hint);
        host.dataset.u7Miss = String(Number(host.dataset.u7Miss ?? "0") + 1);
        return;
      }
      haptic(HAPTIC.correct);
      for (const k of KINDS) cells.get(`${ft.id}:${k.id}`)?.classList.add(ft.ok.includes(k.id) ? "yes" : "no");
      fi += 1;
      if (fi < FEATURES.length) show();
      else {
        confirm.disabled = true;
        window.setTimeout(() => !disposed && conclude(), 900);
      }
    });
    show();
  }

  function conclude(): void {
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("표를 다 채웠어요. 여섯 갈래의 특징이 한눈에 보여요.");
    f.slot.conclude("태양계에는 스스로 빛나는 <b>태양</b>과, 그 둘레를 도는 <b>행성, 왜소 행성, 소행성, 혜성</b>이 있어요. <b>위성</b>은 행성의 둘레를 돌아요.");
    api.enableCTA(doneCta);
  }

'''

TOUR_KINDS = '''
// 찾을 천체 여섯 가지(교과서 탐구의 여섯 갈래)와 그 갈래에 드는 무대의 천체
const KINDS: { id: string; name: string; found: string; keys: string[] }[] = [
  { id: "sun", name: "태양", found: "스스로 빛나요", keys: ["sun"] },
  { id: "planet", name: "행성", found: "태양 둘레를 돌아요", keys: ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] },
  { id: "moon", name: "위성", found: "달을 만났어요", keys: ["moon"] },
  { id: "belt", name: "소행성", found: "화성과 목성 사이", keys: ["belt"] },
  { id: "comet", name: "혜성", found: "꼬리가 있어요", keys: ["comet"] },
  { id: "dwarf", name: "왜소 행성", found: "명왕성을 만났어요", keys: ["pluto"] },
];
const DEV_KEYS = ["sun", "earth", "moon", "belt", "comet", "pluto"];
// 특징 표의 세 칸(교과서 탐구의 표). ok는 그 특징에 해당하는 갈래, hint는 틀렸을 때 가로 화면에서 본 것을 짚는 말
const FEATURES: { id: string; head: string; q: string; ok: string[]; hint: string }[] = [
  { id: "shine", head: "스스로 빛남", q: "<b>스스로 빛을 내는</b> 천체를 모두 고르고 <b>표에 적기</b>를 눌러요.", ok: ["sun"], hint: "행성과 달은 태양을 향한 쪽만 밝았어요. 스스로 빛난 것을 다시 골라 보세요." },
  { id: "sun", head: "태양 둘레", q: "이번에는 <b>태양의 둘레를 도는</b> 천체를 모두 골라요.", ok: ["planet", "belt", "comet", "dwarf"], hint: "달은 지구 곁에서 지구 둘레를 돌았어요. 태양은 가운데에 있었고요. 다시 골라 보세요." },
  { id: "planet", head: "행성 둘레", q: "마지막으로 <b>행성의 둘레를 도는</b> 천체를 모두 골라요.", ok: ["moon"], hint: "행성 곁에 붙어 그 둘레를 돈 천체는 하나뿐이었어요. 다시 골라 보세요." },
];

'''

TOUR_LEAVE = '''  function leave(): void {
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
    rot?.dispose();
    rot = null;
    missionEl = null;
    doneBar = null;
    enterBtn.classList.remove("pulse");
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 둘러보기";
      if (!asked) startTable();
    } else {
      enterBtn.querySelector("span")!.textContent = "다시 출발하기";
      f.say("아직 못 만난 천체가 있어요. 다시 출발해서 <b>남은 천체</b>를 찾아 눌러 보세요.");
    }
  }
'''


def port_tour():
    s = common(read(SRC + "solarTour.ts"))
    s = between(s, "// solarTour", "import { el, clamp }", '''// u7TourLab: 태양계 구성 천체(u7l1). 교과서 탐구 "태양계 구성 천체 자료 수집 및 분석하기"(228~229쪽)의 여섯 갈래
// (태양, 행성, 왜소 행성, 소행성, 혜성, 위성)를 가로 화면의 3D 태양계에서 하나씩 찾아 만난다.
// 3D 무대는 정본 steps/solarTour.ts 그대로다(qa/u7v5-port-landscape.py가 옮겨 적는다. 이 파일을 손으로 고치지 않는다).
// 바꾼 것: 세로 화면의 틀(한 화면, 찾을 것 여섯 가지, 판정, 결론은 조작 칸에) · 찾을 것(안쪽 2곳, 바깥 2곳, 소행성대 → 천체의 갈래 여섯)
//          · 가로 화면에서 다 찾으면 그 자리에서 알리고 돌아가는 버튼을 준다.
''', "tour 머리말")
    s = once(s, 'import type { RotateStage } from "../../../ui/rotateStage";\n', 'import type { RotateStage } from "../../../ui/rotateStage";\nimport { u7Frame, u7Goals, u7Dev } from "./kit";\n', "tour import")
    s = once(s, '\nconst TERRA = ["mercury", "venus", "earth", "mars"];\nconst JOVIAN = ["jupiter", "saturn", "uranus", "neptune"];\n', TOUR_KINDS, "tour kinds")
    s = once(s, "export const solarTour: StepRenderer", "export const u7TourLab: StepRenderer", "tour export")
    s = between(s, '  host.appendChild(el("div", { class: "h1"', END, TOUR_HEAD, "tour 틀")
    s = once(s, 'rot = enterRotateStage({ title: "태양계 순항, 드래그 회전 · 핀치 줌 · 탭 방문", onLeave: () => leave() });', 'rot = enterRotateStage({ title: "천체 여섯 가지를 찾아 눌러요 · 끌면 돌고, 두 손가락으로 확대", onLeave: () => leave() });', "tour 가로 제목")
    s = between(s, '    missionEl = el(\n', '    const zoomIn = el(', '''    missionEl = el("div", { class: "sp3-missions u7x-missions" }, ...KINDS.map((k) => el("span", { dataset: { g: k.id }, text: k.name })));
    syncMission();
''', "tour 가로 목록")
    s = between(s, '      helper.innerHTML = "3D를 켤 수 없어요.', '      return;\n', '''      finished = true;
      asked = true;
      api.recordQuiz(true);
      rot?.leave();
      conclude();
      f.say("이 기기에서는 입체 무대를 켤 수 없어요. 아래 글로 알아 두세요.");
''', "tour 폴백")
    s = once(s, 'pillText.textContent = visited.size ? `방문 ${visited.size}곳, 천체를 탭!` : "돌리고 · 줌하고 · 탭해 보세요";', 'pillText.textContent = finished ? "모두 만났어요" : visited.size ? `${goalsUi.count()}가지 만남, 다른 천체도 눌러요` : "끌어서 돌리고, 천체를 눌러요";', "tour 알약")
    s = between(s, "  function leave(): void {\n", '  enterBtn.addEventListener("click"', TOUR_LEAVE + "\n", "tour leave")
    s = once(s, "    // ---- 프레임 ----\n    let t = 0;\n", "    // 검사용(개발 서버에서만): 번호로 천체를 만난다\n    u7Dev(host, { visit: (i: number) => openCard(DEV_KEYS[i]), close: () => closeCard() });\n\n    // ---- 프레임 ----\n    let t = 0;\n", "tour 검사 손잡이")
    s = once(s, 'api.setCTA("태양계를 순항해요", { enabled: false });', 'api.setCTA("여섯 가지 천체를 찾아요", { enabled: false });', "tour cta")
    io.open(OUT + "tourLab.ts", "w", encoding="utf-8", newline="\n").write(s)


# ───────── 일식과 월식 ─────────
ECL_HEAD = '''  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-enter", api });
  const doneCta = s.cta ?? "개념 정리하기";
  const enterBtn = el("button", { class: "u7x-enterbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" })) as HTMLButtonElement;
  f.stage.append(el("div", { class: "u7x-enter-art", html: enterArtSvg() }), enterBtn);
  const goalsUi = u7Goals(1, [
    { id: "solar", name: "지구에 달의 그림자 만들기", sub: "달을 어디에 두면 될까요" },
    { id: "ground", name: "그림자 속 땅에서 올려다보기", sub: "태양은 어떤 모습일까요" },
    { id: "lunar", name: "달을 지구의 그림자 속으로", sub: "달을 어디에 두면 될까요" },
  ]);
  const FOUND: Record<string, string> = { solar: "일식이에요", ground: "개기일식이에요", lunar: "월식이에요" };
  f.slot.setControls(el("div", { class: "u7x-cap", text: "가로 화면에서 세 가지를 해 봐요" }), goalsUi.el);
  f.say("가로 화면에서 <b>달</b>을 끌어 태양, 지구와 <b>한 줄</b>로 세워 보세요.");
  f.pips(1);
  host.dataset.u7Phase = "play";

  const goals = new Set<string>();
  let finished = false;
  let asked = false;
  let doneBar: HTMLElement | null = null;

  function showDone(): void {
    if (!finished || !rot || doneBar) return;
    // 가로 화면 안에서 끝을 알린다(세로 화면으로 돌아가야 정리가 이어진다)
    const back = el("button", { class: "u7x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
    back.addEventListener("click", () => rot?.leave());
    doneBar = el("div", { class: "u7x-rotdone" }, el("span", { text: "세 가지를 모두 해냈어요" }), back);
    rot.stage.appendChild(doneBar);
  }

  function collect(id: string, _subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    goalsUi.done(id, FOUND[id]);
    host.dataset.u7Found = String(goals.size);
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      showDone();
    }
  }

  function askOrder(): void {
    asked = true;
    host.dataset.u7Phase = "ask";
    f.pips(2);
    // 교과서의 기록 두 칸: 지구에 그림자가 생길 때와 달에 그림자가 생길 때 세 천체의 자리
    f.say("두 가지를 모두 만들었어요. 그때 세 천체의 자리를 떠올려 적어 봐요.");
    f.slot.ask(
      "<b>지구에 달의 그림자</b>가 생겼을 때, 가운데에 있던 천체는?",
      [{ t: "달", ok: true }, { t: "지구" }, { t: "태양" }],
      (ok) => api.recordQuiz(ok),
      { why: "태양, 달, 지구의 차례로 한 줄이었어요.", onNext: askLunar },
    );
  }

  function askLunar(): void {
    host.dataset.u7Phase = "ask2";
    f.slot.ask(
      "<b>달이 지구의 그림자</b>에 들어갔을 때, 가운데에 있던 천체는?",
      [{ t: "지구", ok: true }, { t: "달" }, { t: "태양" }],
      () => undefined,
      { why: "태양, 지구, 달의 차례로 한 줄이었어요.", onNext: conclude },
    );
  }

  function conclude(): void {
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("가로 화면의 <b>왜 매달 일어나지 않을까요?</b> 단추도 눌러 보면 좋아요.");
    f.slot.conclude("<b>태양, 달, 지구</b> 차례로 한 줄이면 달이 태양을 가리는 <b>일식</b>, <b>태양, 지구, 달</b> 차례로 한 줄이면 달이 지구 그림자에 드는 <b>월식</b>이에요.");
    api.enableCTA(doneCta);
  }

'''

ECL_LEAVE = '''  function leave(): void {
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
    rot?.dispose();
    rot = null;
    doneBar = null;
    groundView = false;
    enterBtn.classList.remove("pulse");
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 열어 보기";
      if (!asked) askOrder();
    } else {
      enterBtn.querySelector("span")!.textContent = "다시 열어서 이어 하기";
      f.say("아직 남은 일이 있어요. 다시 열어서 <b>아래 세 가지</b>를 마저 해 보세요.");
    }
  }
'''


def port_eclipse():
    s = common(read(SRC + "eclipse3d.ts"))
    s = between(s, "// eclipse3d", "import { el", '''// u7EclipseLab: 일식과 월식(u7l6). 교과서 "태양과 달이 가려지는 원리 알아보기"(252쪽: 손전등, 큰 공, 작은 공을 한 줄로 놓고
// 작은 공을 돌리며 두 공에 생기는 그림자를 본다)를 가로 화면의 3D에서 한다. 그림 Ⅶ-10과 같은 배치다.
// 3D 무대는 정본 steps/eclipse3d.ts 그대로다(qa/u7v5-port-landscape.py가 옮겨 적는다. 이 파일을 손으로 고치지 않는다).
// 바꾼 것: 세로 화면의 틀(한 화면, 할 일 세 가지는 한 일로 부르고 해낸 뒤에 이름을 붙인다, 판정, 결론은 조작 칸에)
//          · 가로 화면에서 다 해내면 그 자리에서 알리고 돌아가는 버튼을 준다.
''', "eclipse 머리말")
    s = once(s, 'import type { RotateStage } from "../../../ui/rotateStage";\n', 'import type { RotateStage } from "../../../ui/rotateStage";\nimport { u7Frame, u7Goals, u7Dev } from "./kit";\n', "eclipse import")
    s = once(s, "export const eclipse3d: StepRenderer", "export const u7EclipseLab: StepRenderer", "eclipse export")
    s = between(s, '  host.appendChild(el("div", { class: "h1"', END, ECL_HEAD, "eclipse 틀")
    s = between(s, '      helper.innerHTML = "3D를 켤 수 없어요.', '      return;\n', '''      finished = true;
      asked = true;
      api.recordQuiz(true);
      rot?.leave();
      conclude();
      f.say("이 기기에서는 입체 무대를 켤 수 없어요. 아래 글로 알아 두세요.");
''', "eclipse 폴백")
    s = once(s, "    const { scene, camera } = st;\n", "    const { scene, camera } = st;\n    showDone();\n", "eclipse 다시 열 때")
    s = between(s, "  function leave(): void {\n", '  enterBtn.addEventListener("click"', ECL_LEAVE + "\n", "eclipse leave")
    # 세로 화면의 그림: 일식 배치(태양, 달, 지구 한 줄)로 그려져 있어 판정 질문의 오답 보기와 겹친다. 달을 줄 밖으로 뺀다
    s = between(s, '    <path d="M106 48h40"', '    <circle cx="200" cy="48" r="16"', '    <circle cx="160" cy="20" r="8" fill="url(#ec-moon)"/>\n', "eclipse 그림의 달")
    s = between(s, '    <ellipse cx="186.5"', '    <path d="M258 40l8 8-8 8"', "", "eclipse 그림의 그림자")
    # 가로 화면의 글: 낱말 가운데서 줄이 끊기지 않게, 단추는 해요체로
    s = once(s, 'class: "sp3-toast"', 'class: "sp3-toast u7x-toast"', "eclipse 자막")
    if s.count("왜 매달 안 일어날까?") != 2:
        sys.exit("[port] eclipse 단추 글")
    s = s.replace("왜 매달 안 일어날까?", "왜 매달 일어나지 않을까요?")
    s = once(s, '  enterBtn.addEventListener("click", () => void enter());\n', '  enterBtn.addEventListener("click", () => void enter());\n  // 검사용(개발 서버에서만): 달을 주어진 각도에 놓는다(180 = 태양 쪽, 0 = 태양 반대쪽)\n  u7Dev(host, { phi: (deg: number) => (phi = (deg * Math.PI) / 180) });\n', "eclipse 검사 손잡이")
    io.open(OUT + "eclipseLab.ts", "w", encoding="utf-8", newline="\n").write(s)


port_tour()
port_eclipse()
print("ok")
