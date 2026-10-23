---
title: "{课程标题}"
lesson: 1
summary: "{一句话，让读者判断要不要打开这一课。}"
reviewAfter: "3d"
sources:
  - title: "{主要来源}"
    url: "https://example.com"
    author: "{作者}"
    note: "{开课前读哪一节}"
---

# {课程标题}

学完这一课，你能**{一个具体能力}**。

<Source
  title="{主要来源}"
  url="https://example.com"
  author="{作者}"
  note="开课前先读第 2 节。"
/>

## 为什么现在讲这个

{两三句话，把这一课接到 [mission](/MISSION) 上。要具体。}

## {第一个概念}

{只讲这一课要用的知识。每个不显然的结论都带链接引用：[来源](https://example.com)。}

每个概念最多一道测验。选项长度要平行；正确项的位置在不同课之间要有变化。

<Quiz
  question="{问题？}"
  :options="['{选项 A}', '{选项 B}', '{选项 C}']"
  :answer="0"
  explanation="{一两句说明为什么，以及为什么其他选项错。}"
/>

## 动手

{用户实际要做什么。程序性或身体性的技能用 <Steps> 包 <Step>，一步一个动作。}

<Retrieval prompt="凭记忆说：{强迫回忆那个概念的问题}">

{答案，一到两句。}

</Retrieval>

## 本节要记住的

- {一句值得记住的话}
- {一句值得记住的话}

下一课：[{下一课标题}](/lessons/0002-{slug}) - 速查：[{速查页标题}](/reference/{slug}) - [术语表](/GLOSSARY#term)

---

卡住了，或者想往深里问？直接问你的教学 agent——它就是干这个的。
