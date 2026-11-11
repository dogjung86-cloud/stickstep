# 중1 Ⅶ v5 판정 자료를 내용 파일에서 뽑는다.
#   python qa/u7v5-docs.py "<출력 폴더>"
#   concept-before-after.md : 레슨마다 지금의 정리 카드(정본)와 새 개념 스텝, 새 정리 카드
#   blind.md                : 새로 쓴 문제의 문제지(정답 없음)와 새 개념, 정리 글(검산용)
#   answers.md              : 새 문제의 정답표(검산하는 쪽에는 주지 않는다)
#   overlap                 : 새 글과 시험 풀(src/content/exams/u7*.ts)의 16자 겹침 검사 결과를 화면에 찍는다
import io, os, re, sys

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rd = lambda p: io.open(p, encoding="utf-8").read()
# 태그를 걷는다. 줄바꿈은 띄어쓰기로, 정리 카드 속 소제목(rm-h)은 [소제목] 꼴로 남긴다
RMH = re.compile("<b class='rm-h'>(.*?)</b>")
strip = lambda h: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", RMH.sub(lambda m: " [" + m.group(1) + "] ", h.replace("<br>", " ")))).strip()
STR = r'"((?:[^"\\]|\\.)*)"'

old = rd("src/content/unit7.ts")
new = rd("src/content/unit7v5.ts")
LESSONS = [("u7l1", "태양계 구성 천체"), ("u7l2", "행성 분류"), ("u7l3", "태양의 활동"), ("u7l4", "지구의 자전과 공전"), ("u7l5", "달의 위상 변화"), ("u7l6", "일식과 월식")]


def cards(src):
    """정리 카드: (이름, 핵심 문장, 자세히)"""
    res = []
    for m in re.finditer(r'name: ' + STR + r'.*?text:\s*' + STR + r'.*?more:\s*' + STR, src, re.S):
        res.append((m.group(1), strip(m.group(2)), strip(m.group(3))))
    return res


def block(src, start, end):
    a = src.find(start)
    b = src.find(end, a + 1) if end else len(src)
    return src[a:b] if a >= 0 else ""


old_parts = {f"u7l{i}": block(old, f"const L{i} = {{", f"const L{i + 1} = {{" if i < 6 else "export const UNIT7") for i in range(1, 7)}
new_parts = {f"u7l{i}": block(new, f"// ══════════ u7l{i} ", f"// ══════════ u7l{i + 1} " if i < 6 else "export const UNIT7_V5") for i in range(1, 7)}

# ── 개념 글의 전과 후 ──
md = ["# 중1 Ⅶ 태양계: 개념 글의 전과 후 (2026-11-12)", "",
      "정본에는 개념 스텝이 없고 개념 설명이 정리 카드에만 있었다. 새 판은 랩 뒤에 용어를 정의하는 개념 스텝을 두고 정리 카드를 새 랩에 맞춰 다시 썼다.",
      "u7l3은 만화가 용어를 하나씩 정의하므로 개념 스텝을 두지 않았다.", ""]
blind = ["# 중1 Ⅶ 태양계: 새 개념 글, 정리 글, 새 문제(정답 없음)", ""]
for lid, title in LESSONS:
    md += [f"## {lid} {title}", "", "### 지금(정본의 정리 카드)", ""]
    for n, t, more in cards(old_parts[lid]):
        md += [f"- **{n}**: {t}", f"  - 자세히: {more}"]
    md += ["", "### 새 개념 스텝", ""]
    blind += [f"## {lid} {title}", "", "### 개념 스텝", ""]
    np = new_parts[lid]
    concepts = re.findall(r'concept\(\{.*?\n\}\);', np, re.S)
    if not concepts:
        md += ["(없음. 만화의 용어 카드가 정의를 맡는다)"]
        blind += ["(없음)"]
    for c in concepts:
        ti = strip(re.search(r'title: ' + STR, c).group(1))
        le = strip(re.search(r'lead: ' + STR, c).group(1))
        lines = [f"**{ti}** ({le})"]
        for m in re.finditer(r'term\(' + STR + r',\s*' + STR + r'\)', c):
            lines.append(f"- {m.group(1)}: {strip(m.group(2))}")
        for m in re.finditer(r'k: "note".*?html: ' + STR, c):
            lines.append(f"- (메모) {strip(m.group(1))}")
        md += lines + [""]
        blind += lines + [""]
    md += ["### 새 정리 카드", ""]
    blind += ["### 정리 카드", ""]
    for n, t, more in cards(np):
        md += [f"- **{n}**: {t}", f"  - 자세히: {more}"]
        blind += [f"- **{n}**: {t}", f"  - 자세히: {more}"]
    md.append("")
    blind.append("")
io.open(os.path.join(out, "concept-before-after.md"), "w", encoding="utf-8", newline="\n").write("\n".join(md) + "\n")

# ── 새 문제: 문제지와 정답표 ──
blind += ["## 새로 쓴 문제 여섯 개", "", "보기 가운데 옳은 것을 하나 고른다. 답과 까닭을 적는다.", ""]
ans = ["# 중1 Ⅶ v5 새 문제 정답표", ""]
for i, m in enumerate(re.finditer(r'const (Q\d) = mcq\(\{\s*prompt: ' + STR + r',\s*options: \[(.*?)\],\s*answer: (\d)', new, re.S), 1):
    opts = re.findall(STR, m.group(3))
    right = opts[int(m.group(4))]
    r = (i * 2) % 5  # 문제지에서는 보기의 차례를 돌려 놓는다(앱에서도 보기는 섞여 나온다)
    shown = opts[r:] + opts[:r]
    blind += [f"**{m.group(1)}.** {strip(m.group(2).replace('<br>', ' / '))}", ""] + [f"{'①②③④⑤'[k]} {o}" for k, o in enumerate(shown)] + [""]
    ans.append(f"- {m.group(1)}: {'①②③④⑤'[shown.index(right)]} {right}")
io.open(os.path.join(out, "blind.md"), "w", encoding="utf-8", newline="\n").write("\n".join(blind) + "\n")
io.open(os.path.join(out, "answers.md"), "w", encoding="utf-8", newline="\n").write("\n".join(ans) + "\n")

# ── 시험 풀과의 겹침(16자 창) ──
N = 16
flat = lambda t: re.sub(r"\s+", "", re.sub(r"&[a-z]+;", "", re.sub(r"<[^>]+>", "", t)))
pool = ""
for f in sorted(os.listdir("src/content/exams")):
    if re.match(r"u7(l\d)?\.ts$", f):
        pool += "|".join(flat(x) for x in re.findall(STR, rd(os.path.join("src/content/exams", f)))) + "|"
mine = []
srcs = [("unit7v5.ts", re.sub(r"^\s*//.*$", "", new, flags=re.M))]
for d in ("src/lessons/steps/u7v5", "src/lessons/steps/opener/u7"):
    for f in os.listdir(d):
        if f.endswith(".ts") and f not in ("tourLab.ts", "eclipseLab.ts"):
            srcs.append((f, re.sub(r"^\s*//.*$", "", rd(os.path.join(d, f)), flags=re.M)))
hits = []
for where, src in srcs:
    for t in re.findall(STR, src):
        if not re.search("[가-힣]", t):
            continue
        ft = flat(t)
        for i in range(0, max(0, len(ft) - N + 1)):
            if ft[i:i + N] in pool:
                hits.append((where, ft[i:i + N]))
                break
rep = [f"겹침 검사: 시험 풀과 같은 16자 {len(hits)}건"] + [f"  {w}: {h}" for w, h in hits]
io.open(os.path.join(out, "overlap.txt"), "w", encoding="utf-8", newline="\n").write("\n".join(rep) + "\n")
print(len(hits), "hits")
