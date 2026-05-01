---
title: "数据科学速查：数据清洗与特征工程"
date: 2026-04-11
category: foundations
description: "数据清洗与特征工程的核心操作：缺失值、异常值、编码、标准化和特征选择的实用速查。"
difficulty: intermediate
plainSummary: "数据清洗并非可选的预处理步骤，而是模型质量的基石。清洗质量直接决定了模型学习的效果。"
tags:
  - "Data Science"
  - "Feature Engineering"
lang: zh
draft: false
---

## 为何数据清洗重于模型选择

业界有一句名言：“垃圾进，垃圾出”（Garbage In, Garbage Out, GIGO）。无论模型架构多么先进，面对低质量数据也只能学到噪声。在实际项目中，数据清洗和特征工程通常占据了 60%-80% 的开发时间。

## 缺失值处理

| 策略 | 适用场景 | 注意点 |
| --- | --- | --- |
| 删除行 | 缺失比例较低（< 5%），且样本量充足 | 可能引入样本偏差 |
| 填充均值/中位数 | 数值特征，分布接近正态 | 会降低整体方差 |
| 填充众数 | 类别特征 | 简单但可能掩盖真实分布 |
| 前向/后向填充 | 时间序列数据 | 基于相邻值相关的假设 |
| 标记为独立类别 | 缺失本身具有业务含义 | 需要结合领域知识判断 |

```python
import pandas as pd

# 数值列用中位数填充
df['price'] = df['price'].fillna(df['price'].median())

# 类别列用 'unknown' 填充
df['category'] = df['category'].fillna('unknown')
```

## 类别特征编码

模型无法直接处理文本数据。常见的编码方式如下：

| 方法 | 适用场景 | 输出形式 |
| --- | --- | --- |
| 标签编码 (Label Encoding) | 有序类别（如：低/中/高） | 整数 |
| 独热编码 (One-Hot Encoding) | 无序类别，且类别数量较少 | 0/1 向量 |
| 目标编码 (Target Encoding) | 高基数类别 | 目标变量的均值 |
| 嵌入 (Embedding) | 超高基数、深度学习场景 | 低维稠密向量 |

```python
# One-Hot 编码
df_encoded = pd.get_dummies(df, columns=['color'], prefix='color')

# Label 编码
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['size_encoded'] = le.fit_transform(df['size'])
```

## 特征标准化

当不同特征的量纲差异巨大时（例如：年龄 0-100 vs. 收入 0-1,000,000），必须进行标准化处理：

| 方法 | 公式 | 适用场景 |
| --- | --- | --- |
| StandardScaler | (x - μ) / σ | 绝大多数通用场景 |
| MinMaxScaler | (x - min) / (max - min) | 需要固定在 0-1 范围时 |
| RobustScaler | (x - 中位数) / IQR | 存在明显异常值时 |

## 异常值检测

- **IQR 法**：低于 Q1 - 1.5×IQR 或高于 Q3 + 1.5×IQR 的值视为异常。
- **Z-score**：绝对值 |z| > 3 的值通常视为异常。
- **可视化**：箱线图（Boxplot）和散点图（Scatter Plot）是最直观的检测工具。

注意：异常值并不一定需要删除。在某些场景下（如欺诈检测），异常值往往是最核心的信号。

## 特征选择

并非所有特征都对预测有贡献。冗余特征会引入噪声、增加训练耗时并导致过拟合。

1. **相关性分析**：剔除与目标变量相关性极低的特征。
2. **方差过滤**：删除方差为零或接近于零（特征值几乎无变化）的特征。
3. **特征重要性**：利用树模型（如 Random Forest、XGBoost）输出的特征重要性进行排序筛选。
4. **正则化**：L1 正则化（Lasso）会自动将不重要特征的权重压缩至零，实现自动筛选。

## 延伸阅读

如果你想深入理解 AI 模型背后的数学基础，请阅读 [Math for AI：向量空间与余弦相似度](../math-for-ai-01/)。

如果你想了解 Embedding 与向量检索的具体应用，请阅读 [Embeddings、向量与 RAG](../ai-developer-core/embeddings-vector-rag/)。
