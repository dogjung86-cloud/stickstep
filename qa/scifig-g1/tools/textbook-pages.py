# 교과서 PDF(단원별, 한 쪽이 책 두 쪽 스프레드)를 쪽 이미지와 글로 뽑는다(조사용, 결과는 저장소 밖에 둔다).
# python qa/scifig-g1/tools/textbook-pages.py <교과서 폴더> <출력 폴더> [가로 픽셀]
import sys, os, glob
import fitz  # PyMuPDF
from pypdf import PdfReader

src, out = sys.argv[1], sys.argv[2]
width = int(sys.argv[3]) if len(sys.argv) > 3 else 1800
os.makedirs(out, exist_ok=True)
for path in sorted(glob.glob(os.path.join(src, "0*_텍스트보존.pdf"))):
    unit = os.path.basename(path)[:2]
    d = os.path.join(out, f"u{int(unit)}")
    os.makedirs(d, exist_ok=True)
    doc = fitz.open(path)
    reader = PdfReader(path)
    texts = []
    for i, page in enumerate(doc):
        zoom = width / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
        pix.save(os.path.join(d, f"p{i+1:02d}.png"))
        try:
            t = reader.pages[i].extract_text() or ""
        except Exception as e:
            t = f"(글 뽑기 실패: {e})"
        texts.append(f"===== PDF {i+1}쪽 =====\n{t}\n")
    with open(os.path.join(d, "text.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(texts))
    print(unit, len(doc), "pages")
