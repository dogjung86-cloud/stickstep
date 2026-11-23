// [중2 Ⅵ v5] 순환 여행 랩(g2u6l3). 2026-11-15 사용자 요청: "세로로 길게, 좌심실에서 나온 피가 대동맥을 거쳐 온몸을 돌며
// 산소를 주고 이산화 탄소를 받은 뒤 심장으로 들어가는 과정을 아주 자세히 보여 주는 3D 랩. 온몸순환과 허파순환이 잘 학습되게."
//
// g2u6RideLab 「혈액은 몸속 어디를 돌까요?」
//   그림(혈액의 순환 경로: 위에 허파, 가운데 심장, 아래에 온몸의 모세혈관. 산소를 많이 포함한 혈액과 적게 포함한 혈액),
//   그림(순환계의 구조: 동맥은 벽이 두껍고, 정맥은 동맥보다 얇고, 모세혈관은 벽이 매우 얇아 물질 교환이 일어남)과
//   활동. 혈액 한 방울을 좌심실에서 출발시켜 온몸과 허파를 한 바퀴 따라간다.
//   경로 랩(g2u6LoopLab)이 모식도에서 차례를 짚었다면, 이 랩은 실제 몸속의 길과 그 길에서 일어나는 일(물질 교환, 색, 판막)을 본다.
//   기체가 어느 쪽으로 이동하는지 고르는 일은 레슨 4의 기체 교환 랩이 맡는다. 여기서는 그 모습을 자세히 보여 준다.
//   학생이 정하는 것:
//     ① 조직세포 곁에서: 동맥, 모세혈관, 정맥 가운데 세포와 물질을 주고받는 혈관(벽이 매우 얇은 혈관)
//     ② 심장 앞에서: 대정맥이 이어진 방(사용자가 헷갈린 바로 그곳. 온몸을 돈 혈액은 우심방으로 들어간다)
//     ③ 폐정맥에서: 산소가 많은 혈액이 심장으로 들어가는 이 혈관이 동맥인지 정맥인지
//     그리고 심장 수축 두 번, 숨 들이쉬기 한 번은 학생이 눌러야 일어난다.
//   틀린 길에서 보이는 결과: 동맥에서 산소를 내보내려 하면 두꺼운 벽에 막혀 되돌아온다(벽이 빛난다). 정맥을 고르면 그 벽이 빛난다.
//     좌심방이나 다른 방을 고르면 대정맥이 빛나며 닿는 곳을 보인다. 폐정맥을 동맥이라 하면 심장으로 들어가는 방향의 화살이 깜빡인다.
//   판정(채점): 온몸순환을 마친 혈액이 다음에 간 곳(두 순환이 심장에서 이어진다). 조작에서 틀린 횟수도 함께 센다(kit의 slip).
// 과학 가드: 앞에서 본 몸이라 화면 왼쪽이 몸의 오른쪽(우심방, 우심실). 오른쪽 방에는 산소가 적은 혈액, 왼쪽 방에는 많은 혈액.
//   산소는 적혈구가, 이산화 탄소와 영양소와 노폐물은 혈장이 나른다(그림에서 산소만 적혈구에 붙는다).
//   혈액의 색은 모세혈관에서만 바뀐다(온몸의 모세혈관에서 검붉게, 허파의 모세혈관에서 선홍색으로).
//   판막: 심실이 수축할 때 방실판막이 닫히고 동맥 쪽 판막이 열린다. 쉬거나 심방이 수축할 때는 그 반대다.
// 무대: 세로로 긴 판(346×440). 폰 한 화면 예산보다 길다(사용자가 "세로로 길게"를 원한 예외). 결정 단추는 무대 안에 있어
//   스크롤하지 않고 누를 수 있고, 마지막 판정은 조작 칸에 뜨며 그때 조작 칸을 화면 안으로 당긴다(누른 보기 바로 아래에 정답 카드).
//   넓은 화면은 이 무대를 자기 배율(--rdk)로 키운다(--lk는 230 높이 기준이라 그대로 쓰면 넘친다. 맞추는 일은 이 파일이 한다).
// 표식: data-g6-stage("3d" | "flat"), data-g6-ready, data-g6-step(국면), data-g6-seg, data-g6-picks, data-g6-fail, data-g6-phase(판정).
//   세션에 "ss.rideflat" = "1"을 심으면 평면 무대로 뜬다(검사와 비교활동용).

import { el } from "../../../core/dom";
import { isWide } from "../../../core/wide";
import type { StepRenderer } from "../../types";
import { bad, g6Lab, good, tap, type G6Step } from "./kit";
import { BREATH_DUR, RC, RH, RW, oxygen, startState, type FillKey, type FrameKey, type Pick, type PickKey, type RideStage, type RideState, type Seg } from "./rideStage";
import { canRide3d, modelRideStage } from "./rideStage3d";
import { flatRideStage } from "./rideStageFlat";

const ROOMS: Pick[] = [
  { key: "ra", text: "우심방" },
  { key: "la", text: "좌심방" },
  { key: "rv", text: "우심실" },
  { key: "lv", text: "좌심실" },
];
/** 지나온 길 기록(조작 칸). 두 순환을 한 줄씩. */
const LOG: { loop: "b" | "l"; k: string; t: string }[] = [
  { loop: "b", k: "lv", t: "좌심실" },
  { loop: "b", k: "ao", t: "대동맥" },
  { loop: "b", k: "bed", t: "모세혈관" },
  { loop: "b", k: "vc", t: "대정맥" },
  { loop: "b", k: "ra", t: "우심방" },
  { loop: "l", k: "rv", t: "우심실" },
  { loop: "l", k: "pa", t: "폐동맥" },
  { loop: "l", k: "lbed", t: "모세혈관" },
  { loop: "l", k: "pv", t: "폐정맥" },
  { loop: "l", k: "la", t: "좌심방" },
];

export const g2u6RideLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  // 큰 버튼의 안내는 '무대' 대신 '화면 속'이라고 쓴다(무대는 제작 말)
  const lab = g6Lab(host, api, s, { steps: 5, cls: "g2u6x-ride", wait: "화면 속 '좌심실 수축' 버튼을 눌러 출발해 보세요" });
  host.classList.add("g2u6x-ride-step");
  const { f, tm } = lab;
  let st: RideState = startState();
  let stage!: RideStage;
  let waiting: ((k: PickKey) => void) | null = null;

  // ── 상태를 무대에 알린다(검사 도구가 읽는 표식도 함께) ──
  const push = (patch: Partial<RideState>): void => {
    st = { ...st, ...patch };
    stage.set(st);
    host.dataset.g6Seg = st.seg;
    host.dataset.g6Frame = st.frame;
    host.dataset.g6Picks = st.picks.map((p) => p.key + (p.dim ? "-" : "")).join(",");
  };
  const now = (): number => performance.now();
  const move = (seg: Seg, a: number, b: number, dur: number, delay = 0, extra: Partial<RideState> = {}): void => push({ seg, a, b, t0: now() + delay, dur, ...extra });
  const frame = (k: FrameKey, dur: number, extra: Partial<RideState> = {}): void => push({ frame: k, ft0: now(), fdur: dur, ...extra });
  const o2 = (to: number, dur: number, delay = 0): void => push({ o0: oxygen(st, now()), o1: to, ot0: now() + delay, odur: dur });
  const done = (k: FillKey): void => push({ done: st.done.includes(k) ? st.done : [...st.done, k] });
  const sleep = (ms: number): Promise<void> => new Promise((r) => tm.later(r, ms));
  const phase = (p: string): void => {
    host.dataset.g6Step = p;
  };
  const say = (html: string): void => f.say(html);
  const cta = (t: string): void => api.setCTA(t, { enabled: false });

  // ── 무대(입체가 안 되면 평면) ──
  const onPick = (k: PickKey): void => {
    const w = waiting;
    if (!w) return;
    waiting = null;
    w(k);
  };
  const useFlat = (): void => {
    stage = flatRideStage(f.stage, { tm, onPick });
    host.dataset.g6Stage = "flat";
  };
  if (canRide3d()) {
    stage = modelRideStage(f.stage, {
      tm,
      onPick,
      onReady: () => (host.dataset.g6Ready = "1"),
      // 입체를 켜지 못하면 그 자리에서 평면 무대로 바꾸고 지금 상태를 그대로 이어 그린다
      onFail: () => {
        stage.dispose();
        useFlat();
        stage.set(st);
      },
    });
    host.dataset.g6Stage = "3d";
  } else useFlat();
  lab.onCleanup(() => stage.dispose());

  // ── 넓은 화면: 이 무대만의 배율(세로 440을 왼쪽 칸 높이에 맞춘다) ──
  const fitWide = (): void => {
    if (!isWide()) {
      host.style.removeProperty("--rdk");
      return;
    }
    const lp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lp")) || 400;
    const colW = Math.min(window.innerWidth, 1440) - lp - 68;
    const colH = window.innerHeight - 48 - 30 - 12; // 머리 줄, 스텝 위아래 여백, 무대와 조작 칸 사이
    const logH = 112 * 1.18; // 아래의 지나온 길 기록
    const k = Math.max(0.9, Math.min(2.6, (colH - logH) / RH, colW / RW));
    host.style.setProperty("--rdk", k.toFixed(3));
  };
  fitWide();
  const mq = window.matchMedia("(orientation: landscape) and (min-width: 1024px) and (min-height: 600px)");
  const onResize = (): void => {
    // wide.ts가 클래스를 바꾼 뒤에 셈한다
    tm.later(fitWide, 30);
  };
  window.addEventListener("resize", onResize);
  mq.addEventListener("change", onResize);
  lab.onCleanup(() => {
    window.removeEventListener("resize", onResize);
    mq.removeEventListener("change", onResize);
  });

  // ── 조작 칸: 지나온 길 기록 ──
  const logEls = new Map<string, HTMLElement>();
  const rows = (["b", "l"] as const).map((loop) =>
    el(
      "div",
      { class: `g2u6x-rd-row ${loop}` },
      el("b", { text: loop === "b" ? "온몸순환" : "허파순환" }),
      el(
        "div",
        { class: "g2u6x-rd-items" },
        ...LOG.filter((x) => x.loop === loop).map((x) => {
          const e = el("span", { text: x.t });
          logEls.set(x.k, e);
          return e;
        }),
      ),
    ),
  );
  const logBox = el("div", { class: "g2u6x-rd-log" }, el("div", { class: "g2u6x-rd-log-k", text: "지나온 길" }), ...rows);
  f.slot.setControls(logBox);
  const mark = (k: string, rich: boolean): void => {
    const e = logEls.get(k);
    if (!e) return;
    e.classList.add("on");
    e.style.setProperty("--c", rich ? RC.rich : RC.poor);
  };

  // ── 무대 안 단추 ──
  /** 무대가 다 보이게 당긴다(폰에서 아래를 보고 있었을 때) */
  const showStage = (): void => {
    tm.later(() => f.stage.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  };
  const pick = (): Promise<PickKey> => new Promise((res) => (waiting = res));
  /** 누를 것이 하나뿐인 동작(심장 수축, 숨 들이쉬기) */
  const act = async (p: Pick, ctaText: string): Promise<void> => {
    push({ picks: [p] });
    cta(ctaText);
    showStage();
    await pick();
    tap();
    push({ picks: [] });
    cta("혈액이 이동하는 모습을 살펴보세요");
  };
  /** 고르는 결정. 누른 단추에 결과를 새긴다(맞으면 체크와 "맞아요", 틀리면 가위표와 "아니에요").
   *  틀리면 무대가 결과를 보이는 동안 단추를 잠그고(hide면 잠깐 걷어 무대의 근거를 보이고), 틀린 단추는 표시가 남은 채 다시 고르게 한다. */
  const decide = async (picks: Pick[], right: PickKey, wrong: (k: PickKey) => Promise<void>, o: { hide?: boolean } = {}): Promise<void> => {
    let ps = picks;
    push({ picks: ps });
    cta("화면 속에서 알맞은 곳을 골라 눌러 보세요");
    showStage();
    for (;;) {
      const k = await pick();
      if (k === right) {
        good();
        host.dataset.g6Fail = "";
        // 맞힌 단추에 체크를 잠깐 보인 뒤 걷는다(다른 단추는 바로 걷는다)
        push({ picks: ps.filter((p) => p.key === k).map((p) => ({ ...p, mark: "ok" as const, lock: true })) });
        cta("혈액이 이동하는 모습을 살펴보세요");
        await sleep(900);
        push({ picks: [] });
        return;
      }
      bad();
      lab.slip();
      host.dataset.g6Fail = k;
      ps = ps.map((p) => (p.key === k ? { ...p, mark: "no" as const } : p));
      push({ picks: o.hide ? [] : ps.map((p) => ({ ...p, lock: true })) }); // 결과를 보는 동안은 잠근다
      await wrong(k);
      push({ picks: ps });
    }
  };

  // ── 여행 ──
  const run = async (): Promise<void> => {
    // 0. 출발: 좌심실
    phase("start");
    mark("lv", true);
    say("여기는 <b>좌심실</b>이에요. 산소를 가득 실은 <b>선홍색 혈액</b>이 출발을 기다리고 있어요. 좌심실을 수축시켜 출발해 볼까요?");
    await act({ key: "pump", text: "좌심실 수축", hot: true, at: [262, 314] }, "화면 속 '좌심실 수축' 버튼을 눌러 출발해 보세요");

    // 1. 좌심실 → 대동맥 → 온몸. 글이 판막을 말하는 동안 심실이 수축한 자세(방실판막 닫힘, 동맥 쪽 판막 열림)를 붙잡는다
    phase("aorta");
    push({ beat: "vent", bt0: now(), bhold: 2300 });
    move("ao", 0, 0.12, 700);
    // 판막을 말할 때는 어느 판막인지 쓴다(SCI_GUIDE 순환 여행 랩). 수정안의 "판막이 열리며"에 "심실과 대동맥 사이의"를 넣었다(이 자세에서 열려 있는 판막).
    say("두꺼운 좌심실이 힘차게 수축하자 심실과 대동맥 사이의 판막이 열리며 혈액이 대동맥으로 뿜어져 나와요!");
    await sleep(2200);
    frame("follow", 900, { place: "대동맥", tags: ["lungs", "tissue", "ao"] });
    move("ao", 0.12, 1, 3300);
    mark("ao", true);
    say("<b>대동맥</b>은 심장에서 나가는 혈관이라 동맥이에요. 갈라지며 온몸으로 내려가요.");
    await sleep(3400);
    done("ao");

    // 2. 조직세포 곁: 물질을 주고받는 혈관은?
    phase("d1");
    frame("body", 1500, { legend: "gasBody", place: "조직세포 곁", tags: ["mcell"] });
    await sleep(650);
    move("mart", 0, 0.9, 1200);
    await sleep(1150);
    say("동맥, 모세혈관, 정맥 가운데 조직세포와 물질을 주고받는 혈관을 눌러요.");
    await decide(
      [
        { key: "art", text: "동맥", at: [300, 156] },
        { key: "cap", text: "모세혈관", at: [184, 178] },
        { key: "ven", text: "정맥", at: [64, 324] },
      ],
      "cap",
      async (k) => {
        push({ ex: k === "art" ? "bumpArt" : "bumpVen", et0: now() });
        say(
          k === "art"
            ? "동맥은 혈관벽이 두꺼워 산소가 빠져나가지 못해요. 벽이 <b>매우 얇은</b> 혈관을 찾아요."
            : "정맥은 모세혈관을 지나 모인 혈관이고 벽도 더 두꺼워요. 벽이 <b>매우 얇은</b> 혈관을 찾아요.",
        );
        await sleep(1500);
      },
    );
    f.pips(1);
    phase("body");
    push({ ex: "body", et0: now(), tags: ["mcell", "mcap"] });
    move("mcap", 0, 1, 3800, 300);
    o2(0, 2800, 900);
    say("맞아요. 혈관벽이 매우 얇은 <b>모세혈관</b>에서 산소와 영양소가 조직세포로 나가요.");
    await sleep(2000);
    say("세포에서 생긴 이산화 탄소와 노폐물은 혈장에 녹아 혈액으로 들어와요.");
    await sleep(1800);
    // 색이 다 바뀐 뒤에 말한다(혈액의 산소는 0.9초부터 3.7초 사이에 줄어든다)
    say("산소를 내준 혈액은 색이 <b>어두워졌어요</b>. 산소가 적은 혈액이에요.");
    mark("bed", false);
    await sleep(1200);

    // 3. 정맥 → 대정맥 → 심장
    phase("vein");
    move("mven", 0, 1, 1300);
    await sleep(1000);
    done("bed");
    frame("follow", 1400, { ex: "", legend: "blood", place: "대정맥", tags: ["lungs", "tissue", "ao", "vc"] });
    move("vc", 0, 0.8, 3200, 350);
    mark("vc", false);
    say("모세혈관이 모여 정맥이 되고, 정맥은 <b>대정맥</b>으로 모여요. 심장으로 들어가니 정맥이에요.");
    await sleep(3600);

    // 4. 대정맥은 어느 방으로? 틀리면 단추를 잠깐 걷고 대정맥을 끝까지 빛낸다
    phase("d2");
    frame("heart", 1000, { place: "심장 앞", tags: ["vc", "ao"] });
    await sleep(1050);
    say("대정맥은 심장의 어느 방으로 이어질까요? 대정맥이 닿는 방을 눌러요.");
    await decide(
      ROOMS,
      "ra",
      async () => {
        push({ hint: "vc", ht0: now() });
        say("빛나는 <b>대정맥</b>을 끝까지 따라가 봐요. 그림의 왼쪽이 몸의 오른쪽이에요.");
        await sleep(2300);
        push({ hint: "" });
      },
      { hide: true },
    );
    f.pips(2);
    move("vc", 0.8, 1, 700, 0, { hint: "", place: "우심방", tags: ["ra", "rv", "la", "lv", "vc", "ao"], loops: 1 });
    done("vc");
    mark("ra", false);
    say("맞아요, <b>우심방</b>이에요. 좌심실에서 여기까지가 <b>온몸순환</b>이에요.");
    await sleep(2000);

    // 5. 심장 수축: 우심방 → 우심실 → 폐동맥
    phase("pump2");
    say("이제 심장을 수축시켜 이 혈액을 내보내요.");
    await act({ key: "pump", text: "심장 수축", hot: true, at: [173, 370] }, "화면 속 '심장 수축' 버튼을 눌러 보세요");
    push({ beat: "atria", bt0: now(), bhold: 900 });
    move("rv", 0, 1, 800);
    mark("rv", false);
    say("심방이 수축해 혈액이 <b>우심실</b>로 내려갔어요.");
    await sleep(1300);
    push({ beat: "vent", bt0: now(), bhold: 2300 });
    move("pa", 0, 0.17, 650);
    say("우심실이 수축하면 심방과 심실 사이의 판막이 닫혀 <b>폐동맥</b>으로만 나가요.");
    await sleep(2300);
    frame("follow", 900, { place: "폐동맥", tags: ["lungs", "pa", "vc", "ao"] });
    move("pa", 0.17, 1, 2700);
    mark("pa", false);
    say("우심실이 수축하자 <b>폐동맥</b>을 따라 허파로 이동해요. 심장에서 나가는 동맥이지만 아직 <b>산소가 적은 혈액</b>이 흘러요.");
    await sleep(2800);
    done("pa");

    // 6. 허파꽈리 곁: 숨을 들이쉬면 기체 교환
    phase("lung");
    frame("lung", 1500, { legend: "gasLung", place: "허파꽈리 곁", tags: ["malv", "lcap"] });
    await sleep(650);
    move("lcap", 0, 0.2, 900);
    await sleep(1000);
    say("허파꽈리를 감싼 <b>모세혈관</b>이에요. 숨을 들이쉬어 허파꽈리에 공기를 넣어요.");
    await act({ key: "breath", text: "숨 들이쉬기", hot: true, at: [173, 378] }, "화면 속 '숨 들이쉬기' 버튼을 눌러 보세요");
    push({ ex: "breath", et0: now() });
    say("들이마신 공기가 허파꽈리로 들어왔어요. 허파꽈리에 <b>산소</b>가 많아요.");
    await sleep(BREATH_DUR);
    push({ ex: "lung", et0: now() });
    move("lcap", 0.2, 1, 3600, 300);
    o2(1, 2600, 900);
    f.pips(3);
    say("이산화 탄소는 허파꽈리로 나가고, 산소는 혈액으로 들어와요.");
    mark("lbed", true);
    await sleep(3600);
    // 색이 다 바뀐 뒤에 말한다(혈액의 산소는 0.9초부터 3.5초 사이에 늘어난다)
    say("산소를 받은 혈액이 <b>선홍색</b>이 됐어요. 산소가 많은 혈액이에요.");
    await sleep(1500);

    // 7. 폐정맥: 동맥일까, 정맥일까? 대동맥 활 아래에서 멈추고, 그동안 대동맥은 흐리게, 폐동맥 이름표는 걷는다
    phase("d4");
    done("lbed");
    frame("pv", 1400, { ex: "", legend: "blood", place: "허파에서 심장으로", tags: ["ao"], dim: ["ao"] });
    move("pv", 0, 0.72, 2200, 450);
    await sleep(2700);
    say("산소가 많은 혈액이 심장으로 들어가는 이 혈관은 동맥일까요, 정맥일까요?");
    await decide(
      [
        { key: "artery", text: "동맥", at: [118, 372] },
        { key: "vein", text: "정맥", at: [228, 372] },
      ],
      "vein",
      async () => {
        push({ hint: "pvdir", ht0: now() });
        say("혈액이 심장으로 <b>들어가고</b> 있어요. 산소가 많아도 들어가면 정맥이에요.");
        await sleep(1500);
      },
    );
    f.pips(4);
    push({ hint: "", dim: [], tags: ["pa", "ao", "pv"] });
    mark("pv", true);
    say("맞아요, <b>폐정맥</b>이에요. 산소가 많은 혈액이 흐르는 정맥이에요.");
    move("pv", 0.72, 1, 1100);
    await sleep(1300);

    // 8. 좌심방 → 좌심실
    phase("pump3");
    done("pv");
    frame("heart", 900, { place: "좌심방", tags: ["ra", "rv", "la", "lv", "pv", "pa", "vc", "ao"], loops: 2 });
    mark("la", true);
    say("<b>좌심방</b>에 들어왔어요. 우심실에서 여기까지가 <b>허파순환</b>이에요.");
    await sleep(1900);
    say("심장을 수축시켜 이 혈액을 좌심실로 보내요.");
    await act({ key: "pump", text: "심장 수축", hot: true, at: [173, 370] }, "화면 속 '심장 수축' 버튼을 눌러 보세요");
    push({ beat: "atria", bt0: now(), bhold: 900 });
    move("lv", 0, 1, 900, 0, { place: "좌심실" });
    say("혈액이 다시 출발점인 <b>좌심실</b>로 내려왔어요! 온몸순환과 허파순환이 하나로 이어져 온몸을 한 바퀴 순환했어요.");
    await sleep(1700);

    // 9. 한눈에 보기와 판정: 두 순환의 구역, 심장 안 이음매 두 곳의 화살
    phase("summary");
    frame("all", 1500, { place: "", links: true, tags: ["lungs", "tissue", "ra", "rv", "la", "lv", "ao", "vc", "pa", "pv", "bodyLoop", "lungLoop"] });
    say("두 순환이 <b>심장</b>에서 이어져 한 길이 돼요. 무대에 칠해진 길을 보고 답해요.");
    await sleep(1700);
    // 색 이름: 수정안의 '암적색'은 이 단원에서 쓰지 않는 이름이라 뺐다(이유 글), "색이 어두워져"로 바꿨다(결론. 무대 글 "어두워졌어요"와 같은 말)
    lab.judge(
      "<b>온몸순환</b>을 마치고 우심방으로 돌아온 혈액은 이어서 어디로 이동했나요?",
      [{ t: "우심실을 거쳐 허파로 이동했다", ok: true }, { t: "좌심방을 거쳐 다시 온몸으로 이동했다" }, { t: "대동맥을 거쳐 곧바로 온몸으로 이동했다" }],
      "온몸에 산소를 전달하고 우심방으로 돌아온 혈액은 <b>우심실 → 폐동맥 → 허파</b>로 이동해 다시 산소를 공급받아요.",
      () => {
        lab.finish("혈액은 <b>온몸의 모세혈관</b>에서 조직세포에 산소를 주고 색이 어두워져 우심방으로 돌아오고(온몸순환), 이어서 <b>허파의 모세혈관</b>에서 산소를 받아 선홍색이 되어 좌심방으로 돌아와요(허파순환). 이 두 순환이 끊임없이 이어지며 온몸에 산소와 영양소를 전달해요.");
        tm.later(() => f.slot.el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
      },
    );
    // 판정은 조작 칸에 뜬다. 폰에서는 무대가 길어 조작 칸이 화면 아래에 있으니 끌어올린다(누른 보기 바로 아래에 정답 카드가 뜬다)
    tm.later(() => f.slot.el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  };
  void run();
  return lab.cleanup;
};
