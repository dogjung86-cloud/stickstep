// [중1 Ⅱ v5] u2l2 cellWorkLab: 「세포의 구조, 멈추면 어떻게 될까?」(동물) · 「식물세포의 두 구조, 멈추면?」(식물)
// 한 통찰: 세포의 구조마다 맡은 일이 있어서, 한 구조가 멈추면 그 일이 멈춘다(구조와 기능의 관계).
// 무대: 살아 움직이는 세포 하나. 결과가 옆의 목록이 아니라 세포 안에서 보인다.
//   동물: 양분 알갱이가 세포막을 지나 들어온다 → 마이토콘드리아가 에너지 불꽃을 낸다. 핵에서는 조절의 고리가 퍼진다.
//   식물: 햇빛을 받은 엽록체에서 양분이 나온다 → 마이토콘드리아가 에너지를 낸다. 세포벽이 육각형 모양을 잡고 있다.
// 조작: 조작 칸의 구조 카드(또는 그림 속 구조)를 누르면 그 구조만 멈춘다. 다시 누르면 일한다. 한 번에 하나만 멈춘다.
//   세포막이나 엽록체가 멈추면 양분이 끊기고, 조금 뒤 에너지도 꺼진다(양분이 있어야 에너지를 만든다).
// 다 해 보면 "고장 난 곳 찾아보기"(판정 두 번: 무대의 증상만 보고 멈춘 구조를 고른다. 이때는 멈춘 구조를 회색으로
// 칠하지 않는다. 첫 판정만 채점한다).
//
// 무대는 둘이고 진행은 이 파일 하나다(2026-11-11 사용자 판정: "입체 느낌이 좋다. 다만 손으로 돌려 가며 살펴보는 기능은
// 넣지 않는다. Ⅱ단원에서는 세포만 입체로 한다").
//   입체 무대(cellStage3d.ts): 쓸 수 있는 기기에서는 이것이 뜬다. 모양과 안팎이 곧 내용인 랩이라 입체가 값을 한다.
//   평면 무대(cellStageFlat.ts): WebGL을 쓸 수 없는 기기, 또는 입체를 켜다 실패했을 때.
// 검사와 견주어 보기: 세션에 "ss.cellflat" = "1"을 심으면 평면 무대로 뜬다. 지금 무대는 data-cwk-stage("3d" | "flat")로 읽는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV_PART } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "./b6Lab";
import type { CellKey, CellStage } from "./cellStage";
import { canModel, modelCellStage } from "./cellStage3d";
import { flatCellStage } from "./cellStageFlat";

interface CwkStep {
  title: string;
  mode: "animal" | "plant";
  cta?: string;
  curio?: Curio;
}

type Key = CellKey;

const NAME: Record<Key, string> = { mem: "세포막", nuc: "핵", mito: "마이토콘드리아", chl: "엽록체", wall: "세포벽" };
/** 해 본 뒤 카드에 남는 말: 그 구조가 맡은 일. */
const JOB: Record<Key, string> = { mem: "물질 출입 조절", nuc: "생명활동 조절", mito: "에너지 만들기", chl: "양분 만들기", wall: "모양 지키기" };
const SAY: Record<Key, string> = {
  mem: "세포막을 멈추니 <b>양분</b>이 들어오지 못해요. 양분이 없으니 에너지도 꺼져요.",
  nuc: "핵을 멈추니 생명활동이 <b>조절</b>되지 않아 움직임이 뒤죽박죽이에요.",
  mito: "마이토콘드리아를 멈추니 <b>에너지</b>를 만들지 못해 움직임이 멎었어요.",
  chl: "엽록체를 멈추니 햇빛이 비쳐도 <b>양분</b>이 생기지 않아요. 에너지도 꺼져요.",
  // 그림과 같은 말로 쓴다: 벽이 멈추면 세포가 각진 모양을 잃고 둥글어진다(처음 글 "축 처졌어요"는 그림과 어긋나게 읽혔다. 2026-11-11 눈검수)
  wall: "세포벽을 멈추니 세포가 각진 <b>모양</b>을 지키지 못하고 둥글어졌어요.",
};

export const cellWorkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CwkStep;
  const plant = s.mode === "plant";
  const keys: Key[] = plant ? ["chl", "wall"] : ["mem", "nuc", "mito"];
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: keys.length + 1, cls: "cwk-stage", qCls: "cwk-q", api });

  let off: Key | null = null;
  let phase: "play" | "diag" | "done" = "play";
  let starve = false; // 양분이 끊겨 에너지까지 꺼진 상태
  let starveId = 0;
  let hideTags = false; // 이름표가 곧 답이 되는 질문에서는 이름표를 가린다

  // ── 무대 ─────────────────────────────────────────────────────────
  let stage!: CellStage;
  /** 지금 상태를 무대에 알린다(검사 도구가 읽는 표식도 함께 고친다). */
  const push = (): void => {
    stage.set({ off, starve, diag: phase === "diag", hideTags });
    host.dataset.cwkOff = off ?? "";
    host.dataset.cwkPhase = phase;
    host.dataset.cwkStarve = starve ? "1" : "0";
  };
  const onTap = (k: Key): void => toggle(k);
  const useFlat = (): void => {
    f.stage.replaceChildren();
    stage = flatCellStage(f.stage, { plant, tm, onTap });
    host.dataset.cwkStage = "flat";
  };
  if (canModel()) {
    stage = modelCellStage(f.stage, {
      plant,
      tm,
      onTap,
      onReady: () => (host.dataset.cwkReady = "1"),
      // 입체를 켜지 못하면 그 자리에서 평면 도해로 바꾸고 지금 상태를 그대로 이어 그린다
      onFail: () => {
        stage.dispose();
        useFlat();
        push();
      },
    });
    host.dataset.cwkStage = "3d";
  } else useFlat();

  const cards = {} as Record<Key, BvCard>;
  keys.forEach((k) => {
    cards[k] = bvCard(`cwk-card${plant ? "" : " col"}`, { name: NAME[k], sub: "일하는 중", icon: BV_PART[k], key: k });
  });
  const diagBtn = bvBtn("main cwk-diag", "고장 난 곳 찾아보기");
  diagBtn.hidden = true;

  /** 한 구조만 멈춘다(null이면 모두 일한다). mark가 false면 카드 표시는 건드리지 않는다(판정 국면). */
  function setOff(k: Key | null, mark = true): void {
    off = k;
    tm.cancel(starveId);
    starve = false;
    // 양분이 끊기면(세포막, 엽록체) 조금 뒤 에너지도 꺼진다. 판정 국면에서는 증상이 곧바로 보이게 기다림을 줄인다
    if (k === "mem" || k === "chl") {
      starveId = tm.later(
        () => {
          starve = true;
          push();
        },
        phase === "diag" ? 250 : 1300,
      );
    }
    push();
    keys.forEach((x) => {
      const stopped = mark && x === k;
      cards[x].sub(stopped ? "멈춤" : cards[x].isDone() ? JOB[x] : "일하는 중");
      cards[x].el.classList.toggle("stopped", stopped);
      cards[x].el.setAttribute("aria-pressed", stopped ? "true" : "false");
    });
  }

  const allTried = (): boolean => keys.every((x) => cards[x].isDone());

  function toggle(k: Key): void {
    if (phase !== "play" || !keys.includes(k)) return;
    haptic(HAPTIC.tap);
    if (off === k) {
      setOff(null);
      f.say(allTried() ? "다시 모두 일해요. 이제 <b>고장 난 곳</b>을 찾아볼 차례예요." : "다시 일해요. 다른 구조도 <b>멈춰</b> 보세요.");
      return;
    }
    setOff(k);
    f.say(SAY[k]);
    if (!cards[k].isDone()) {
      cards[k].done();
      f.pips(keys.filter((x) => cards[x].isDone()).length);
      if (allTried()) {
        // 마지막 구조의 결과를 볼 시간을 준 뒤 버튼을 띄운다(누르는 것은 학생이다)
        tm.later(() => {
          diagBtn.hidden = false;
          api.setCTA("'고장 난 곳 찾아보기'를 눌러요", { enabled: false });
        }, 1500);
      }
    }
  }

  keys.forEach((k) => cards[k].el.addEventListener("click", () => toggle(k)));

  // ── 고장 난 곳 찾기(판정) ─────────────────────────────────────────
  diagBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "diag";
    if (plant) askPlant1();
    else askAnimal1();
  });

  const namesOf = (ok: Key, others: Key[]): { t: string; ok?: boolean }[] => [{ t: NAME[ok], ok: true }, ...others.map((k) => ({ t: NAME[k] }))];

  function askAnimal1(): void {
    setOff("mito", false);
    f.say("어딘가 고장 난 세포예요. 세포를 잘 살펴보고 <b>멈춘 구조</b>를 골라요.");
    f.slot.ask("양분은 들어오는데 에너지가 생기지 않아요. 멈춘 구조는?", namesOf("mito", ["mem", "nuc"]), (ok) => api.recordQuiz(ok), {
      why: "양분으로 에너지를 만드는 곳은 <b>마이토콘드리아</b>예요.",
      onNext: askAnimal2,
    });
  }
  function askAnimal2(): void {
    setOff("mem", false);
    f.say("이번에는 다른 곳이 고장 났어요. 양분 알갱이를 눈으로 따라가 봐요.");
    f.slot.ask("양분이 세포 안으로 들어오지 못해요. 멈춘 구조는?", namesOf("mem", ["nuc", "mito"]), () => undefined, {
      why: "물질이 드나드는 것을 조절하는 곳은 <b>세포막</b>이에요.",
      onNext: finish,
    });
  }
  function askPlant1(): void {
    setOff("chl", false);
    f.say("어딘가 고장 난 세포예요. 세포를 잘 살펴보고 <b>멈춘 구조</b>를 골라요.");
    f.slot.ask("햇빛은 비치는데 양분이 생기지 않아요. 멈춘 구조는?", namesOf("chl", ["wall", "mito"]), (ok) => api.recordQuiz(ok), {
      why: "빛을 받아 양분을 만드는 곳은 <b>엽록체</b>예요.",
      onNext: askPlant2,
    });
  }
  function askPlant2(): void {
    hideTags = true; // 그림의 이름표 둘("엽록체", "세포벽")이 그대로 답이라 가린다(2026-11-11 눈검수)
    setOff(null, false);
    f.say("다시 모두 일해요. 마지막으로 앞에서 본 동물세포와 견주어 봐요.");
    f.slot.ask(
      "식물세포에는 있고 동물세포에는 없는 구조는?",
      [{ t: "엽록체와 세포벽", ok: true }, { t: "엽록체와 핵" }, { t: "세포벽과 세포막" }],
      () => undefined,
      { why: "핵과 세포막은 <b>두 세포 모두</b>에 있어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    hideTags = false;
    setOff(null, false);
    f.pips(keys.length + 1);
    f.say(plant ? "식물세포의 두 구조를 다 살펴봤어요. 아래에서 알게 된 것을 읽어 봐요." : "고장 난 곳을 다 찾았어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude(
      plant
        ? "식물세포는 <b>엽록체</b>로 양분을 만들고, <b>세포벽</b>으로 모양을 지켜요. 동물세포에는 이 둘이 없어요."
        : "세포의 구조마다 <b>맡은 일</b>이 있어요. 한 구조가 멈추면 그 일도 멈춰요.",
    );
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(keys.length, ...keys.map((k) => cards[k])), diagBtn);
  push();
  f.say(plant ? "햇빛을 받는 식물세포예요. 새로 배운 두 구조를 하나씩 <b>멈춰</b> 보세요." : "살아 움직이는 동물세포예요. 아래에서 구조를 하나 골라 <b>멈춰</b> 보세요.");
  api.setCTA(plant ? "두 구조를 하나씩 멈춰 보세요" : "세 구조를 하나씩 멈춰 보세요", { enabled: false });
  return () => {
    tm.clear();
    stage.dispose();
  };
};
