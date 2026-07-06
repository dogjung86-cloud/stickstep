// 렌더러 공통 계약 — 렌더러는 MatterSim의 parts 배열만 읽는다(물리에 손대지 않음).

import type { MatterSim } from "../engine/matterSim";

export interface MatterRenderer {
  readonly kind: "meta" | "dot";
  /** 초기화 성공 여부(메타볼은 WebGL 실패 시 false → Dot 폴백). */
  readonly ok: boolean;
  readonly canvas: HTMLCanvasElement;
  /** CSS 크기 재측정 + 백버퍼 재설정. 레이아웃 확정 후·리사이즈 시에만 부른다. */
  resize(): void;
  draw(sim: MatterSim): void;
  /** 컨텍스트 정리(WebGL은 lose_context). 스텝 이탈 시 반드시 호출. */
  dispose(): void;
}
