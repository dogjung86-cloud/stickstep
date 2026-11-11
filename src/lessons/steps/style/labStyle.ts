// 랩의 다른 느낌 샘플(2026-11-11): 병행 토글과 배선.
// 사용자 물음: "지금처럼 점선면 구성 말고, 다른 느낌으로 상호작용 랩을 구성해 볼 수 있나."
// 정본 랩(steps/bio6)은 건드리지 않는다. 토글이 켜져 있을 때만 같은 스텝 타입을 샘플 렌더러가 대신 그린다.
// 꺼져 있으면 정본 렌더러가 같은 인자로 그대로 불린다(지금과 글자 하나까지 같다).
//
//   켜기: 주소에 ?u2style 을 붙인다(값이 없으면 셋 모두. ?u2style=collage,sketch,model 로 골라 켤 수 있다).
//         한 번 켜면 같은 탭에서는 세션("ss.u2style")에 남는다. 끄기: ?u2style=0
//   견주어 보는 화면(public/qa-labstyle.html, 개발 서버 전용)은 창마다 window.__u2style 을 심어 지금 랩과 샘플을 나란히 띄운다.
//
//   collage  종이 콜라주  u2l8 kinLab       「박쥐는 누구와 더 가까울까?」
//   sketch   손그림 공책  u2l7 beakIslesLab 「두 섬의 새는 어떻게 달라질까?」
//   model    입체 모형    u2l2 cellWorkLab  「세포의 구조, 멈추면 어떻게 될까?」(동물세포)

import type { Step, StepRenderer } from "../../types";
import { kinCollage } from "./kinCollage";
import { beakIslesSketch } from "./beakIslesSketch";
import { cellWorkModel } from "./cellWorkModel";

export type LabStyleKey = "collage" | "sketch" | "model";

/** 지금 이 창에서 샘플이 켜져 있는가. 스텝을 그릴 때마다 묻는다(모듈을 읽을 때 굳히지 않는다). */
export function labStyleOn(key: LabStyleKey): boolean {
  try {
    let v = (window as unknown as { __u2style?: string }).__u2style;
    if (v === undefined) {
      const q = new URLSearchParams(location.search);
      if (q.has("u2style")) {
        v = q.get("u2style") || "1";
        if (v === "0") sessionStorage.removeItem("ss.u2style");
        else sessionStorage.setItem("ss.u2style", v);
      } else {
        v = sessionStorage.getItem("ss.u2style") ?? "0";
      }
    }
    if (!v || v === "0") return false;
    if (v === "1" || v === "all") return true;
    return v.split(",").includes(key);
  } catch {
    return false;
  }
}

/** 등록 표의 세 랩을 "토글이 켜져 있으면 샘플, 아니면 정본"으로 감싼다. registry.ts가 맨 끝에서 한 번 부른다. */
export function withLabStyle(R: Record<string, StepRenderer>): void {
  const wrap = (type: string, key: LabStyleKey, sample: StepRenderer, when?: (step: Step) => boolean): void => {
    const base = R[type];
    if (!base) return;
    R[type] = (host, step, api) => (labStyleOn(key) && (!when || when(step)) ? sample : base)(host, step, api);
  };
  wrap("kinLab", "collage", kinCollage);
  wrap("beakIslesLab", "sketch", beakIslesSketch);
  wrap("cellWorkLab", "model", cellWorkModel, (s) => (s as unknown as { mode?: string }).mode === "animal");
}

/** 견주어 보는 화면(public/qa-labstyle.html)이 부르는 문: Ⅱ단원 li번 레슨의 si번 스텝(랩) 하나만 든 레슨을 연다.
 *  style이 "0"이면 지금 랩, 아니면 샘플. 끝까지 하고 '다음'을 누르면 같은 랩이 처음부터 다시 열린다. 진행 기록은 남기지 않는다.
 *  개발 서버에서만 단다(견주어 보는 화면도 개발 서버 전용이다. public/qa-* 는 빌드에서 걷어 낸다).
 *  들여오기는 부를 때 한다(등록 표와 서로 물리지 않게). */
if (import.meta.env.DEV) {
  (window as unknown as { __u2styleOpen?: (li: number, si: number, style: string) => Promise<string> }).__u2styleOpen = async (li, si, style) => {
    (window as unknown as { __u2style?: string }).__u2style = style;
    const [{ nav }, { createLessonPlayer }, c] = await Promise.all([import("../../../core/router"), import("../../player"), import("../../../content/curriculum")]);
    const unit = c.CURRICULUM.find((u) => u.id === "u2");
    const lesson = unit?.lessons[li];
    if (!lesson || !lesson.steps[si]) return "";
    const open = (): void => {
      nav.reset(createLessonPlayer({ ...lesson, steps: [lesson.steps[si]] }, { onExit: open, onComplete: open }));
    };
    open();
    return lesson.steps[si].type;
  };
}
