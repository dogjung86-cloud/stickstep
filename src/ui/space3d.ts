// space3d — VII 단원(태양계) 공용 three.js 킷.
//   · 이 모듈은 three를 정적 import하므로, 스텝 렌더러에서는 반드시
//     `await import("../../ui/space3d")`로 **동적 로드**한다(초기 번들에서 분리).
//   · 행성 재질: 절차적 캔버스 텍스처를 즉시 입혀 두고, 실사 텍스처
//     (public/textures/, Solar System Scope CC BY 4.0)가 로드되면 바꿔 끼운다
//     — 네트워크·파일 유무와 무관하게 무대가 비지 않는다.
//   · dispose() 규율: 지오메트리·재질·텍스처 해제 + forceContextLoss (meta.ts와 동일 철학).
//   · DPR 캡 1.75, rAF 루프는 스텝 쪽 createLoop가 소유한다(여기서는 render()만 제공).

import * as THREE from "three";

export { THREE };

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const texLoader = new THREE.TextureLoader();

/** 실사 텍스처 비동기 로드. 성공 시 onLoad, 실패는 조용히 무시(절차적 유지).
 *  씬마다 새 Texture를 만들어 dispose()가 안전하다(HTTP 캐시 덕에 재로드는 저렴). */
function loadPhotoTexture(file: string, onLoad: (tex: THREE.Texture) => void): void {
  texLoader.load(
    `${base}textures/${file}`,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      onLoad(tex);
    },
    undefined,
    () => {
      /* 실사 없으면 절차적 텍스처 유지 */
    },
  );
}

export interface SpaceStage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  resize(w: number, h: number): void;
  render(): void;
  dispose(): void;
}

/** WebGL 씬 셋업. 실패(컨텍스트 불가) 시 null — 호출부가 2D 폴백을 그린다. */
export function createSpaceStage(canvas: HTMLCanvasElement, o?: { fov?: number }): SpaceStage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o?.fov ?? 42, 1, 0.1, 4000);

  function resize(w: number, h: number): void {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function dispose(): void {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
      const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
      for (const m of mats) {
        const tex = (m as { map?: THREE.Texture }).map;
        if (tex) tex.dispose();
        m.dispose();
      }
    });
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return { scene, camera, renderer, resize, render: () => renderer.render(scene, camera), dispose };
}

// ── 절차적 텍스처 ────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 값 노이즈(타일 없음, 텍스처용으론 충분). */
function makeNoise(seed: number): (x: number, y: number) => number {
  const rand = mulberry32(seed);
  const g: number[] = [];
  for (let i = 0; i < 256; i++) g.push(rand());
  const at = (ix: number, iy: number): number => g[((ix * 73 + iy * 149) & 255) >>> 0];
  const sm = (t: number): number => t * t * (3 - 2 * t);
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = sm(x - ix);
    const fy = sm(y - iy);
    const a = at(ix, iy);
    const b = at(ix + 1, iy);
    const c = at(ix, iy + 1);
    const d = at(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

function fbm(n: (x: number, y: number) => number, x: number, y: number, oct = 4): number {
  let v = 0;
  let amp = 0.5;
  for (let i = 0; i < oct; i++) {
    v += amp * n(x, y);
    x *= 2.03;
    y *= 2.03;
    amp *= 0.5;
  }
  return v;
}

export type PlanetKind =
  | "mercury" | "venus" | "earth" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune"
  | "moon" | "sun";

/** 512×256 등장방형 절차 텍스처. */
export function planetTexture(kind: PlanetKind): THREE.CanvasTexture {
  const W = 512;
  const H = 256;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const n = makeNoise(kind.length * 97 + kind.charCodeAt(0) * 13);

  const bands = (stops: [number, string][], wobble: number, streak: number): void => {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    for (const [p, c] of stops) grad.addColorStop(p, c);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // 위도 밴드 흔들림 + 노이즈 스트릭
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const wob = Math.sin((x / W) * Math.PI * 4 + y * 0.06) * wobble + fbm(n, x * 0.02, y * 0.05) * streak;
        const sy = Math.max(0, Math.min(H - 1, Math.round(y + wob)));
        if (sy !== y) {
          const si = (sy * W + x) * 4;
          const di = (y * W + x) * 4;
          d[di] = d[si];
          d[di + 1] = d[si + 1];
          d[di + 2] = d[si + 2];
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    // 미세 명암 그레인
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const v = fbm(n, x * 0.05, y * 0.05);
      ctx.fillStyle = v > 0.55 ? "rgba(255,255,255,.045)" : "rgba(0,0,0,.05)";
      ctx.fillRect(x, y, 2.2, 1.2);
    }
  };

  const craters = (count: number, base: string, dark: string, lite: string): void => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 2200; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const v = fbm(n, x * 0.03, y * 0.03);
      ctx.fillStyle = v > 0.52 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)";
      ctx.fillRect(x, y, 3, 2);
    }
    const rnd = mulberry32(7);
    for (let i = 0; i < count; i++) {
      const x = rnd() * W;
      const y = H * 0.12 + rnd() * H * 0.76;
      const r = 2.5 + rnd() * rnd() * 14;
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lite;
      ctx.lineWidth = Math.max(1, r * 0.18);
      ctx.beginPath();
      ctx.arc(x, y, r, -Math.PI * 0.9, Math.PI * 0.15);
      ctx.stroke();
    }
  };

  switch (kind) {
    case "mercury":
      craters(46, "#8E8A88", "rgba(74,70,72,.55)", "rgba(214,208,204,.5)");
      break;
    case "moon":
      craters(40, "#9AA0A8", "rgba(84,88,96,.5)", "rgba(226,230,236,.5)");
      // 바다(어두운 얼룩)
      for (const [mx, my, mr] of [[150, 90, 46], [260, 120, 38], [90, 150, 30], [380, 80, 34]] as const) {
        ctx.fillStyle = "rgba(96,102,114,.4)";
        ctx.beginPath();
        ctx.ellipse(mx, my, mr, mr * 0.7, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "venus":
      bands(
        [[0, "#E9CD8C"], [0.3, "#E2B96B"], [0.52, "#EFD9A0"], [0.74, "#DCAF62"], [1, "#E7C784"]],
        9,
        16,
      );
      break;
    case "earth": {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#8FB8E8");
      grad.addColorStop(0.18, "#2E6FD4");
      grad.addColorStop(0.55, "#1D5DC4");
      grad.addColorStop(0.85, "#2E6FD4");
      grad.addColorStop(1, "#A8CBEE");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // 대륙
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x += 1) {
          const v = fbm(n, x * 0.016, y * 0.03, 5);
          if (v > 0.58) {
            const g = v > 0.66 ? "#7CA65A" : "#5E9A52";
            ctx.fillStyle = g;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      // 극지방 얼음
      ctx.fillStyle = "rgba(240,248,255,.92)";
      ctx.fillRect(0, 0, W, 14);
      ctx.fillRect(0, H - 14, W, 14);
      // 구름
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * W;
        const y = 20 + Math.random() * (H - 40);
        const v = fbm(n, x * 0.01 + 40, y * 0.02 + 40);
        if (v > 0.5) {
          ctx.fillStyle = "rgba(255,255,255,.5)";
          ctx.beginPath();
          ctx.ellipse(x, y, 10 + v * 22, 3 + v * 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "mars": {
      ctx.fillStyle = "#C05B3C";
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x += 2) {
          const v = fbm(n, x * 0.02, y * 0.035, 5);
          if (v > 0.6) {
            ctx.fillStyle = "rgba(92,44,30,.5)";
            ctx.fillRect(x, y, 2, 1);
          } else if (v < 0.36) {
            ctx.fillStyle = "rgba(238,158,110,.4)";
            ctx.fillRect(x, y, 2, 1);
          }
        }
      }
      // 극관
      ctx.fillStyle = "rgba(246,250,255,.95)";
      ctx.beginPath();
      ctx.ellipse(W * 0.5, 6, W * 0.34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H - 6, W * 0.3, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "jupiter":
      bands(
        [
          [0, "#D8C2A0"], [0.14, "#C39A6C"], [0.24, "#EADFC6"], [0.34, "#B57B50"],
          [0.46, "#E6D2AC"], [0.56, "#C08A5C"], [0.68, "#EFE3C8"], [0.8, "#C7A276"], [1, "#D9C4A2"],
        ],
        6,
        13,
      );
      // 대적점
      ctx.fillStyle = "#C4553E";
      ctx.beginPath();
      ctx.ellipse(W * 0.68, H * 0.63, 26, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,226,196,.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(W * 0.68, H * 0.63, 30, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "saturn":
      bands(
        [[0, "#EBDDB4"], [0.2, "#DEC694"], [0.42, "#F0E4C0"], [0.6, "#D9BE8A"], [0.82, "#EEDFB6"], [1, "#E4D2A2"]],
        5,
        9,
      );
      break;
    case "uranus":
      bands([[0, "#BFEDEF"], [0.4, "#8FD8DD"], [0.7, "#7CCFD6"], [1, "#A8E4E8"]], 3, 5);
      break;
    case "neptune":
      bands([[0, "#5F86E8"], [0.35, "#3D63D2"], [0.62, "#2F53BE"], [1, "#4A72DC"]], 4, 8);
      // 대흑점
      ctx.fillStyle = "rgba(22,42,110,.85)";
      ctx.beginPath();
      ctx.ellipse(W * 0.4, H * 0.42, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "sun": {
      const g2 = ctx.createLinearGradient(0, 0, 0, H);
      g2.addColorStop(0, "#FFCF5E");
      g2.addColorStop(0.5, "#FFB13A");
      g2.addColorStop(1, "#FFCF5E");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
      // 쌀알 무늬(그래뉼) — 1px 샘플로 부드럽게(확대해도 계단 없음)
      for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
          const v = fbm(n, x * 0.045, y * 0.045, 5);
          if (v > 0.56) {
            ctx.fillStyle = `rgba(255,238,190,${(0.18 + (v - 0.56) * 1.6).toFixed(2)})`;
            ctx.fillRect(x, y, 1, 1);
          } else if (v < 0.42) {
            ctx.fillStyle = `rgba(206,112,26,${(0.16 + (0.42 - v) * 1.3).toFixed(2)})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      break;
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** 행성 구체(램버트 재질 — 태양광 명암이 위상·낮밤을 그대로 만든다).
 *  절차적 텍스처로 즉시 그리고, 실사 텍스처가 도착하면 바꿔 끼운다. */
export function makePlanet(kind: PlanetKind, radius: number, segments = 48): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, segments, Math.round(segments * 0.66));
  const mat =
    kind === "sun"
      ? new THREE.MeshBasicMaterial({ map: planetTexture("sun") })
      : new THREE.MeshLambertMaterial({ map: planetTexture(kind) });
  const mesh = new THREE.Mesh(geo, mat);
  loadPhotoTexture(`${kind}.jpg`, (tex) => {
    const m = mat as THREE.MeshLambertMaterial;
    m.map?.dispose();
    m.map = tex;
    m.needsUpdate = true;
  });
  return mesh;
}

/** 토성·천왕성 고리 — UV를 반지름 방향으로 재배치해 줄무늬 텍스처를 두른다. */
export function makeRing(inner: number, outer: number, tone: "saturn" | "faint"): THREE.Mesh {
  const geo = new THREE.RingGeometry(inner, outer, 96, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 8;
  const ctx = cv.getContext("2d")!;
  const rnd = mulberry32(tone === "saturn" ? 11 : 29);
  for (let x = 0; x < 256; x++) {
    const t = x / 256;
    const gap = (t > 0.6 && t < 0.68) || (t > 0.86 && t < 0.9);
    const a = gap ? 0.05 : 0.28 + rnd() * 0.5 * Math.sin(t * Math.PI);
    ctx.fillStyle =
      tone === "saturn" ? `rgba(226,206,158,${a.toFixed(3)})` : `rgba(190,220,228,${(a * 0.5).toFixed(3)})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, depthWrite: false });
  if (tone === "saturn") {
    // 실사 고리 스트립(가로축 = 반지름) — UV가 이미 반지름 방향이라 그대로 맞는다
    loadPhotoTexture("saturn_ring.png", (ptex) => {
      mat.map?.dispose();
      mat.map = ptex;
      mat.needsUpdate = true;
    });
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** 발광 스프라이트(태양 글로우·플레어). */
export function makeGlow(size: number, color: string, inner = 0.18): THREE.Sprite {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,.95)");
  g.addColorStop(inner, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.setScalar(size);
  return sp;
}

/** 별배경 — 구면 랜덤 분포 발광점. */
export function makeStars(count: number, radius: number): THREE.Points {
  const rnd = mulberry32(2024);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = s * Math.cos(th) * radius;
    pos[i * 3 + 1] = u * radius;
    pos[i * 3 + 2] = s * Math.sin(th) * radius;
    const warm = rnd();
    const b = 0.55 + rnd() * 0.45;
    col[i * 3] = b * (warm > 0.8 ? 1 : 0.85);
    col[i * 3 + 1] = b * 0.9;
    col[i * 3 + 2] = b * (warm < 0.2 ? 1 : 0.92);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  return new THREE.Points(geo, mat);
}

/** 은하수 배경 구 — 실사 텍스처(stars.jpg)를 안쪽 면에. 로드 전엔 투명(별 포인트가 채운다). */
export function makeMilkyWay(radius: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 48, 30);
  const mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  loadPhotoTexture("stars.jpg", (tex) => {
    mat.map = tex;
    mat.opacity = 0.55;
    mat.needsUpdate = true;
  });
  return mesh;
}

/** 이름 라벨 스프라이트(캔버스 텍스트, 알약 배경). scale은 월드 단위. */
export function makeLabel(text: string, o?: { size?: number; color?: string }): THREE.Sprite {
  const H = 88;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `800 ${H * 0.46}px Pretendard, sans-serif`;
  const W = Math.ceil(probe.measureText(text).width + H * 0.9);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  ctx.font = `800 ${H * 0.46}px Pretendard, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(10,18,36,.62)";
  ctx.beginPath();
  ctx.roundRect(2, H * 0.14, W - 4, H * 0.72, H * 0.36);
  ctx.fill();
  ctx.strokeStyle = "rgba(140,165,215,.4)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = o?.color ?? "#E4EDFF";
  ctx.fillText(text, W / 2, H * 0.52);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
  const sp = new THREE.Sprite(mat);
  const s = o?.size ?? 2.6;
  sp.scale.set((s * W) / H, s, 1);
  sp.renderOrder = 5;
  return sp;
}

/** 궤도 링(가는 선). */
export function makeOrbitLine(radius: number, color = "#5E7CA8", opacity = 0.4, segments = 128): THREE.Line {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geo, mat);
}
