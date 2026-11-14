// 개념 영상 재생 화면. 세로 9:16 영상을 화면 가득 틀고, 어디까지 봤는지와 다 봤는지를 기기에 적는다.
//
// 라우터 화면으로 연다(nav.go). 닫기 버튼과 하드웨어 뒤로가기가 같은 길(nav.back)을 지나고, 화면이 치워질 때(onExit)
// 영상을 멈추고 마지막 위치를 적은 뒤 연 쪽에 알린다(지도는 영상 칸을 다시 칠하고, 레슨은 보던 스텝을 다시 그린다).
// 영상 파일은 앱에 싣지 않고 Vimeo 같은 곳에 올린 것을 임베드한다. 올린 곳이 아직 적히지 않은 영상은 검수용 미리 보기(?vid=1)에서만 열리며 자리 표시를 보여 준다.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { setVideoProgress, videoProgressOf } from "../core/store";
import { findUnit } from "../content/curriculum";
import { videoMinutes, videoPreviewOn, type VideoEpisode } from "../content/videos";
import type { Screen } from "../core/router";

const DONE_RATIO = 0.9; // 이만큼 보면 "다 봤어요"
const RATES = [1, 1.25, 1.5, 0.75];

export function videoScreen(ep: VideoEpisode, o: { onBack: () => void; onClosed?: () => void }): Screen {
  const unit = findUnit(ep.unitId);
  const saved = videoProgressOf(ep.id);
  let video: HTMLVideoElement | null = null;
  let lastSaved = 0;
  let closed = false;

  const closeBtn = el("button", { class: "vp-x", attrs: { "aria-label": "영상 닫기" }, html: icon("x", 20, { sw: 2.4 }) });
  closeBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onBack();
  });
  const sub = `${unit ? `${unit.roman}. ${unit.title} · ` : ""}영상 ${ep.no} · ${videoMinutes(ep)}`;
  const rateBtn = el("button", { class: "vp-rate", attrs: { "aria-label": "재생 속도" }, text: "1배" });
  const top = el(
    "div",
    { class: "vp-top" },
    closeBtn,
    el("div", { class: "vp-ttl" }, el("b", { text: ep.title }), el("span", { text: sub })),
    rateBtn,
  );

  const frame = el("div", { class: "vp-frame" });
  const stage = el("div", { class: "vp-stage" }, frame);

  const markDone = (): void => setVideoProgress(ep.id, video ? video.currentTime : ep.seconds, true);

  let offMessage: (() => void) | null = null;
  if (ep.src?.kind === "vimeo") {
    // Vimeo 임베드. 플레이어 스크립트를 싣지 않고 iframe과 postMessage만으로 재생 위치를 받는다(누르기 전에는 아무것도 받지 않는다).
    const src = ep.src;
    const resumeAt = saved && !saved.done && saved.sec >= 5 ? saved.sec : 0;
    const q = new URLSearchParams({ autoplay: "1", playsinline: "1", dnt: "1", title: "0", byline: "0", portrait: "0", texttrack: "ko" });
    if (src.h) q.set("h", src.h);
    const ORIGIN = "https://player.vimeo.com";
    const frameEl = el("iframe", {
      class: "vp-video",
      attrs: { src: `${ORIGIN}/video/${encodeURIComponent(src.id)}?${q.toString()}`, allow: "autoplay; fullscreen; picture-in-picture", allowfullscreen: "", title: ep.title, referrerpolicy: "strict-origin-when-cross-origin" },
    });
    const post = (method: string, value?: unknown): void => frameEl.contentWindow?.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), ORIGIN);
    let lastSec = 0;
    let doneNow = false;
    const onMessage = (e: MessageEvent): void => {
      if (e.origin !== ORIGIN || e.source !== frameEl.contentWindow) return;
      let d: { event?: string; data?: { seconds?: number; percent?: number } } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!d?.event) return;
      if (d.event === "ready") {
        post("addEventListener", "timeupdate");
        post("addEventListener", "ended");
        if (resumeAt) post("setCurrentTime", resumeAt);
      } else if (d.event === "timeupdate" && d.data) {
        lastSec = d.data.seconds ?? lastSec;
        const done = (d.data.percent ?? 0) >= DONE_RATIO;
        if (done || Math.abs(lastSec - lastSaved) >= 5) {
          lastSaved = lastSec;
          doneNow = doneNow || done;
          setVideoProgress(ep.id, lastSec, done);
        }
      } else if (d.event === "ended") {
        doneNow = true;
        setVideoProgress(ep.id, lastSec || ep.seconds, true);
      }
    };
    window.addEventListener("message", onMessage);
    offMessage = () => {
      window.removeEventListener("message", onMessage);
      if (lastSec) setVideoProgress(ep.id, lastSec, doneNow);
      frameEl.removeAttribute("src"); // 재생을 멈춘다
    };
    let ri = 0;
    rateBtn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      ri = (ri + 1) % RATES.length;
      post("setPlaybackRate", RATES[ri]);
      rateBtn.textContent = `${RATES[ri]}배`;
    });
    frame.appendChild(frameEl);
  } else if (ep.src) {
    video = el("video", {
      class: "vp-video",
      attrs: { src: ep.src.url, playsinline: "", controls: "", preload: "metadata", controlslist: "nodownload noplaybackrate", disablepictureinpicture: "" },
    }) as HTMLVideoElement;
    if (ep.src.captions) {
      video.appendChild(el("track", { attrs: { kind: "subtitles", srclang: "ko", label: "한국어", src: ep.src.captions, default: "" } }));
    }
    const v = video;
    v.addEventListener("loadedmetadata", () => {
      // 보던 영상은 그 자리에서 잇는다(다 본 영상이나 끝에 가까우면 처음부터)
      if (saved && !saved.done && saved.sec >= 5 && saved.sec < v.duration * DONE_RATIO) v.currentTime = saved.sec;
      void v.play().catch(() => {
        /* 자동 재생이 막힌 기기에서는 사용자가 재생 버튼을 누른다 */
      });
    });
    v.addEventListener("timeupdate", () => {
      if (!v.duration) return;
      const done = v.currentTime >= v.duration * DONE_RATIO;
      if (done || Math.abs(v.currentTime - lastSaved) >= 5) {
        lastSaved = v.currentTime;
        setVideoProgress(ep.id, v.currentTime, done);
      }
    });
    v.addEventListener("ended", markDone);
    let ri = 0;
    rateBtn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      ri = (ri + 1) % RATES.length;
      v.playbackRate = RATES[ri];
      rateBtn.textContent = `${RATES[ri]}배`;
    });
    frame.appendChild(v);
  } else {
    // 영상 파일이 아직 없다(검수용 미리 보기에서만 여기까지 온다)
    rateBtn.style.visibility = "hidden";
    const box = el(
      "div",
      { class: "vp-empty" },
      el("span", { class: "vp-empty-ic", attrs: { "aria-hidden": "true" }, html: icon("play", 26) }),
      el("b", { text: "영상을 준비하고 있어요" }),
      el("p", { text: `${ep.title} 영상이 올라오면 이 자리에서 바로 볼 수 있어요.` }),
    );
    if (videoPreviewOn()) {
      const mark = el("button", { class: "vp-mark", text: "다 본 것으로 표시(검수용)" });
      mark.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        markDone();
        mark.textContent = "봤어요로 표시했어요";
        mark.disabled = true;
      });
      box.appendChild(mark);
    }
    frame.appendChild(box);
  }

  const elm = el("section", { class: "screen", attrs: { id: "sc-video", "data-vid": ep.id } }, top, stage);

  const onExit = (): void => {
    if (closed) return;
    closed = true;
    offMessage?.();
    if (video) {
      try {
        video.pause();
        if (video.duration) setVideoProgress(ep.id, video.currentTime, video.currentTime >= video.duration * DONE_RATIO);
        video.removeAttribute("src");
        video.load(); // 받던 영상을 놓아 준다(데이터 아끼기)
      } catch {
        /* noop */
      }
    }
    o.onClosed?.();
  };
  return { el: elm, onExit };
}
