// 중2 Ⅳ 물질의 구성: 도입, 랩, 개념, 정리, 문제 전면 재제작(v5, 2026-11-12). 주소에 ?g2u4v5 를 붙였을 때만 보인다.
// 정본(unit4.ts)에서 도입(hook), 랩, 개념, 정리(recap), 문제를 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 잠금, 만화(g2u4l4)는 정본 그대로 따라온다.
// 내용은 길어서 두 파일로 나눴다: unit4v5a.ts(레슨 1~3), unit4v5b.ts(레슨 4~6). 저작 도구는 unit4v5kit.ts. 설계는 design/g2u4v5-plan.md.
import type { Unit } from "../curriculum";
import { remakeUnit } from "../v5remake";
import { G2_UNIT4 } from "./unit4";
import { PLAN_A } from "./unit4v5a";
import { PLAN_B } from "./unit4v5b";

export const G2_UNIT4_V5: Unit | null = remakeUnit(G2_UNIT4, { ...PLAN_A, ...PLAN_B });
