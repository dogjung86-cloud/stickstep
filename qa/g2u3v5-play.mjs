// 중2 Ⅲ v5 검사: 도입 장면과 랩을 실제로 조작하는 길. check-g2u3v5.mjs가 쓴다.
// 랩은 스텝 요소의 data-lx-lab 으로, 도입은 data-opn-scene 으로 고른다. wrong이 참이면 그 랩의 채점 판정에서 한 번 틀려 본다.

// ── 도입 ──
export const OPENERS = {
  "g2u3-town": async ({ page, L, check }) => {
    check("거울 숙이기 1", await L.tapK(page, "down", 700));
    check("거울 숙이기 2", await L.tapK(page, "down", 700));
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
};
