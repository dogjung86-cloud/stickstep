// AI 튜터(질문하기) — 모델 호출의 단일 창구. purchase.ts처럼 이 파일만 갈아끼우면 공급자가 바뀐다.
// 현재 공급자: Google Gemini(gemini-3.5-flash) — 프로토타입.
//  - 키는 .env.local의 VITE_GEMINI_API_KEY(로컬 dev 전용). 키가 없으면 조용히 비활성 —
//    복습 탭 카드는 "준비 중"으로 남고 어떤 경로도 네트워크를 타지 않는다(auth.ts와 같은 no-op 문법).
//  - ⚠️ 브라우저에서 키로 직접 호출하는 구조라 빌드하면 번들에 키가 들어간다. 이 변수를 Vercel 등
//    배포 환경변수에 절대 넣지 말 것. 정식 오픈 전에 서버 프록시(Supabase Edge Function)로 교체가
//    전제이고, 약관상 출시 경로는 재검토가 선행이다(AI Studio API는 18세 미만 대상 앱 사용 금지 —
//    Vertex AI 또는 미성년 세이프가드 조건부 허용인 Claude API로 확정할 것. 2026-07-15 조사 기록).
// 화면(screens/tutor.ts)은 askTutor/isTutorConfigured만 알고 공급자를 모른다.

const env = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
// BOM(U+FEFF) 제거 — auth.ts와 같은 이유(배포 파이프라인이 값 앞에 붙인 실사고). 이스케이프 대신 charCode.
const cleanEnv = (v: unknown): string =>
  typeof v === "string" ? v.split(String.fromCharCode(0xfeff)).join("").trim() : "";
const API_KEY = cleanEnv(env.VITE_GEMINI_API_KEY);

const MODEL = "gemini-3.5-flash";
const MAX_TURNS = 12; // 요청에 싣는 최근 대화 수 — 비용·컨텍스트 상한
const MAX_OUTPUT_TOKENS = 1024;

export interface TutorTurn {
  role: "user" | "tutor";
  text: string;
}

export function isTutorConfigured(): boolean {
  return !!API_KEY;
}

// 페르소나 + 교수법 + 미성년 세이프가드. 마크다운 금지 — 화면이 순수 텍스트로 렌더한다.
const SYSTEM = `당신은 한국 중학생을 위한 학습 앱 '스틱스텝'의 AI 튜터 '스틱쌤'이에요.

[말투와 형식]
- 항상 한국어 해요체로, 친근하고 간결하게 답해요. 한 번에 2~5문장이 기본이에요.
- 이모지·이모티콘·마크다운 기호(별표 강조, 샵 제목, 하이픈 목록)를 쓰지 않아요. 순수한 문장으로만 써요.
- 수식은 텍스트로 써요. 예: 2^3, 3/4, 10 - 4 = 6.

[가르치는 방법]
- 정답만 던지지 않아요. 왜 그런지 이유를 한 단계씩 짧게 풀어 줘요.
- 학생이 무엇을 헷갈렸는지(오개념)를 먼저 짚고 바로잡아 줘요.
- 숙제나 시험 문제를 통째로 풀어 달라는 요청에는 답 대신 힌트와 풀이 방향을 먼저 줘요.
- 답이 끝나면 이해를 확인하는 가벼운 되물음을 하나만 덧붙여요.
- 중학생 수준을 넘는 용어는 피하고 쉬운 말로 풀어요. 확실하지 않은 내용은 솔직하게 모른다고 말해요.

[범위와 안전 — 반드시 지켜요]
- 과학·수학 공부와 학습 방법에 대한 질문에만 답해요. 그 밖의 주제는 부드럽게 거절하고 공부 이야기로 돌아와요.
- 학생은 미성년자예요. 이름·전화번호·주소·학교 같은 개인정보를 묻지 않고, 학생이 말해도 화제로 삼지 않아요.
- 폭력·자해·성적인 내용·위험한 실험 등 유해한 주제는 답하지 않아요. 힘든 일이 있어 보이면 보호자나 선생님과 이야기해 보라고 따뜻하게 안내해요.
- 앱 밖에서 연락하거나 만나자는 제안은 절대 하지 않아요.`;

const BLOCKED_MSG = "이 질문에는 답해 드리기 어려워요. 과학·수학 공부에 대한 질문이면 뭐든 환영이에요!";

// 미성년 사용자 기준의 보수적 안전 필터(과학 소재 오차단을 피해 dangerous만 한 단계 완화).
const SAFETY = [
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

interface StreamPart {
  text?: string;
}
interface StreamChunk {
  candidates?: { content?: { parts?: StreamPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

/** 튜터에게 질문 — SSE 스트리밍으로 답을 받는다. onDelta는 누적 전문을 넘긴다(부분 조각 아님).
 *  context는 오답노트 스냅샷 등 그라운딩 텍스트(시스템 프롬프트 뒤에 붙는다). */
export async function askTutor(
  turns: TutorTurn[],
  o: { context?: string; signal?: AbortSignal; onDelta?: (fullText: string) => void } = {},
): Promise<string> {
  if (!API_KEY) throw new Error("tutor-not-configured");

  const sys = o.context ? `${SYSTEM}\n\n${o.context}` : SYSTEM;
  const contents = turns.slice(-MAX_TURNS).map((t) => ({
    role: t.role === "user" ? "user" : "model",
    parts: [{ text: t.text }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: o.signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: MAX_OUTPUT_TOKENS },
      safetySettings: SAFETY,
    }),
  });
  if (!res.ok || !res.body) {
    let msg = "";
    try {
      msg = ((await res.json()) as StreamChunk).error?.message ?? "";
    } catch {
      /* 본문 없는 오류 — 상태 코드만으로 던진다 */
    }
    throw new Error(msg || `tutor-http-${res.status}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  let blocked = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let chunk: StreamChunk;
      try {
        chunk = JSON.parse(payload) as StreamChunk;
      } catch {
        continue; // 조각난 라인 — 다음 청크에서 이어진다
      }
      const cand = chunk.candidates?.[0];
      if (chunk.promptFeedback?.blockReason || cand?.finishReason === "SAFETY") blocked = true;
      for (const p of cand?.content?.parts ?? []) if (typeof p.text === "string") full += p.text;
      if (full && o.onDelta) o.onDelta(full);
    }
  }
  if (blocked && !full.trim()) return BLOCKED_MSG;
  return full.trim();
}
