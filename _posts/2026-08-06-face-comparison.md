---
layout: post
title: InsightFace - 人脸分析工具
description: InsightFace 是一个开源的人脸分析工具箱，提供人脸检测、人脸识别、人脸关键点、人脸属性分析等能力。
tags: [人脸比对, 向量数据库, InsightFace]
math: false
mermaid: false
---

[InsightFace](https://github.com/deepinsight/insightface) 是一个开源的人脸分析工具箱，提供人脸检测、人脸识别、人脸关键点、人脸属性分析等能力。

本文以 Python 为例，介绍如何快速使用 InsightFace 完成人脸检测与人脸识别。

## 1. InsightFace 是什么？

InsightFace 是一个基于深度学习的人脸分析项目，核心功能包括：

- 👤 人脸检测（Face Detection）
- 🧑‍🤝‍🧑 多人脸检测
- 🔍 人脸识别（Face Recognition）
- 📐 人脸关键点检测（Face Landmark）
- 😊 人脸属性分析
- 🧬 人脸特征提取（Face Embedding）
- 📏 人脸相似度计算
- 🎯 人脸跟踪等扩展能力

> [!tip]
>
> InsightFace Python 库代码采用 **MIT License**，但官方提供的预训练模型具有独立的模型许可。
> 
> 官方 Model Zoo 中提供的[预训练模型](https://github.com/deepinsight/insightface/releases/latest)目前仅限`非商业研究用途`。
> 如果用于商业产品，应当进一步确认对应模型的授权情况，或使用拥有商业授权的模型。

## 2. 安装

### 2.1 创建 Python 环境

推荐使用 Conda：

```bash
conda create -n insightface python=3.10
conda activate insightface
```

### 2.2 安装依赖包

```bash
pip install insightface opencv-python numpy chromadb
```

如果需要使用 ONNX Runtime：

- CPU
    ```bash
    pip install onnxruntime
    ```
- NVIDIA GPU
    ```bash
    pip install onnxruntime-gpu
    ```

> 下载较慢可以使用清华源镜像站安装：`pip install insightface -i https://pypi.tuna.tsinghua.edu.cn/simple`

可以通过以下代码检查：

```python
import onnxruntime as ort
print(ort.get_available_providers())
```

CPU 通常会看到：`['CPUExecutionProvider']`

GPU 环境可能看到：`['CUDAExecutionProvider', 'CPUExecutionProvider']`

## 3. 运行第一个程序

InsightFace 提供了较高级的 FaceAnalysis 接口，可以直接完成：

- 人脸检测
- 人脸关键点
- 人脸特征提取
- 人脸属性分析

最简单的程序：

```python
import cv2
from insightface.app import FaceAnalysis

app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

img = cv2.imread("test.jpg")
faces = app.get(img)

print("检测到人脸数量:", len(faces))
for face in faces:
    print("bbox:", face.bbox)
    print("embedding shape:", face.embedding.shape)
```

> 第一次运行时，InsightFace 可能会自动下载模型。

## 4. 模型选择

InsightFace 提供了多个预训练模型包。

常见的模型：

|模型	|特点	|速度	|精度|大小|
|--|--|:--|:--|--|
|buffalo_sc	|小型模型	|⭐⭐⭐⭐⭐	|⭐⭐⭐|~14MB|
|buffalo_s	|小型模型	|⭐⭐⭐⭐	|⭐⭐⭐|~122MB|
|buffalo_m	|中等	|⭐⭐⭐	|⭐⭐⭐⭐|~263MB|
|buffalo_l	|大型模型	|⭐⭐	|⭐⭐⭐⭐⭐|~275MB|

> 入门推荐：`buffalo_l`; 如果更关注实时速度：`buffalo_sc`

## 5. 人脸对比

### 5.1 比较两个人脸是否为同一个

```python
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import time

def face_comparison(img_path1, img_path2):
    # 1. 初始化人脸分析应用
    # name='buffalo_l' 是 InsightFace 提供的预训练模型包，包含了检测、对齐、识别全套模型，精度与速度平衡极佳。
    # 首次运行会自动下载模型文件（约 300MB）
    app = FaceAnalysis(
        name="buffalo_l",
        providers=['CPUExecutionProvider'] # CPU 
        # providers=['CUDAExecutionProvider', 'CPUExecutionProvider'] # GPU
    )
    
    # 准备模型：
    # ctx_id: 0 表示使用第一张 GPU，-1 表示使用 CPU
    # det_size: 检测分辨率，越大检测越准但越慢，推荐 (640, 640)
    app.prepare(ctx_id=0, det_size=(640, 640))

    # 2. 读取图像 (InsightFace 默认要求 BGR 格式，cv2.imread 正好是 BGR)
    img1 = cv2.imread(img_path1)
    img2 = cv2.imread(img_path2)

    if img1 is None or img2 is None:
        print("图片读取失败，请检查路径。")
        return

    # 3. 检测人脸并提取特征
    # app.get() 会返回图片中所有检测到的人脸对象列表
    faces1 = app.get(img1)
    faces2 = app.get(img2)

    if len(faces1) == 0 or len(faces2) == 0:
        print("其中一张图片未检测到人脸！")
        return

    # 假设我们只对比两张图片中的“最大/最明显”的一张脸（列表的第一个元素）
    face1 = faces1[0]
    face2 = faces2[0]

    # 获取 512 维特征向量 (Embedding)
    feat1 = face1.embedding
    feat2 = face2.embedding

    # 4. 计算相似度 (余弦相似度)
    # InsightFace 提取的 embedding 默认已经过 L2 归一化。
    # 因此，两个向量的点积 (Dot Product) 就等于它们的余弦相似度，范围在 [-1, 1] 之间。
    sim = np.dot(feat1, feat2)
    
    # 也可以使用 insightface 官方提供的工具函数计算
    # sim = insightface.utils.cosine_similarity(feat1, feat2)

    print(f"图片1人脸位置: {face1.bbox}")
    print(f"图片2人脸位置: {face2.bbox}")
    print(f"特征向量相似度: {sim:.4f}")

    # 5. 设定阈值并得出结论
    # 阈值的设定取决于你的业务场景（对误识率 FAR 和 拒识率 FRR 的容忍度）
    # 通常：> 0.45 极大概率是同一人，< 0.3 极大概率不是同一人。
    threshold = 0.45 
    if sim > threshold:
        print("✅ 结论：同一个人")
    else:
        print("❌ 结论：不是同一个人")

    # 可选：在图片上画出检测框
    bbox1 = face1.bbox.astype(int)
    cv2.rectangle(img1, (bbox1[0], bbox1[1]), (bbox1[2], bbox1[3]), (0, 255, 0), 2)
    cv2.imshow("Image 1", img1)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # 请替换为你本地的两张人脸图片路径
    face_comparison("test1.jpg", "test2.jpg")
```

### 5.2 门禁系统(numpy) - 人脸注册与实时识别

#### 模型选择

| 方案       | 适合规模 | 查询方式     |人数|
| -------- | ---: | -------- |:---|
| NumPy    |    小 | 全量计算     |100|
| FAISS    |  中大型 | 向量检索     |10,000|
| ChromaDB |   中型 | 向量数据库    |10,000|
| Milvus   |   大型 | 分布式向量数据库 |100,000+|


如果数据量不大，可以直接保存：

```python
np.save("alice.npy",face.embedding)
```

读取：

```python
embedding = np.load("alice.npy")
```

这样就不需要每次重新运行人脸模型。

#### 注册人脸特征信息

```python
# register_faces.py
import os
import cv2
import numpy as np
import json
import insightface
from insightface.app import FaceAnalysis

def register_faces(dataset_dir, output_feat_file, output_name_file):
    # 初始化模型，建议使用 CPU 或 GPU 运行
    app = FaceAnalysis(
        name="buffalo_l", 
        providers=['CPUExecutionProvider']
    )
    app.prepare(ctx_id=0, det_size=(640, 640))

    features = []
    names = []

    print("开始提取人脸特征...")
    for filename in os.listdir(dataset_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            # 获取文件名作为姓名，例如 "张三.jpg" -> "张三"
            name = os.path.splitext(filename)[0]
            img_path = os.path.join(dataset_dir, filename)
            img = cv2.imread(img_path)
            
            if img is None:
                continue
                
            faces = app.get(img)
            if len(faces) == 0:
                print(f"[-] {filename} 未检测到人脸，跳过")
                continue
            elif len(faces) > 1:
                print(f"[!] {filename} 检测到多张人脸，仅使用面积最大的一张")
                
            # 取画面中面积最大的人脸
            face = max(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]))
            features.append(face.embedding)
            names.append(name)
            print(f"[+] 成功录入: {name}")

    if len(features) == 0:
        print("没有录入任何人脸！请检查 dataset 文件夹。")
        return

    # 将列表转换为 NumPy 数组，形状为 (N, 512)
    features_np = np.array(features, dtype=np.float32)
    
    # 保存到本地文件
    np.save(output_feat_file, features_np)
    with open(output_name_file, 'w', encoding='utf-8') as f:
        json.dump(names, f, ensure_ascii=False, indent=4)
        
    print(f"\n录入完成！共录入 {len(names)} 人。")
    print(f"特征矩阵保存至: {output_feat_file}")
    print(f"人员名单保存至: {output_name_file}")

if __name__ == "__main__":
    DATASET_DIR = "dataset"
    FEAT_FILE = "face_features.npy"
    NAME_FILE = "face_names.json"
    
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)
        print(f"请先在 {DATASET_DIR} 文件夹中放入员工单人照，然后再运行此脚本。")
    else:
        register_faces(DATASET_DIR, FEAT_FILE, NAME_FILE)
```

#### 实时识别

```python
# access_control.py
import cv2
import numpy as np
import json
import insightface
from insightface.app import FaceAnalysis
import time

def load_face_database(feat_file, name_file):
    try:
        features_db = np.load(feat_file)
        with open(name_file, 'r', encoding='utf-8') as f:
            names = json.load(f)
        print(f"✅ 成功加载人脸库：共 {len(names)} 人。")
        return features_db, names
    except FileNotFoundError:
        print("❌ 未找到人脸库文件，请先运行 register_faces.py")
        return None, None

def run_access_control():
    # 1. 初始化模型 (门禁场景下 det_size 可以稍微调低以换取更高帧率)
    app = FaceAnalysis(
        name="buffalo_l", 
        providers=['CPUExecutionProvider']
    )
    app.prepare(ctx_id=0, det_size=(640, 480))
    
    # 2. 加载本地特征库
    FEAT_FILE = "face_features.npy"
    NAME_FILE = "face_names.json"
    features_db, names = load_face_database(FEAT_FILE, NAME_FILE)
    if features_db is None:
        return

    # 3. 设定识别阈值 (门禁场景建议 0.45 ~ 0.55 之间)
    THRESHOLD = 0.45 
    
    # 4. 打开摄像头 (0 为默认摄像头)
    cap = cv2.VideoCapture(0) 
    if not cap.isOpened():
        print("无法打开摄像头")
        return

    print("门禁系统启动中... 按 'q' 退出。")
    
    # 字典：记录上次开门时间，防止同一个人站在门前疯狂触发“开门”指令
    last_open_time = {} 

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # 检测当前画面中的所有人脸
        faces = app.get(frame)
        
        for face in faces:
            bbox = face.bbox.astype(int)
            feat = face.embedding # 提取 512 维特征
            
            # 【核心：1:N 批量计算】
            # features_db 是 (N, 512), feat 是 (512,)
            # np.dot 会瞬间算出当前人脸与库中几千个人的相似度数组
            sims = np.dot(features_db, feat)
            
            max_idx = np.argmax(sims)
            max_sim = sims[max_idx]
            
            name = "Unknown"
            color = (0, 0, 255) # 默认红色框 (陌生人)
            
            if max_sim > THRESHOLD:
                name = names[max_idx]
                color = (0, 255, 0) # 绿色框 (内部员工)
                
                # 模拟开门逻辑 (防抖：5秒内同一个人只开一次门)
                current_time = time.time()
                if name not in last_open_time or (current_time - last_open_time[name] > 5.0):
                    print(f"✅ [{time.strftime('%H:%M:%S')}] 识别成功: {name} (相似度: {max_sim:.3f}) -> 触发开门!")
                    last_open_time[name] = current_time
                    # TODO: 这里接入你的单片机、继电器或门禁控制 API
            
            # 在画面上绘制人脸框和名字
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
            
            # 绘制文字背景框
            cv2.rectangle(frame, (bbox[0], bbox[1] - 30), (bbox[2], bbox[1]), color, -1)
            cv2.putText(frame, f"{name} ({max_sim:.2f})", 
                        (bbox[0], bbox[1] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        cv2.imshow("Access Control System", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_access_control()
```

### 5.3 门禁系统(ChromaDB) - 采用向量数据库保存人脸信息

#### 项目结构

```
project/ 
├── dataset/ 
│   ├── Alice.jpg 
│   ├── Bob.jpg 
│   └── name.jpg 
│ 
├── face_db/ 
│   ├── data/
│   └── chroma.sqlite3 
│ 
├── access.py
└── register.py
```

#### 人脸数据存入向量数据库

```python
# register_chroma.py
import os
import cv2
import insightface
from insightface.app import FaceAnalysis
import chromadb

def register_faces():
    # 1. 初始化 InsightFace 模型
    app = FaceAnalysis(
        name="buffalo_s", 
        # root="./../", # 模型使用本地路径 
        providers=['CPUExecutionProvider']
    )
    app.prepare(ctx_id=0, det_size=(320, 320))

    # 2. 初始化本地向量数据库 (ChromaDB)
    # PersistentClient 会将数据持久化保存在本地 ./face_db 文件夹中
    client = chromadb.PersistentClient(path="./face_db")
    
    # 获取或创建集合，指定距离度量为 cosine (余弦相似度)
    collection = client.get_or_create_collection(
        name="company_access", 
        metadata={"hnsw:space": "cosine"}
    )

    dataset_dir = "dataset"
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        print(f"请创建 {dataset_dir} 文件夹并放入员工照片（以姓名命名），然后重新运行。")
        return

    print("开始向本地向量数据库录入人脸...")
    for filename in os.listdir(dataset_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            name = os.path.splitext(filename)[0]
            img_path = os.path.join(dataset_dir, filename)
            img = cv2.imread(img_path)
            if img is None: continue

            faces = app.get(img)
            if len(faces) == 0:
                print(f"[-] {filename} 未检测到人脸")
                continue

            # 取画面中最大的人脸
            face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))
            embedding = face.embedding.tolist() # Chroma 需要 Python list 格式

            # 3. 存入向量数据库 (使用 upsert 防止重复录入报错)
            collection.upsert(
                ids=[name], # 用姓名作为唯一主键 ID
                embeddings=[embedding],
                # 【核心优势】：存入结构化元数据，方便后续做权限判断
                metadatas=[{"name": name, "identity": "contestant", "status": "active"}] 
            )
            print(f"[+] 成功录入向量数据库: {name}")

    print(f"\n录入完成！当前本地数据库共有 {collection.count()} 条人脸数据。")

if __name__ == "__main__":
    register_faces()
```

#### 连接模型与数据库实时检测

```python
import cv2
import insightface
from insightface.app import FaceAnalysis
import chromadb
import time
import threading
import queue

# --- 全局队列：用于主线程和子线程通信 ---
# maxsize=2 限制队列大小，防止内存爆炸和画面严重延迟
frame_queue = queue.Queue(maxsize=2) 
result_queue = queue.Queue(maxsize=2)

# 全局变量，用于存储最新的识别结果，供主线程画框使用
latest_faces_data = []

def ai_worker_thread():
    """
    子线程：负责耗时的 AI 检测和数据库查询 (消费者)
    """
    print("[子线程] 正在加载 InsightFace 模型和 ChromaDB...")
    
    # 1. 在子线程中独立初始化模型 (避免多线程抢锁，最稳妥的做法)
    app = FaceAnalysis(
        name="buffalo_s", 
        # root="./../", # 模型使用本地路径 
        providers=['CPUExecutionProvider'], 
        # 【核心优化】：只允许检测和识别，关掉年龄、性别、关键点等吃 CPU 的模块
        allowed_modules=['detection', 'recognition']
    )
    app.prepare(ctx_id=0, det_size=(320, 320))
    
    # 2. 在子线程中连接数据库
    client = chromadb.PersistentClient(path="./face_db")
    try:
        collection = client.get_collection(name="company_access")
    except:
        print("[子线程] ❌ 未找到人脸数据库！")
        return
        
    THRESHOLD = 0.40
    print("[子线程] ✅ AI 引擎就绪，开始监控...")
    last_open_time = {}

    while True:
        try:
            # 从队列中获取最新的一帧画面 (阻塞等待)
            frame = frame_queue.get(timeout=1.0)
        except queue.Empty:
            continue

        # --- 核心 AI 推理 ---
        faces = app.get(frame)
        current_frame_results = []
        
        for face in faces:
            bbox = face.bbox.astype(int)
            embedding = face.embedding.tolist()

            # 向量数据库查询
            results = collection.query(
                query_embeddings=[embedding],
                n_results=1,
                include=["metadatas", "distances"]
            )

            distance = results['distances'][0][0]
            similarity = 1.0 - distance
            metadata = results['metadatas'][0][0]
            name = metadata.get("name", "Unknown")

            color = (0, 0, 255)
            display_name = "Unknown"

            if similarity > THRESHOLD:
                if metadata.get("status") == "active":
                    display_name = name
                    color = (0, 255, 0)
                    
                    current_time = time.time()
                    if name not in last_open_time or (current_time - last_open_time[name] > 5.0):
                        print(f"✅ [{time.strftime('%H:%M:%S')}] 识别成功: {name} (相似度: {similarity:.3f}) -> 开门!")
                        last_open_time[name] = current_time
                else:
                    display_name = f"{name} (已停用)"
                    color = (0, 165, 255)
            
            current_frame_results.append({
                "bbox": bbox, "color": color, 
                "display_name": display_name, "similarity": similarity
            })

        # 将这一帧的识别结果放入结果队列
        if result_queue.full():
            try: result_queue.get_nowait() # 丢弃旧结果
            except: pass
        result_queue.put_nowait(current_frame_results)


def run_access_control():
    """
    主线程：负责摄像头读取和画面渲染 (生产者)
    """
    global latest_faces_data
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("无法打开摄像头")
        return

    # 启动 AI 子线程 (设置为守护线程，主程序退出时它也会自动退出)
    worker_thread = threading.Thread(target=ai_worker_thread, daemon=True)
    worker_thread.start()

    print("[主线程] 门禁系统画面启动... 按 'q' 退出。")

    while True:
        ret, frame = cap.read()
        if not ret: break

        # 1. 将最新画面推入队列给子线程处理
        # 【核心技巧】：如果队列满了，说明子线程处理不过来。此时丢弃旧画面，强制塞入最新画面，保证不延迟！
        if frame_queue.full():
            try: frame_queue.get_nowait() 
            except: pass
        frame_queue.put_nowait(frame)

        # 2. 检查子线程是否算出了新结果
        if not result_queue.empty():
            try:
                latest_faces_data = result_queue.get_nowait()
            except: pass

        # 3. 渲染画面 (主线程只管画框，绝对不卡)
        for face_data in latest_faces_data:
            bbox = face_data["bbox"]
            color = face_data["color"]
            display_name = face_data["display_name"]
            similarity = face_data["similarity"]

            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
            cv2.rectangle(frame, (bbox[0], bbox[1]-30), (bbox[2], bbox[1]), color, -1)
            cv2.putText(frame, f"{display_name} ({similarity:.2f})", 
                        (bbox[0], bbox[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

        cv2.imshow("Access Control (Multi-threaded)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_access_control()
```