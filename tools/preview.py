"""本地预览渲染器：在没有 Ruby/Jekyll 的环境里，把站点渲染成静态 HTML。

只用于开发预览，不追求与 Jekyll 逐字节一致；tools/ 已在 _config.yml 里排除发布。

用法：
    python tools/preview.py            # 渲染到 _preview 并启动服务 127.0.0.1:7777
    python tools/preview.py --build    # 只渲染，不启动服务
"""
import argparse
import datetime as dt
import http.server
import os
import re
import shutil
import sys
import threading
import webbrowser
from pathlib import Path

import mistune
import yaml
from jinja2 import ChainableUndefined, Environment

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_preview"
SITE = {
    "title": "noSugarK",
    "description": "noSugarK 的个人主页与博客",
    "url": "",
}
MD = mistune.create_markdown(escape=False, plugins=["table", "strikethrough"])
JINJA = Environment(undefined=ChainableUndefined, autoescape=False)


def jdate(value, fmt="%Y-%m-%d"):
    if fmt == "%s":
        return str(int((value.timestamp() if isinstance(value, (dt.datetime, dt.date)) else dt.datetime.now().timestamp())))
    if isinstance(value, dt.datetime):
        return value.strftime(fmt)
    if isinstance(value, dt.date):
        return value.strftime(fmt)
    text = str(value)
    for pattern in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S %z"):
        try:
            return dt.datetime.strptime(text, pattern).strftime(fmt)
        except ValueError:
            pass
    return text


JINJA.filters.update(
    {
        "relative_url": lambda s: str(s),
        "absolute_url": lambda s: str(s),
        "date": jdate,
        "strip_html": lambda s: re.sub(r"<[^>]+>", "", str(s)),
        "strip_newlines": lambda s: str(s).replace("\n", "").replace("\r", ""),
        "escape": lambda s: str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"),
        "truncate": lambda s, n=120: (str(s)[:n] + "…") if len(str(s)) > n else str(s),
        "downcase": lambda s: str(s).lower(),
        "url_encode": lambda s: str(s).replace(" ", "%20"),
        "plus": lambda s, n=0: float(s) + float(n) if str(s).replace(".", "", 1).isdigit() else s,
    }
)


def read(path):
    return path.read_text(encoding="utf-8")


def frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    _, raw, body = text.split("---", 2)
    return yaml.safe_load(raw) or {}, body.lstrip("\n")


def jinja_compat(src):
    """把 Liquid 独有的 filter: 参数写法与 comment 块转成 Jinja2 语法。"""
    src = re.sub(r"\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}", "", src, flags=re.S)
    src = re.sub(r"\|\s*(\w+)\s*:\s*([^}|]+)", lambda m: f"| {m.group(1)}({m.group(2).strip()})", src)
    return src


def render_jinja(src, context):
    return JINJA.from_string(jinja_compat(src)).render(**context)


def collect():
    posts = []
    for path in sorted((ROOT / "_posts").glob("*.md")):
        meta, body = frontmatter(read(path))
        if isinstance(meta.get("date"), dt.date):
            date = meta["date"]
        else:
            date = dt.datetime.strptime(str(meta.get("date", path.name[:10])), "%Y-%m-%d")
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
        url = f"/blog/{date:%Y/%m/%d}/{slug}/"
        posts.append(
            {
                "layout": meta.get("layout", "post"),
                "title": meta.get("title", slug),
                "description": meta.get("description", ""),
                "tags": meta.get("tags", []),
                "date": date,
                "slug": slug,
                "url": url,
                "content": "",
                "motion_lab": meta.get("motion_lab", False),
                "demo_lab": meta.get("demo_lab", False),
                "mermaid": meta.get("mermaid", False),
                "math": meta.get("math", False),
                "body": body,
            }
        )
    posts.sort(key=lambda p: p["date"], reverse=True)
    by_slug = {p["slug"]: p for p in posts}
    return posts, by_slug


def preprocess_liquid(src, by_slug):
    """把文章正文里用到的少量 Liquid 标签替换成最终文本，再交给 Markdown。"""
    def post_url(match):
        name = match.group(1).strip().split("/")[-1]
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", name)
        post = by_slug.get(slug)
        return post["url"] if post else match.group(0)

    src = re.sub(r"\{%-?\s*post_url\s+([^%]+?)\s*-?%\}", post_url, src)
    src = re.sub(r"\{\{\s*['\"]([^'\"]+)['\"]\s*\|\s*relative_url\s*\}\}", r"\1", src)
    src = re.sub(r"\{\{\s*['\"]([^'\"]+)['\"]\s*\|\s*absolute_url\s*\}\}", r"\1", src)
    return src


def render_markdown(post, by_slug):
    body = preprocess_liquid(post["body"], by_slug)
    return MD(body)


def render_page(meta, content, context, by_slug):
    """套 layout：layout 本身可能还有 layout（post.html → default.html）。"""
    layout = meta.get("layout")
    current = content
    seen = set()
    while layout and layout not in seen:
        seen.add(layout)
        path = ROOT / "_layouts" / f"{layout}.html"
        if not path.exists():
            break
        layout_meta, layout_body = frontmatter(read(path))
        page = dict(meta)
        page["content"] = current
        ctx = dict(context)
        ctx.update({"page": page, "content": current})
        current = render_jinja(layout_body, ctx)
        layout = layout_meta.get("layout")
    return current


def write_html(rel_path, html):
    target = OUT / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")


def build():
    OUT.mkdir(exist_ok=True)
    shutil.copytree(ROOT / "assets", OUT / "assets", dirs_exist_ok=True)

    posts, by_slug = collect()
    for post in posts:
        post["content"] = render_markdown(post, by_slug)

    base_ctx = {
        "site": dict(SITE, posts=posts, time=dt.datetime.now()),
    }

    for post in posts:
        html = render_page(post, post["content"], base_ctx, by_slug)
        write_html(post["url"].lstrip("/") + "index.html", html)

    for name in ("index.html", "blog.html"):
        meta, body = frontmatter(read(ROOT / name))
        # 页面模板里的 for/if 交给 Jinja2，先还原 Liquid 的 post_url 与路径过滤器
        body = preprocess_liquid(body, by_slug)
        body = body.replace("| relative_url", "| relative_url")
        page_meta = dict(meta, url="/" if name == "index.html" else meta.get("permalink", "/blog/"))
        html = render_page(page_meta, body, base_ctx, by_slug)
        rel = "index.html" if name == "index.html" else "blog/index.html"
        write_html(rel, html)

    print(f"rendered {len(posts)} posts + index/blog to {OUT}")


def serve():
    os.chdir(OUT)
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(*args, **kwargs)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 7777), handler)
    url = "http://127.0.0.1:7777/blog/2026/11/18/frontend-animation-resources/"
    print(f"serving {OUT} at http://127.0.0.1:7777")
    print(f"preview: {url}")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    server.serve_forever()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", action="store_true", help="只渲染，不启动服务")
    args = parser.parse_args()
    build()
    if not args.build:
        serve()
