// Ⅳ 물질의 구성 그림 공용 도우미(밑줄 파일이라 빌드가 그림으로 치지 않는다).
// 입자 색과 상대 크기는 앱의 chemKit ELEMS와 같다(수소 흰색, 탄소 짙은 회색, 산소 빨강, 헬륨 옅은 하늘, 구리 주황 갈색 등).
export const ELEM = {
  H: { rgb: [232, 238, 246], r: 9, bounce: "#DCE6F2" },
  C: { rgb: [84, 94, 108], r: 13, bounce: "#C9D2DE" },
  N: { rgb: [62, 110, 196], r: 12.5, bounce: "#D0DDF7" },
  O: { rgb: [230, 58, 44], r: 12, bounce: "#FFD8D2" },
  Cl: { rgb: [62, 186, 88], r: 14.5, bounce: "#D3F9D8" },
  Na: { rgb: [150, 98, 224], r: 15, bounce: "#E5DBFF" },
  Cu: { rgb: [216, 132, 74], r: 15, bounce: "#FFE3CC" },
  He: { rgb: [150, 222, 236], r: 10, bounce: "#E3F8FC" },
};
export const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** 공 하나(입체 구, 왼쪽 위 빛). fog: 0~1 뒤쪽일수록 바탕색으로 스민다. */
export function ball(t, P, x, y, r, el, o = {}) {
  const e = ELEM[el];
  let rgb = e.rgb;
  if (el === "H") rgb = [222, 229, 239]; // 흰 바탕 위에서도 공이 읽히게 아주 조금 어둡게
  if (o.fog) rgb = rgb.map((v, k) => v + ((o.fogTo ?? [236, 240, 245])[k] - v) * o.fog);
  P.sphere(t, x, y, r, hexOf(rgb), { spec: o.spec ?? 0.5, gloss: o.gloss ?? 30, rim: 0.2, bounce: e.bounce, wrap: 0.3, ambient: el === "H" ? 0.16 : 0.2 });
}

/** 앞 공이 뒤 공에 드리우는 접촉 그늘(공을 그리기 직전에, 그 공 자리 아래쪽에) */
export function contact(t, P, x, y, r, a = 0.3) {
  const { ctx } = t;
  ctx.save();
  ctx.fillStyle = P.rg(ctx, x + r * 0.12, y + r * 0.18, r * 0.82, x + r * 0.12, y + r * 0.18, r * 1.3, [[0, `rgba(30,28,45,${a})`], [1, "rgba(30,28,45,0)"]]);
  ctx.beginPath();
  ctx.arc(x + r * 0.12, y + r * 0.18, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 분자(공 여러 개): atoms = [{ el, x, y, z }], 뒤(z 작은 것)부터 그린다. */
export function molecule(t, P, atoms, o = {}) {
  const list = atoms.slice().sort((a, b) => a.z - b.z);
  list.forEach((a, i) => {
    const r = ELEM[a.el].r * (o.scale ?? 1);
    if (i > 0 || o.shadowFirst) contact(t, P, a.x, a.y, r, o.contact ?? 0.26);
    ball(t, P, a.x, a.y, r, a.el, { fog: a.fog ?? o.fog ?? 0 });
  });
}

/** 투명한 유리 상자(앞면 + 깊이). back()으로 뒤 모서리와 바닥을, front()로 앞 유리와 반짝임을 그린다. */
export function glassBox(t, P, x, y, w, h, dx = 14, dy = -10) {
  const { ctx } = t;
  const back = () => {
    P.dropShadow(t, (c) => P.rrect(c, x, y + dy * 0 + 2, w + dx, h, 8), { dx: 2, dy: 6, blur: 12, a: 0.13 });
    // 상자 안(아주 옅은 유리빛)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, x, y, x + w, y + h, [[0, "rgba(245,250,255,.92)"], [1, "rgba(226,236,246,.92)"]]);
    ctx.fill();
    ctx.restore();
    // 뒤 모서리(옅은 선)
    ctx.save();
    ctx.strokeStyle = "rgba(120,140,165,.38)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx, y + h + dy);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.moveTo(x + dx, y + h + dy);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    ctx.restore();
  };
  const front = () => {
    ctx.save();
    // 윗면과 오른쪽 옆면 모서리
    ctx.strokeStyle = "rgba(96,118,146,.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x + w + dx, y + dy);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
    // 앞면 유리: 테두리와 왼쪽 위 반짝임
    ctx.strokeStyle = "rgba(84,104,132,.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 10);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x + w * 0.55, y + 4);
    ctx.stroke();
    ctx.fillStyle = P.lg(ctx, x, y, x + w * 0.5, y + h * 0.5, [[0, "rgba(255,255,255,.28)"], [1, "rgba(255,255,255,0)"]]);
    ctx.fillRect(x, y, w, h);
    // 윗면 유리 결
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  return { back, front };
}
