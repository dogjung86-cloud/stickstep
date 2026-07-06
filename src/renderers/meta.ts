// MetaRenderer — WebGL 메타볼(프로토타입 B안, 확정 렌더러).
// FRAG 셰이더는 sample/renderer-comparison.html의 원본을 수치 그대로 이식했다.
//   rMul = 1.04 + 0.20·sol - 0.48·gas · threshold 1.0 · soft mix(.30,.09,sol)
//   조명 L=(-0.5,-0.65,0.58) · specular pow 26+42·sol · ice grain vnoise(ps*7)+glint(ps*13)^14
//   기체는 field를 안개(mist)로 변환. uniform 색 3종(core/deep/glow)은 palette.thermalColors.
// 볼 개수 상한 48 — 시뮬 count는 48 이하로 만들 것.

import { thermalColors } from "./palette";
import type { MatterRenderer } from "./types";
import type { MatterSim } from "../engine/matterSim";

export const MAX_BALLS = 48;

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2  u_res;
uniform float u_dpr;
uniform int   u_count;
uniform vec3  u_balls[${MAX_BALLS}];
uniform float u_sol;
uniform float u_gas;
uniform vec3  u_cCore;
uniform vec3  u_cDeep;
uniform vec3  u_cGlow;

float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 q){
  vec2 i = floor(q), f = fract(q);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, u_res.y * u_dpr - gl_FragCoord.y) / u_dpr;
  float S = 60.0;
  vec2 ps = p / S;
  float liq = clamp(1.0 - u_sol - u_gas, 0.0, 1.0);
  float rMul = 1.04 + 0.20 * u_sol - 0.48 * u_gas;

  float field = 0.0;
  vec2 grad = vec2(0.0);
  for(int i = 0; i < ${MAX_BALLS}; i++){
    if(i >= u_count) break;
    vec3 b = u_balls[i];
    vec2 d = ps - b.xy / S;
    float r = b.z * rMul / S;
    float k = r * r * 0.06;
    float d2 = dot(d, d) + k;
    float c = (r * r) / d2;
    field += c;
    grad += (-2.0 * c / d2) * d;
  }

  float th = 1.0;
  float soft = mix(0.30, 0.09, u_sol);
  float surf = smoothstep(th - soft, th + soft, field);

  vec3 N = normalize(vec3(-grad, 6.0));
  vec3 L = normalize(vec3(-0.5, -0.65, 0.58));
  float dif = max(dot(N, L), 0.0);
  float spePow = 26.0 + 42.0 * u_sol;
  float spe = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), spePow);

  float depth = clamp((field - th) / 3.0, 0.0, 1.0);
  vec3 body = mix(u_cCore, u_cDeep, depth * 0.92);
  body *= 0.60 + 0.55 * dif;
  float rim = (1.0 - smoothstep(th, th + 0.9, field)) * surf;
  body += u_cGlow * rim * (0.30 + 0.45 * liq);
  body += vec3(1.0) * spe * (0.45 + 0.50 * liq + 0.35 * u_sol);

  float iceM = u_sol * surf;
  float grain = vnoise(ps * 7.0);
  float glint = pow(vnoise(ps * 13.0 + 3.7), 14.0);
  body = mix(body, body * (0.78 + 0.55 * grain) + vec3(1.0) * glint * 1.6, iceM * 0.85);
  body += vec3(0.10, 0.16, 0.24) * iceM * 0.55;

  float halo = smoothstep(0.10, th, field) * (1.0 - surf);
  vec3 colS = body * surf + u_cGlow * halo * halo * 0.35;
  float aS = min(1.0, surf + halo * halo * 0.30);

  float mist = smoothstep(0.14, 1.7, field);
  vec3 colG = (u_cGlow * 0.75 + u_cCore * 0.45) * mist;
  float aG = mist * 0.80;

  vec3 colF = mix(colS, colG, u_gas);
  float aF = mix(aS, aG, u_gas);
  gl_FragColor = vec4(colF, aF);
}
`;

interface Uniforms {
  res: WebGLUniformLocation | null;
  dpr: WebGLUniformLocation | null;
  count: WebGLUniformLocation | null;
  balls: WebGLUniformLocation | null;
  sol: WebGLUniformLocation | null;
  gas: WebGLUniformLocation | null;
  cCore: WebGLUniformLocation | null;
  cDeep: WebGLUniformLocation | null;
  cGlow: WebGLUniformLocation | null;
}

export class MetaRenderer implements MatterRenderer {
  readonly kind = "meta" as const;
  readonly canvas: HTMLCanvasElement;
  ok = false;
  private gl: WebGLRenderingContext | null = null;
  private u: Uniforms | null = null;
  private ballBuf = new Float32Array(MAX_BALLS * 3);
  private dpr = 1;
  private w = 0;
  private h = 0;
  /** 컨텍스트 유실(기기 절전 등) 시 스테이지가 Dot으로 갈아타도록 알림. */
  onContextLost: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const opts: WebGLContextAttributes = { alpha: true, premultipliedAlpha: true, antialias: false };
    const gl =
      (canvas.getContext("webgl", opts) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl", opts) as WebGLRenderingContext | null);
    this.gl = gl;
    if (!gl) return;
    const vs = this.compile(gl.VERTEX_SHADER, VERT);
    const fs = this.compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("metaball link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    // 풀스크린 트라이앵글
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {
      res: gl.getUniformLocation(prog, "u_res"),
      dpr: gl.getUniformLocation(prog, "u_dpr"),
      count: gl.getUniformLocation(prog, "u_count"),
      balls: gl.getUniformLocation(prog, "u_balls"),
      sol: gl.getUniformLocation(prog, "u_sol"),
      gas: gl.getUniformLocation(prog, "u_gas"),
      cCore: gl.getUniformLocation(prog, "u_cCore"),
      cDeep: gl.getUniformLocation(prog, "u_cDeep"),
      cGlow: gl.getUniformLocation(prog, "u_cGlow"),
    };
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    canvas.addEventListener("webglcontextlost", this.handleLost);
    this.ok = true;
    this.resize();
  }

  private handleLost = (e: Event): void => {
    e.preventDefault();
    this.ok = false;
    this.onContextLost?.();
  };

  private compile(type: number, src: string): WebGLShader | null {
    const gl = this.gl!;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("metaball shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  resize(): void {
    // WebGL은 DPR을 1.75로 캡 — 셰이더가 픽셀 단위라 고해상도 비용이 가파르다(프로토타입 확정값).
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
    if (this.ok && this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(sim: MatterSim): void {
    if (!this.ok || !this.gl || !this.u) return;
    const gl = this.gl;
    const { sol, gas } = sim.phases();
    const n = Math.min(sim.parts.length, MAX_BALLS);
    for (let i = 0; i < n; i++) {
      const p = sim.parts[i];
      this.ballBuf[i * 3] = p.x;
      this.ballBuf[i * 3 + 1] = p.y;
      this.ballBuf[i * 3 + 2] = sim.o.r;
    }
    const { core, deep, glow } = thermalColors(sim.T, sol);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.u.res, this.w, this.h);
    gl.uniform1f(this.u.dpr, this.dpr);
    gl.uniform1i(this.u.count, n);
    gl.uniform3fv(this.u.balls, this.ballBuf);
    gl.uniform1f(this.u.sol, sol);
    gl.uniform1f(this.u.gas, gas);
    gl.uniform3f(this.u.cCore, core[0], core[1], core[2]);
    gl.uniform3f(this.u.cDeep, deep[0], deep[1], deep[2]);
    gl.uniform3f(this.u.cGlow, glow[0], glow[1], glow[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** 브라우저 컨텍스트 개수 제한에 안 걸리게, 스텝 이탈 시 컨텍스트를 즉시 반납한다. */
  dispose(): void {
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    if (this.gl) {
      const ext = this.gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    }
    this.ok = false;
    this.gl = null;
    this.u = null;
  }
}
