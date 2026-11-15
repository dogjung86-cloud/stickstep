// 단원 검사(qa/check-*.mjs)를 개발 서버 없이, 미리 빌드한 개발 모드 번들(스냅숏)로 돌리게 하는 미리 싣기 훅.
// 여러 사람이 같은 워크트리에서 파일을 고치는 동안에도 검사가 흔들리지 않는다(개발 서버의 새로 고침이 없다).
//
//   1) 번들: NODE_ENV=development npx vite build --mode development --outDir <내 폴더> --emptyOutDir
//   2) 검사: DIST_HOOK=<내 폴더> PORT=5781 node --import ./qa/dist-hook.mjs qa/check-u3v5.mjs <캡처 폴더> u3l2
//
// playwright의 chromium.launch를 감싸, 새 컨텍스트마다 http://localhost:<PORT>/** 요청을 번들 폴더의 파일로 답한다.
// 개발 모드 번들이라 레슨 바로 열기(?open=)가 그대로 된다. 서버는 띄우지 않는다.
// 페이지 안에서 /src 모듈을 불러 레슨을 여는 검사(check-u2v5-fit, check-cell3d 등)는 번들에 /src가 없어 이 훅으로는 돌지 않는다(개발 서버로).
import { createRequire } from "node:module";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const require = createRequire(import.meta.url);
const pw = require("playwright-core");
const DIST = process.env.DIST_HOOK;
const PORT = process.env.PORT || "5781";
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".mjs": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".ico": "image/x-icon", ".txt": "text/plain", ".wasm": "application/wasm",
};

function handler(route) {
  const u = new URL(route.request().url());
  let rel = decodeURIComponent(u.pathname.replace(/^\/+/, "")) || "index.html";
  let f = join(DIST, rel);
  if (!existsSync(f) || statSync(f).isDirectory()) {
    if (!extname(rel)) f = join(DIST, "index.html");
    else return route.fulfill({ status: 404, body: "" });
  }
  return route.fulfill({ status: 200, contentType: MIME[extname(f).toLowerCase()] ?? "application/octet-stream", body: readFileSync(f) });
}

if (DIST) {
  if (!existsSync(join(DIST, "index.html"))) throw new Error(`DIST_HOOK 폴더에 index.html이 없어요: ${DIST}`);
  const origLaunch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...args) => {
    const browser = await origLaunch(...args);
    const origNewContext = browser.newContext.bind(browser);
    // browser.newPage도 안에서 this.newContext를 부르므로 이것 하나로 둘 다 걸린다
    browser.newContext = async (...a) => {
      const ctx = await origNewContext(...a);
      await ctx.route(`http://localhost:${PORT}/**`, handler);
      return ctx;
    };
    return browser;
  };
  console.log(`[dist-hook] localhost:${PORT} → ${DIST}`);
}
