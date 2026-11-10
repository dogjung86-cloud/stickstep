// 인물 시트: 만화용(얼굴 없음)과 표정 있는 변형이 한 식구로 보이는지 눈으로 확인한다.
// 맨 아래 줄은 고를 수 있는 안(현행 캐릭터에 가까운 민머리 쌤).
// 실행: node qa/sketch/sheet-characters.mjs [출력 png]
import { Sk, C, qmark } from "./lib/sk.mjs";
import { drawFigure, pose, TEACHER, KID, LIND, SAILOR_A, SAILOR_B } from "./lib/figure.mjs";
import { shotHtml, close } from "./lib/shot.mjs";

const out = process.argv[2] ?? "qa/shots/sketch-characters.png";
const cell = (fn, w = 250, h = 330) => { const sk = new Sk(w, h, { id: "c" + Math.random().toString(36).slice(2, 6) }); fn(sk); return sk.svg(); };
const fig = (o, P = pose(), extra) => cell(sk => { drawFigure(sk, 125, 318, 0.5, P, o); if (extra) extra(sk); });
const wave = pose({ elL: [-100, -344], haL: [-158, -432], tilt: -0.05 });
const think = pose({ elR: [54, -292], haR: [24, -350], tilt: 0.06 });
const SICK = { skin: C.skinSick, handL: C.skinSick, handR: C.skinSick };

const rows = [
  { title: "만화 (얼굴 없음): 머리 모양, 모자, 옷으로 구분", items: [
    ["스틱맨 쌤", fig(TEACHER, wave)], ["제임스 린드", fig(LIND, think, sk => qmark(sk, 206, 60, 0.5, { color: C.teal }))],
    ["선원 (머릿수건)", fig(SAILOR_A)], ["선원 (털모자)", fig(SAILOR_B)], ["아픈 선원", fig({ ...SAILOR_A, ...SICK }, pose({ neck: [14, -338], head: [40, -424], tilt: 0.3 }))],
  ] },
  { title: "스플래시, 원형 스틱맨, 로그인 그림 (표정 있음): 같은 얼굴에 표정을 켠 모습", items: [
    ["쌤 웃음", fig({ ...TEACHER, face: "smile" })], ["쌤 놀람", fig({ ...TEACHER, face: "wide" })], ["쌤 궁금", fig({ ...TEACHER, face: "curious" }, pose({ tilt: 0.1 }))],
    ["주인공 신남", fig({ ...KID, face: "happy" })], ["주인공 공부하자!", fig({ ...KID, face: "determined", band: true })],
  ] },
  { title: "고를 수 있는 안: 현행 캐릭터처럼 민머리에 안경만", items: [
    ["민머리 쌤 (만화용)", fig({ ...TEACHER, hair: "bald" }, wave)], ["민머리 쌤 웃음", fig({ ...TEACHER, hair: "bald", face: "smile" })],
    ["민머리 주인공 신남", fig({ ...KID, hair: "bald", face: "happy" })], ["민머리 공부하자!", fig({ ...KID, hair: "bald", face: "determined", band: true })],
  ] },
];
const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#F3F5F8;font:15px/1.4 "Malgun Gothic",sans-serif;color:#1E2A38}
  .wrap{padding:24px 28px} h1{font-size:22px;margin:0 0 14px} h2{font-size:16px;margin:18px 0 8px;color:#0B7A6E}
  .row{display:flex;gap:12px} .c{width:250px} .f{background:#fff;border:1px solid #D0D5DD;border-radius:12px;overflow:hidden;height:330px}
  .f svg{width:250px;height:330px;display:block} .l{text-align:center;font-size:13px;color:#667085;margin-top:4px}
</style><div class="wrap"><h1>인물 한눈에 보기</h1>${rows.map(r => `<h2>${r.title}</h2><div class="row">${r.items.map(([l, s]) => `<div class="c"><div class="f">${s}</div><div class="l">${l}</div></div>`).join("")}</div>`).join("")}</div>`;
await shotHtml(html, out, 1370, 1260, 1.5);
await close();
console.log("saved", out);
