// 중1 Ⅳ 물질의 상태 변화: 도입, 랩, 개념, 정리, 문제 재제작(v5, 2026-11-12). 주소에 ?u4v5 를 붙였을 때만 보인다.
// 정본(unit4.ts)에서 도입(hook), 랩, 정리(recap), 문제를 바꿔 끼우고 개념 스텝을 새로 넣는다.
// 레슨의 id와 수, 제목, 쪽수, 잠금, 만화는 정본 그대로 따라온다. 설계와 책의 실험 대응표는 design/u4v5-plan.md.
// 개념 스텝에는 아직 컷이 없다(코드 그림 세션이 output/g1-v5/u4/concept-cuts.md 를 보고 그린 뒤 싣는다).
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import type { Curio } from "../ui/curio";
import { concept, mcq, multi, opener, recap } from "./dsl";
import { miniArt } from "../ui/matterFigures";
import { UNIT4 } from "./unit4";
import { remakeUnit } from "./v5remake";

// ── 새 랩 스텝의 팩토리(dsl.ts를 고치지 않고 이 파일 안에 둔다) ──
interface LabProps {
  title: string;
  cta?: string;
  curio?: Curio;
}
const lab = (type: string) => (o: LabProps & Record<string, unknown>): Step => ({ type, ...o }) as unknown as Step;
const inkLab = lab("u4InkLab");
const evapLab = lab("u4EvapLab");
const moveLab = lab("u4MoveLab");
const buildLab = lab("u4BuildLab");
const namesLab = lab("u4NamesLab");
const watchLab = lab("u4WatchLab");
const dryIceLab = lab("u4DryIceLab");
const oliveLab = lab("u4OliveLab");
const balloonLab = lab("u4BalloonLab");
const heatLab = lab("u4HeatLab");
const curioOf = (old: Step): Curio | undefined => (old as unknown as { curio?: Curio }).curio;
const warn = (msg: string): void => {
  if (import.meta.env.DEV) console.warn(`[v5] u4: ${msg}`);
};

/** 정리 뒤의 문제 구간을 새 배열로 바꾼다. keep(글 조각)으로 정본의 문항을 그대로 가져올 수 있다(그 문항의 글에 든 조각으로 찾는다). */
function problems(steps: Step[], make: (keep: (needle: string) => Step) => Step[]): Step[] {
  let at = -1;
  steps.forEach((st, i) => {
    if (st.type === "recap") at = i;
  });
  if (at < 0) {
    warn("정리 스텝을 찾지 못해 문제를 바꾸지 않았다");
    return steps;
  }
  const old = steps.slice(at + 1);
  const keep = (needle: string): Step => {
    const hit = old.find((st) => JSON.stringify(st).includes(needle));
    if (!hit) warn(`남길 문항을 찾지 못했다: ${needle}`);
    return hit ?? old[0];
  };
  const next = make(keep);
  // 선택형, OX, 복수 선택에 "몇 번째 / 모두 몇 개" 번호를 다시 매긴다
  const of = next.filter((st) => st.type === "quiz").length;
  let n = 0;
  return [...steps.slice(0, at + 1), ...next.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st))];
}

/** 남긴 정본 문항에서 옛 랩을 가리키는 말만 새 랩에 맞춘다(글 조각을 찾아 바꾼 새 스텝을 돌려준다). */
function reword(st: Step, pairs: [string, string][]): Step {
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return pairs.reduce((out, [a, b]) => out.split(a).join(b), v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  const text = JSON.stringify(st);
  for (const [a] of pairs) if (!text.includes(a)) warn(`맞출 문장을 찾지 못했다: ${a}`);
  return walk(st) as Step;
}

type Block = NonNullable<Parameters<typeof concept>[0]["blocks"]>[number];
const term = (name: string, def: string): Block => ({ k: "term", name, def }) as Block;
const note = (html: string, tone: "blue" | "amber" | "violet" = "amber"): Block => ({ k: "note", tone, html }) as Block;
const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "matter", ...o });

export const UNIT4_V5: Unit | null = remakeUnit(UNIT4, {
  // ══ 1. 입자의 운동: 뚜껑을 열면(도입) → 잉크와 식초의 확산 → 저울 위 소독제의 증발 → 용어 → 정리 → 문제 ══
  u4l1: {
    intro: opener({ title: "냄새는 어떻게 퍼질까요?", scene: "u4-lid", wait: "먼저 뚜껑을 열어 보세요", cta: "실험실 열기" }),
    swap: {
      diffusion: inkLab({ title: "젓지 않아도 잉크가 퍼질까요?", cta: "다음 실험, 증발" }),
      evaporation: [
        evapLab({ title: "저울의 숫자는 어떻게 될까요?", cta: "이름 붙이기" }),
        words({
          title: "확산과 증발,<br>입자가 스스로 움직여요",
          lead: "잉크는 젓지 않아도 퍼졌고, 소독제는 가만히 두어도 줄었어요. 두 현상에 이름을 붙여요.",
          blocks: [
            term("확산", "물질을 이루는 입자가 <b>스스로 움직여 멀리 퍼져 나가는</b> 현상이에요. 물속의 잉크가 그랬고, 접시의 식초도 가운데에서 사방으로 퍼져 바깥쪽 방울까지 닿았어요."),
            term("증발", "액체 <b>표면</b>의 입자가 스스로 움직여 <b>기체로 변하는</b> 현상이에요. 넓게 펴 바른 소독제가 더 많이 줄어든 것도 표면이 넓어서였어요."),
            note("저어 주거나 바람이 불어야만 퍼지는 것이 아니에요. 끓여야만 기체가 되는 것도 아니고요. 두 현상 모두 입자가 <b>스스로 끊임없이 움직이기</b> 때문에 일어나요."),
          ],
          cta: "정리하기",
        }),
      ],
      recap: recap({
        title: "입자의 운동,<br>카드 두 장으로 정리",
        narrator: "잉크도 소독제도 아무도 건드리지 않았어요. <b>스스로 움직이는 입자</b>가 한 일을 카드 두 장으로 정리해요.",
        cards: [
          {
            name: "확산",
            color: "#5AA2F8",
            art: miniArt("diffuse"),
            text: "입자가 <b>스스로 움직여 멀리 퍼져 나가는</b> 현상. 젓지 않아도, 바람이 없어도 일어나요.",
            examples: ["물속의 잉크", "빵집 냄새", "우러나는 홍차"],
            more: "<b class='rm-h'>왜 그럴까요?</b>물질을 이루는 입자는 눈에 보이지 않을 만큼 작지만 한순간도 멈추지 않고 스스로 움직여요. 잉크 입자는 물 입자 사이를 이리저리 움직이다가 비커 전체로 고르게 퍼졌어요. 접시에서는 식초 입자가 가운데에서 사방으로 퍼져 나가 <b>가까운 방울부터</b> 차례로 닿았죠.<b class='rm-h'>예를 들면</b>빵집 앞을 지날 때 나는 빵 냄새, 마약 탐지견이 가방 속 물건을 찾아내는 것, 찻잔 속에서 홍차가 물 전체로 우러나는 것이 모두 확산이에요.<b class='rm-h'>헷갈리지 마세요</b>실험에서 물을 젓지 않은 까닭이 있어요. 저으면 금방 섞이지만 <b>저어서 섞인 것인지 입자가 스스로 퍼진 것인지</b> 가릴 수 없거든요. 확산은 냄새처럼 공기 속에서만 일어나는 것도 아니에요. 잉크처럼 물속에서도 일어나요.<span class='fun'><b>알고 있나요?</b> 방 한쪽에서 뿌린 향수 냄새가 반대쪽까지 오는 데는 시간이 걸려요. 향수 입자가 공기 입자와 수없이 부딪치며 조금씩 나아가기 때문이에요.</span>",
          },
          {
            name: "증발",
            color: "#35C7DB",
            art: miniArt("evap"),
            text: "액체 <b>표면</b>의 입자가 스스로 움직여 <b>기체로 변하는</b> 현상. 끓이지 않아도 일어나요.",
            examples: ["마르는 빨래", "염전의 소금", "손 소독제"],
            more: "<b class='rm-h'>왜 그럴까요?</b>액체의 입자도 쉬지 않고 움직여요. 그 가운데 <b>표면</b>에 있는 입자는 공기 쪽으로 튀어 나가 기체가 될 수 있어요. 저울 위의 소독제가 줄어든 것은 표면의 입자가 하나둘 공기 중으로 날아갔기 때문이에요.<b class='rm-h'>표면이 넓을수록</b>같은 0.50 g인데 넓게 펴 바른 쪽이 한 덩이로 올린 쪽보다 훨씬 많이 줄었죠. 공기와 닿는 표면이 넓으면 날아갈 수 있는 입자가 많아요. 젖은 빨래를 펴서 널고, 염전에서 바닷물을 얕고 넓게 가두는 까닭이에요.<b class='rm-h'>헷갈리지 마세요</b>증발은 물을 끓일 때만 일어나는 일이 아니에요. 책상에 둔 물컵의 물도, 젖은 우산의 물기도 가열하지 않았는데 조금씩 줄어들어요.<span class='fun'><b>알고 있나요?</b> 젖은 머리카락은 드라이어 바람으로 빨리 말라요. 따뜻하면 입자가 더 활발하게 움직이고, 바람이 표면에서 막 날아오른 입자를 치워 주거든요.</span>",
          },
        ],
        note: { icon: "bulb", tone: "blue", title: "둘의 공통점", html: "확산도 증발도 누가 밀어 주어서 일어나는 일이 아니에요. 물질을 이루는 입자가 <b>스스로 끊임없이 움직이기</b> 때문이에요." },
        cta: "문제 풀기",
      }),
    },
    after: (steps) =>
      problems(steps, (keep) => [
        keep("확산일까,<br>증발일까?"),
        mcq({
          prompt: "물에 잉크를 넣고 확산을 관찰할 때 <b>물을 젓지 않는</b> 까닭은?",
          options: ["저어서 섞인 것과 구별하려고", "저으면 잉크의 색이 옅어져서", "저으면 물의 양이 줄어들어서", "저으면 잉크가 가라앉아서", "젓지 않아야 더 빨리 퍼져서"],
          answer: 0,
          explainGood: "맞아요. 저으면 금방 섞이지만 그것이 <b>저어서</b>인지 <b>입자가 스스로 움직여서</b>인지 가릴 수 없어요. 젓지 않았는데도 퍼져야 입자가 스스로 움직인다고 말할 수 있죠.",
          explainBad: "젓는다고 색이나 양이 달라지지는 않고, 젓지 않으면 오히려 더 천천히 퍼져요. 젓지 않는 까닭은 <b>저어서 섞인 것과 구별하려는</b> 거예요. 젓지 않았는데도 퍼져야 입자가 스스로 움직인다고 말할 수 있어요.",
        }),
        mcq({
          prompt: "똑같이 젖은 수건 두 장이 있어요. 한 장은 <b>넓게 펴서</b> 널고, 한 장은 <b>뭉쳐서</b> 두었어요. 더 빨리 마르는 쪽과 그 까닭은?",
          options: ["펴서 넌 수건, 공기와 닿는 표면이 넓어서", "펴서 넌 수건, 머금은 물이 더 적어서", "뭉친 수건, 물 입자가 가까이 모여 있어서", "뭉친 수건, 속이 더 따뜻해서", "똑같이 마른다, 물의 양이 같아서"],
          answer: 0,
          explainGood: "정확해요. 증발은 액체의 <b>표면</b>에서 일어나요. 펴서 널면 공기와 닿는 표면이 넓어져 물 입자가 더 많이 날아가요. 소독제를 넓게 펴 발랐을 때와 같아요.",
          explainBad: "두 수건이 머금은 물의 양은 같아요. 다른 것은 <b>공기와 닿는 표면의 넓이</b>예요. 증발은 표면에서 일어나므로 넓게 펴서 넌 수건이 더 빨리 말라요. 소독제를 넓게 펴 발랐을 때 더 많이 줄어든 것과 같아요.",
        }),
        keep("스스로 끊임없이 운동한다</b>는 증거"),
      ]),
  },
  // ══ 2. 물질의 상태: 쏟아진 얼음과 주스(도입) → 옮겨 담고 기록하기 → 입자 모형 만들기 → 용어 → 정리 → 문제 ══
  u4l2: {
    intro: opener({ title: "얼음은 줍는데 주스는요?", scene: "u4-spill", wait: "먼저 얼음과 주스를 주워 보세요", cta: "실험실 열기" }),
    swap: {
      matterTemp: moveLab({ title: "옮겨 담으면 무엇이 달라질까요?", cta: "다음, 입자 모형 만들기" }),
      matterShape: [
        buildLab({ title: "입자 모형을 만들어 볼까요?", cta: "이름 붙이기" }),
        words({
          title: "고체, 액체, 기체,<br>세 가지 상태",
          lead: "옮겨 담을 때 달랐던 성질과 직접 만든 입자 모형을 하나로 이어요.",
          blocks: [
            term("고체", "<b>모양과 부피가 일정한</b> 상태예요. 입자들이 매우 가까이에서 <b>규칙적으로</b> 늘어서 제자리에서만 움직여요. 얼음, 돌, 나무가 고체예요."),
            term("액체", "담는 그릇에 따라 <b>모양은 달라지지만 부피는 일정한</b> 상태예요. 입자들이 고체보다 불규칙하게 놓여 비교적 자유롭게 움직이므로 흐를 수 있어요."),
            term("기체", "담는 그릇에 따라 <b>모양과 부피가 모두 달라지는</b> 상태예요. 입자들이 서로 매우 멀리 떨어져 자유롭게 움직이며 그릇 안에 고르게 퍼져요."),
            note("고체의 입자도 멈춰 있지 않아요. 입자 모형에서 본 것처럼 <b>제자리에서 계속 떨고</b> 있어요. 자리를 옮기지 못할 뿐이에요."),
          ],
          cta: "정리하기",
        }),
      ],
      matterCompare: null,
      recap: recap({
        title: "세 가지 상태,<br>카드 세 장으로 정리",
        narrator: "옮겨 담으며 기록한 성질과 직접 만든 입자 모형을 <b>카드 세 장</b>으로 이어요.",
        cards: [
          {
            name: "고체",
            color: "#4E9BF5",
            art: miniArt("solid"),
            text: "<b>모양과 부피가 일정</b>해요. 입자들이 매우 가까이, <b>규칙적으로</b> 늘어서 제자리에서만 움직여요.",
            examples: ["얼음", "돌", "나무"],
            more: "<b class='rm-h'>왜 그럴까요?</b>고체의 입자들은 서로 매우 가까이에서 <b>규칙적으로</b> 늘어서 있고 제자리를 벗어나지 못해요. 직접 만든 고체의 입자 모형에서 입자들은 가지런히 줄을 선 채 제자리에서 떨기만 했죠. 입자가 모두 제자리를 지키니 전체의 모양도, 차지하는 공간도 변하지 않아요.<b class='rm-h'>예를 들면</b>얼음은 컵에 담아도 접시에 담아도 모양이 그대로였고 부피 눈금도 100 mL 그대로였어요. 돌, 나무, 필통처럼 단단한 물체는 어디에 두어도 제 모양을 지켜요.<b class='rm-h'>헷갈리지 마세요</b>고체의 입자가 완전히 멈춰 있다고 생각하기 쉬워요. 하지만 입자는 <b>제자리에서 끊임없이 움직여요</b>. 자리를 옮기지 못할 뿐이에요.",
          },
          {
            name: "액체",
            color: "#9A7CF7",
            art: miniArt("liquid"),
            text: "그릇에 따라 <b>모양은 달라지고 부피는 일정</b>해요. 입자들이 불규칙하게 놓여 <b>자리를 바꾸며</b> 움직여요.",
            examples: ["물", "주스", "식용유"],
            more: "<b class='rm-h'>왜 그럴까요?</b>액체의 입자들은 고체보다 불규칙하게 놓여 있고, 서로 붙은 채 <b>자리를 바꾸며</b> 움직여요. 그래서 액체는 흐르고, 담는 그릇의 모양대로 담겨요. 하지만 입자 사이의 거리는 거의 달라지지 않아서 부피는 그대로예요.<b class='rm-h'>예를 들면</b>물은 컵에서는 컵 모양, 접시에서는 넓게 퍼진 모양이 됐지만 부피 눈금은 두 번 다 100 mL였어요. 주스를 길쭉한 컵에서 넓은 그릇으로 옮겨도 양은 같아요.<b class='rm-h'>헷갈리지 마세요</b>넓은 접시에 담긴 물은 얕아서 적어 보이고, 좁은 컵에서는 높이 차올라 많아 보여요. 겉보기 높이에 속지 마세요. 달라진 것은 <b>모양뿐</b>이에요.",
          },
          {
            name: "기체",
            color: "#F0705E",
            art: miniArt("gas"),
            text: "그릇에 따라 <b>모양과 부피가 모두 달라져요</b>. 입자들이 <b>매우 멀리</b> 떨어져 자유롭게 움직여요.",
            examples: ["공기", "수증기"],
            more: "<b class='rm-h'>왜 그럴까요?</b>기체의 입자들은 서로 <b>매우 멀리</b> 떨어져 사방으로 자유롭게 움직여요. 그래서 담긴 그릇 안에 고르게 퍼져 그릇을 가득 채워요. 그릇이 크면 큰 대로, 작으면 작은 대로 채우니 모양도 부피도 그릇을 따라가요.<b class='rm-h'>예를 들면</b>공기는 뚜껑 덮은 컵에서는 300 mL, 접시에서는 200 mL를 가득 채웠어요. 풍선 속의 공기가 풍선 구석구석까지 차 있는 것도, 방 한쪽의 방향제 냄새가 방 전체에서 나는 것도 기체 입자가 고르게 퍼지기 때문이에요.<b class='rm-h'>헷갈리지 마세요</b>눈에 보이지 않는다고 아무것도 없는 것이 아니에요. 공기도 입자로 이루어진 <b>물질</b>이에요. 뚜껑이 없는 그릇이라면 기체는 그릇 밖으로 퍼져 나가요.",
          },
        ],
        note: { icon: "sparkle", tone: "violet", title: "쏟아진 얼음과 주스", html: "얼음은 입자들이 <b>제자리를 지켜서</b> 모양 그대로 주워 담을 수 있었어요. 주스는 입자들이 <b>자리를 바꾸며 움직여서</b> 손가락 사이로 흘러내렸고요." },
        cta: "문제 풀기",
      }),
    },
    after: (steps) =>
      problems(steps, (keep) => [
        keep("교실에서 찾은<br>세 가지 상태"),
        mcq({
          prompt: "주스 200 mL를 길쭉한 컵에서 넓은 접시로 <b>남김없이</b> 옮겨 담았어요. 옮겨 담은 뒤의 주스에 대한 설명으로 옳은 것은?",
          options: ["모양은 달라지고 부피는 그대로다", "모양과 부피가 모두 달라진다", "모양과 부피가 모두 그대로다", "모양은 그대로이고 부피만 줄어든다", "모양은 그대로이고 부피만 늘어난다"],
          answer: 0,
          explainGood: "맞아요. 주스는 액체라서 <b>접시 모양대로</b> 퍼지지만, 입자 사이의 거리는 거의 그대로라 부피는 200 mL 그대로예요. 물을 컵에서 접시로 옮겼을 때와 같아요.",
          explainBad: "주스는 액체예요. 액체는 담는 그릇에 따라 <b>모양만</b> 달라지고 <b>부피는 일정</b>해요. 넓은 접시에서 얕아 보여도 양은 200 mL 그대로예요. 모양과 부피가 모두 달라지는 것은 기체, 모두 그대로인 것은 고체예요.",
        }),
        keep("물질의 세 가지 상태를 입자 모형으로"),
        reword(keep("<b>고체</b> 상태의 입자에 대한 설명"), [
          ["무대의 -20℃ 얼음에서 본 떨림이 그거예요.", "직접 만든 고체의 입자 모형에서 본 떨림이 그거예요."],
          ["무대의 -20℃ 얼음을 떠올려요. 입자들이", "직접 만든 고체의 입자 모형을 떠올려요. 입자들이"],
        ]),
        multi({
          prompt: "<b>기체</b>에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
          options: ["입자 사이의 거리가 매우 멀다", "담는 그릇에 따라 부피가 달라진다", "입자들이 제자리에서만 움직인다"],
          answer: [0, 1],
          explainGood: "정확해요. 기체의 입자들은 서로 <b>매우 멀리</b> 떨어져 자유롭게 움직이고, 그릇을 가득 채우므로 <b>부피가 그릇에 따라</b> 달라져요. 제자리에서만 움직이는 것은 고체의 입자예요.",
          explainBad: "기체의 입자들은 서로 <b>매우 멀리</b> 떨어져 사방으로 자유롭게 움직여요. 그래서 그릇을 가득 채우고 <b>부피가 그릇에 따라</b> 달라지죠. 입자들이 제자리에서만 움직이는 것은 고체예요.",
        }),
      ]),
  },
  // ══ 3. 물질의 상태 변화 ══
  u4l3: {
    swap: {
      phaseNames: (old) => [
        namesLab({ title: "이름대로 물을 바꿔 볼까요?", cta: "다음 실험, 얼음 접시", curio: curioOf(old) }),
        watchLab({ title: "물방울은 어디에서 왔을까요?", cta: "다음 실험, 승화" }),
      ],
      sublimation: dryIceLab({ title: "비누막은 어떻게 될까요?", cta: "개념 정리하기" }),
    },
  },
  // ══ 4. 상태 변화와 입자 배열 ══
  u4l4: {
    intro: opener({ title: "국그릇의 랩은 어떻게 될까요?", scene: "u4-wrap", wait: "먼저 랩을 지켜보세요", cta: "실험실 열기" }),
    swap: {
      phaseVolume: [oliveLab({ title: "얼리면 질량이 달라질까요?", cta: "다음 실험, 풍선" }), balloonLab({ title: "풍선은 어떻게 될까요?", cta: "개념 정리하기" })],
    },
  },
  // ══ 5. 열에너지를 흡수하는 상태 변화 ══
  u4l5: {
    intro: opener({ title: "센 불이면 더 뜨거울까요?", scene: "u4-ramen", wait: "먼저 불을 세게 해 보세요", cta: "실험실 열기" }),
    swap: { heatCurve: heatLab({ title: "가열하면 온도는 계속 오를까요?", mode: "heat", cta: "개념 정리하기" }) },
  },
  // ══ 6. 열에너지를 방출하는 상태 변화 ══
  u4l6: {
    swap: { heatCurve: heatLab({ title: "식히면 온도는 계속 내려갈까요?", mode: "cool", cta: "개념 정리하기" }) },
  },
});

// 검사 도구(qa/check-u4v5.mjs)가 문제의 정답을 찾는 표. 개발 모드에서만 내놓는다(운영 번들에는 없다).
if (import.meta.env.DEV) Object.assign(globalThis as unknown as Record<string, unknown>, { __u4v5: UNIT4_V5, __u4base: UNIT4 });
