# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

中文前端开发者，正在评估、学习或向团队解释 Preact，希望通过短时间的实践理解它的运行方式与适用场景。

## Product Purpose

帮助开发者通过可操作的演示理解 Preact 的组件与虚拟 DOM、差异更新、渲染调度、服务端渲染与补水，以及轻量运行时。成功意味着访客能亲自运行实验、观察结果，并据此形成准确的技术理解。

## Positioning

页面本身由 Preact 驱动，并以实际运行的交互实验展示其行为；不是只用静态页面陈述功能。

## Operating Context

面向中文技术阅读与浏览器体验。访客可在桌面或移动浏览器中阅读内容、操作演示并查看对应代码。

## Capabilities and Constraints

- 当前项目基于 Preact、TypeScript 与 Vite，含 Diff、调度器、SSR／hydrate、JSX／HTM／compat 和运行时体积等交互实验。
- Preact 与 React API 的兼容能力、约 4kB gzip 运行时等事实性内容应保持准确；不添加无来源的性能比较、客户背书或 benchmark。
- 关键实验需在页面内真实运行；保留现有功能、主题切换、可访问性和移动端支持。

## Evidence on Hand

- 仓库 README.md 中的官方介绍、功能描述与快速开始示例。
- `src/components/` 中可运行的实验台及 `scripts/verify.mjs` 浏览器验收。
