// 중2 Ⅲ v5 검사: 도입 장면과 랩을 실제로 조작하는 길. check-g2u3v5.mjs가 쓴다.
// 랩은 스텝 요소의 data-lx-lab 으로, 도입은 data-opn-scene 으로 고른다. wrong이 참이면 그 랩의 채점 판정에서 한 번 틀려 본다.

// ── 도입 ──
export const OPENERS = {
  "g2u3-town": async ({ page, L, check }) => {
    check("거울 숙이기 1", await L.tapK(page, "down", 700));
    check("거울 숙이기 2", await L.tapK(page, "down", 700));
  },
  "g2u3-straw": async ({ page, L }) => {
    await L.hold(page, '[data-k="pour"]', 500);
    await L.hold(page, '[data-k="pour"]', 1700);
  },
  "g2u3-dark": async ({ page, L }) => {
    await L.tapK(page, "stare", 2100);
    await L.tapK(page, "torch", 400);
  },
  "g2u3-cat": async ({ page, L }) => {
    for (let i = 0; i < 3; i++) await L.tapK(page, "step", 600);
  },
  "g2u3-spoon": async ({ page, L }) => {
    await L.tapK(page, "in", 500);
    await L.tapK(page, "out", 500);
  },
  "g2u3-dots": async ({ page, L }) => {
    await L.hold(page, '[data-k="back"]', 1900);
  },
  "g2u3-float": async ({ page }) => {
    await page.evaluate(() => document.querySelector(".screen.active .opn-g2u3-hit")?.click());
    await page.waitForTimeout(2600);
  },
  "g2u3-kalimba": async ({ page, L }) => {
    await L.tapK(page, "long", 700);
    await L.tapK(page, "short", 700);
  },
};

/** 거울과 렌즈 관찰: 두 종류에서 가까울 때와 멀 때를 적는다. */
const curve = (tag) => async (c, wrong) => {
  const { page, L, check } = c;
  // 멀리 둔 채 '가까울 때' 칸을 누르면 적히지 않는다
  await L.setRange(page, 18);
  await L.tapK(page, "near");
  check(`${tag} 잘못 누르면 적히지 않음`, (await L.ds(page, "lxN")) == null);
  await c.fit(`${tag} 잘못 적기`);
  for (const dev of ["cvx", "ccv"]) {
    await L.tapK(page, dev);
    await L.setRange(page, 3);
    await L.W(page, 200);
    await L.tapK(page, "near");
    if (dev === "ccv") await c.shot(`${tag}-near`);
    await L.setRange(page, 18);
    await L.W(page, 200);
    await L.tapK(page, "far");
    await c.shot(`${tag}-${dev}-far`);
  }
  await c.fit(`${tag} 네 칸`);
  await c.judge(tag, wrong);
  await c.done(tag);
};

// ── 랩 ──
export const LABS = {
  reflect: async (c, wrong) => {
    const { page, L, check } = c;
    for (const v of [4, 8, 12]) {
      await L.setRange(page, v);
      await L.W(page, 150);
      await L.tapK(page, "rec");
    }
    check("세 번 기록하면 과녁 국면", await L.waitDs(page, "lx", "aim"));
    await c.fit("reflect 과녁");
    // 일부러 빗나가게 한 번
    await L.setRange(page, 3);
    await L.tapK(page, "rec", 600);
    await c.fit("reflect 빗나감");
    await c.shot("reflect-missshot");
    const target = Number(await L.ds(page, "lxTarget"));
    await L.setRange(page, target / 5);
    await L.tapK(page, "rec", 400);
    check("과녁 명중", (await L.ds(page, "lx")) === "hit");
    await c.shot("reflect-hit");
    await c.judge("reflect", wrong);
    await c.done("reflect");
  },
  rough: async (c, wrong) => {
    const { page, L, check } = c;
    await L.tapK(page, "rough");
    for (const v of [70, 130, 190, 250]) {
      await L.setRange(page, v);
      await L.W(page, 120);
    }
    await c.fit("rough 닿는 자리");
    await c.shot("rough-probe");
    check("다섯 줄기 버튼이 열림", await L.tapK(page, "five", 500));
    await c.shot("rough-five");
    await L.tapK(page, "flat");
    await L.tapK(page, "five", 300);
    await c.fit("rough 다섯 줄기");
    await c.judge("rough", wrong);
    await c.done("rough");
  },
  tank: async (c, wrong) => {
    const { page, L, check } = c;
    await L.tapK(page, "fire", 400);
    await c.shot("tank-nothing");
    await L.tapK(page, "smoke", 400);
    await c.fit("tank 연기만");
    await c.shot("tank-smoke");
    await L.tapK(page, "milk", 400);
    await L.tapK(page, "dark", 400);
    check("준비가 끝나면 재는 국면", await L.waitDs(page, "lx", "measure"));
    await L.W(page, 300);
    await c.fit("tank 재기");
    for (const v of [2, 4, 6]) {
      await L.setRange(page, v);
      await L.W(page, 150);
      await L.tapK(page, "rec");
    }
    await c.shot("tank-measure");
    await c.judge("tank", wrong);
    await c.done("tank");
  },
  coin: async (c, wrong) => {
    const { page, L, check } = c;
    await L.setRange(page, 30);
    await L.W(page, 300);
    await c.fit("coin 물이 낮을 때");
    await c.shot("coin-low");
    await L.setRange(page, 92);
    await L.W(page, 300);
    check("물을 부으면 동전이 보임", (await L.ds(page, "lxSee")) === "1");
    check("자리 보기 버튼", await L.tapK(page, "ghost", 600));
    await c.fit("coin 떠오른 자리");
    await c.shot("coin-ghost");
    await c.judge("coin", wrong);
    await c.done("coin");
  },
  path: async (c, wrong) => {
    const { page, L, check } = c;
    // 틀린 방향(눈에서 책으로)을 먼저 그려 본다
    await L.tapK(page, "eye");
    await L.tapK(page, "obj");
    await L.tapK(page, "send", 500);
    await c.fit("path 틀린 화살표");
    await c.shot("path-bad");
    await L.tapK(page, "clear");
    await L.tapK(page, "lamp");
    await L.tapK(page, "obj");
    await L.tapK(page, "obj");
    await L.tapK(page, "eye");
    await L.tapK(page, "send", 500);
    await c.shot("path-room");
    check("책이 보이면 어항으로", await L.waitDs(page, "lx", "tank"));
    await L.W(page, 300);
    await L.tapK(page, "lamp");
    await L.tapK(page, "obj");
    await L.tapK(page, "obj");
    await L.tapK(page, "eye");
    await c.fit("path 어항 그리기");
    await L.tapK(page, "send", 700);
    await c.shot("path-tank");
    await c.judge("path", wrong);
    await c.done("path");
  },
  half: async (c, wrong) => {
    const { page, L, check } = c;
    const moveB = async (to) => {
      for (let i = 0; i < 8; i++) {
        const b = Number(await L.ds(page, "lxB"));
        if (b === to) return;
        await L.tapK(page, b > to ? "bL" : "bR", 120);
      }
    };
    // 보통 거울로는 맞출 수 없다
    await L.tapK(page, "plain");
    await L.tapK(page, "confirm", 400);
    await c.fit("half 보통 거울");
    await c.shot("half-plain");
    await L.tapK(page, "half");
    // 어긋난 채 확인
    await L.tapK(page, "confirm", 400);
    await c.shot("half-off");
    await moveB(Number(await L.ds(page, "lxA")));
    await L.tapK(page, "confirm", 400);
    await c.fit("half 겹침");
    await c.shot("half-ok");
    await L.tapK(page, "aL", 150);
    await L.tapK(page, "aL", 150);
    await moveB(Number(await L.ds(page, "lxA")));
    await L.tapK(page, "confirm", 400);
    check("두 번 기록하면 판정", await L.waitDs(page, "lx", "ask"));
    await c.judge("half", wrong);
    await c.done("half");
  },
  extend: async (c, wrong) => {
    const { page, L } = c;
    for (const v of [110, 150, 200]) {
      await L.setRange(page, v);
      await L.W(page, 150);
      await L.tapK(page, "keep", 300);
    }
    await c.fit("extend 연장선 셋");
    await c.shot("extend-three");
    await c.judge("extend", wrong);
    await c.done("extend");
  },
  mirror: curve("mirror"),
  lens: curve("lens"),
  use: async (c, wrong) => {
    const { page, L } = c;
    await L.tapK(page, "plane", 400);
    await c.fit("use 평면거울");
    await c.shot("use-plane");
    await L.tapK(page, "concave", 400);
    await L.tapK(page, "convex", 500);
    await c.shot("use-convex");
    await c.judge("use", wrong);
    await c.done("use");
  },
  lamp: async (c, wrong) => {
    const { page, L } = c;
    await L.tapK(page, "w", 400);
    await L.tapK(page, "r", 400);
    await c.fit("lamp 빨간 조명");
    await c.shot("lamp-red");
    await L.tapK(page, "g", 400);
    await c.judge("lamp", wrong);
    await c.done("lamp");
  },
  torch: async (c, wrong) => {
    const { page, L } = c;
    await L.tapK(page, "r");
    await L.tapK(page, "g", 400);
    await c.fit("torch 두 빛");
    await c.shot("torch-rg");
    await L.tapK(page, "b", 400);
    await c.shot("torch-rgb");
    await L.tapK(page, "g", 300);
    await L.tapK(page, "r", 300);
    await L.tapK(page, "g", 300);
    await c.fit("torch 네 칸");
    await c.judge("torch", wrong);
    await c.done("torch");
  },
  pixel: async (c, wrong) => {
    const { page, L, check } = c;
    for (const k of ["r", "g", "b"]) await L.tapK(page, k, 350);
    await c.shot("pixel-look");
    check("세 부분을 보면 만들기 국면", await L.waitDs(page, "lx", "make"));
    await L.W(page, 300);
    // 틀린 조합으로 한 번
    await L.tapK(page, "r");
    await L.tapK(page, "b");
    await L.tapK(page, "confirm", 400);
    await c.fit("pixel 어긋남");
    await c.shot("pixel-wrong");
    await L.tapK(page, "b");
    await L.tapK(page, "g");
    await L.tapK(page, "confirm", 400);
    await c.shot("pixel-yellow");
    await L.W(page, 2700);
    for (const k of ["r", "g", "b"]) await L.tapK(page, k, 200);
    await L.tapK(page, "confirm", 400);
    await c.judge("pixel", wrong);
    await c.done("pixel");
  },
  ball: async (c, wrong) => {
    const { page, L, check } = c;
    // 예측(정오 없음)
    check("ball 예측이 뜸", await L.waitAsk(page));
    await c.fit("ball 예측");
    await L.answer(page, true);
    check("ball 예측 뒤 조작", await L.waitDs(page, "lx", "play"));
    await L.W(page, 300);
    const calm = () => L.waitFor(page, () => document.querySelector(".screen.active .step")?.dataset.lxBusy === "0", null, 120);
    // 겹치게 두 번 눌러 본다(기록되지 않는다)
    await L.tapK(page, "press", 700);
    await L.tapK(page, "press", 500);
    await c.fit("ball 겹친 물결");
    await c.shot("ball-dirty");
    await calm();
    await L.tapK(page, "press", 1300);
    await c.shot("ball-wave");
    await calm();
    await L.setRange(page, 270);
    await L.tapK(page, "press", 300);
    await calm();
    await c.judge("ball", wrong);
    await c.done("ball");
  },
  wave: async (c, wrong) => {
    const { page, L, check } = c;
    await L.tapK(page, "2", 400);
    await c.fit("wave 진폭 2칸");
    await L.tapK(page, "3", 400);
    check("진폭 3칸이면 다음 주문", await L.waitDs(page, "lx", "len"));
    await c.shot("wave-amp");
    // 흔드는 횟수 버튼은 둘째 줄이다
    const tapF = (k) => page.evaluate((k) => [...document.querySelectorAll(`.screen.active .step .g2u3x-segs`)][1]?.querySelector(`[data-k="${k}"]`)?.click(), k);
    await tapF("2");
    await L.W(page, 400);
    await c.fit("wave 마루 사이 4칸");
    await tapF("4");
    await L.W(page, 500);
    await c.shot("wave-len");
    await c.judge("wave", wrong);
    await c.done("wave");
  },
  sound: async (c, wrong) => {
    const { page, L, check } = c;
    // 두 가지를 한꺼번에 바꾸면 기록되지 않는다
    await L.tapK(page, "power");
    await L.tapK(page, "bar");
    await L.tapK(page, "rec", 400);
    check("두 가지를 바꾸면 기록 안 됨", (await L.ds(page, "lx")) === "set");
    await c.fit("sound 두 가지");
    await c.shot("sound-two");
    await L.tapK(page, "bar");
    const one = async (pick, bad) => {
      await L.tapK(page, "rec", 300);
      if (bad) {
        await L.tapK(page, bad, 300);
        await c.fit("sound 잘못 고름");
      }
      await L.tapK(page, pick, 400);
    };
    await one("amp", "freq");
    await c.shot("sound-amp");
    await L.tapK(page, "power");
    await L.tapK(page, "bar");
    await one("freq");
    await c.shot("sound-freq");
    await L.tapK(page, "bar");
    await L.tapK(page, "inst");
    await L.tapK(page, "hear", 200);
    await one("shape");
    await c.shot("sound-shape");
    await c.judge("sound", wrong);
    await c.done("sound");
  },
};
