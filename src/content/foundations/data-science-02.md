---
title: "Data Science 速查：数据清洗与特征工程"
date: 2026-04-11
category: foundations
description: "数据清洗与特征工程的核心操作：缺失值、异常值、编码、标准化和特征选择的实用速查。"
difficulty: intermediate
plainSummary: "数据清洗不是可选的前处理步骤，而是模型质量的基础。清洗质量决定了模型能学到什么。"
tags:
  - "Data Science"
  - "Feature Engineering"
lang: zh
draft: false
---

## 为什么数据清洗比模型选择更重要

一个经典说法：垃圾进，垃圾出。再强的模型，面对脏数据也只会学到噪声。在实际项目中，数据清洗和特征工程通常占据 60-80% 的时间。

## 缺失值处理

| 策略 | 适用场景 | 注意点 |
| --- | --- | --- |
| 删除行 | 缺失比例低（< 5%），数据量充足 | 可能引入偏差 |
| 填充均值/中位数 | 数值特征，分布接近正态 | 会降低方差 |
| 填充众数 | 类别特征 | 简单但可能不准确 |
| 前向/后向填充 | 时间序列数据 | 假设相邻值相关 |
| 标记为独立类别 | 缺失本身有业务含义 | 需要领域知识判断 |

```python
import pandas as pd

# 数值列用中位数填充
df['price'] = df['price'].fillna(df['price'].median())

# 类别列用 'unknown' 填充
df['category'] = df['category'].fillna('unknown')
```

## 类别特征编码

模型不能直接处理文本。常见编码方式：

| 方法 | 适用 | 输出 |
| --- | --- | --- |
| Label Encoding | 有序类别（低/中/高） | 整数 |
| One-Hot Encoding | 无序类别，类别数少 | 0/1 向量 |
| Target Encoding | 高基数类别 | 目标均值 |
| Embedding | 超高基数、深度学习 | 低维稠密向量 |

```python
# One-Hot
df_encoded = pd.get_dummies(df, columns=['color'], prefix='color')

# Label Encoding
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['size_encoded'] = le.fit_transform(df['size'])
```

## 特征标准化

不同特征的量纲差异巨大时（比如年龄 0-100 vs 收入 0-1000000），需要标准化：

| 方法 | 公式 | 适用 |
| --- | --- | --- |
| StandardScaler | (x - μ) / σ | 大多数情况 |
| MinMaxScaler | (x - min) / (max - min) | 需要 0-1 范围时 |
| RobustScaler | (x - 中位数) / IQR | 有异常值时 |

## 异常值检测

- **IQR 法**：低于 Q1 - 1.5×IQR 或高于 Q3 + 1.5×IQR 的值视为异常。
- **Z-score**：|z| > 3 的值视为异常。
- **可视化**：箱线图和散点图是最直观的检测工具。

异常值不一定要删除。有时异常值才是最有价值的信号。

## 特征选择

不是所有特征都有用。多余的特征会增加噪声、延长训练时间、导致过拟合。

1. **相关性分析**：删除与目标变量相关性极低的特征。
2. **方差过滤**：删除方差为零或极低的特征。
3. **特征重要性**：用树模型（Random Forest、XGBoost）输出的 feature importance 排序。
4. **正则化**：L1 正则化（Lasso）会自动把不重要特征的权重压到零。

## 和本站内容怎么接上

如果你想理解 AI 模型用到的数学基础，读 [Math for AI：向量空间与余弦相似度](../math-for-ai-01/)。

如果你想理解 Embedding 和向量检索的关系，读 [Embeddings、向量与 RAG](../ai-developer-core/embeddings-vector-rag/)。
