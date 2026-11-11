// [랩의 다른 느낌 샘플 3: 입체 모형] u2l2 cellWorkLab(동물세포) 「세포의 구조, 멈추면 어떻게 될까?」를 같은 내용, 같은 통찰로 다시 그린다.
// 정본(steps/bio6/cellWorkLab.ts)과 같은 것: 질문, 구조 카드 셋, 한 번에 하나만 멈추기, 멈춘 결과(양분이 튕겨 나감, 조절의 고리가 사라지고
//   뒤죽박죽, 에너지가 꺼짐), 양분이 끊기면 조금 뒤 에너지도 꺼지는 것, 판정 둘(증상만 보고 멈춘 구조 고르기. 이때는 회색으로 칠하지 않는다),
//   결론, 채점, 검사 표식(.bv-card[data-k], .cwk-diag).
// 다른 것은 무대뿐이다. 평면 도해 대신 손으로 돌려 볼 수 있는 입체 세포 모형(three.js)이다.
//   세포막은 선이 아니라 세포를 온통 둘러싼 막이고, 양분은 사방에서 그 막을 지나 들어온다. 핵과 마이토콘드리아는 그 안에 떠 있다.
//   가로로 끌면 모형이 돈다(세로 끌기는 화면 넘기기에 양보한다). 모형의 구조를 눌러도 카드와 같이 멈춘다.
// 규칙(SCI_GUIDE 3D 절): three는 ui/space3d를 동적 import로만 싣는다. 그리기 루프는 이 스텝의 createLoop가 갖고, cleanup에서 dispose 한다.
//   국면의 진행(멈춤, 굶음, 판정)은 타이머로만 돈다. 그리기 루프가 멈춘 환경에서도 랩은 끝까지 진행된다.
//   WebGL을 쓸 수 없는 기기에서는 정본의 평면 랩을 그대로 띄운다.
// 구조 색은 정본과 같다(bio6Kit.BV): 세포막 주황, 핵 보라, 마이토콘드리아 빨강, 양분 노랑, 에너지 파랑 번개.

import type * as T from "three";
import { createLoop, type Loop } from "../../../core/anim";
import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { BV, BV_PART } from "../../../ui/bio6Kit";
import type { SpaceStage } from "../../../ui/space3d";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCapture, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "../bio6/b6Lab";
import { cellWorkLab } from "../bio6/cellWorkLab";

interface CwkStep {
  title: string;
  mode: "animal" | "plant";
  cta?: string;
  curio?: Curio;
}

type Key = "mem" | "nuc" | "mito";
const KEYS: Key[] = ["mem", "nuc", "mito"];
// 글은 정본과 글자 하나까지 같다.
const NAME: Record<Key, string> = { mem: "세포막", nuc: "핵", mito: "마이토콘드리아" };
const JOB: Record<Key, string> = { mem: "물질 출입 조절", nuc: "생명활동 조절", mito: "에너지 만들기" };
const SAY: Record<Key, string> = {
  mem: "세포막을 멈추니 <b>양분</b>이 들어오지 못해요. 양분이 없으니 에너지도 꺼져요.",
  nuc: "핵을 멈추니 생명활동이 <b>조절</b>되지 않아 움직임이 뒤죽박죽이에요.",
  mito: "마이토콘드리아를 멈추니 <b>에너지</b>를 만들지 못해 움직임이 멎었어요.",
};

const BOLT = "M1.4 -7.4L-4.4 1.2h3.6L-2 7.4 4.4 -1.8H0.7Z";
const LEGEND = `<i class="n"></i>양분<svg viewBox="-7 -9 14 18" width="11" height="14" aria-hidden="true"><path d="${BOLT}" fill="${BV.spark}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round" paint-order="stroke"/></svg>에너지`;

/** 이 기기에서 WebGL을 쓸 수 있는가(쓸 수 없으면 평면 랩으로 물러난다). */
function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

// ── 모형의 치수(세포 반지름을 1로) ──────────────────────────────────
const NUC_POS: [number, number, number] = [0.08, 0.04, -0.05];
const NUC_R = 0.36;
/** 마이토콘드리아 셋: 자리와 누운 방향(오일러 각) */
const MITO: { p: [number, number, number]; r: [number, number, number] }[] = [
  { p: [-0.54, 0.3, 0.28], r: [0.3, 0.2, 1.1] },
  { p: [0.56, -0.26, 0.3], r: [-0.2, 0.5, -0.9] },
  { p: [-0.28, -0.46, -0.3], r: [0.15, 0.3, 0.75] },
];
/** 양분 여섯 알이 들어오는 방향(세포 바깥에서 가운데 쪽으로). 보는 쪽에서 볼 때 세포의 옆, 위, 아래다.
 *  모형을 돌려도 양분의 길은 돌지 않는다(막 밖의 양분이 세포 앞에 겹쳐 안에 든 것처럼 보이지 않게). 이름표 자리도 피했다. */
const NUTR_DIR: [number, number, number][] = [[-1, 0.12, 0.1], [1, -0.08, 0.12], [-0.45, 0.9, 0.05], [0.5, 0.86, 0.08], [-0.7, -0.7, 0.1], [0.66, -0.74, 0.06]];
/** 세포의 겉모양: 살짝 납작하고 울퉁불퉁한 공. 방향(단위 벡터)을 주면 겉까지의 점을 돌려준다. */
function surf(x: number, y: number, z: number, k = 1): [number, number, number] {
  const bump = 1 + 0.04 * Math.sin(x * 2.3 + 1.2) * Math.cos(y * 2.9) + 0.03 * Math.sin(z * 3.1 + 0.5);
  return [x * 1.1 * bump * k, y * 0.92 * bump * k, z * bump * k];
}

export const cellWorkModel: StepRenderer = (host, step, api) => {
  if (!canWebGL()) return cellWorkLab(host, step, api);
  const s = step as unknown as CwkStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: KEYS.length + 1, cls: "lsm-stage", qCls: "cwk-q" });
  host.classList.add("ls-model");

  // ── 무대: 캔버스 + 이름표 + 이끎선 ───────────────────────────────
  const canvas = el("canvas", { class: "lsm-canvas", attrs: { role: "img", "aria-label": "손으로 돌려 볼 수 있는 동물세포 입체 모형" } });
  const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  lines.setAttribute("class", "lsm-lines");
  lines.setAttribute("aria-hidden", "true");
  lines.innerHTML = KEYS.map((k) => `<g data-k="${k}"><line/><circle r="2.6"/></g>`).join("");
  const tags = {} as Record<Key, HTMLElement>;
  KEYS.forEach((k) => (tags[k] = el("div", { class: `lsm-tag ${k}`, text: NAME[k] })));
  const hint = el("div", { class: "lsm-hint", html: `<svg viewBox="0 0 22 12" width="22" height="12" aria-hidden="true"><path d="M5 2L1.5 6 5 10M17 2l3.5 4L17 10M2 6h18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>끌어서 돌리기` });
  f.stage.append(canvas, lines, tags.mem, tags.nuc, tags.mito, el("div", { class: "lsm-legend", html: LEGEND }), hint);

  // ── 상태(정본과 같다) ────────────────────────────────────────────
  let off: Key | null = null;
  let phase: "play" | "diag" | "done" = "play";
  let starve = false; // 양분이 끊겨 에너지까지 꺼진 상태
  let starveId = 0;
  let disposed = false;

  const cards = {} as Record<Key, BvCard>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("cwk-card col", { name: NAME[k], sub: "일하는 중", icon: BV_PART[k], key: k });
  });
  const diagBtn = bvBtn("main cwk-diag", "고장 난 곳 찾아보기");
  diagBtn.hidden = true;

  /** 한 구조만 멈춘다(null이면 모두 일한다). mark가 false면 카드 표시는 건드리지 않는다(판정 국면). */
  function setOff(k: Key | null, mark = true): void {
    off = k;
    tm.cancel(starveId);
    starve = false;
    // 양분이 끊기면 조금 뒤 에너지도 꺼진다. 판정 국면에서는 증상이 곧바로 보이게 기다림을 줄인다
    if (k === "mem") starveId = tm.later(() => (starve = true), phase === "diag" ? 250 : 1300);
    KEYS.forEach((x) => {
      const stopped = mark && x === k;
      cards[x].sub(stopped ? "멈춤" : cards[x].isDone() ? JOB[x] : "일하는 중");
      cards[x].el.classList.toggle("stopped", stopped);
      cards[x].el.setAttribute("aria-pressed", stopped ? "true" : "false");
    });
    host.dataset.lsmOff = k ?? "";
  }

  const allTried = (): boolean => KEYS.every((x) => cards[x].isDone());

  function toggle(k: Key): void {
    if (phase !== "play") return;
    haptic(HAPTIC.tap);
    if (off === k) {
      setOff(null);
      f.say(allTried() ? "다시 모두 일해요. 이제 <b>고장 난 곳</b>을 찾아볼 차례예요." : "다시 일해요. 다른 구조도 <b>멈춰</b> 보세요.");
      return;
    }
    setOff(k);
    f.say(SAY[k]);
    if (!cards[k].isDone()) {
      cards[k].done();
      f.pips(KEYS.filter((x) => cards[x].isDone()).length);
      if (allTried()) {
        tm.later(() => {
          diagBtn.hidden = false;
          api.setCTA("고장 난 곳을 찾아보세요", { enabled: false });
        }, 1500);
      }
    }
  }
  KEYS.forEach((k) => cards[k].el.addEventListener("click", () => toggle(k)));

  // ── 고장 난 곳 찾기(판정) ─────────────────────────────────────────
  diagBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "diag";
    host.dataset.lsmPhase = phase;
    ask1();
  });
  const namesOf = (ok: Key, others: Key[]): { t: string; ok?: boolean }[] => [{ t: NAME[ok], ok: true }, ...others.map((k) => ({ t: NAME[k] }))];
  function ask1(): void {
    setOff("mito", false);
    f.say("어딘가 고장 난 세포예요. 세포를 잘 살펴보고 <b>멈춘 구조</b>를 골라요.");
    f.slot.ask("양분은 들어오는데 에너지가 생기지 않아요. 멈춘 구조는?", namesOf("mito", ["mem", "nuc"]), (ok) => api.recordQuiz(ok), {
      why: "양분으로 에너지를 만드는 곳은 <b>마이토콘드리아</b>예요.",
      onNext: ask2,
    });
  }
  function ask2(): void {
    setOff("mem", false);
    f.say("이번에는 다른 곳이 고장 났어요. 양분 알갱이를 눈으로 따라가 봐요.");
    f.slot.ask("양분이 세포 안으로 들어오지 못해요. 멈춘 구조는?", namesOf("mem", ["nuc", "mito"]), () => undefined, {
      why: "물질이 드나드는 것을 조절하는 곳은 <b>세포막</b>이에요.",
      onNext: finish,
    });
  }
  function finish(): void {
    phase = "done";
    host.dataset.lsmPhase = phase;
    setOff(null, false);
    f.pips(KEYS.length + 1);
    f.say("고장 난 곳을 다 찾았어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("세포의 구조마다 <b>맡은 일</b>이 있어요. 한 구조가 멈추면 그 일도 멈춰요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  // ── 입체 모형(동적 로드) ─────────────────────────────────────────
  let st: SpaceStage | null = null;
  let loop: Loop | null = null;
  let ro: ResizeObserver | null = null;
  let extraDispose: (() => void) | null = null;
  let yawUser = -0.35;
  let dragging = false;

  void (async () => {
    const S = await import("../../../ui/space3d");
    if (disposed) return;
    const THREE: typeof T = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 30 });
    if (!st) {
      f.stage.classList.add("lsm-off");
      f.stage.appendChild(el("div", { class: "lsm-fail", text: "이 기기에서는 입체 모형을 켤 수 없어요. 아래 카드로 구조를 멈추고 안내 글을 읽어 주세요." }));
      return;
    }
    const stage3 = st;
    stage3.renderer.setClearColor(0x000000, 0);
    stage3.camera.position.set(0, 1.1, 4.62);
    stage3.camera.lookAt(0, -0.03, 0);
    const scene = stage3.scene;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4c6, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(-2.4, 3.2, 3.6);
    scene.add(key);

    const cell = new THREE.Group();
    scene.add(cell);
    const V = (p: [number, number, number]): T.Vector3 => new THREE.Vector3(p[0], p[1], p[2]);
    const GRAY = new THREE.Color("#8E97A6");

    // 세포의 겉모양(울퉁불퉁한 공)
    const shellGeo = new THREE.SphereGeometry(1, 56, 40);
    const pos = shellGeo.attributes.position as T.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const p = surf(pos.getX(i), pos.getY(i), pos.getZ(i));
      pos.setXYZ(i, p[0], p[1], p[2]);
    }
    shellGeo.computeVertexNormals();
    // 세포 속: 안쪽 벽(뒤쪽 면)만 그려 속이 들여다보이는 옅은 살구색 방을 만든다
    const cyto = new THREE.Mesh(shellGeo, new THREE.MeshLambertMaterial({ color: "#FFE2C2", side: THREE.BackSide, transparent: true, opacity: 0.93, depthWrite: false }));
    cyto.scale.setScalar(0.985);
    cyto.renderOrder = 1;
    cell.add(cyto);
    // 세포막: 가장자리로 갈수록 진해지는 얇은 막(앞쪽 면). 가운데는 비쳐서 속이 보인다
    const memMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(BV.mem) }, uGray: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uGray; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.9);
          // 멈춘 막은 가장자리(막이 두껍게 겹쳐 보이는 곳)만 회색이 된다. 가운데로 비치는 세포 속의 색은 그대로 둔다
          float rim = smoothstep(0.22, 0.6, f);
          vec3 c = mix(uColor, vec3(0.5, 0.53, 0.6), uGray * rim);
          gl_FragColor = vec4(c + f * 0.08, mix(0.13 * (1.0 - 0.75 * uGray), 0.96, f)); }`,
    });
    const mem = new THREE.Mesh(shellGeo, memMat);
    mem.renderOrder = 4;
    cell.add(mem);

    // 핵
    // 겉에 옅은 얼룩을 둔다(민무늬 공은 돌려도 도는 줄 모른다)
    const nucTex = (() => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 128;
      const g = c.getContext("2d") as CanvasRenderingContext2D;
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, 256, 128);
      [[40, 50, 26], [118, 84, 20], [176, 40, 30], [226, 92, 18], [84, 22, 14], [150, 108, 14]].forEach(([x, y, r]) => {
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(120,110,170,.55)");
        rg.addColorStop(1, "rgba(120,110,170,0)");
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const nucMat = new THREE.MeshStandardMaterial({ color: BV.nuc, map: nucTex, roughness: 0.42, metalness: 0.02 });
    const nucBase = new THREE.Color(BV.nuc);
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(NUC_R, 40, 28), nucMat);
    nuc.position.copy(V(NUC_POS));
    cell.add(nuc);
    // 조절의 고리(핵에서 퍼져 나간다). 늘 보는 쪽을 향한다
    const rings = [0, 1].map(() => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(NUC_R + 0.03, 0.009, 8, 56), new THREE.MeshBasicMaterial({ color: "#8B6CF6", transparent: true, opacity: 0, depthWrite: false }));
      m.renderOrder = 3;
      scene.add(m);
      return m;
    });

    // 마이토콘드리아 셋(주름 무늬가 있는 길쭉한 알)
    /** 길이를 따라 흐르는 물결 주름(카드의 그림과 같은 무늬). 둘레의 세 곳에 그려 어느 쪽에서 봐도 보인다. */
    const stripes = (body: string, line: string): T.CanvasTexture => {
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 128;
      const g = c.getContext("2d") as CanvasRenderingContext2D;
      g.fillStyle = body;
      g.fillRect(0, 0, 192, 128);
      g.strokeStyle = line;
      g.lineWidth = 7;
      g.lineCap = "round";
      g.lineJoin = "round";
      [32, 96, 160].forEach((x) => {
        g.beginPath();
        for (let y = 26; y <= 102; y += 2) {
          const px = x + 11 * Math.sin(((y - 26) / 76) * Math.PI * 4);
          if (y === 26) g.moveTo(px, y);
          else g.lineTo(px, y);
        }
        g.stroke();
      });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const mitoTex = stripes("#F25050", "#FFD1D1");
    const mitoOffTex = stripes("#8E97A6", "#C9CFD9"); // 멈춘 모습(회색). 탐색 국면에서만 쓴다
    const mitoGeo = new THREE.CapsuleGeometry(0.105, 0.25, 8, 18);
    const mitos = MITO.map((m) => {
      const mat = new THREE.MeshStandardMaterial({ map: mitoTex, roughness: 0.5, emissive: new THREE.Color("#FF4D4D"), emissiveIntensity: 0.25 });
      const mesh = new THREE.Mesh(mitoGeo, mat);
      mesh.position.copy(V(m.p));
      mesh.rotation.set(m.r[0], m.r[1], m.r[2]);
      cell.add(mesh);
      return mesh;
    });

    // 에너지(파란 번개): 마이토콘드리아마다 셋씩, 바깥으로 튀어 나가며 사라진다
    const boltTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 96;
      const g = c.getContext("2d") as CanvasRenderingContext2D;
      g.translate(48, 48);
      g.scale(5, 5);
      const p = new Path2D(BOLT);
      g.lineJoin = "round";
      g.strokeStyle = "#1558B0"; // 밝은 바탕에서도 보이게 짙은 파랑 테를 한 겹 더 두른다
      g.lineWidth = 4.2;
      g.stroke(p);
      g.strokeStyle = "#fff";
      g.lineWidth = 2.2;
      g.stroke(p);
      g.fillStyle = BV.spark;
      g.fill(p);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const sparks = MITO.flatMap((m, mi) =>
      [0, 1, 2].map((j) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: boltTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
        sp.renderOrder = 6;
        cell.add(sp);
        // 핵에서 멀어지는 쪽으로, 셋이 조금씩 다른 방향
        const out = V(m.p).sub(V(NUC_POS)).normalize();
        const side = new THREE.Vector3(Math.sin(j * 2.1 + mi), Math.cos(j * 2.1 + mi * 1.7), Math.sin(j * 1.3 + 2)).multiplyScalar(0.75);
        return { sp, mi, dir: out.add(side).normalize(), ph: (j * 0.34 + mi * 0.21) % 1 };
      }),
    );

    // 양분 여섯 알
    const nutrGeo = new THREE.SphereGeometry(0.052, 16, 12);
    const nutrMat = new THREE.MeshStandardMaterial({ color: BV.nutr, roughness: 0.35, emissive: new THREE.Color("#8A6A00"), emissiveIntensity: 0.35 });
    const nutr = NUTR_DIR.map((d, i) => {
      const dir = V(d).normalize();
      const p0 = V(surf(dir.x, dir.y, dir.z, 1.36)); // 무대 안에서 출발한다(가장자리에 걸려 잘리지 않게)
      const pm = V(surf(dir.x, dir.y, dir.z, 1.0));
      const pb = V(surf(dir.x, dir.y, dir.z, 1.1));
      const mesh = new THREE.Mesh(nutrGeo, nutrMat);
      scene.add(mesh); // 세포를 따라 돌지 않는다
      return { mesh, dir, p0, pm, pb, ti: 0, target: new THREE.Vector3(), pile: new THREE.Vector3(), ph: (i * 0.168) % 1 };
    });

    // 세포 속에서 떠다니는 작은 알갱이(살아 움직이는 느낌. 에너지가 꺼지면 멎는다)
    const jigGeo = new THREE.SphereGeometry(0.024, 10, 8);
    const jigMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 });
    const jigs = [[0.3, 0.42, 0.3], [0.5, 0.18, -0.25], [-0.1, 0.55, -0.1], [-0.55, -0.1, -0.2], [0.2, -0.55, 0.2], [0.1, -0.2, 0.6], [-0.3, 0.1, 0.62], [0.62, 0.3, 0.1], [-0.6, 0.38, -0.3]].map((b, i) => {
      const mesh = new THREE.Mesh(jigGeo, jigMat);
      cell.add(mesh);
      return { mesh, b: V(b as [number, number, number]), a: 1.1 + (i % 4) * 0.37, c: i * 1.9 };
    });

    // ── 이름표의 이끎선: 이름표의 끝점은 고정, 가리키는 점은 모형을 따라간다 ──
    const lineOf = (k: Key): { line: SVGLineElement; dot: SVGCircleElement } => {
      const g = lines.querySelector(`g[data-k="${k}"]`) as SVGGElement;
      return { line: g.querySelector("line") as SVGLineElement, dot: g.querySelector("circle") as SVGCircleElement };
    };
    const LN = { mem: lineOf("mem"), nuc: lineOf("nuc"), mito: lineOf("mito") };
    let W = 346;
    let H = 230;
    const tagEnd = {} as Record<Key, [number, number]>;
    const fit = (): void => {
      W = f.stage.clientWidth || 346;
      H = f.stage.clientHeight || 230;
      stage3.resize(W, H);
      lines.setAttribute("viewBox", `0 0 ${W} ${H}`);
      KEYS.forEach((k) => {
        const t = tags[k];
        const left = t.offsetLeft < W / 2;
        tagEnd[k] = [left ? t.offsetLeft + t.offsetWidth : t.offsetLeft, t.offsetTop + t.offsetHeight / 2];
      });
    };
    fit();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(fit);
      ro.observe(f.stage);
    }
    const tmp = new THREE.Vector3();
    const toPx = (v: T.Vector3): [number, number] => {
      tmp.copy(v).project(stage3.camera);
      return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H];
    };
    const setLine = (k: Key, x: number, y: number): void => {
      const [ex, ey] = tagEnd[k];
      const L = LN[k];
      L.line.setAttribute("x1", ex.toFixed(1));
      L.line.setAttribute("y1", ey.toFixed(1));
      L.line.setAttribute("x2", x.toFixed(1));
      L.line.setAttribute("y2", y.toFixed(1));
      L.dot.setAttribute("cx", x.toFixed(1));
      L.dot.setAttribute("cy", y.toFixed(1));
    };

    // ── 손으로 돌리기와 누르기 ───────────────────────────────────
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let moved = 0;
    let downAt = 0;
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      downX = lastX = e.clientX;
      downY = e.clientY;
      moved = 0;
      downAt = performance.now();
      bvCapture(canvas, e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      yawUser += dx * 0.0115;
      if (moved > 8) f.stage.classList.add("turned");
    });
    const up = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      if (moved > 8 || performance.now() - downAt > 600) return;
      // 누르기: 모형에서 맨 앞에 맞은 구조를 멈춘다(속 구조가 아니면 세포막)
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, stage3.camera);
      const inner = ray.intersectObjects([nuc, ...mitos], false)[0];
      if (inner) toggle(inner.object === nuc ? "nuc" : "mito");
      else if (ray.intersectObject(mem, false).length) toggle("mem");
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", () => (dragging = false));

    // ── 그리기 ───────────────────────────────────────────────────
    let time = 0;
    let lifeT = 0; // 살아 움직이는 시간(에너지가 꺼지면 멈춘다)
    let jigT = 0;
    let act = 1; // 에너지가 도는 정도(0~1)
    let ringFx = 1;
    const gray = { mem: 0, nuc: 0, mito: 0 };
    const lerp3 = (a: T.Vector3, b: T.Vector3, t: number, out: T.Vector3): T.Vector3 => out.copy(a).lerp(b, t);
    const ease = (x: number): number => x * x * (3 - 2 * x);
    const nucWorld = new THREE.Vector3();
    const mitoWorld = new THREE.Vector3();
    let mitoPick = 0;

    loop = createLoop((dtN) => {
      const dt = Math.min(0.05, dtN * 0.0167);
      time += dt;
      const dead = off === "mito" || starve;
      const chaos = off === "nuc";
      act += ((dead ? 0 : 1) - act) * Math.min(1, dt * 5);
      ringFx += ((chaos ? 0 : 1) - ringFx) * Math.min(1, dt * 8);
      lifeT += dt * act;
      jigT += dt * (chaos ? 5.5 : 1) * act;

      // 모형: 가만히 두어도 조금씩 좌우로 돈다. 뒤죽박죽일 때는 떤다
      cell.rotation.y = yawUser + (dragging ? 0 : 1) * 0.16 * Math.sin(time * 0.5);
      cell.scale.setScalar(1 + 0.014 * Math.sin(lifeT * 2.4));
      cell.position.set(chaos ? 0.014 * Math.sin(time * 52) : 0, chaos ? 0.011 * Math.sin(time * 61) : 0, 0);

      // 멈춘 구조는 회색이 된다(판정 국면에서는 색으로 드러내지 않는다)
      (KEYS as Key[]).forEach((k) => {
        const to = off === k && phase === "play" ? 1 : 0;
        gray[k] += (to - gray[k]) * Math.min(1, dt * 7);
      });
      memMat.uniforms.uGray.value = gray.mem;
      nucMat.color.copy(nucBase).lerp(GRAY, gray.nuc);
      mitos.forEach((m) => {
        const mat = m.material as T.MeshStandardMaterial;
        const tex = gray.mito > 0.5 ? mitoOffTex : mitoTex;
        if (mat.map !== tex) mat.map = tex;
        mat.emissiveIntensity = (0.2 + 0.16 * Math.sin(lifeT * 4.5)) * act * (1 - gray.mito);
      });

      // 양분: 막을 지난 뒤에는 그때 가장 가까이 있는 마이토콘드리아로 간다(모형이 돌면 가는 곳도 따라 바뀐다)
      nutr.forEach((n, i) => {
        if (n.ph < 0.45) {
          // 막을 지나기 전에만 갈 곳을 고른다(가는 도중에 바꾸면 길이 꺾인다)
          let bestD = 1e9;
          mitos.forEach((m, mi) => {
            m.getWorldPosition(mitoWorld);
            const dd = mitoWorld.distanceTo(n.pm);
            if (dd < bestD) {
              bestD = dd;
              n.ti = mi;
            }
          });
        }
        mitos[n.ti].getWorldPosition(n.target);
        n.pile.copy(n.target).addScaledVector(n.dir, 0.17 + (i % 3) * 0.03);
        const speed = chaos ? (i % 2 ? 1 / 7 : 1 / 1.5) : off === "mem" ? 1 / 2.4 : 1 / 3.7;
        if (off === "mito") n.ph = Math.min(0.9, n.ph + dt * speed);
        else n.ph = (n.ph + dt * speed) % 1;
        let sc = 1;
        if (off === "mem") {
          // 세포막 바로 바깥에서 튕겨 돌아간다
          const u = n.ph < 0.5 ? n.ph * 2 : (1 - n.ph) * 2;
          lerp3(n.p0, n.pb, ease(u), n.mesh.position);
        } else if (n.ph < 0.45) {
          lerp3(n.p0, n.pm, n.ph / 0.45, n.mesh.position);
        } else if (n.ph < 0.9) {
          lerp3(n.pm, off === "mito" ? n.pile : n.target, ease((n.ph - 0.45) / 0.45), n.mesh.position);
        } else if (off === "mito") {
          n.mesh.position.copy(n.pile); // 쓰이지 못하고 쌓인다
        } else {
          n.mesh.position.copy(n.target);
          sc = 1 - (n.ph - 0.9) / 0.1;
        }
        n.mesh.scale.setScalar(Math.max(0.01, sc));
      });

      // 에너지 번개
      sparks.forEach((sp) => {
        const cyc = chaos ? [0.42, 0, 2.9][sp.mi] : 1.4;
        const on = cyc > 0 ? act : 0;
        if (cyc > 0) sp.ph = (sp.ph + dt / cyc) % 1;
        const p = sp.ph;
        const m = MITO[sp.mi].p;
        sp.sp.position.set(m[0] + sp.dir.x * (0.13 + 0.36 * p), m[1] + sp.dir.y * (0.13 + 0.36 * p), m[2] + sp.dir.z * (0.13 + 0.36 * p));
        (sp.sp.material as T.SpriteMaterial).opacity = on * Math.pow(Math.sin(Math.PI * p), 0.6);
        sp.sp.scale.setScalar(0.15 + 0.1 * p);
      });

      // 조절의 고리
      nuc.getWorldPosition(nucWorld);
      rings.forEach((r, j) => {
        const p = (time / 2.4 + j * 0.5) % 1;
        r.position.copy(nucWorld);
        r.quaternion.copy(stage3.camera.quaternion);
        r.scale.setScalar(1 + 1.0 * p);
        (r.material as T.MeshBasicMaterial).opacity = (1 - p) * (1 - p) * 0.7 * ringFx;
      });

      // 떠다니는 알갱이
      jigs.forEach((j) => {
        j.mesh.position.set(j.b.x + 0.05 * Math.sin(jigT * j.a + j.c), j.b.y + 0.05 * Math.sin(jigT * j.a * 1.31 + j.c * 2), j.b.z + 0.05 * Math.cos(jigT * j.a * 0.83 + j.c));
      });

      // 이끎선
      const [nx, ny] = toPx(nucWorld);
      setLine("nuc", nx + 16, ny - 14);
      // 세포막: 화면에서 본 세포의 왼쪽 위 가장자리
      const [cx, cy] = toPx(tmp.set(0, 0, 0));
      const [rx] = toPx(tmp.set(1.1, 0, 0).applyQuaternion(stage3.camera.quaternion));
      const R = Math.abs(rx - cx);
      setLine("mem", cx - R * 0.95, cy - R * 0.27);
      // 마이토콘드리아: 가장 앞에 나와 있는 것(조금 더 앞선 것이 생길 때만 갈아탄다)
      let best = mitoPick;
      let bestZ = -1e9;
      mitos.forEach((m, i) => {
        m.getWorldPosition(mitoWorld);
        const z = mitoWorld.z + mitoWorld.x * 0.5 - mitoWorld.y * 0.5 + (i === mitoPick ? 0.25 : 0);
        if (z > bestZ) {
          bestZ = z;
          best = i;
        }
      });
      mitoPick = best;
      mitos[mitoPick].getWorldPosition(mitoWorld);
      const [mx, my] = toPx(mitoWorld);
      setLine("mito", mx, my);

      stage3.render();
    }).start();
    extraDispose = () => {
      mitoTex.dispose();
      mitoOffTex.dispose();
    };
    f.stage.classList.add("ready");
    host.dataset.lsmReady = "1";
  })();

  f.slot.setControls(bvCards(KEYS.length, ...KEYS.map((k) => cards[k])), diagBtn);
  host.dataset.lsmOff = "";
  host.dataset.lsmPhase = phase;
  f.say("살아 움직이는 동물세포예요. 아래에서 구조를 하나 골라 <b>멈춰</b> 보세요.");
  api.setCTA("세 구조를 하나씩 멈춰 보세요", { enabled: false });
  return () => {
    disposed = true;
    tm.clear();
    ro?.disconnect();
    loop?.stop();
    extraDispose?.();
    st?.dispose();
  };
};
