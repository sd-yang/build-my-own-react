# 学习记录中文版的 Build your own React

> https://qcsite.gatsbyjs.io/build-your-own-react/

## createElement

将 jsx 转化为 js, 返回特定的对象格式


## render

1. 第一阶段
- 根据转化后的js对象生存dom节点，再将新节点添加到容器中
- 对每一个子节点递归做相同的处理

2. 第二阶段
- 使用递归会阻塞任务进行，需要改写递归，使用 requestIdleCallback （react 使用 调度器 schedule) 来使优先级高的任务先进行
- 将任务分成不同的小块，进行循环

**Fibers**

- 将所有任务单元组织起来就需要一个数据结构 fiber树
- 每一个 element 都是一个fiber，每一个fiber都是一个任务单元

fiber节点主要完成以下内容：

- 把 element 添加到 DOM 上
- 为该 fiber 节点的子节点新建 fiber
- 挑出下一个任务单元



