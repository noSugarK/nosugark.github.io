"""本地预览渲染器：在没有 Ruby/Jekyll 的环境里，把站点渲染成静态 HTML。

只用于开发预览，不追求与 Jekyll 逐字节一致；tools/ 已在 _config.yml 里排除发布。

用法：
    python tools/preview.py            # 渲染到 _preview 并启动服务 127.0.0.1:7777
    python tools/preview.py --build    # 只渲染，不启动服务
"""
import argparse
import datetime as dt
import html as html_mod
import http.server
import json
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


def liquid_plus(s, n=0):
    """Liquid 的 plus 按数值相加；预览里别把 11 变成 11.0。"""
    try:
        value = float(s) + float(n)
    except (TypeError, ValueError):
        return s
    return int(value) if value.is_integer() else value


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
        "plus": liquid_plus,
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
    """把 Liquid 独有的写法转成 Jinja2：comment 块、filter: 参数、elsif、
    assign/capture、nil、xxx.size。layout 和页面正文都走这里。"""
    src = re.sub(r"\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}", "", src, flags=re.S)
    # Liquid 的 assign 是跨循环保留的全局变量，Jinja 的 set 一出 for 就丢。
    # blog.html 靠 prevY / prevM 做年、月变化检测，先把以 nil 初始化的这类
    # 循环变量放进 namespace，再改写引用；否则每篇文章都会单独开一个年/月分组。
    carried = set(re.findall(r"\{%-?\s*assign\s+(\w+)\s*=\s*nil\s*-?%\}", src))
    if carried:
        for name in carried:
            src = re.sub(rf"(\{{%-?\s*)assign\s+{name}\s*=", rf"\1set _lq.{name} =", src)
        names = "|".join(map(re.escape, carried))
        src = re.sub(
            r"\{%[^%]*%\}|\{\{[^}]*\}\}",
            lambda m: re.sub(rf"(?<![\w.])(?:{names})\b", lambda n: f"_lq.{n.group(0)}", m.group(0)),
            src,
        )
        src = "{%- set _lq = namespace() -%}" + src
    # 参数可能是带引号的日期格式（内含 -%/|），先整体吃下引号串再拼成函数调用
    src = re.sub(r"\|\s*(\w+)\s*:\s*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|[^\s}|]+)",
                 lambda m: f"| {m.group(1)}({m.group(2)})", src)
    # Liquid 写 elsif，Jinja2 写 elif；站点模板用 elsif 做多分支
    src = re.sub(r"(\{%-?\s*)elsif\b", r"\1elif", src)
    # 博客列表用的 assign / capture / nil / size
    src = re.sub(r"(\{%-?\s*)assign\b", r"\1set", src)
    src = re.sub(r"(\{%-?\s*)capture\s+([\w-]+)", r"\1set \2", src)
    src = re.sub(r"(\{%-?\s*)endcapture\b", r"\1endset", src)
    src = re.sub(r"\bnil\b", "none", src)
    src = re.sub(r"\b([\w.]+)\.size\b", r"(\1|length)", src)
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
    """把正文/页面里用到的少量 Liquid 标签替换成最终文本，再交给 Markdown / Jinja。"""
    # layout 走 jinja_compat 会剥注释，但页面/文章正文不经过它，这里统一先剥掉
    src = re.sub(r"\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}", "", src, flags=re.S)
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

    # search.json：正文全文单独成册，列表页只在首次搜索时才拉取
    search_items = []
    for post in posts:
        hay = " ".join([
            str(post["title"]),
            " ".join(str(x) for x in (post["tags"] or [])),
            str(post["description"] or ""),
            html_mod.unescape(re.sub(r"<[^>]+>", " ", post["content"])),
        ])
        search_items.append({"id": "p-" + post["slug"], "s": " ".join(hay.split())})
    write_html("search.json", json.dumps(search_items, ensure_ascii=False))

    base_ctx = {
        "site": dict(SITE, posts=posts, time=dt.datetime.now()),
    }

    for post in posts:
        html = render_page(post, post["content"], base_ctx, by_slug)
        write_html(post["url"].lstrip("/") + "index.html", html)

    for name, page_url, rel in (
        ("index.html", "/", "index.html"),
        ("blog.html", "/blog/", "blog/index.html"),
        ("motion.html", "/motion/", "motion/index.html"),
    ):
        meta, body = frontmatter(read(ROOT / name))
        # 页面正文里的 for/if/assign 也要渲染，否则本地预览会露出 Liquid 原文
        body = preprocess_liquid(body, by_slug)
        body = render_jinja(body, base_ctx)
        page_meta = dict(meta, url=page_url)
        html = render_page(page_meta, body, base_ctx, by_slug)
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
