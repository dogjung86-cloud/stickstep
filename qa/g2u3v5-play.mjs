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
};
