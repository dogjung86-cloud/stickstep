// 스틱스텝 학교 검색: 나이스 교육정보 개방 포털 "학교기본정보"(open.neis.go.kr/hub/schoolInfo) 프록시.
// 앱의 "내 학교" 시트(core/school.ts)가 { q, kind }를 보내면 학교 목록을 최소 항목으로 줄여 돌려준다.
// - 나이스 인증키는 서버 시크릿 NEIS_API_KEY로만 둔다(번들·리포에 싣지 않는다). 시크릿이 없으면 키 없이
//   부르는데, 그때 나이스는 한 번에 5건까지만 준다(시험용. 운영은 키 등록 필수).
// - 돌려주는 항목은 표준학교코드·학교명·지역(시도 + 시군구)·학교급뿐이다. 주소 전체, 전화, 누리집은 버린다.
// - 로그인 없이도 부를 수 있다(게스트도 학교를 고른다). 그래서 verify_jwt=false로 배포하고,
//   검색어 검증과 IP별 호출 수 제한(느슨한 1차 방어)으로 남용을 막는다. DB는 건드리지 않는다.
// - 학교급 허용 목록은 app/src/core/school.ts의 SCHOOL_KINDS보다 넓게 둔다(앱에서 학교급을 넓힐 때 재배포 불필요).
const NEIS_URL = "https://open.neis.go.kr/hub/schoolInfo";
const KINDS = new Set(["초등학교", "중학교", "고등학교"]);
const Q_MIN = 2;
const Q_MAX = 20;
const PAGE = 30; // 한 번에 보여 줄 최대 학교 수

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const neisKey = (): string => (Deno.env.get("NEIS_API_KEY") ?? "").replace(/﻿/g, "").trim();

// IP별 호출 수 제한: 1분에 40번. 함수 인스턴스 메모리라 느슨하다(재시작하면 풀린다).
const HITS = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = HITS.get(ip);
  if (!h || now - h.t > 60_000) {
    HITS.set(ip, { n: 1, t: now });
    if (HITS.size > 5000) HITS.clear();
    return false;
  }
  h.n += 1;
  return h.n > 40;
}

interface NeisRow {
  SD_SCHUL_CODE?: string;
  SCHUL_NM?: string;
  SCHUL_KND_SC_NM?: string;
  LCTN_SC_NM?: string;
  ORG_RDNMA?: string;
}

/** 지역 = 시도 + 도로명주소의 둘째 마디(시군구). 주소 전체는 내보내지 않는다. */
function regionOf(r: NeisRow): string {
  const sido = (r.LCTN_SC_NM ?? "").trim();
  const parts = (r.ORG_RDNMA ?? "").trim().split(/\s+/);
  const gu = parts.length > 1 && /[시군구]$/.test(parts[1]) ? parts[1] : "";
  return gu ? `${sido} ${gu}` : sido;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  // 운영 점검용: 인증키가 등록됐는지만 알려 준다(키 값은 내보내지 않는다).
  if (req.method === "GET") return json(200, { ok: true, keyed: !!neisKey() });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return json(429, { error: "too_many", message: "잠시 후 다시 검색해 주세요." });

  let body: { q?: unknown; kind?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  const q = typeof body.q === "string" ? body.q.replace(/\s+/g, " ").trim().slice(0, Q_MAX) : "";
  const kind = typeof body.kind === "string" && KINDS.has(body.kind) ? body.kind : "중학교";
  // 한글·영문·숫자·공백만 받는다(학교 이름에 쓰이는 글자).
  if (q.length < Q_MIN || !/^[가-힣a-zA-Z0-9 ]+$/.test(q)) return json(400, { error: "bad_query" });

  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: String(PAGE),
    SCHUL_NM: q,
    SCHUL_KND_SC_NM: kind,
  });
  const key = neisKey();
  if (key) params.set("KEY", key);

  try {
    const res = await fetch(`${NEIS_URL}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return json(502, { error: "upstream" });
    const data = (await res.json()) as {
      schoolInfo?: [{ head?: [{ list_total_count?: number }, unknown] }, { row?: NeisRow[] }];
      RESULT?: { CODE?: string };
    };
    // 결과 없음은 schoolInfo 없이 RESULT.CODE "INFO-200"으로 온다. 그 밖의 코드는 나이스 쪽 오류다.
    if (!data.schoolInfo) {
      if (data.RESULT?.CODE === "INFO-200") return json(200, { items: [], total: 0 });
      return json(502, { error: "upstream", code: data.RESULT?.CODE ?? null });
    }
    const rows = data.schoolInfo[1]?.row ?? [];
    const total = data.schoolInfo[0]?.head?.[0]?.list_total_count ?? rows.length;
    const items = rows
      .filter((r) => r.SD_SCHUL_CODE && r.SCHUL_NM)
      .map((r) => ({
        code: String(r.SD_SCHUL_CODE),
        name: String(r.SCHUL_NM).trim(),
        region: regionOf(r),
        kind: (r.SCHUL_KND_SC_NM ?? kind).trim(),
      }));
    return json(200, { items, total });
  } catch {
    return json(502, { error: "upstream" });
  }
});
