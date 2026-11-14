// 개념 영상: 영상 한 편과 그 영상이 맡는 레슨(발자국) 묶음의 짝.
//
// 영상은 레슨과 일대일이 아니다. 한 편이 이어진 레슨 하나에서 셋까지를 아우른다(중1 일곱 단원: 28편이 레슨 44개를
// 빠짐없이 덮는다). 짝의 출처는 output/video-scripts/uN/uN-plan.md의 "아우르는 스텝" 열이다.
//
// 보이는 조건: 영상이 있는 곳(src, 예: { kind: "vimeo", id: "123456789" })이 적힌 영상만 지도와 레슨에 나타난다. 주소가 하나도 없는 지금은 아무것도
// 나타나지 않는다(지도는 예전 그대로). 검수할 때는 주소 끝에 ?vid=1을 붙이면(또는 sessionStorage "ss.vid"="1")
// 주소가 없는 영상도 자리 표시 재생 화면과 함께 전부 보인다.

import { findLesson, isPremiumLocked } from "./curriculum";

/**
 * 영상이 있는 곳. 영상 파일은 앱에 싣지 않는다(2026-11-14 사용자 지시: Vimeo 같은 곳에 올려 임베드한다).
 *  - vimeo: Vimeo 영상 번호(id)와, 일부 공개 영상이면 주소의 h 값. 재생 화면이 Vimeo 플레이어를 iframe으로 싣는다.
 *  - file: 영상 파일 주소를 그대로 튼다(다른 호스팅의 mp4 주소용, 검수용).
 */
export type VideoSource = { kind: "vimeo"; id: string; h?: string } | { kind: "file"; url: string; captions?: string };

export interface VideoEpisode {
  id: string; // "u3v1"
  unitId: string;
  no: number; // 단원 안에서 몇째 영상인지(1부터)
  title: string;
  label?: string; // 지도 이름표에 쓸 짧은 이름(없으면 title)
  lessons: string[]; // 이 영상이 맡는 레슨 id(이어진 순서). 첫 레슨의 발자국 앞에 영상 칸이 선다
  seconds: number; // 길이(초). 영상이 나오기 전에는 원고 어림값
  src?: VideoSource;
}

const ep = (unitId: string, no: number, title: string, lessonNos: number[], seconds: number, label?: string): VideoEpisode => ({
  id: `${unitId}v${no}`,
  unitId,
  no,
  title,
  label,
  lessons: lessonNos.map((n) => `${unitId}l${n}`),
  seconds,
});

export const VIDEO_EPISODES: VideoEpisode[] = [
  // Ⅰ. 과학과 인류의 지속가능한 삶
  ep("u1", 1, "과학적 탐구 방법", [1, 2], 200),
  ep("u1", 2, "과학의 발전과 지속가능한 삶", [3, 4, 5], 202, "과학의 발전"),
  // Ⅱ. 생물의 구성과 다양성
  ep("u2", 1, "세포", [1, 2, 3], 201),
  ep("u2", 2, "다양한 세포와 생물의 구성 단계", [4, 5], 186, "세포와 구성 단계"),
  ep("u2", 3, "생물다양성과 변이", [6, 7], 178),
  ep("u2", 4, "생물의 분류", [8, 9], 194),
  ep("u2", 5, "생물다양성 보전", [10], 185),
  // Ⅲ. 열
  ep("u3", 1, "온도와 열평형", [1, 2], 174),
  ep("u3", 2, "열의 이동", [3], 173),
  ep("u3", 3, "비열", [4], 151),
  ep("u3", 4, "열팽창", [5], 165),
  // Ⅳ. 물질의 상태 변화
  ep("u4", 1, "입자의 운동과 물질의 상태", [1, 2], 192, "입자 운동과 상태"),
  ep("u4", 2, "물질의 상태 변화", [3], 173),
  ep("u4", 3, "상태 변화와 입자 배열", [4], 170, "상태 변화와 입자"),
  ep("u4", 4, "열에너지를 흡수하는 상태 변화", [5], 164, "열에너지 흡수"),
  ep("u4", 5, "열에너지를 방출하는 상태 변화", [6], 179, "열에너지 방출"),
  // Ⅴ. 힘의 작용
  ep("u5", 1, "힘의 표현과 평형", [1, 2], 191),
  ep("u5", 2, "중력과 탄성력", [3, 4], 204),
  ep("u5", 3, "마찰력과 부력", [5, 6], 203),
  ep("u5", 4, "힘과 물체의 운동", [7], 159),
  // Ⅵ. 기체의 성질
  ep("u6", 1, "기체의 압력", [1], 189),
  ep("u6", 2, "보일 법칙", [2, 3], 203),
  ep("u6", 3, "샤를 법칙", [4, 5], 178),
  // Ⅶ. 태양계
  ep("u7", 1, "태양계 구성 천체와 행성 분류", [1, 2], 166, "태양계와 행성"),
  ep("u7", 2, "태양의 활동", [3], 170),
  ep("u7", 3, "지구의 자전과 공전", [4], 154),
  ep("u7", 4, "달의 위상 변화", [5], 143),
  ep("u7", 5, "일식과 월식", [6], 158),
];

/** 검수용 미리 보기(주소가 없는 영상도 자리 표시와 함께 보인다). ?vid=1 로 켜고 ?vid=0 으로 끈다. */
export function videoPreviewOn(): boolean {
  try {
    const q = new URLSearchParams(location.search).get("vid");
    if (q === "1") sessionStorage.setItem("ss.vid", "1");
    else if (q === "0") sessionStorage.removeItem("ss.vid");
    return sessionStorage.getItem("ss.vid") === "1";
  } catch {
    return false;
  }
}

/** 지도와 레슨에 나타나는 영상인가(파일 주소가 있거나 미리 보기가 켜져 있다). */
export function isVideoVisible(e: VideoEpisode): boolean {
  return !!e.src || videoPreviewOn();
}

/** 그 단원에서 지금 보이는 영상들(영상 순서). */
export function visibleEpisodesOf(unitId: string): VideoEpisode[] {
  return VIDEO_EPISODES.filter((e) => e.unitId === unitId && isVideoVisible(e));
}

export function findEpisode(id: string): VideoEpisode | null {
  return VIDEO_EPISODES.find((e) => e.id === id) ?? null;
}

/** 그 레슨을 맡는 영상(보이는 것만). 한 묶음의 레슨은 모두 같은 영상을 돌려받는다. */
export function episodeOfLesson(lessonId: string): VideoEpisode | null {
  const e = VIDEO_EPISODES.find((x) => x.lessons.includes(lessonId));
  return e && isVideoVisible(e) ? e : null;
}

/**
 * 유료 잠금: 영상이 맡는 첫 레슨이 구매 전의 유료 레슨이면 영상도 잠긴다(2026-11-14 사용자 결정 "유료는 잠그자").
 * 레슨의 순차 잠금(앞 레슨을 마쳐야 열림)과는 무관하다. 영상은 앞 레슨을 마치지 않아도 볼 수 있다.
 */
export function isVideoLocked(e: VideoEpisode): boolean {
  const first = findLesson(e.lessons[0]);
  return !!first && isPremiumLocked(first.lesson);
}

/** "3분", "4분"처럼 반올림한 길이. */
export function videoMinutes(e: VideoEpisode): string {
  return `${Math.max(1, Math.round(e.seconds / 60))}분`;
}
