#!/usr/bin/env python3
"""把 png / jpg 压成 webp。

    python tools/img2webp.py                      # 默认扫 assets/img
    python tools/img2webp.py assets/img/posts/foo # 只处理某个目录或某几个文件
    python tools/img2webp.py -w 1200 -q 82 --delete

默认最长边压到 2000px：正文栏最宽 1032px，灯箱按 92vw 算，2000 在大屏上
开灯箱还够清楚，再往上纯属浪费。质量 90 是拿 UI 截图 1:1 比对过的——
平色块 q82 都看不出差别，留点余量。
"""
import argparse, os, sys
from PIL import Image, ImageOps

# Windows 控制台默认 cp936，不改过来中文输出全是乱码
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SRC_EXT = {".png", ".jpg", ".jpeg"}


def walk(paths):
    """目录就递归找图，直接给文件名也认。"""
    for p in paths:
        if os.path.isdir(p):
            for root, _, files in os.walk(p):
                for n in sorted(files):
                    if os.path.splitext(n)[1].lower() in SRC_EXT:
                        yield os.path.join(root, n)
        elif os.path.splitext(p)[1].lower() in SRC_EXT:
            yield p
        else:
            print(f"跳过（不是 png/jpg）: {p}", file=sys.stderr)


def has_alpha(im):
    """真有透明像素才留 alpha 通道。

    截图和照片基本都是全不透明，带着一条常量 255 的通道等于白扔 1/4 数据；
    但图标、去背图是真需要，不能像原来那样无脑 convert('RGB') 一刀切。
    """
    if im.mode in ("RGBA", "LA"):
        return im.getchannel("A").getextrema()[0] < 255
    if im.mode == "P":
        return "transparency" in im.info
    return False


def convert(src, maxw, quality, delete):
    with Image.open(src) as im:
        im.load()
        # 手机拍的 jpg 常把方向记在 EXIF 里，不先摆正，转完就躺倒了
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGBA" if has_alpha(im) else "RGB")
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        dst = os.path.splitext(src)[0] + ".webp"
        im.save(dst, format="WEBP", quality=quality, method=6)
        size = im.size

    a, b = os.path.getsize(src), os.path.getsize(dst)
    if b >= a:
        # 已经压得很紧的小图转 webp 可能反而变大，那就别留了
        os.remove(dst)
        print(f"{os.path.basename(src):34} {a/1024:7.0f} KB  跳过（webp 反而更大）")
        return False
    print(f"{os.path.basename(src):34} {a/1024:7.0f} KB -> {b/1024:6.0f} KB"
          f"  ({100 - b*100/a:4.1f}% off)  {size[0]}x{size[1]}"
          f"{'  +alpha' if im.mode == 'RGBA' else ''}")
    if delete:
        os.remove(src)
    return True


def selftest():
    """合成几张图跑一遍：透明该留、不透明该扔、jpg 认得、超宽该缩。"""
    import tempfile, shutil
    d = tempfile.mkdtemp()
    try:
        # 图得够大够杂，webp 才比 png 小；纯色小图会走"跳过"分支，测不到想测的东西
        import random
        random.seed(0)
        noise = Image.frombytes("RGB", (600, 400),
                                bytes(random.randrange(256) for _ in range(600 * 400 * 3)))
        clear = noise.convert("RGBA")
        clear.putalpha(Image.linear_gradient("L").resize((600, 400)))
        clear.save(f"{d}/clear.png")
        noise.convert("RGBA").save(f"{d}/opaque.png")
        Image.new("RGB", (3000, 1000), (9, 9, 9)).save(f"{d}/wide.jpg")
        assert has_alpha(Image.open(f"{d}/clear.png")), "半透明的图该留 alpha"
        assert not has_alpha(Image.open(f"{d}/opaque.png")), "全不透明的图该扔 alpha"
        for f in (f"{d}/clear.png", f"{d}/opaque.png", f"{d}/wide.jpg"):
            convert(f, 2000, 90, delete=False)
        assert Image.open(f"{d}/clear.webp").convert("RGBA").getchannel("A").getextrema()[0] < 255
        assert Image.open(f"{d}/opaque.webp").mode == "RGB"
        assert Image.open(f"{d}/wide.webp").size == (2000, 667), "超宽的该缩到 maxw"
        print("selftest ok")
    finally:
        shutil.rmtree(d)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*", default=["assets/img"],
                    help="目录或文件，默认 assets/img")
    ap.add_argument("-w", "--max-width", type=int, default=2000)
    ap.add_argument("-q", "--quality", type=int, default=90)
    ap.add_argument("--delete", action="store_true",
                    help="转完删掉原图。注意：文章里的引用要自己改成 .webp")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        selftest()
    else:
        n = sum(convert(f, a.max_width, a.quality, a.delete) for f in walk(a.paths))
        print(f"\n转换 {n} 张" + ("，原图已删——记得把文章里的引用改成 .webp" if a.delete and n else ""))
