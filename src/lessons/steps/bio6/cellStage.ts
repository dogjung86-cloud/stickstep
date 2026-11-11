// [중1 Ⅱ v5] u2l2 세포 구조 랩의 무대 약속.
// 랩의 진행(steps/bio6/cellWorkLab.ts)은 하나이고, 세포를 그리는 무대는 둘이다.
//   입체 무대(cellStage3d.ts): three.js로 그린 세포 모형. 쓸 수 있는 기기에서는 이것이 뜬다(2026-11-11 사용자 판정).
//   평면 무대(cellStageFlat.ts): SVG 도해. WebGL을 쓸 수 없는 기기에서 뜬다.
// 두 무대는 같은 상태(CellState)를 받아 같은 뜻으로 그린다. 글과 질문, 판정은 랩 쪽에만 있다.

import { BV } from "../../../ui/bio6Kit";
import type { BvTimers } from "./b6Lab";

export type CellKey = "mem" | "nuc" | "mito" | "chl" | "wall";
export const CELL_KEYS: CellKey[] = ["mem", "nuc", "mito", "chl", "wall"];

/** 무대가 그려야 하는 세포의 상태. */
export interface CellState {
  /** 멈춘 구조(없으면 null). 한 번에 하나만 멈춘다. */
  off: CellKey | null;
  /** 양분이 끊겨 에너지까지 꺼졌는가(세포막이나 엽록체가 멈추고 조금 뒤). */
  starve: boolean;
  /** 고장 난 곳 찾기 국면인가. 이때는 멈춘 구조를 회색으로 칠하지 않는다(증상만 보고 찾게). */
  diag: boolean;
  /** 구조의 이름표를 가리는가. 이름표가 곧 답이 되는 질문(식물세포에만 있는 구조 묻기)에서 켠다. */
  hideTags: boolean;
}

export interface CellStage {
  kind: "flat" | "3d";
  set: (st: CellState) => void;
  dispose: () => void;
}

export interface CellStageOpts {
  plant: boolean;
  tm: BvTimers;
  /** 그림 속 구조를 눌렀을 때 */
  onTap: (k: CellKey) => void;
  /** 입체 무대: 첫 장면을 그렸을 때 */
  onReady?: () => void;
  /** 입체 무대: 켜지 못했을 때(랩이 평면 무대로 바꾼다) */
  onFail?: () => void;
}

/** 에너지 표시(번개). 연한 세포 속에서도, 어두운 무대에서도 읽히게 파란 몸에 흰 테를 두른다. */
export const BOLT = "M1.4 -7.4L-4.4 1.2h3.6L-2 7.4 4.4 -1.8H0.7Z";

/** 무대 왼쪽 아래의 범례(양분, 에너지). 두 무대가 같은 것을 쓴다. */
export const CELL_LEGEND = `<i class="n"></i>양분<svg viewBox="-7 -9 14 18" width="11" height="14" aria-hidden="true"><path d="${BOLT}" fill="${BV.spark}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/></svg>에너지`;

/** 식물세포의 겉모양(346×230 설계 판의 좌표). 평면 무대는 이대로 그리고, 입체 무대는 가운데(179, 118)를 원점으로 옮겨 쓴다. */
export const P_HEX: [number, number][] = [[112, 36], [246, 36], [296, 118], [246, 200], [112, 200], [62, 118]];
/** 세포벽이 멈췄을 때 평면 무대가 옮겨 가는 모양(같은 꼭짓점 수. 벽과 세포가 함께 둥글어진다).
 *  입체 무대는 벽을 육각형 그대로 남기고 안의 세포만 타원으로 바꾼다(cellStage3d.ts의 SAG_A, SAG_B). */
export const P_SAG: [number, number][] = [[104, 74], [256, 66], [312, 134], [262, 204], [98, 206], [46, 140]];
export const P_C: [number, number] = [179, 118];
