# 중2 Ⅷ v5 판정 자료: 단원 검사가 찍은 캡처를 레슨마다 한 장으로 붙인다.
# python qa/g2u8v5-sheets.py <캡처 폴더> <출력 폴더>
import os, subprocess, sys
S, O = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(O, exist_ok=True)
sel = {
    "g2u8l1": ["intro-ask", "intro-done", "pencil-start", "pencil-one", "pencil-bend", "pencil-miss", "pencil-done", "parallax-year", "parallax-half", "parallax-2pc", "parallax-miss", "parallax-done"],
    "g2u8l2": ["intro-ask", "intro-done", "lux-start", "lux-mixed", "lux-all", "lux-miss", "lux-done", "spread-predict", "spread-2", "spread-3", "spread-miss", "spread-done"],
    "g2u8l3": ["intro-ask", "intro-done", "mag-wrong", "mag-named", "mag-mid", "mag-miss", "mag-done", "abs-predict", "abs-sirius", "abs-all", "abs-miss", "abs-done"],
    "g2u8l4": ["intro-ask", "intro-done", "heater-start", "heater-early", "heater-yellow", "heater-miss", "heater-done", "temp-wrong", "temp-two", "temp-white", "temp-miss", "temp-done"],
    "g2u8l5": ["intro-ask", "intro-done", "model-band", "model-top", "model-scatter", "model-miss", "model-done", "galaxy-guess", "galaxy-real", "galaxy-in", "galaxy-out", "galaxy-done"],
    "g2u8l6": ["intro-ask", "intro-done", "observe-start", "observe-zoom", "observe-wrong", "observe-hh", "observe-album", "observe-miss", "nebula-in", "nebula-side", "nebula-back", "nebula-done"],
    "g2u8l7": ["balloon-start", "balloon-tags", "balloon-fail", "balloon-before", "balloon-after", "balloon-miss", "balloon-done", "center-start", "center-me", "center-ga", "center-miss", "center-done"],
    "g2u8l8": ["intro-ask", "intro-done", "mission-start", "mission-far", "mission-all", "mission-miss", "mission-done", "plan-start", "plan-fail", "plan-ok", "plan-miss", "plan-done"],
}
for k, v in sel.items():
    have = [m for m in v if os.path.exists(os.path.join(S, f"{k}-{m}.png"))]
    miss = [m for m in v if m not in have]
    if miss:
        print(k, "없음:", miss)
    subprocess.run([sys.executable, os.path.join(HERE, "sheet.py"), os.path.join(O, f"{k}.png"), "6", "300", *[os.path.join(S, f"{k}-{m}.png") for m in have], "--labels", "|".join(have)], check=True, stdout=subprocess.DEVNULL)
print("ok")
