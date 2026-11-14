// 닉네임 금칙어. 닉네임은 학교 랭킹에서 같은 학교 사람에게 보이므로(ui/schoolRank.ts) 저장할 때 한 번 거른다.
// 서버도 같은 목록으로 한 번 더 거른다(supabase/migrations/2026-11-14-school-rank.sql의 rank_name).
// 목록을 고치면 두 곳을 함께 고친다.

/** 닉네임을 정하지 않았거나 쓸 수 없는 닉네임일 때 랭킹에 보이는 이름(서버 rank_name과 같은 값). */
export const RANK_DEFAULT_NAME = "스텝 친구";

const BLOCKED =
  /(시발|씨발|씨bal|시bal|ㅅㅂ|ㅆㅂ|병신|ㅂㅅ|좆|존나|졸라|새끼|개새|지랄|ㅈㄹ|닥쳐|꺼져|미친놈|미친년|섹스|보지|자지|창녀|걸레|니애미|느금|엠창|fuck|shit|bitch|sex|porn|운영자|관리자|스틱스텝|stickstep|admin)/;

/** 쓸 수 없는 말이 들어 있는가(공백과 기호를 끼워 넣은 꼴도 잡는다). */
export function nickBlocked(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return BLOCKED.test(raw.toLowerCase().replace(/[\s._\-*~!@#^]+/g, ""));
}
