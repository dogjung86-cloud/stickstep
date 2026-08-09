// 중2 대단원 V — 식물과 에너지 (v3 전면 재제작, 2026-08-10).
// 교과서 소단원 순서 그대로(책 168~197쪽): 식물의 광합성 → 환경요인 → 식물의 호흡과 광합성 →
// 광합성산물의 저장과 이용. 이 교과서에는 증산 작용 소단원이 없다(원문 정독으로 확정).
// 배선: curriculum.ts의 ss.g2u5v3 토글(병행) — 레슨 id는 현행과 동일(g2u5l1~l6, 시험 풀 호환).
// 언어 가드: 몰·화학식 금지 · 암처리 먼저 · 아이오딘=녹말 확인 · 호흡은 낮밤 항상 ·
// 체관 설탕은 위·아래로 · 온도는 알맞은 범위 뒤 광합성량 감소 · 해요체 · 이모지 금지.
import type { Unit } from "../curriculum";
import {
  lesson, concept, comic, recap, mcq, ox, multi, binSort, cut,
  greenHuntLab,
} from "../dsl";
import { p3MiniArt, psFlowFig } from "../../ui/plant3Figures";

/** public 임의 경로 사진 한 장(검증 자산 재사용 — plant/figs·exam/g2u5). */
const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
export const pimg = (path: string, alt: string): string =>
  `<img src="${IMG_BASE}${path}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** 사진 두 장 나란히 — (가)(나) 라벨(지권 gpair 문법). */
export const ppair = (a: string, altA: string, b: string, altB: string, labA = "(가)", labB = "(나)"): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">${labA}</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">${labB}</figcaption></figure>
  </div>`;

export const G2_UNIT5_V3: Unit = {
  id: "g2u5",
  roman: "V",
  title: "식물과 에너지",
  subtitle: "빛으로 양분을 만들고, 양분에서 에너지를 꺼내는 식물의 하루",
  color: "#12B886",
  icon: "leaf",
  standard: "책 168~197쪽",
  lessons: [
    lesson({
      id: "g2u5l1", unitId: "g2u5",
      title: "스스로 밥을 짓는 식물",
      subtitle: "300년에 걸친 발견, 광합성",
      label: "광합성", icon: "leaf", minutes: 10, standard: "책 170~173쪽",
      doneNote: "광합성은 엽록체에서 — 빛·이산화 탄소·물로 포도당과 산소를",
      steps: [
        comic({
          title: "나무의 몸은<br><em>어디서</em> 왔을까",
          lead: "과학자 세 명이 300년에 걸쳐 풀어낸 수수께끼예요.",
          narrator: "동물은 먹이를 먹고 자라죠. 그런데 식물은 아무것도 먹지 않는 것 같은데 어떻게 커질까요? 이 단순한 질문 하나가 <b>300년짜리 수사</b>가 됐답니다.",
          cta: "다음 컷",
          panels: [
            {
              img: "comics/g2u5l1/0.webp", stage: "1640년대, 벨기에", title: "반 헬몬트의 저울",
              caption: "과학자 <b>반 헬몬트</b>는 궁금했어요. '나무는 흙을 먹고 자라는 걸까?' 그는 어린 버드나무와 잘 말린 흙의 무게를 <b>정확히 재고</b> 실험을 시작했죠.",
            },
            {
              img: "comics/g2u5l1/1.webp", stage: "5년의 기다림", title: "물만 주고 길렀어요",
              caption: "화분에는 오직 <b>물만</b> 주었어요. 해가 뜨고 지고, 계절이 바뀌기를 다섯 해 — 버드나무는 어느새 훌쩍 자랐답니다.",
            },
            {
              img: "comics/g2u5l1/2.webp", stage: "충격의 결과", title: "흙은 그대로였다!",
              caption: "나무는 <b>약 74 kg</b>이나 무거워졌는데, 흙은 겨우 <b>숟가락 몇 술(약 57 g)</b>만 줄었어요. 나무의 몸은 흙에서 온 게 아니었던 거예요!",
            },
            {
              img: "comics/g2u5l1/3.webp", stage: "반쪽짜리 결론", title: "\"그럼 물이구나!\"",
              caption: "반 헬몬트는 '물이 나무가 된 것'이라고 결론지었어요. 절반은 맞았죠. 하지만 그가 놓친 재료가 하나 더 있었으니 — 바로 눈에 보이지 않는 <b>공기</b>였어요.",
            },
            {
              img: "comics/g2u5l1/4.webp", stage: "약 130년 뒤, 영국", title: "프리스틀리의 촛불",
              caption: "<b>프리스틀리</b>는 유리종 안에서 촛불을 태우면 곧 꺼진다는 걸 알았어요. 그런데 <b>식물을 함께</b> 넣어 두면, 꺼졌던 초에 다시 불을 붙일 수 있었죠. 식물이 <b>탁해진 공기를 되살린</b> 거예요!",
            },
            {
              img: "comics/g2u5l1/5.webp", stage: "마지막 조각", title: "잉엔하우스: 빛이 있어야!",
              caption: "몇 년 뒤 <b>잉엔하우스</b>가 마지막 조각을 맞췄어요. 식물이 공기를 되살리는 건 <b>빛이 있을 때뿐</b> — 어둠 속 식물은 공기를 되살리지 못했답니다.",
            },
            {
              img: "comics/g2u5l1/6.webp", stage: "수수께끼 완성", title: "빛 + 공기 + 물",
              caption: "정리하면 — 잎은 <b>빛</b>을 받아 <b>공기(이산화 탄소)</b>와 <b>물</b>로 스스로 양분을 만들고, 그 과정에서 <b>산소</b>를 내놓아요. 이 과정의 이름이 바로 <b>광합성</b>이랍니다.",
              term: { name: "광합성", def: "식물이 빛에너지를 이용하여 스스로 양분을 만드는 과정이에요." },
            },
          ],
        }),
        concept({
          kicker: "과학 용어 정복하기",
          kickerTone: "bio",
          title: "광합성 —<br>식물의 밥 짓기",
          lead: "동물은 먹어서 양분을 얻지만, 식물은 <b>스스로 만들어요</b>. 300년 수사의 결론을 정식 용어로 정리해요.",
          blocks: [
            { k: "figure", svg: cut("plant3", "g2u5l1", "밥솥처럼 김이 나는 잎사귀 앞에서 셰프 모자를 쓴 스틱맨"), cap: "재료만 있으면 식물의 부엌은 매일 밥을 지어요" },
            { k: "term", name: "광합성", def: "식물이 <b>빛에너지</b>를 이용하여 스스로 <b>양분을 만드는</b> 과정이에요. 만든 양분으로 식물은 자라고, 꽃을 피우고, 살아가죠." },
            { k: "note", tone: "amber", html: "그런데 이 '밥 짓기'는 식물의 몸 <b>어디에서</b> 일어날까요? 힌트 하나 — 광합성이 활발한 곳은 하나같이 <b>초록색</b>이에요. 초록의 정체를 따라가 봐요!" },
          ],
          cta: "초록의 정체 찾기",
        }),
        greenHuntLab({
          title: "초록의 정체 추적 —<br>어디서 밥을 지을까",
          lead: "잎을 점점 크게 확대하면서, 초록색이 <b>어디에</b> 숨어 있는지 직접 찾아봐요.",
          cta: "재료와 산물 정리하기",
          curio: {
            q: "가을에 잎이 노랗게 물들면, 광합성은 어떻게 될까요?",
            a: "단풍은 잎이 지기 전에 <b>엽록소가 분해되면서</b> 가려져 있던 노란 색소가 드러나는 현상이에요. 엽록소가 사라진 잎은 빛에너지를 붙잡지 못해 광합성을 거의 못 하게 되죠. 그래서 나무는 낙엽을 떨어뜨리기 전, 잎 속 양분을 줄기로 거둬들인답니다.",
          },
        }),
        concept({
          kicker: "과학 용어 정복하기",
          kickerTone: "bio",
          title: "광합성 공장의<br>재료와 산물",
          lead: "장소를 찾았으니 이제 <b>들어가는 것</b>과 <b>나오는 것</b>을 확인할 차례예요.",
          blocks: [
            { k: "figure", svg: cut("plant3", "g2u5l1b", "잎 공장으로 들어가는 세 갈래 길과 나오는 두 갈래 길을 안내하는 스틱맨"), cap: "들어가는 재료 셋, 나오는 산물 둘" },
            { k: "figure", svg: psFlowFig(), cap: "광합성 과정 — 빛에너지·이산화 탄소·물이 들어가고, 포도당과 산소가 나와요" },
            { k: "term", name: "광합성에 필요한 물질", def: "<b>이산화 탄소</b>는 주로 잎의 <b>기공</b>(잎에 있는 작은 구멍)을 통해 들어오고, <b>물</b>은 뿌리에서 흡수되어 <b>물관</b>을 타고 잎까지 올라와요. 그리고 엽록소가 흡수한 <b>빛에너지</b>가 이 재료들을 양분으로 바꾸죠." },
            { k: "term", name: "광합성산물", def: "광합성으로 만들어지는 양분은 <b>포도당</b>이에요. 포도당은 곧 <b>녹말</b>로 바뀌어 엽록체에 잠시 저장되죠. 함께 만들어진 <b>산소</b>는 기공을 통해 식물 밖으로 나가요." },
            { k: "note", tone: "blue", html: "숲의 공기가 상쾌하게 느껴지는 데는 이유가 있었던 거예요 — 잎들이 낮 동안 부지런히 <b>산소</b>를 내놓고 있으니까요." },
          ],
          cta: "정리하기",
        }),
        recap({
          title: "광합성,<br>세 장으로 정리해요",
          narrator: "300년 수사의 결론을 머릿속 서랍에 넣어요.",
          cards: [
            {
              name: "광합성 = 스스로 양분 만들기",
              color: "#12B886",
              art: p3MiniArt("leafSun"),
              text: "광합성은 식물이 <b>빛에너지</b>를 이용해 스스로 <b>양분을 만드는</b> 과정이에요.",
              examples: ["동물 = 먹어서 얻기", "식물 = 만들어서 얻기", "재료: 이산화 탄소 + 물"],
              more: "<b class='rm-h'>왜 대단한 일일까요?</b>동물은 다른 생물을 먹어야만 양분을 얻지만, 식물은 빛·이산화 탄소·물이라는 흔한 재료로 양분을 <b>직접 만들어요</b>. 지구의 거의 모든 생물이 먹는 양분을 거슬러 올라가면 결국 식물의 광합성에 닿죠 — 그래서 식물을 생태계의 '생산자'라고 불러요.<b class='rm-h'>만화의 세 과학자, 한 줄씩</b>반 헬몬트는 <b>흙이 아니라는 것</b>(물이 재료)을, 프리스틀리는 <b>공기를 되살린다는 것</b>(산소 방출)을, 잉엔하우스는 <b>빛이 있어야 한다는 것</b>을 밝혔어요. 세 조각을 합치면 광합성의 얼개가 완성되죠.<b class='rm-h'>헷갈리지 마세요</b>'광합성 = 숨쉬기'가 아니에요. 광합성은 <b>양분을 만드는</b> 과정이고, 만든 양분을 분해해 에너지를 꺼내는 과정은 따로 있어요(뒤 레슨에서 만나요!).<span class='fun'><b>알고 있나요?</b> 반 헬몬트의 버드나무 실험은 5년짜리였어요 — 과학사에서 손꼽히게 인내심이 필요했던 실험이죠. 그동안 그가 한 일은 물 주기뿐!</span>",
            },
            {
              name: "장소는 엽록체",
              color: "#2F9E44",
              art: p3MiniArt("chloroGrain"),
              text: "광합성은 식물세포 속 <b>엽록체</b>에서 일어나요. 엽록체 속 초록 색소 <b>엽록소</b>가 빛에너지를 흡수하죠.",
              examples: ["초록 알갱이 = 엽록체", "엽록소 = 빛 잡는 색소", "잎이 초록인 이유"],
              more: "<b class='rm-h'>엽록체와 엽록소, 뭐가 달라요?</b><b>엽록체</b>는 세포 속 초록 <b>알갱이(장소)</b>이고, <b>엽록소</b>는 그 알갱이 속에 든 초록 <b>색소(물질)</b>예요. 엽록소가 빛에너지를 흡수해 주기 때문에 엽록체에서 광합성이 일어날 수 있죠. '체'는 장소, '소'는 색소 — 끝 글자로 기억해요.<b class='rm-h'>추적 장면 기억나요?</b>잎을 확대하니 초록이 세포 전체가 아니라 <b>알갱이들</b>에만 몰려 있었죠? 그 알갱이가 엽록체예요. 현미경으로 검정말 잎을 보면 세포마다 초록 알갱이가 오글오글 들어 있답니다.<b class='rm-h'>시험에서는</b>'광합성이 일어나는 장소'를 물으면 답은 <b>식물세포의 엽록체</b>. '빛에너지를 흡수하는 색소'를 물으면 <b>엽록소</b>예요. 두 용어를 바꿔 쓰면 오답!<span class='fun'><b>알고 있나요?</b> 바다달팽이 엘리시아는 먹은 조류의 엽록체를 제 몸에 붙잡아 두고 광합성 양분을 얻어요 — 그래서 몸이 점점 초록색이 된답니다.</span>",
            },
            {
              name: "재료 셋, 산물 둘",
              color: "#F59F00",
              art: p3MiniArt("inOut"),
              text: "<b>빛에너지 + 이산화 탄소 + 물</b> → <b>포도당 + 산소</b>. 포도당은 곧 <b>녹말</b>로 바뀌어 저장돼요.",
              examples: ["이산화 탄소 → 기공으로", "물 → 뿌리에서 물관으로", "산소 → 기공으로 배출"],
              more: "<b class='rm-h'>재료가 들어오는 길</b><b>이산화 탄소</b>는 잎의 작은 구멍 <b>기공</b>으로 들어와요. <b>물</b>은 뿌리에서 흡수되어 <b>물관</b>이라는 관을 타고 잎까지 올라오죠. 재료마다 들어오는 길이 달라요 — '물도 기공으로 들어온다'는 함정에 걸리지 마세요.<b class='rm-h'>산물이 나가는 길</b>만들어진 <b>포도당</b>은 곧 물에 녹지 않는 <b>녹말</b>로 바뀌어 엽록체에 잠시 저장돼요. 함께 생긴 <b>산소</b>는 기공으로 빠져나가 우리가 마시는 공기가 되죠.<b class='rm-h'>시험에서는</b>'광합성으로 <b>처음</b> 만들어지는 양분'은 녹말이 아니라 <b>포도당</b>이에요. 녹말은 포도당이 <b>바뀐 저장 형태</b>라는 점, 순서를 꼭 구분하세요.<span class='fun'><b>알고 있나요?</b> 숲이 도시보다 산소 농도가 높은 것도 이 때문이에요 — 수많은 잎이 매일 산소를 뿜어내고 있거든요.</span>",
            },
          ],
          cta: "문제 풀기",
        }),
        binSort({
          title: "광합성 공장,<br>입구와 출구를 나눠요",
          lead: "광합성이라는 공장에 <b>들어가는 것</b>과 공장에서 <b>나오는 것</b>을 나눠 봐요.",
          instruction: "카드를 끌어서 알맞은 통에 넣어요.",
          bins: [
            { id: "in", label: "공장에 들어가요", color: "#12B886", hint: "재료" },
            { id: "out", label: "공장에서 나와요", color: "#F59F00", hint: "산물" },
          ],
          items: [
            { label: "빛에너지", bin: "in" },
            { label: "이산화 탄소", bin: "in" },
            { label: "물", bin: "in" },
            { label: "포도당", bin: "out" },
            { label: "산소", bin: "out" },
          ],
          explainGood: "완벽해요! 들어가는 재료는 <b>빛에너지·이산화 탄소·물</b> 셋, 나오는 산물은 <b>포도당·산소</b> 둘이에요.",
          explainBad: "숨쉬기와 헷갈리면 방향이 뒤집혀요 — 광합성에서는 <b>이산화 탄소가 들어가고 산소가 나온답니다</b>. 재료 셋(빛에너지·이산화 탄소·물), 산물 둘(포도당·산소)로 기억해요.",
        }),
        mcq({
          prompt: "그림은 광합성 과정을 나타낸 거예요. ㉠에 들어갈 물질로 옳은 것은?",
          figure: psFlowFig({ blanks: ["co2"] }),
          options: ["이산화 탄소", "산소", "녹말", "질소", "수증기"],
          answer: 0,
          explainGood: "맞아요! 빛에너지·물과 함께 엽록체로 들어가는 재료 — <b>이산화 탄소</b>예요. 주로 잎의 기공으로 들어오죠.",
          explainBad: "㉠은 화살표가 엽록체를 <b>향해 들어가는</b> 쪽이에요. 산소는 나오는 산물이고, 들어가는 기체 재료는 <b>이산화 탄소</b>랍니다.",
        }),
        mcq({
          prompt: "광합성으로 <b>처음</b> 만들어지는 양분은 무엇일까요?",
          options: ["포도당", "녹말", "설탕", "단백질", "지방"],
          answer: 0,
          explainGood: "정확해요! 광합성으로 처음 만들어지는 양분은 <b>포도당</b> — 곧 녹말로 바뀌어 엽록체에 저장되죠.",
          explainBad: "녹말은 포도당이 <b>바뀐 저장 형태</b>예요. 광합성에서 처음 태어나는 양분은 <b>포도당</b>이고, 그 포도당이 곧 녹말로 바뀐답니다.",
        }),
        ox({
          prompt: "광합성에 필요한 물은 잎의 기공을 통해 식물 안으로 들어와요.",
          answer: false,
          explainGood: "잘 잡아냈어요! 물은 <b>뿌리에서 흡수되어 물관</b>을 타고 잎까지 올라와요. 기공으로 드나드는 건 이산화 탄소와 산소 같은 <b>기체</b>죠.",
          explainBad: "기공은 <b>기체</b>의 문이에요. 물은 뿌리에서 흡수되어 <b>물관</b>을 타고 잎까지 올라온답니다 — 재료마다 들어오는 길이 달라요.",
        }),
        mcq({
          prompt: "잎이 초록색으로 보이는 까닭과 관련해, 빛에너지를 흡수하는 초록 색소의 이름은?",
          options: ["엽록소", "엽록체", "기공", "물관", "녹말"],
          answer: 0,
          explainGood: "맞아요! <b>엽록소</b>는 엽록체 안에 들어 있는 초록 색소로, 광합성에 필요한 빛에너지를 흡수해요.",
          explainBad: "엽록<b>체</b>는 광합성이 일어나는 <b>장소(알갱이)</b>이고, 그 속의 초록 <b>색소</b>가 엽록<b>소</b>예요. 빛에너지를 흡수하는 건 색소인 <b>엽록소</b>랍니다.",
        }),
        multi({
          prompt: "광합성에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
          options: [
            "식물세포의 엽록체에서 일어난다",
            "빛에너지를 이용하는 과정이다",
            "산소를 재료로 사용한다",
            "밤에 가장 활발하게 일어난다",
          ],
          answer: [0, 1],
          explainGood: "완벽해요! 광합성은 <b>엽록체</b>에서, <b>빛에너지</b>를 이용해 일어나요. 산소는 재료가 아니라 <b>산물</b>이고, 빛이 없는 밤엔 일어나지 않죠.",
          explainBad: "산소는 광합성의 <b>재료가 아니라 산물</b>이에요. 그리고 광합성은 빛에너지가 필요하니 <b>빛이 있는 낮</b>에 일어나죠. 옳은 것은 '엽록체에서'와 '빛에너지 이용' 둘이랍니다.",
        }),
      ],
    }),
    lesson({
      id: "g2u5l2", unitId: "g2u5",
      title: "빛을 받은 잎의 비밀",
      subtitle: "센서와 아이오딘으로 잡는 광합성의 증거",
      label: "확인 실험", icon: "flask", minutes: 10, standard: "책 174~175쪽",
      doneNote: "빛을 받은 잎만 이산화 탄소를 쓰고, 산소를 내놓고, 녹말을 남겨요",
      steps: [],
    }),
    lesson({
      id: "g2u5l3", unitId: "g2u5",
      title: "광합성의 조건 맞추기",
      subtitle: "빛·이산화 탄소·온도, 세 개의 다이얼",
      label: "환경요인", icon: "bulb", minutes: 9, standard: "책 176~181쪽",
      doneNote: "셋 다 '알맞을 때' 최대 — 온도는 지나치면 오히려 뚝",
      steps: [],
    }),
    lesson({
      id: "g2u5l4", unitId: "g2u5",
      title: "에너지를 꺼내는 숨, 호흡",
      subtitle: "양분을 분해해 에너지를 얻는 과정",
      label: "호흡", icon: "bolt", minutes: 9, standard: "책 182~185쪽",
      premium: true,
      doneNote: "호흡은 낮에도 밤에도, 모든 세포에서 계속돼요",
      steps: [],
    }),
    lesson({
      id: "g2u5l5", unitId: "g2u5",
      title: "낮의 잎, 밤의 잎",
      subtitle: "광합성과 호흡이 맞물리는 하루",
      label: "낮과 밤", icon: "swap", minutes: 9, standard: "책 184~185쪽",
      premium: true,
      doneNote: "기체의 방향은 광합성량과 호흡량의 크기 비교로 정해져요",
      steps: [],
    }),
    lesson({
      id: "g2u5l6", unitId: "g2u5",
      title: "양분의 저장과 이용",
      subtitle: "고구마의 살은 잎이 보낸 선물",
      label: "양분의 여행", icon: "route", minutes: 10, standard: "책 186~197쪽",
      premium: true,
      doneNote: "녹말은 설탕이 되어 체관을 타고, 필요한 곳 어디로든",
      steps: [],
    }),
  ],
};
