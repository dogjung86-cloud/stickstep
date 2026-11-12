# 중2 Ⅶ v5 판정 자료: 단원 검사가 찍은 캡처(qa/shots/g2u7v5)를 레슨마다 한 장으로 붙인다.
# python qa/g2u7v5-sheets.py <출력 폴더>
import os, subprocess, sys
from PIL import Image
O = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(HERE, "shots", "g2u7v5")
sel = {
    "g2u7l1": ["intro-ask", "intro-done", "straw-fail", "straw-pull", "straw-push", "straw-miss", "straw-done", "rub-nucleus", "rub-moved", "rub-apart", "rub-miss", "rub-done"],
    "g2u7l2": ["intro-ask", "intro-done", "can-start", "can-plain", "can-touch", "can-near", "can-other", "can-miss", "can-hit1", "can-done"],
    "g2u7l3": ["intro-ask", "intro-done", "wire-start", "wire-closed", "wire-flip", "wire-miss", "wire-done", "water-start", "water-miss", "water-done"],
    "g2u7l4": ["intro-ask", "intro-done", "ohm-start", "ohm-guard", "ohm-line", "ohm-both", "ohm-miss", "formula-one", "formula-ratio", "formula-curve", "formula-miss", "formula-done"],
    "g2u7l5": ["intro-ask", "intro-done", "bulb-start", "bulb-series-out", "bulb-parallel-out", "bulb-miss", "split-series", "split-parallel", "split-water-p", "split-water-s", "split-miss", "split-done"],
    "g2u7l6": ["intro-ask", "intro-done", "power-three", "power-ten", "power-miss", "power-done", "eff-short", "eff-inc", "eff-led", "eff-miss", "eff-done"],
    "g2u7l7": ["intro-ask", "intro-done", "coil-start", "coil-on", "coil-flip", "coil-strong", "coil-miss", "coil-done"],
    "g2u7l8": ["intro-ask", "intro-done", "swing-start", "swing-out", "swing-both", "swing-miss", "swing-done", "motor-start", "motor-on", "motor-flip", "motor-miss", "motor-done"],
}
for k, v in sel.items():
    have = [m for m in v if os.path.exists(os.path.join(S, f"{k}-{m}.png"))]
    subprocess.run([sys.executable, os.path.join(HERE, "sheet.py"), os.path.join(O, f"{k}.png"), "6", "300", *[os.path.join(S, f"{k}-{m}.png") for m in have], "--labels", "|".join(have)], check=True, stdout=subprocess.DEVNULL)
Image.open(os.path.join(S, "g2u7l3-water-rot.png")).rotate(90, expand=True).save(os.path.join(O, "g2u7l3-landscape.png"))
print("ok")
