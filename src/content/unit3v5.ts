// 중1 Ⅲ 열: 재제작(v5, 2026-11-12). 주소 ?u3v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit3.ts)에서 도입, 랩, 개념, 정리, 문제를 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, u3l3의 만화는 정본 그대로다.
// 설계와 교과서 대응표: design/u3v5-plan.md
//   u3l1 도입 u3-cups  → 랩 u3TempLab(온도 막대 + 비밀의 물과 같은 온도 만들기)
//   u3l2 도입 u3-egg   → 랩 u3ContactLab(열량계에 컵 넣기, 컵 속 물의 온도를 학생이 정한다)
//   u3l3 (만화 그대로)  → 랩 u3RodLab(전도) · u3ConvLab(대류) · u3RadLab(복사)
//   u3l4 도입 u3-beach → 랩 u3RaceLab(물과 식용유 가열)
//   u3l5 도입 u3-wire  → 랩 u3ExpandLab(막대와 입자) · u3TapeLab(알루미늄박과 종이 띠, 바이메탈)
// 레슨의 꼴: 도입 → 랩 → 개념(용어에 이름 붙이기, 새로 넣었다) → 정리 → 문제.
//   개념: 정본에는 개념 스텝이 없었다. 랩에서 겪은 것에 이름을 붙이는 용어 카드를 레슨마다 하나 둔다(컷은 아직 없다. 목록은 output/g1-v5/u3/concept-cuts.md).
//   정리: 정본 카드의 그림과 '자세히'를 이어 쓰고(reRecap), 핵심 문장과 쌤의 말을 새 랩에 맞춰 다시 썼다. 옛 랩을 가리키던 문장은 fix로 바꾼다.
//   문제: 새 랩의 판정과 같은 것을 다시 묻는 문항은 빼고, 랩에서 본 것의 까닭과 옮겨 쓰기를 묻는 문항을 새로 썼다. 남긴 문항은 정본 객체를 그대로 쓴다(keep).
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { opener, concept, mcq, ox, multi } from "./dsl";
import { UNIT3 } from "./unit3";
import { remakeUnit } from "./v5remake";

type Curio = { q: string; a: string };
const lab = (type: string) => (o: { title: string; cta?: string; curio?: Curio }): Step => ({ type, ...o });
const tempLab = lab("u3TempLab");
const contactLab = lab("u3ContactLab");
const rodLab = lab("u3RodLab");
const convLab = lab("u3ConvLab");
const radLab = lab("u3RadLab");
const raceLab = lab("u3RaceLab");
const expandLab = lab("u3ExpandLab");
const tapeLab = lab("u3TapeLab");

/** 정본 랩 스텝에 달려 있던 궁금증 카드를 새 랩으로 옮겨 단다(글의 주인은 정본이다). */
const withCurio = (make: (curio?: Curio) => Step | Step[]) => (old: Step): Step | Step[] => make(old.curio as Curio | undefined);

const warn = (msg: string): void => {
  if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) console.warn(`[v5] u3: ${msg}`);
};
const textOf = (s: Step): string => String(s.prompt ?? s.title ?? "");
/** 정본의 문제 스텝을 글의 한 토막으로 찾아 그대로 쓴다(정본이 바뀌어 못 찾으면 개발 서버 콘솔에 알린다). */
const keep = (steps: Step[], needle: string): Step[] => {
  const s = steps.find((x) => (x.type === "quiz" || x.type === "binSort") && textOf(x).includes(needle));
  if (!s) warn(`남길 문제를 찾지 못했다: ${needle}`);
  return s ? [s] : [];
};
/** 문제 번호(n, of)를 차례대로 다시 매긴다(분류 활동은 번호가 없다). */
const numbered = (list: Step[]): Step[] => {
  const of = list.filter((s) => s.type === "quiz").length;
  let n = 0;
  return list.map((s) => (s.type === "quiz" ? { ...s, n: ++n, of } : s));
};

interface RecapCard { name: string; text: string; color?: string; art?: string; examples?: string[]; more?: string }
/** 정본의 정리 스텝을 바탕으로 새 정리를 만든다. 카드의 그림과 '자세히'는 이어 쓰고 핵심 문장(texts)과 쌤의 말을 바꾼다.
 *  fix: [카드 차례, 옛 문장, 새 문장]. '자세히'에서 옛 랩을 가리키던 문장을 바꾼다. */
function reRecap(steps: Step[], o: { narrator: string; texts: (string | null)[]; examples?: (string[] | null)[]; fix?: [number, string, string][]; cta?: string }): Step {
  const old = steps.find((s) => s.type === "recap");
  if (!old) {
    warn("정리 스텝을 찾지 못했다");
    return { type: "recap", title: "정리", cards: [] };
  }
  const cards = (old.cards as RecapCard[]).map((c, i) => {
    let more = c.more;
    for (const [idx, from, to] of o.fix ?? []) {
      if (idx !== i || more === undefined) continue;
      if (!more.includes(from)) warn(`정리 카드 ${i}에서 바꿀 문장을 찾지 못했다: ${from}`);
      more = more.replace(from, to);
    }
    return { ...c, text: o.texts[i] ?? c.text, examples: o.examples?.[i] ?? c.examples, more };
  });
  return { ...old, narrator: o.narrator, cards, cta: o.cta ?? (old.cta as string | undefined) };
}
/** 레슨의 스텝을 다시 짠다: 정리 앞까지(도입, 만화, 랩)는 그대로 두고 그 뒤를 개념 → 정리 → 문제로 채운다. */
const rebuild = (steps: Step[], make: (old: Step[]) => { concept: Step; recap: Step; problems: Step[] }): Step[] => {
  const cut = steps.findIndex((s) => s.type === "recap");
  if (cut < 0) {
    warn("정리 스텝이 없어 레슨을 다시 짜지 못했다");
    return steps;
  }
  const m = make(steps);
  return [...steps.slice(0, cut), m.concept, m.recap, ...numbered(m.problems)];
};
const terms = (o: { title: string; lead: string; terms: [string, string][]; note: string }): Step =>
  concept({
    kicker: "과학 용어 정복하기",
    kickerTone: "heat",
    title: o.title,
    lead: o.lead,
    blocks: [...o.terms.map(([name, def]) => ({ k: "term" as const, name, def })), { k: "note" as const, tone: "amber" as const, html: o.note }],
    cta: "카드로 정리하기",
  });

export const UNIT3_V5: Unit | null = remakeUnit(UNIT3, {
  // ══════════ u3l1 온도와 입자 운동 ══════════
  u3l1: {
    intro: opener({ title: "똑같아 보이는 두 컵, 무엇이 다를까?", scene: "u3-cups", wait: "두 컵의 뚜껑을 열어 보세요", cta: "물속을 크게 확대해 보기" }),
    swap: { heatParticles: withCurio((curio) => tempLab({ title: "온도가 오르면 입자는 어떻게 될까?", cta: "용어 정리하기", curio })) },
    after: (steps) =>
      rebuild(steps, (old) => ({
        concept: terms({
          title: "온도,<br>입자가 움직이는 정도",
          lead: "막대를 밀 때마다 달라지던 입자의 움직임. 거기에 붙은 이름을 정리해요.",
          terms: [
            ["입자", "물질을 이루는 <b>눈에 보이지 않는 아주 작은 알갱이</b>예요. 물도, 컵도, 공기도 모두 입자로 이루어져 있어요. 입자는 가만히 있지 않고 끊임없이 움직여요."],
            ["온도", "물체를 구성하는 <b>입자의 운동이 활발한 정도</b>를 나타내요. 입자가 활발하게 움직일수록 온도가 높고, 둔하게 움직일수록 온도가 낮아요."],
          ],
          note: "가장 차갑게 식힌 물에서도 입자는 <b>멈추지 않았어요</b>. 차가운 물체의 입자도 둔하게나마 계속 움직여요.",
        }),
        recap: reRecap(old, {
          narrator: "물의 온도를 바꾸며 본 것을 카드 세 장으로 정리했어요.",
          texts: [
            "물체를 구성하는 <b>입자 운동이 활발한 정도</b>예요. 그래서 입자의 움직임만 보고도 비밀의 물의 온도를 맞힐 수 있었어요.",
            "입자 운동이 <b>활발</b>해져 온도가 높아지고, 입자 사이도 <b>멀어져요</b>.",
            "입자 운동이 <b>둔</b>해지고 입자 사이가 <b>가까워져요</b>. 그래도 입자가 멈추지는 않아요.",
          ],
        }),
        problems: [
          mcq({
            prompt: "입자 모형으로 나타낸 물의 온도를 20℃에서 80℃로 높였어요. 이때 <b>달라지지 않는</b> 것은?",
            options: ["물 입자의 수", "물 입자가 움직이는 빠르기", "물 입자 사이의 거리", "물 입자 운동의 활발한 정도"],
            answer: 0,
            explainGood: "맞아요. 가열해도 <b>입자의 수와 크기는 그대로</b>예요. 달라지는 것은 움직임과 입자 사이의 거리예요.",
            explainBad: "온도가 높아지면 입자가 <b>빨라지고</b> 운동이 활발해지며 <b>사이가 멀어져요</b>. 하지만 입자가 새로 생기지는 않아요. 달라지지 않는 것은 <b>입자의 수</b>예요.",
          }),
          ...keep(old, "(가)~(다)의 입자 운동"),
          ...keep(old, "냉장고에"),
          multi({
            prompt: "추운 날 손바닥을 마주 대고 빠르게 비볐더니 손바닥이 따뜻해졌어요. 옳은 설명을 <b>모두</b> 고르세요.",
            options: ["손바닥을 이루는 입자의 운동이 활발해졌다", "불로 가열하지 않아도 온도가 높아질 수 있다", "손바닥을 이루는 입자의 수가 늘어났다"],
            answer: [0, 1],
            explainGood: "정확해요. 비비거나 두드릴 때에도 <b>입자의 운동이 활발해지면</b> 온도가 높아져요. 입자의 수는 그대로예요.",
            explainBad: "온도가 높아졌다는 것은 <b>입자의 운동이 활발해졌다</b>는 뜻이에요. 가열하지 않고 비비기만 해도 그렇게 될 수 있어요. 다만 <b>입자의 수는 늘지 않아요</b>.",
          }),
        ],
      })),
  },

  // ══════════ u3l2 열평형 ══════════
  u3l2: {
    intro: opener({ title: "갓 삶은 달걀을 찬물에 넣으면?", scene: "u3-egg", wait: "달걀을 꾹 눌러 물에 담가 보세요", cta: "열량계로 실험하기" }),
    swap: { heatContact: withCurio((curio) => contactLab({ title: "뜨거운 물과 찬물이 닿으면?", cta: "용어 정리하기", curio })) },
    after: (steps) =>
      rebuild(steps, (old) => ({
        concept: terms({
          title: "열과 열평형",
          lead: "컵의 벽을 건너던 노란 화살표, 그리고 두 선이 만난 자리. 두 가지에 이름을 붙여요.",
          terms: [
            ["열", "<b>온도가 높은 물체에서 낮은 물체로 이동하는 에너지</b>예요. 열을 잃은 쪽은 온도가 내려가고, 열을 얻은 쪽은 온도가 올라가요."],
            ["열평형", "열이 이동하다가 <b>두 물체의 온도가 같아진 상태</b>예요. 그래프에서 두 선이 만나 나란해진 곳이에요. 온도가 같아지면 열은 더 이동하지 않아요."],
          ],
          note: "온도와 열은 달라요. <b>온도</b>는 입자 운동이 활발한 정도이고, <b>열</b>은 온도가 달라서 옮겨 가는 에너지예요. 그리고 열평형이 되어도 입자는 <b>멈추지 않아요</b>.",
        }),
        recap: reRecap(old, {
          narrator: "찬 컵을 넣어도 뜨거운 컵을 넣어도 끝은 같았죠. 두 선이 만나는 곳! 카드로 정리해요.",
          texts: [
            "온도가 <b>높은 물체에서 낮은 물체로</b> 이동하는 에너지예요. 컵이 차가울 땐 컵으로, 컵이 뜨거울 땐 바깥 물로 갔어요.",
            null,
            null,
          ],
          fix: [[2, "무대에서 본 빨간 입자와 파란 입자의 충돌이 바로 그 장면이에요.", "열량계에서 두 물의 입자 빠르기가 점점 비슷해지던 것이 바로 그 장면이에요."]],
        }),
        problems: [
          mcq({
            prompt: "60℃ 물이 담긴 통에 90℃ 물이 든 금속 컵을 담가 두었어요. 일어나는 일로 옳은 것은?",
            options: [
              "열이 컵 속 물에서 통의 물로 이동한다",
              "열이 통의 물에서 컵 속 물로 이동한다",
              "통의 물의 온도가 60℃보다 낮아진다",
              "컵 속 물의 온도가 90℃보다 높아진다",
              "온도가 서로 달라도 열은 이동하지 않는다",
            ],
            answer: 0,
            explainGood: "맞아요. 열은 언제나 <b>온도가 높은 쪽(90℃)에서 낮은 쪽(60℃)</b>으로 이동해요. 컵 속 물은 식고 통의 물은 데워져요.",
            explainBad: "어느 물이 안에 있고 밖에 있는지는 상관없어요. 열은 <b>온도가 높은 물(90℃)에서 낮은 물(60℃)로</b> 이동해요. 그래서 컵 속 물은 식고 통의 물은 데워지다가 같은 온도가 돼요.",
          }),
          ...keep(old, "수조의 물 (가)"),
          ...keep(old, "입자 운동은 어떻게 변할까"),
          ...keep(old, "멈출 때까지 기다렸다가"),
          ox({
            prompt: "뜨거운 물과 찬물이 열평형에 도달하면 두 물을 이루는 <b>입자의 움직임도 멈춘다.</b>",
            answer: false,
            explainGood: "맞아요, 틀린 말이에요. 열평형에서 멈추는 것은 <b>열의 이동</b>이에요. 입자는 여전히 움직이고, 두 물의 입자 운동이 활발한 정도가 <b>같아졌을</b> 뿐이에요.",
            explainBad: "멈추는 것은 <b>열의 이동</b>이지 입자가 아니에요. 열평형이 되어도 두 물의 입자는 계속 움직여요. 다만 운동이 활발한 정도가 <b>서로 같아져요</b>.",
          }),
        ],
      })),
  },

  // ══════════ u3l3 열의 이동 ══════════
  u3l3: {
    swap: {
      conduction: withCurio((curio) => rodLab({ title: "어느 막대가 열을 빨리 전할까?", cta: "다음, 대류", curio })),
      convection: withCurio((curio) => convLab({ title: "아래만 데워도 왜 다 따뜻해질까?", cta: "다음, 복사", curio })),
      radiation: withCurio((curio) => radLab({ title: "난로 곁에 서면 왜 따뜻할까?", cta: "용어 정리하기", curio })),
    },
    after: (steps) =>
      rebuild(steps, (old) => ({
        concept: terms({
          title: "전도, 대류, 복사",
          lead: "막대, 방 안의 공기, 유리 상자. 세 실험에서 열이 이동한 방식에 이름을 붙여요.",
          terms: [
            ["전도", "물체를 구성하는 입자의 운동이 <b>이웃한 입자에 차례로 전달</b>되어 열이 이동하는 현상이에요. 막대 속 입자는 제자리에서 떨기만 했어요."],
            ["대류", "물이나 공기를 이루는 <b>입자가 직접 이동</b>하면서 열을 전달하는 현상이에요. 데워진 쪽은 위로, 차가운 쪽은 아래로 움직이며 돌아요."],
            ["복사", "열이 <b>물질을 통하지 않고 직접</b> 이동하는 현상이에요. 공기를 다 뺀 유리 상자에서도 온도계는 따뜻했어요."],
          ],
          note: "전도와 대류는 열을 전할 <b>입자가 있어야</b> 일어나요. 복사는 입자가 없어도 돼요. 태양의 열이 텅 빈 우주를 건너오는 것도 복사예요.",
        }),
        recap: reRecap(old, {
          narrator: "세 실험에서 열이 이동한 방식을 카드로 견줘요. <b>입자가 무엇을 했는지</b>가 핵심!",
          texts: [
            "입자의 운동이 <b>이웃한 입자에 차례로</b> 전달돼요. 입자는 제자리! 전도되는 빠르기는 물질마다 달라요.",
            "데워진 <b>입자가 직접 이동</b>하며 열을 날라요. 그래서 난방기는 아래에, 냉방기는 위에 달아요.",
            "열이 <b>물질을 통하지 않고 직접</b> 이동해요. 가로막으면 닿지 않고, 공기가 없어도 전해져요.",
          ],
          examples: [null, ["냄비 속 물", "냉난방"], ["난로의 열기", "햇볕"]],
          fix: [
            [1, "주전자를 아래만 데워도 물 전체가 끓는 이유죠.", "냄비를 아래만 데워도 물 전체가 뜨거워지는 까닭이죠."],
            [2, "모닥불 곁에 앉으면 불에 닿지 않아도 얼굴이 후끈하고", "난로 곁에 서면 난로에 닿지 않아도 몸이 따뜻하고"],
          ],
        }),
        problems: [
          ...keep(old, "구리·철·유리 막대"),
          mcq({
            prompt: "추운 방의 <b>천장 가까이에</b> 난방기를 달고 켰더니, 한참 지나도 바닥 쪽은 계속 추웠어요. 그 까닭으로 옳은 것은?",
            options: [
              "데워진 공기가 위쪽에만 머물러 방 안의 공기가 돌지 않아서",
              "데워진 공기가 바닥으로 내려와 식어 버려서",
              "난방기에서 나온 열이 천장으로 모두 전도되어서",
              "바닥 쪽 공기 입자가 움직이지 않고 멈춰 있어서",
            ],
            answer: 0,
            explainGood: "맞아요. 데워진 공기는 <b>위로</b> 올라가려 해요. 이미 맨 위에서 데워지면 내려올 까닭이 없어 공기가 돌지 않고, 열이 아래까지 전해지지 않아요.",
            explainBad: "따뜻해진 공기는 <b>위로 올라가고</b> 찬 공기는 아래로 내려와요. 난방기가 위에 있으면 데워진 공기가 위에만 머물러 대류가 일어나지 않아요. 그래서 난방기는 <b>아래쪽</b>에 달아요.",
          }),
          mcq({
            prompt: "보온병은 안쪽 벽과 바깥쪽 벽 사이를 <b>공기가 거의 없는 빈 곳</b>으로 만들어요. 이렇게 하면 주로 무엇을 막을 수 있을까요?",
            options: [
              "전도와 대류로 열이 이동하는 것",
              "복사로 열이 이동하는 것",
              "전도, 대류, 복사 세 가지 모두",
              "병 속 물의 입자가 움직이는 것",
            ],
            answer: 0,
            explainGood: "정확해요. 전도와 대류는 열을 전할 <b>입자가 있어야</b> 일어나요. 벽 사이에 입자가 거의 없으면 두 가지가 막혀요. 복사는 빈 곳도 건너가므로 벽을 반짝이게 만들어 따로 막아요.",
            explainBad: "입자가 없는 곳에서는 <b>전도와 대류</b>가 일어나지 못해요. 하지만 <b>복사</b>는 물질이 없어도 열이 이동하므로 빈 곳만으로는 막지 못해요. 그래서 보온병은 벽을 거울처럼 반짝이게 만들어 복사도 줄여요.",
          }),
          ...keep(old, "이 열은 어떻게"),
          ...keep(old, "온돌은 아궁이에"),
          ...keep(old, "철봉과 나무 의자"),
        ],
      })),
  },

  // ══════════ u3l4 비열 ══════════
  u3l4: {
    intro: opener({ title: "한낮의 해변, 어느 쪽이 더 뜨거울까?", scene: "u3-beach", wait: "해를 꾹 눌러 햇볕을 비춰 보세요", cta: "물과 식용유로 실험하기" }),
    swap: { specificHeat: withCurio((curio) => raceLab({ title: "같은 불에 어느 쪽이 빨리 뜨거워질까?", cta: "용어 정리하기", curio })) },
    after: (steps) =>
      rebuild(steps, (old) => ({
        concept: terms({
          title: "열량과 비열",
          lead: "식용유는 20초, 물은 43초. 같은 온도만큼 올리는 데 든 열이 달랐어요. 이 차이에 이름을 붙여요.",
          terms: [
            ["열량", "온도가 다른 물체 사이에서 <b>이동한 열의 양</b>이에요. 같은 세기로 오래 가열할수록 물질이 받은 열량이 커요."],
            ["비열", "어떤 물질 <b>1 kg의 온도를 1℃ 높이는 데 필요한 열량</b>이에요. 물은 식용유보다 비열이 커서 같은 온도만큼 올리는 데 열이 더 많이 들었어요. 비열은 물질마다 다른 고유한 값이에요."],
          ],
          note: "비열이 크다는 것은 <b>뜨겁다</b>는 뜻이 아니에요. 온도가 <b>잘 변하지 않는다</b>는 뜻이에요. 온도가 빨리 오른 식용유가 비열이 작은 쪽이에요.",
        }),
        recap: reRecap(old, {
          narrator: "물이 느긋하게 데워진 까닭에 이름이 생겼어요. <b>비열</b>! 카드로 정리해요.",
          texts: [
            null,
            "비열이 <b>크면</b> 온도가 잘 안 변해요. 천천히 데워지고 천천히 식어요(물). <b>작으면</b> 빨리 데워지고 빨리 식어요(식용유).",
            null,
          ],
        }),
        problems: [
          mcq({
            prompt: "질량이 같은 액체 A와 B를 같은 세기로 가열했어요. 온도를 30℃ 높이는 데 A는 2분, B는 5분이 걸렸어요. 옳은 것은?",
            options: [
              "B의 비열이 A보다 크다",
              "A의 비열이 B보다 크다",
              "두 액체가 받은 열량은 같다",
              "같은 시간 동안 가열하면 B의 온도가 더 많이 오른다",
            ],
            answer: 0,
            explainGood: "맞아요. 같은 온도만큼 높이는 데 <b>더 오래</b> 가열해야 했던 B가 열을 더 많이 받았어요. 같은 온도 변화에 열량이 더 많이 드는 물질이 <b>비열이 큰</b> 물질이에요.",
            explainBad: "오래 가열할수록 받은 열량이 커요. 같은 30℃를 높이는 데 B는 5분이나 걸렸으니 <b>B가 열을 더 많이 받았고</b>, 그만큼 B의 비열이 커요. 같은 시간만 가열하면 비열이 작은 A의 온도가 더 많이 올라요.",
          }),
          ...keep(old, "세 물질 (가)~(다)에"),
          ...keep(old, "온도 변화가 큰"),
          ...keep(old, "비열이 클까"),
          ...keep(old, "모래는 뜨겁고 바닷물은 시원한"),
        ],
      })),
  },

  // ══════════ u3l5 열팽창 ══════════
  u3l5: {
    intro: opener({ title: "한여름의 전깃줄은 어떻게 될까?", scene: "u3-wire", wait: "여름과 겨울을 오가 보세요", cta: "금속 막대 가열해 보기" }),
    swap: {
      // 랩 하나를 둘로: 막대와 입자(열팽창의 까닭) 뒤에 두 띠 붙이기(물질마다 다르다, 바이메탈)
      expansion: withCurio((curio) => [expandLab({ title: "가열하면 막대는 왜 길어질까?", cta: "다음, 두 띠 붙이기" }), tapeLab({ title: "붙인 두 띠는 어느 쪽으로 휠까?", cta: "용어 정리하기", curio })]),
    },
    after: (steps) =>
      rebuild(steps, (old) => ({
        concept: terms({
          title: "열팽창과 바이메탈",
          lead: "가열한 막대는 길어지고, 붙인 두 띠는 휘었어요. 두 가지에 이름을 붙여요.",
          terms: [
            ["열팽창", "물체가 열을 받아 <b>길이나 부피가 늘어나는 현상</b>이에요. 입자 운동이 활발해져 입자 사이의 거리가 멀어지기 때문이에요. 식으면 다시 줄어들어요."],
            ["바이메탈", "<b>열팽창 정도가 다른 두 금속</b>을 붙여 만든 띠예요. 온도가 높아지면 열팽창 정도가 작은 금속 쪽으로 휘어요. 다리미 속에서 전기를 끊던 그 띠예요."],
          ],
          note: "막대가 길어질 때 입자 하나하나가 <b>커지는 것이 아니에요</b>. 입자의 수가 늘어나는 것도 아니에요. 입자 <b>사이의 거리</b>만 멀어져요.",
        }),
        recap: reRecap(old, {
          narrator: "여름에 전깃줄이 처진 까닭, 이제 알겠죠? 카드로 정리해요.",
          texts: [
            "물체가 열을 받아 <b>팽창</b>하는 현상. 입자 운동이 활발해져 <b>입자 사이의 거리</b>가 멀어지기 때문이에요. 입자의 크기와 수는 그대로예요.",
            "같은 열을 받아도 팽창하는 정도는 물질마다 달라요. 알루미늄박은 종이보다 많이 늘어났죠. 고체뿐 아니라 <b>액체도</b> 열팽창해요.",
            "열팽창 정도가 <b>다른 두 금속</b>을 붙인 띠. 뜨거워지면 <b>열팽창 정도가 작은 금속 쪽으로</b> 휘어 전기를 끊고, 식으면 다시 이어요.",
          ],
          // 화재경보기의 바이메탈은 휘어서 전기를 잇는 쪽이라 이 카드의 설명과 어긋난다. 끊는 쪽의 예만 둔다.
          examples: [null, null, ["전기다리미", "전기밥솥"]],
        }),
        problems: [
          ...keep(old, "금속 막대를 <b>가열</b>할 때"),
          ...keep(old, "종이와 알루미늄박을 붙인 테이프"),
          mcq({
            prompt: "금속 A를 위에, 금속 B를 아래에 붙여 만든 바이메탈을 가열했더니 <b>위쪽으로</b> 휘었어요. 옳은 것은?",
            options: [
              "B가 A보다 열팽창 정도가 크다",
              "A가 B보다 열팽창 정도가 크다",
              "가열하는 동안 A는 줄어들고 B만 늘어났다",
              "두 금속의 열팽창 정도가 같다",
            ],
            answer: 0,
            explainGood: "맞아요. 바이메탈은 <b>덜 늘어나는 금속 쪽</b>으로 휘어요. 위쪽(A)으로 휘었으니 A가 덜 늘어나고, 아래의 <b>B가 더 많이</b> 늘어난 거예요.",
            explainBad: "두 금속 모두 늘어나지만 늘어나는 정도가 달라요. 더 많이 늘어나는 금속이 휜 모양의 <b>바깥쪽</b>, 덜 늘어나는 금속이 <b>안쪽</b>이 돼요. 위로 휘었다면 안쪽인 A가 덜, 바깥쪽인 <b>B가 더</b> 늘어난 거예요.",
          }),
          ...keep(old, "금속 뚜껑"),
          ...keep(old, "비열일까"),
          ...keep(old, "알코올 온도계"),
        ],
      })),
  },
});
