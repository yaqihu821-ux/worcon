---
name: Worcon canvas rendering
description: Compatibility and visibility considerations for Worcon’s animated background and settings overlay.
---

Worcon 的 Canvas 光场渐变应使用显式 `rgba()` 颜色字符串，不要依赖把带逗号的 HSL 片段拼进 `hsla()`；部分浏览器的 Canvas `addColorStop()` 会拒绝这种字符串。

**Why:** 预览环境出现过 Canvas `addColorStop` 的 “string did not match the expected pattern” 错误，改用 RGBA 后恢复正常。

**How to apply:** 新增或调整光场颜色时，使用 RGB 数值数组和 `rgba(r,g,b,a)` 拼接；设置遮罩则同时用 `aria-hidden` 或 `visibility` 明确控制默认隐藏与打开状态。