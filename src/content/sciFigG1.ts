// 중1 과학 도해: 개념 스텝과 정리 카드(자세히)에 싣는, 실제 과학 내용을 담은 디테일한 그림.
// 그림은 코드로 그려 굽는다(qa/scifig-g1, `node qa/scifig-g1/build.mjs`) → public/scifig/g1/<단원>/<키>.webp.
// 생성물(webp)은 손으로 고치지 않는다. 글(대체 글, 캡션)의 정본은 이 표다.
// 콘텐츠 파일이 부르는 파일이라 CSS를 불러오지 않고 인라인 스타일만 쓴다(dsl.ts 머리말: 내용 파일만 묶어 돌리는 검사가 깨진다).
// lazy 로딩 금지(.scroll 안에서 이미지가 뜨지 않는다, CLAUDE.md 아트 파이프라인).
import type { Block } from "../ui/blocks";

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

interface SciFig {
  /** 설계 크기(px). 이미지는 이 비율로 자리를 먼저 잡는다(로드 전 화면 밀림 방지). */
  w: number;
  h: number;
  alt: string;
  cap: string;
}

/** 키 = u<단원>l<레슨>f<번호>(qa/scifig-g1/figs/<키>.mjs 와 같다). */
const FIGS: Record<string, SciFig> = {
  u2l5f1: {
    w: 340, h: 186,
    alt: "잎 한 조각을 네모나게 잘라 비스듬히 본 입체 그림. 위아래 표피 조직은 납작하고 투명한 세포 한 겹이고, 그 사이에 길쭉한 울타리 조직 세포가 촘촘히, 그 아래 둥근 해면 조직 세포가 틈을 두고 있다. 왼쪽에 울타리 조직과 해면 조직을 묶은 기본 조직계, 위아래 표피 조직을 가리키는 표피 조직계 이름표가 있다.",
    cap: "잎 한 조각을 잘라 보면, 여러 조직이 모여 조직계를 이뤄요",
  },
  u4l4f1: {
    w: 340, h: 346,
    alt: "한 물질의 고체, 액체, 기체를 동그란 창 셋으로 나타낸 입자 그림. 세 창 모두 입자가 19개다. 고체는 작은 창에 입자가 가지런히 붙어 있고, 액체는 조금 큰 창에 가깝지만 불규칙하게, 기체는 아주 큰 창에 멀리 흩어져 움직인다. 창 사이에 융해, 응고, 기화, 액화, 승화 화살표가 있다.",
    cap: "입자 수는 그대로, 입자 사이의 거리와 배열이 달라져 부피가 바뀌어요",
  },
  u7l5f1: {
    w: 340, h: 372,
    alt: "북극 위에서 내려다본 지구 둘레로 달이 시계 반대 방향으로 돈다. 햇빛은 오른쪽에서 온다. 길 위 여덟 자리의 달은 모두 오른쪽 절반이 밝고, 바깥에는 자리마다 지구에서 본 모양이 있다. 오른쪽은 삭, 오른쪽 위는 초승달, 위는 상현달, 왼쪽은 망(보름달), 아래는 하현달, 오른쪽 아래는 그믐달이다.",
    cap: "달의 자리에 따라 지구에서 보이는 모양이 달라져요",
  },
};

const fig = (key: string): SciFig => {
  const f = FIGS[key];
  if (!f) throw new Error(`sciFigG1: 없는 그림 ${key}`);
  return f;
};

const unitOf = (key: string): string => key.replace(/l\d+f\d+$/, "");

/** 그림 <img> 한 장. */
export function sciFigImg(key: string): string {
  const f = fig(key);
  return `<img src="${BASE}scifig/g1/${unitOf(key)}/${key}.webp" alt="${f.alt}" width="${f.w}" height="${f.h}" decoding="async" style="display:block;width:100%;height:auto"/>`;
}

/** 개념 스텝에 넣는 그림 블록(관련 용어 카드 곁에 한 줄로 넣는다). */
export function sciFig(key: string): Block {
  return { k: "figure", svg: sciFigImg(key), cap: fig(key).cap };
}

/** 정리 카드의 자세히(more) 안에 넣는 그림과 캡션(HTML 문자열). */
export function sciFigMore(key: string): string {
  const f = fig(key);
  return `<span style="display:block;margin:10px 0 6px">${sciFigImg(key)}<span style="display:block;margin-top:6px;font-size:12.5px;line-height:1.45;color:var(--ter);text-align:center;word-break:keep-all">${f.cap}</span></span>`;
}
