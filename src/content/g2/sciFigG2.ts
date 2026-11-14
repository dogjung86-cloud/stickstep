// 중2 과학 개념·정리 그림을 싣는 도우미. 그림은 코드로 그려 구운 webp다.
//   그리는 코드: qa/scifig-g2/figs/<단원>/<키>.mjs (검산 메모는 같은 자리의 <키>.md)
//   굽기: node qa/scifig-g2/build.mjs [키 …]  →  public/scifig/g2/<단원>/<키>.webp, 그리고 아래 표를 다시 쓴다.
// 내용 파일(unitN*.ts)이 부르는 파일이라 CSS를 불러오지 않는다(내용 파일만 묶어 돌리는 검사 스크립트가 깨진다). 인라인 스타일만 쓴다.
// lazy 로딩 금지: 스텝은 .scroll 안에서 그려져 lazy 이미지가 뜨지 않는다.
import type { Block } from "../../ui/blocks";

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/** 빌드가 다시 쓰는 표: 키 → [단원 폴더, 가로 px, 세로 px]. 손으로 고치지 않는다. */
const FIGS: Record<string, [string, number, number]> = {
  // <FIGS>
  g2u4l3f1: ["u4", 1020, 1116],
  g2u5l1f1: ["u5", 1020, 1212],
  g2u7l7f1: ["u7", 1020, 900],
  // </FIGS>
};

function img(key: string, alt: string): string {
  const [u, w, h] = FIGS[key] ?? [`u${key.charAt(3)}`, 340, 300];
  return `<img src="${BASE}scifig/g2/${u}/${key}.webp" alt="${alt}" width="${w}" height="${h}" style="display:block;width:100%;height:auto;border-radius:12px" />`;
}

/** 개념 스텝의 그림 블록. 관련 용어 카드 가까이에 한 줄로 넣는다. */
export const sciFig = (key: string, alt: string, cap?: string): Block => ({ k: "figure", svg: img(key, alt), cap });

/** 정리 카드의 자세히(more) 안에 넣는 그림. HTML 문자열이라 more 문자열 사이에 이어 붙인다. */
export const sciFigMore = (key: string, alt: string, cap?: string): string =>
  `<span style="display:block;margin:12px 0 10px">${img(key, alt)}${
    cap ? `<span style="display:block;margin-top:6px;font-size:12.5px;line-height:1.45;color:#8B95A1;text-align:center;word-break:keep-all">${cap}</span>` : ""
  }</span>`;
