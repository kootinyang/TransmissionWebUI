# Transmission Web UI - Inspector 页面样式修改教程

本教程详细介绍如何在代码中修改 Inspector（详情检查器）页面的各种样式，包括布局、颜色、字体、间距等。

---

## 一、Inspector 页面概述

Inspector 是点击工具栏 **Inspector** 按钮（或双击种子）后弹出的右侧详情面板。它包含 4 个标签页：

| 标签页 | 类名/ID | 内容 |
|--------|---------|------|
| **Info** | `.inspector-info-page` | 种子的基本信息（名称、大小、进度、状态等） |
| **Peers** | `.peers-page` | 已连接的 Peers 列表 |
| **Tiers** | `.tiers-page` | Tracker 服务器信息 |
| **Files** | `.files-page` | 种子内文件列表 |

### 整体 DOM 结构

```
.tabs-container          ← Inspector 外层容器（450px 宽侧栏）
  ├── .tabs-buttons      ← 标签切换按钮区（Info / Peers / Tiers / Files）
  ├── .tabs-container-close   ← 关闭按钮（×）
  └── .tabs-pages        ← 内容页面容器
       ├── .inspector-info-page   ← Info 页
       ├── .peers-page            ← Peers 页
       ├── .tiers-page            ← Tiers 页
       └── .files-page            ← Files 页
```

> 注：Inspector 的 DOM 是由 `transmission-app.js` **动态生成**的，`index.html` 中没有预写好的 Inspector HTML。

---

## 二、样式文件位置

所有 Inspector 样式集中在：

```
public_html/transmission-app.css
```

从第 `981` 行开始：

```css
/* ============================================
   Inspector Panel - New Design Styles
   ============================================ */
```

> 由于原有 CSS 是压缩的遗留代码，新样式普遍使用了 `!important` 来确保覆盖旧样式。修改时建议保持这一风格，除非你正在重构整个样式系统。

---

## 三、修改 Inspector 整体容器

### 3.1 容器选择器

```css
.tabs-container
```

### 3.2 可修改的属性示例

```css
.tabs-container {
  background: var(--background) !important;      /* 背景色 */
  border-left: 1px solid var(--border) !important; /* 左边框 */
  box-shadow: none !important;                    /* 阴影 */
  min-width: 450px !important;                    /* 最小宽度 */
  width: 450px !important;                        /* 固定宽度 */
  top: 112px !important;                          /* 距离顶部偏移 */
  bottom: 0 !important;
  padding: 16px 20px 12px 20px !important;        /* 内边距 */
  gap: 12px !important;                           /* 子元素间距 */
}
```

### 3.3 响应式宽度

在 `width < 600px` 时，Inspector 会变成全屏覆盖：

```css
@media (width < 600px) {
  .tabs-container {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    min-width: auto !important;
  }
}
```

**修改建议**：
- 想让 Inspector 更宽 → 修改 `width: 450px` 和 `min-width: 450px`
- 想让顶部留白更小 → 修改 `top: 112px`
- 想让背景半透明 → 改为 `background: rgba(17, 17, 17, 0.95) !important;`

---

## 四、修改标签按钮（Tabs）

### 4.1 标签按钮容器

```css
.tabs-buttons {
  background-color: var(--secondary) !important;
  border-radius: 8px !important;
  padding: 4px !important;
  gap: 4px !important;
}
```

### 4.2 单个标签按钮

```css
.tabs-button {
  background: transparent !important;
  border-radius: 6px !important;
  color: var(--muted-foreground) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding: 8px 4px !important;
  flex: 1 !important;               /* 平均分配宽度 */
  transition: background-color 0.15s ease, color 0.15s ease !important;
}
```

### 4.3 选中状态

```css
.tabs-button.selected,
.tabs-button:active,
.tabs-button:checked {
  background-color: var(--background) !important;
  color: var(--foreground) !important;
}
```

### 4.4 关闭按钮

```css
.tabs-container-close {
  width: 32px !important;
  height: 32px !important;
  background-color: var(--background) !important;
  color: var(--foreground) !important;
  border-radius: 6px !important;
  font-size: 18px !important;
}
```

**修改建议**：
- 按钮改成胶囊形状 → `border-radius: 999px !important;`
- 选中按钮高亮色改成主色 → `background-color: var(--primary) !important; color: var(--primary-foreground) !important;`
- 字号变大 → `font-size: 16px !important;`

---

## 五、修改 Info 页样式

### 5.1 页面布局

```css
.inspector-info-page {
  display: none !important;         /* 默认隐藏 */
  flex-direction: column !important;
  gap: 16px !important;
}

.inspector-info-page:not(.hidden) {
  display: flex !important;         /* 显示时切换为 flex */
}
```

### 5.2 种子名称

```css
.inspector-name-row {
  padding: 0 4px;
  margin-bottom: 4px;
}

.inspector-name-row span {
  font-size: 16px;
  font-weight: 500;
  color: var(--foreground);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
```

### 5.3 信息卡片（Card）

Info 页的数据被分组放在多个 `.inspector-card` 中：

```css
.inspector-card {
  background-color: var(--card) !important;
  border-radius: 12px !important;
  border: 1px solid var(--border) !important;
  padding: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}
```

### 5.4 卡片头部（带图标）

```css
.inspector-card-header {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.inspector-card-icon {
  width: 28px !important;
  height: 28px !important;
  background-color: var(--primary) !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
```

目前有 2 种图标类：
- `.activity` — Activity 卡片（折线图标）
- `.details` — Details 卡片（文档图标）

图标是通过 `::before` 伪元素和内联 SVG 背景图实现的。

### 5.5 信息行（Label + Value）

```css
.inspector-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px !important;
}

.inspector-row label {
  color: var(--muted-foreground) !important;
  font-size: 13px !important;
  font-weight: normal !important;
  flex-shrink: 0 !important;
}

.inspector-row span {
  color: var(--foreground) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  text-align: right !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
```

### 5.6 状态徽章（State Badge）

```css
.state-badge {
  background-color: var(--color-info) !important;
  color: var(--color-info-foreground) !important;
  padding: 4px 10px !important;
  border-radius: 999px !important;   /* 胶囊形 */
  font-size: 12px !important;
  font-weight: 600 !important;
  display: inline-block !important;
}

.state-badge.state-seed {
  background-color: var(--color-success) !important;
  color: var(--color-success-foreground) !important;
}

.state-badge.state-verify {
  background-color: var(--color-warning) !important;
  color: var(--color-warning-foreground) !important;
}

.state-badge.state-paused {
  background-color: var(--muted) !important;
  color: var(--muted-foreground) !important;
}

.state-badge.state-error {
  background-color: var(--color-error) !important;
  color: var(--color-error-foreground) !important;
}
```

### 5.7 Magnet 按钮

```css
.inspector-info-magnet button {
  width: 16px !important;
  height: 16px !important;
  border-radius: 3px !important;
  cursor: pointer !important;
  border: none !important;
  background-image: url("data:image/svg+xml,...");
  background-size: 14px;
  background-repeat: no-repeat;
  background-position: center;
}
```

**修改建议**：
- 卡片改成无边框风格 → 删除 `border: 1px solid var(--border)`
- 圆角变小 → `border-radius: 8px !important;`
- 信息行文字左对齐 → 删除 `.inspector-row span` 中的 `text-align: right`
- 状态徽章改成方形 → `border-radius: 4px !important;`

---

## 六、修改 Peers 页样式

### 6.1 页面布局

```css
.peers-page {
  gap: 16px !important;
}
```

### 6.2 Peers 表格

```css
.peer-list {
  border: none !important;
  overflow: visible !important;
  width: 100% !important;
  border-collapse: collapse !important;
}

.peer-list thead,
.peer-list tbody {
  display: flex !important;
  flex-direction: column !important;
}

.peer-list thead tr,
.peer-list tbody tr {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  height: 40px !important;
  border-bottom: 1px solid var(--border) !important;
}
```

### 6.3 表头样式

```css
.peer-list th {
  background-color: transparent !important;
  color: var(--white) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}
```

### 6.4 单元格样式

```css
.peer-list td {
  color: var(--muted-foreground) !important;
  font-size: 10px !important;
}
```

### 6.5 各列宽度定义

```css
/* 加密图标列 */
.peer-list th.encryption,
.peer-list td.encryption {
  width: 18px !important;
}

/* 速度列 */
.peer-list th.speed,
.peer-list td.speed {
  width: 70px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  justify-content: center !important;
  align-items: flex-end !important;
}

/* 完成度列 */
.peer-list th.percent-done,
.peer-list td.percent-done {
  width: 40px !important;
  text-align: center !important;
  color: var(--foreground) !important;
  font-weight: 500 !important;
}

/* 状态列 */
.peer-list th.status,
.peer-list td.status {
  width: 80px !important;
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  grid-template-rows: repeat(2, 1fr) !important;
  gap: 2px !important;
}

/* 地址列 */
.peer-list th.peer-address,
.peer-list td.peer-address {
  width: 100px !important;
  text-align: center !important;
  color: var(--foreground) !important;
}

/* 客户端名称列 */
.peer-list th.peer-app-name,
.peer-list td.peer-app-name {
  flex: 1 !important;          /* 自适应剩余宽度 */
  min-width: 60px !important;
  text-align: center !important;
  color: var(--white) !important;
}
```

### 6.6 速度文字颜色

```css
.peer-speed-up {
  color: var(--primary) !important;           /* 上传速度 */
  font-size: 10px !important;
  font-weight: 500 !important;
}

.peer-speed-down {
  color: var(--color-success-foreground) !important;  /* 下载速度 */
  font-size: 10px !important;
  font-weight: 500 !important;
}
```

### 6.7 Peer 状态徽章

```css
.peer-status-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  background-color: var(--muted) !important;
  color: var(--muted-foreground) !important;
  min-width: 16px !important;
}

/* 上传/下载中 */
.peer-status-badge[data-flag="D"],
.peer-status-badge[data-flag="U"] {
  background-color: var(--color-success) !important;
  color: var(--color-success-foreground) !important;
}

/* 加密/传入/Tracker */
.peer-status-badge[data-flag="E"],
.peer-status-badge[data-flag="I"],
.peer-status-badge[data-flag="T"] {
  background-color: var(--color-info) !important;
  color: var(--color-info-foreground) !important;
}

/* 阻塞/未知 */
.peer-status-badge[data-flag="H"],
.peer-status-badge[data-flag="X"] {
  background-color: var(--color-warning) !important;
  color: var(--color-warning-foreground) !important;
}
```

**修改建议**：
- 行高增加 → `height: 48px !important;`
- 表头背景加深色 → `background-color: var(--secondary) !important;`
- 表格增加圆角边框 → 给 `.peer-list` 添加 `border-radius: 8px !important; border: 1px solid var(--border) !important;`
- 状态徽章改成圆形 → `border-radius: 999px !important;`

---

## 七、修改 Tiers 页样式

### 7.1 页面布局

```css
.tiers-page {
  gap: 16px !important;
}
```

### 7.2 Tracker 列表容器

```css
#inspector-tiers-list {
  margin: 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
  border: none !important;
}
```

### 7.3 Tracker 分组标题

```css
#inspector-tiers-list .tier-list-torrent {
  color: var(--foreground) !important;
  padding: 12px 0 8px 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}
```

### 7.4 Tracker 信息行

```css
#inspector-tiers-list .tier-list-row {
  background-color: transparent !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 12px 0 !important;
  font-size: 13px !important;
}

#inspector-tiers-list .tier-list-row:last-child {
  border-bottom: none !important;
}

#inspector-tiers-list .tier-list-tracker {
  color: var(--color-info-foreground) !important;
  font-weight: 600 !important;
}
```

**修改建议**：
- 每行之间增加间距 → `margin-bottom: 8px !important;`
- 给每行加卡片背景 → `background-color: var(--card) !important; border-radius: 8px !important; padding: 12px !important;`
- Tracker URL 颜色改为主色 → `color: var(--primary) !important;`

---

## 八、修改 Files 页样式

### 8.1 页面布局

```css
.files-page:not(.hidden) {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}
```

### 8.2 文件卡片头部

```css
.files-card {
  background-color: var(--card) !important;
  border-radius: 12px !important;
  border: 1px solid var(--border) !important;
  padding: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.files-icon {
  width: 28px !important;
  height: 28px !important;
  background-color: var(--primary) !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
```

### 8.3 文件列表

```css
#inspector-file-list {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  list-style: none !important;
  display: flex !important;
  flex-direction: column !important;
}
```

### 8.4 单个文件条目

```css
#inspector-file-list .inspector-torrent-file-list-entry {
  display: flex !important;
  align-items: center !important;
  padding: 6px 0 !important;
  margin-bottom: 0 !important;
  border-bottom: none !important;
  gap: 0 !important;
  min-height: 28px;
}

/* 隔行变色 */
#inspector-file-list .inspector-torrent-file-list-entry:nth-child(even) {
  background-color: var(--muted) !important;
  border-radius: 4px;
}

#inspector-file-list .inspector-torrent-file-list-entry:nth-child(odd) {
  background-color: transparent !important;
}

/* 未选中的文件（灰色） */
#inspector-file-list .inspector-torrent-file-list-entry.skip {
  opacity: 0.5 !important;
}

#inspector-file-list .inspector-torrent-file-list-entry.skip .inspector-torrent-file-list-entry-name {
  color: var(--muted-foreground) !important;
}
```

### 8.5 文件名称和进度

```css
#inspector-file-list .inspector-torrent-file-list-entry-name {
  color: var(--foreground) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  line-height: 1.4 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#inspector-file-list .inspector-torrent-file-list-entry-progress {
  color: var(--muted-foreground) !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
}
```

### 8.6 文件勾选框

```css
#inspector-file-list .file-wanted-control {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 16px !important;
  height: 16px !important;
  border-radius: 4px !important;
  border: 1px solid var(--border) !important;
  background-color: transparent !important;
  margin: 0 0 0 4px !important;
  cursor: pointer !important;
  display: grid !important;
  place-items: center !important;
}

#inspector-file-list .file-wanted-control:checked {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
}

#inspector-file-list .file-wanted-control:checked::after {
  content: '' !important;
  width: 10px !important;
  height: 10px !important;
  background-image: url("data:image/svg+xml,...");  /* 白色对勾 */
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}
```

### 8.7 文件优先级按钮

```css
.file-priority-radiobox {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
}

.file-priority-radiobox > * {
  appearance: none !important;
  -webkit-appearance: none !important;
  background-color: transparent !important;
  border: 1px solid var(--muted-foreground) !important;
  border-radius: 4px !important;
  height: 20px !important;
  width: 20px !important;
  margin: 0 !important;
  padding: 0 !important;
  cursor: pointer !important;
  display: grid !important;
  place-items: center !important;
}

.file-priority-radiobox > *.checked {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
}
```

三个优先级图标：
- `.low` — 减号（`-`）
- `.normal` — 等号（`=`）
- `.high` — 三条横线（菜单图标）

**修改建议**：
- 文件条目增加悬停效果 → 添加 `#inspector-file-list .inspector-torrent-file-list-entry:hover { background-color: var(--secondary) !important; }`
- 勾选框改成圆形 → `border-radius: 999px !important;`
- 优先级按钮尺寸变大 → `height: 24px !important; width: 24px !important;`

---

## 九、通过 JS 修改 Inspector 结构

如果你不只是改样式，还想**修改 Inspector 的内容布局**，就需要编辑 JS。

### 9.1 文件位置

主文件（压缩版，生产使用）：
```
public_html/transmission-app.js
```

建议先看注释版（易读）：
```
Docs/transmission-app（注释版）.js
```

### 9.2 Inspector 类的关键方法

| 方法 | 作用 | 所在位置（注释版） |
|------|------|-------------------|
| `_createInfoPage()` | 创建 Info 页的 DOM | ~1571 行 |
| `_createPeersPage()` | 创建 Peers 表格 | ~1625 行 |
| `_createTiersPage()` | 创建 Tiers 容器 | ~1619 行 |
| `_createFilesPage()` | 创建 Files 容器 | ~1622 行 |
| `_create()` | 组装 4 个页面到 Tabs | ~1642 行 |
| `_updateInfo()` | 更新 Info 页数据 | ~1704 行 |
| `_updatePeers()` | 更新 Peers 数据 | 搜索 `_updatePeers` |
| `_updateTiers()` | 更新 Tiers 数据 | 搜索 `_updateTiers` |
| `_updateFiles()` | 更新 Files 数据 | 搜索 `_updateFiles` |

### 9.3 示例：在 Info 页添加新字段

假设你想在 Info 页添加一个显示 "Hash" 的新行：

**步骤 1**：在 `_createInfoPage()` 中创建元素

找到注释版 JS 的 `_createInfoPage()` 方法：

```javascript
static _createInfoPage() {
  let e = document.createElement('div');
  e.classList.add('inspector-info-page');
  let t = { root: e };
  
  // ... 已有代码 ...
  
  // 添加你自己的字段
  t.hash = o('Hash:');  // 创建 label + span
  
  return t;
}
```

**步骤 2**：在 `_updateInfo()` 中填充数据

```javascript
_updateInfo() {
  let { elements, torrents } = this;
  
  // ... 已有代码 ...
  
  // 填充 hash（假设只选中了一个种子）
  if (torrents.length === 1) {
    elements.info.hash.textContent = torrents[0].getHashString();
  } else {
    elements.info.hash.textContent = 'Mixed';
  }
}
```

> 注意：修改完注释版后，你还需要**同步修改** `public_html/transmission-app.js` 的对应压缩代码，或者重新构建项目。

### 9.4 示例：修改 Peers 表格的列

在 `_createPeersPage()` 中，表头定义如下：

```javascript
let o = ['', 'Up', 'Down', 'Done', 'Status', 'Address', 'Client'];
```

如果你想：
- 修改列标题 → 改 `o` 数组
- 调整列宽 → 改 CSS 中对应的 `.peer-list th.xxx` 和 `.peer-list td.xxx`
- 增加/删除列 → 需要同时修改 `o` 数组、`renderers` 数组和 `Be` 类名映射

---

## 十、使用浏览器开发者工具快速调试

### 10.1 推荐调试流程

1. 打开浏览器，进入 Transmission Web UI
2. 选中一个种子，点击 **Inspector** 打开详情面板
3. 按 `F12` 打开开发者工具 → Elements 面板
4. 用元素选择器点击 Inspector 中的任意元素
5. 在 Styles 面板中直接修改 CSS 属性，实时预览效果
6. 确定满意的样式后，再复制到 `transmission-app.css` 中

### 10.2 快速定位 CSS 选择器

开发者工具中，Computed → 展开任意属性可以看到生效的 CSS 规则。找到规则后，选择器通常直接可用。

常见的 Inspector 选择器前缀：
- `.tabs-container` — 外层容器
- `.tabs-container .tabs-button` — 标签按钮
- `.inspector-info-page` — Info 内容页
- `.peers-page` — Peers 内容页
- `.tiers-page` — Tiers 内容页
- `.files-page` — Files 内容页

---

## 十一、颜色变量速查表

所有颜色都使用 CSS 变量，修改一处即可全局生效：

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `--background` | `#111111` | 页面/Inspector 背景 |
| `--foreground` | `#ffffff` | 主要文字 |
| `--card` | `#1a1a1a` | 卡片背景 |
| `--card-foreground` | `#ffffff` | 卡片上的文字 |
| `--primary` | `#ff8400` | 主色调（橙色） |
| `--primary-foreground` | `#111111` | 主色上的文字 |
| `--secondary` | `#2e2e2e` | 次要背景 |
| `--secondary-foreground` | `#ffffff` | 次要背景上的文字 |
| `--muted` | `#2e2e2e` | 弱化背景 |
| `--muted-foreground` | `#b8b9b6` | 次要/灰色文字 |
| `--border` | `#2e2e2e` | 边框色 |
| `--color-info` | `#222229` | 信息状态背景 |
| `--color-info-foreground` | `#b2b2ff` | 信息状态文字 |
| `--color-success` | `#222924` | 成功状态背景 |
| `--color-success-foreground` | `#b6ffce` | 成功状态文字 |
| `--color-warning` | `#291c0f` | 警告状态背景 |
| `--color-warning-foreground` | `#ff8400` | 警告状态文字 |
| `--color-error` | `#3d1f1f` | 错误状态背景 |
| `--color-error-foreground` | `#ff5c33` | 错误状态文字 |

---

## 十二、常见修改场景示例

### 场景 1：让 Inspector 背景变成毛玻璃效果

```css
.tabs-container {
  background: rgba(17, 17, 17, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
}
```

### 场景 2：让 Info 页的卡片没有边框、更扁平

```css
.inspector-card,
.files-card {
  border: none !important;
  background-color: var(--secondary) !important;
  border-radius: 8px !important;
}
```

### 场景 3：加大 Peers 表格字体

```css
.peer-list th {
  font-size: 14px !important;
}
.peer-list td {
  font-size: 12px !important;
}
.peer-speed-up,
.peer-speed-down {
  font-size: 12px !important;
}
```

### 场景 4：修改标签页选中效果为下划线风格

```css
.tabs-buttons {
  background-color: transparent !important;
  gap: 16px !important;
}

.tabs-button {
  border-radius: 0 !important;
  position: relative !important;
}

.tabs-button.selected::after {
  content: '' !important;
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 2px !important;
  background-color: var(--primary) !important;
}
```

### 场景 5：Files 页增加文件图标

在 CSS 中给文件名称前加图标：

```css
#inspector-file-list .inspector-torrent-file-list-entry-name::before {
  content: '📄 ';
  margin-right: 4px;
}

#inspector-file-list .inspector-torrent-file-list-entry.skip .inspector-torrent-file-list-entry-name::before {
  content: '🚫 ';
}
```

---

## 十三、注意事项

1. **!important 的使用**：由于原有压缩 CSS 优先级较高，新样式大多用了 `!important`。如果你新增样式不生效，尝试加上 `!important`。

2. **JS 是压缩的**：`public_html/transmission-app.js` 是一行压缩代码，直接搜索类名（如 `inspector-info-page`）可以找到对应位置，但修改起来比较痛苦。建议对照 `Docs/transmission-app（注释版）.js` 来理解逻辑。

3. **没有构建流程**：当前项目没有 webpack/vite 等构建工具，直接修改 `transmission-app.css` 和 `transmission-app.js` 后刷新浏览器即可生效。

4. **测试建议**：修改前用浏览器开发者工具实时调试，确认效果后再写回 CSS，可以大幅减少试错时间。

---

*文档生成日期: 2026-04-16*
