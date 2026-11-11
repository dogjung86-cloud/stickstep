// 도입 샘플 그림 빌드: qa/sketch/scenes/intro-u2.mjs → src/ui/introArt.generated.ts
// 실행: node qa/sketch/build-intro.mjs
// 만화 빌드(build.mjs)와 따로 돈다. 만화는 정적 SVG 파일을 <img>로 싣고, 도입 그림은 문서에 직접 넣어
// 묶음(<g class>)을 CSS와 코드로 움직여야 해서 SVG 문자열을 표로 뽑는다. 표는 도입 스텝이 열릴 때만 내려받는다.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as S from "./scenes/intro-u2.mjs";
import * as REST from "./scenes/intro-u2-rest.mjs"; // Ⅱ단원 나머지 다섯 장면
import * as U1 from "./scenes/intro-u1.mjs"; // 중1 Ⅰ 도입 세 장면

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "src", "ui", "introArt.generated.ts");

const art = {}, meta = { stage: { w: S.STAGE_W, h: S.STAGE_H } };
const add = (name, r) => { art[name] = r.sk.svg({ inline: true }); return r.meta ?? {}; };

meta.longcell = { ...S.LC, ...add("longcellKid", S.longcellKid()) };
if (S.basketsBase) meta.baskets = { ...S.BK, ...add("basketsBase", S.basketsBase()), ...add("basketsMush", S.basketsMush()) };
if (S.factoryBase) meta.factory = { ...S.FC, ...add("factoryBase", S.factoryBase()) };
Object.assign(meta, U1.build(add));
REST.register(add, meta);

const round = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : Array.isArray(v) ? v.map(round) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, round(x)])) : v);
const ts = `// 자동 생성물: node qa/sketch/build-intro.mjs 가 만든다. 손으로 고치지 않는다.
// 도입 샘플(opener 스텝)의 손그림. 그림 원본은 qa/sketch/scenes/intro-u2.mjs 다.

/** 문서에 직접 넣는 SVG(묶음마다 class가 있어 CSS와 코드로 움직인다) */
export const INTRO_ART: Record<string, string> = ${JSON.stringify(art, null, 2)};

/** 그림의 좌표(무대 960×544 기준). 장면 코드가 끌기 범위와 놓는 자리를 여기서 읽는다 */
export const INTRO_META = ${JSON.stringify(round(meta), null, 2)} as const;
`;
if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== ts) writeFileSync(OUT, ts);
console.log(Object.entries(art).map(([k, v]) => `${k} ${(v.length / 1024).toFixed(1)}KB`).join(" | "));
