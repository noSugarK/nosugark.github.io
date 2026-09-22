# tools

本地小工具，不参与站点构建（`_config.yml` 里已 `exclude: tools`）。

## 一次性安装 git 钩子

```
git config core.hooksPath tools/hooks
```

每个新克隆都要跑一次——`.git/hooks` 不进版本库，`core.hooksPath` 才能让钩子跟着仓库走。

## img2webp.py

把 png / jpg 压成 webp。

```
python tools/img2webp.py                        # 扫 assets/img
python tools/img2webp.py assets/img/posts/foo   # 指定目录或文件
python tools/img2webp.py -w 1200 -q 82 --delete # 改尺寸/质量，转完删原图
python tools/img2webp.py --selftest             # 自检
```

- 默认最长边 2000px、质量 90。正文栏最宽 1032px，灯箱按 92vw 算，2000 在大屏上够清楚。
- 真有透明像素才保留 alpha，全不透明就扔掉，省 1/4 数据。
- jpg 按 EXIF 摆正方向。
- webp 反而更大就跳过并保留原图，`--delete` 不会误删。
- **原图删掉后，文章里的引用要自己改成 `.webp`。**

## hooks/pre-commit

暂存区里有超过 500 KB 的图就拒绝提交。

```
IMG_LIMIT_KB=800 git commit ...   # 临时改上限
git commit --no-verify            # 临时放行
```

量的是暂存区那份 blob，不是工作区文件。设它是因为吃过亏：`ba1f8bb` 提交过 4 张
27 MB 的截图——压缩级别 0 的 PNG，等于没压过，后来只能重写历史才清掉。
