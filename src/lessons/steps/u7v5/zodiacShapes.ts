// 황도 12궁의 이름과 별자리 그림(정본 steps/zodiacRing.ts에서 옮겨 적었다. 정본 파일은 고치지 않는다).
// index i = (i+1)월에 태양 쪽에 있는 별자리
export const ZODIAC = ["궁수", "염소", "물병", "물고기", "양", "황소", "쌍둥이", "게", "사자", "처녀", "천칭", "전갈"];

// 별자리 스틱 그림: 꼭짓점이 별, 선이 이어진 모양(간략화한 성좌선).
// 좌표는 0..1 정규화, l = 잇는 별 인덱스 쌍.
const SHAPES: Record<string, { p: [number, number][]; l: [number, number][] }> = {
  궁수: { // 주전자(teapot) 모양
    p: [[0.32, 0.45], [0.58, 0.42], [0.66, 0.62], [0.34, 0.66], [0.45, 0.28], [0.78, 0.3], [0.18, 0.52]],
    l: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1], [1, 5], [0, 6], [6, 3]],
  },
  염소: { // 웃는 입꼬리 삼각(고전 모양)
    p: [[0.18, 0.35], [0.35, 0.55], [0.55, 0.62], [0.75, 0.5], [0.82, 0.32]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  물병: { // 물결 두 줄
    p: [[0.2, 0.38], [0.35, 0.28], [0.5, 0.38], [0.65, 0.28], [0.8, 0.38], [0.2, 0.65], [0.35, 0.55], [0.5, 0.65], [0.65, 0.55], [0.8, 0.65]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  물고기: { // V자 끈 + 양 끝 물고기 고리
    p: [[0.22, 0.3], [0.37, 0.5], [0.5, 0.64], [0.63, 0.5], [0.78, 0.3], [0.14, 0.24], [0.26, 0.18], [0.86, 0.24], [0.74, 0.18]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 0], [4, 7], [7, 8], [8, 4]],
  },
  양: { // 완만한 호 끝이 꺾인 뿔
    p: [[0.15, 0.58], [0.4, 0.44], [0.65, 0.4], [0.85, 0.5], [0.8, 0.66]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  황소: { // V자 얼굴 + 긴 뿔
    p: [[0.14, 0.2], [0.42, 0.52], [0.5, 0.68], [0.58, 0.52], [0.86, 0.16]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  쌍둥이: { // 나란한 두 사람
    p: [[0.32, 0.2], [0.32, 0.5], [0.3, 0.8], [0.64, 0.18], [0.66, 0.5], [0.68, 0.8]],
    l: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4]],
  },
  게: { // 거꾸로 된 Y
    p: [[0.5, 0.26], [0.5, 0.52], [0.28, 0.74], [0.72, 0.74]],
    l: [[0, 1], [1, 2], [1, 3]],
  },
  사자: { // 낫(갈기) + 꼬리 삼각
    p: [[0.24, 0.32], [0.33, 0.2], [0.44, 0.24], [0.47, 0.4], [0.37, 0.5], [0.55, 0.6], [0.8, 0.54], [0.74, 0.74]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 5]],
  },
  처녀: { // Y + 치맛자락
    p: [[0.3, 0.18], [0.46, 0.4], [0.66, 0.24], [0.5, 0.56], [0.34, 0.76], [0.62, 0.78]],
    l: [[0, 1], [2, 1], [1, 3], [3, 4], [3, 5]],
  },
  천칭: { // 저울 삼각 + 다리
    p: [[0.5, 0.24], [0.26, 0.48], [0.74, 0.48], [0.3, 0.74], [0.7, 0.74]],
    l: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]],
  },
  전갈: { // 길게 휘는 꼬리와 독침
    p: [[0.18, 0.24], [0.28, 0.4], [0.34, 0.56], [0.44, 0.7], [0.6, 0.76], [0.74, 0.7], [0.8, 0.56], [0.72, 0.46]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
};

/** 별자리 스틱 그림 스프라이트(고해상도 성좌 원판 + 빛번짐 별 + 주성 십자 빛살, material.color로 틴트). */
export function constellationTexture(name: string): HTMLCanvasElement {
  const S = 256;
  const pad = 28;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const shape = SHAPES[name] ?? SHAPES["게"];
  const px = (f: number): number => pad + f * (S - pad * 2);

  // 은은한 천구 성좌 메달 배경
  const bg = ctx.createRadialGradient(S / 2, S / 2, 12, S / 2, S / 2, S * 0.47);
  bg.addColorStop(0, "rgba(32, 54, 98, 0.34)");
  bg.addColorStop(0.76, "rgba(18, 32, 64, 0.22)");
  bg.addColorStop(1, "rgba(12, 22, 46, 0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.47, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(185, 215, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2);
  ctx.stroke();

  // 성좌선: 바깥 은은한 광채 + 안쪽 또렷한 선
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [w, al] of [[8.5, 0.22], [3.4, 0.78]] as const) {
    ctx.strokeStyle = `rgba(235, 245, 255, ${al})`;
    ctx.lineWidth = w;
    for (const [a, b] of shape.l) {
      ctx.beginPath();
      ctx.moveTo(px(shape.p[a][0]), px(shape.p[a][1]));
      ctx.lineTo(px(shape.p[b][0]), px(shape.p[b][1]));
      ctx.stroke();
    }
  }

  // 별: 다단 방사형 글로우 + 주성(0, 1번)은 4방향 빛살
  shape.p.forEach(([fx, fy], i) => {
    const x = px(fx);
    const y = px(fy);
    const bright = i < 2;
    const gr = bright ? 18 : 13;
    const g = ctx.createRadialGradient(x, y, 1, x, y, gr);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.32, "rgba(235, 245, 255, 0.85)");
    g.addColorStop(1, "rgba(180, 215, 255, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, gr, 0, Math.PI * 2);
    ctx.fill();

    if (bright) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      ctx.lineWidth = 1.8;
      for (const [dx, dy] of [[14, 0], [0, 14]] as const) {
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, bright ? 5.6 : 4.4, 0, Math.PI * 2);
    ctx.fill();
  });
  return cv;
}
