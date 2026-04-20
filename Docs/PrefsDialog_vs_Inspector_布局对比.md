# PrefsDialog vs Inspector 布局对比

本文档对比 Transmission Web UI 中两个重要面板的布局差异：**PrefsDialog（设置对话框）** 和 **Inspector（详情检查器）**。

---

## 一、基础共同点

两者都基于同一个底层函数 `M()` 生成核心 DOM 结构：

```javascript
function M(id, tabs, callback) {
  // 生成：
  // .tabs-container
  //   ├── .tabs-buttons      (标签按钮容器)
  //   ├── .tabs-container-close  (× 关闭按钮)
  //   └── .tabs-pages        (页面内容容器)
  //        └── .tabs-page    (各个标签页内容)
}
```

因此它们共享以下基础特征：
- 都是右侧滑出的面板
- 都使用标签页（Tabs）切换内容
- 容器类名都是 `.tabs-container`
- 标签按钮类名都是 `.tabs-button`
- 关闭按钮类名都是 `.tabs-container-close`

---

## 二、核心布局差异一览

| 对比项 | **Inspector** | **PrefsDialog** |
|--------|---------------|-----------------|
| **容器 ID** | `#inspector` | `#prefs-dialog` |
| **挂载位置** | `#mainwin-workarea`（工作区内部） | `document.body`（顶层） |
| **打开方式** | 点击工具栏 Inspector 按钮 / 双击种子 | 通过菜单触发 |
| **标签页数量** | 4 个 | 4 个 |
| **标签页名称** | Info, Peers, Tiers, Files | Torrents, Speed, Peers, Network |
| **顶部结构** | 无标题栏，只有标签按钮 | **有独立的 Header 区域** |
| **容器 Padding** | `16px 20px 12px 20px` | `0`（由子层分别控制） |
| **内容组织** | 直接显示数据（只读为主） | 表单控件（可交互为主） |
| **卡片类名** | `.inspector-card` / `.files-card` | `.prefs-card` |

---

## 三、Inspector 布局详解

### 3.1 DOM 挂载方式

```javascript
document.querySelector('#mainwin-workarea').append(this.elements.root);
```

Inspector 被插入到 **主工作区** 内部，作为右侧固定宽度的侧栏（`450px`），与种子列表并排显示。

### 3.2 整体结构

```
#inspector.tabs-container
  ├── .tabs-buttons
  │    ├── .tabs-button [Info]
  │    ├── .tabs-button [Peers]
  │    ├── .tabs-button [Tiers]
  │    └── .tabs-button [Files]
  ├── .tabs-container-close  [×]
  └── .tabs-pages
       ├── .tabs-page.inspector-info-page
       │    ├── .inspector-name-row
       │    ├── .inspector-card (Activity)
       │    └── .inspector-card (Details)
       ├── .tabs-page.peers-page
       │    └── .peer-list (table)
       ├── .tabs-page.tiers-page
       │    └── #inspector-tiers-list
       └── .tabs-page.files-page
            └── #inspector-file-list
```

### 3.3 布局特点

1. **扁平结构**：`M()` 生成的结构就是最终结构，没有额外的 wrapper
2. **容器直接有 padding**：`.tabs-container { padding: 16px 20px 12px 20px }`
3. **标签按钮和内容页紧挨着**，没有标题栏分隔
4. **距离顶部有偏移**：`top: 112px`，为工具栏（56px）+ 状态栏（56px）留出空间

### 3.4 内容页特点

| 页面 | 内容形式 | 核心元素 |
|------|---------|---------|
| **Info** | 数据展示卡片 | `.inspector-card` 包含 `.inspector-row`（label + span） |
| **Peers** | 数据表格 | `.peer-list` `<table>`，有 thead/tbody |
| **Tiers** | 列表 | `#inspector-tiers-list` 分组显示 Tracker |
| **Files** | 列表 | `#inspector-file-list` `<ul>`，有 checkbox 和优先级按钮 |

---

## 四、PrefsDialog 布局详解

### 4.1 DOM 挂载方式

```javascript
document.body.append(this.elements.root);
```

PrefsDialog 被插入到 **body 顶层**，是一个模态/侧滑面板（点击外部可关闭）。

### 4.2 整体结构

> 注：虽然 `M()` 生成的基础结构和 Inspector 一样，但 PrefsDialog 在此基础上增加了额外的 wrapper 层。

```
#prefs-dialog.tabs-container
  ├── .prefs-dialog-header        ← 【新增】标题栏
  │    ├── .prefs-dialog-title    ← 标题文字
  │    └── .tabs-container-close  ← 关闭按钮（被推到右侧）
  ├── .prefs-dialog-tabs-wrapper  ← 【新增】标签按钮包裹层
  │    └── .tabs-buttons
  │         ├── .tabs-button [Torrents]
  │         ├── .tabs-button [Speed]
  │         ├── .tabs-button [Peers]
  │         └── .tabs-button [Network]
  └── .prefs-dialog-content       ← 【新增】内容区包裹层
       └── .tabs-pages
            ├── .tabs-page.prefs-torrents-page
            │    └── .prefs-card × N
            ├── .tabs-page.prefs-speed-page
            │    └── .prefs-card × N
            ├── .tabs-page.prefs-peers-page
            │    └── .prefs-card × N
            └── .tabs-page.prefs-network-page
                 └── .prefs-card × N
```

### 4.3 布局特点

1. **三层额外包裹**：
   - `.prefs-dialog-header` — 标题栏
   - `.prefs-dialog-tabs-wrapper` — 标签区（`padding: 8px 20px 0 20px`）
   - `.prefs-dialog-content` — 内容区（`flex: 1`，可滚动）

2. **容器 padding 为 0**：
   ```css
   #prefs-dialog.tabs-container {
     padding: 0 !important;
     gap: 16 !important;
     overflow: hidden !important;
   }
   ```
   所有间距由三个子层分别控制。

3. **关闭按钮移到 Header**：
   ```css
   #prefs-dialog .tabs-container-close {
     margin-left: auto !important;
   }
   ```

4. **内容区独立滚动控制**：
   ```css
   .prefs-dialog-content {
     flex: 1 1 auto;
     min-height: 0;
     overflow: hidden;
     display: flex;
     flex-direction: column;
   }
   ```

### 4.4 内容页特点

| 页面 | 内容形式 | 核心元素 |
|------|---------|---------|
| **Torrents** | 表单卡片 | `.prefs-card` 包含 checkbox、input、button |
| **Speed** | 表单卡片 | `.prefs-card` 包含 speed limit 输入框 |
| **Peers** | 表单卡片 | `.prefs-card` 包含 connections 设置 |
| **Network** | 表单卡片 | `.prefs-card` 包含 port、UPnP、加密等选项 |

每个页面内部都是由多个 `.prefs-card` 卡片组成，卡片内是垂直排列的表单控件。

---

## 五、CSS 结构差异对比

### 5.1 容器样式

```css
/* Inspector */
.tabs-container {
  padding: 16px 20px 12px 20px !important;
  top: 112px !important;     /* 避开 toolbar + statusbar */
}

/* PrefsDialog */
#prefs-dialog.tabs-container {
  padding: 0 !important;
  gap: 16 !important;
  overflow: hidden !important;
}
```

### 5.2 标签按钮区

```css
/* Inspector - 直接放在 .tabs-buttons 里，无额外包裹 */
.tabs-buttons {
  padding: 4px !important;
  gap: 4px !important;
}

/* PrefsDialog - 被 .prefs-dialog-tabs-wrapper 包裹 */
.prefs-dialog-tabs-wrapper {
  padding: 8px 20px 0 20px;
  flex-shrink: 0;
}
```

### 5.3 内容页

```css
/* Inspector */
.tabs-pages {
  padding: 16px 0 20px 0 !important;
}

/* PrefsDialog */
.prefs-dialog-content .tabs-pages {
  padding: 16px 20px 20px 20px !important;
  display: flex;
  flex-direction: column;
}
```

### 5.4 卡片样式

```css
/* Inspector 卡片 */
.inspector-card {
  background-color: var(--card) !important;
  border-radius: 12px !important;
  border: 1px solid var(--border) !important;
  padding: 16px !important;
  gap: 12px !important;
}

/* PrefsDialog 卡片 */
.prefs-card {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 12px !important;
  padding: 16px !important;
  gap: 12px !important;
}
```

两者卡片样式几乎一致，只是类名不同。

### 5.5 图标系统（重要差异）

**Inspector**：使用直接的内联 SVG 背景图
```css
.inspector-card-icon.activity::before {
  background-image: url("data:image/svg+xml,...");
}
```

**PrefsDialog**：使用 CSS Mask（遮罩）+ `currentColor`
```css
.prefs-card-icon::before {
  background-color: currentColor;
  -webkit-mask-image: url("data:image/svg+xml,...");
  mask-image: url("data:image/svg+xml,...");
}
```

这意味着 PrefsDialog 的图标颜色会跟随文字颜色自动变化，而 Inspector 的图标颜色是固定的 SVG 描边色。

---

## 六、内容组织差异

### 6.1 Inspector 的信息行

只读的数据展示，左右对齐：

```css
.inspector-row {
  display: flex !important;
  justify-content: space-between !important;
}

.inspector-row label { color: var(--muted-foreground); }
.inspector-row span  { color: var(--foreground); text-align: right; }
```

### 6.2 PrefsDialog 的表单控件

可交互的表单元素，垂直堆叠：

```css
.prefs-card-body {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.prefs-card-body > label { color: var(--muted-foreground); }
.prefs-card-body > input,
.prefs-card-body > select,
.prefs-card-body > textarea {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--foreground);
  width: 100%;
}
```

### 6.3 Checkbox 布局差异

**Inspector 几乎没有 checkbox**（除了 Files 页的 `.file-wanted-control`）。

**PrefsDialog 大量使用 checkbox**，并且有专门的横向排列规则：

```css
.prefs-card-body > div:has(> input[type='checkbox']) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
```

---

## 七、JS 层面的结构差异

### 7.1 Inspector 的 `_create()`

直接返回 `M()` 的结果，没有额外 wrapper：

```javascript
_create() {
  let e = {
    files: n._createFilesPage(),
    info: n._createInfoPage(),
    peers: n._createPeersPage(),
    tiers: n._createTiersPage(),
  };
  return {
    ...M('inspector', [
      ['inspector-tab-info', e.info.root, 'Info'],
      ['inspector-tab-peers', e.peers.root, 'Peers'],
      ['inspector-tab-tiers', e.tiers.root, 'Tiers'],
      ['inspector-tab-files', e.files.root, 'Files'],
    ]),
    ...e,
  };
}
```

### 7.2 PrefsDialog 的 `_create()`

同样基于 `M()`，但 CSS 表明实际 DOM 被额外包裹了 `.prefs-dialog-header`、`.prefs-dialog-tabs-wrapper`、`.prefs-dialog-content`。

> 注：注释版 JS（`Docs/transmission-app（注释版）.js`）中未显示这些 wrapper 的创建代码，但 `public_html/transmission-app.css` 和压缩版 JS 中确实引用了这些类名，说明 PrefsDialog 在最新版本中被重构为更复杂的布局结构。

---

## 八、关键差异总结

| 维度 | Inspector | PrefsDialog |
|------|-----------|-------------|
| **定位** | 工作区侧栏（与种子列表共存） | 顶层弹窗/侧滑面板 |
| **顶部** | 无标题栏 | 有 `.prefs-dialog-header` 标题栏 |
| **标签区** | 直接嵌入 `.tabs-container` | 被 `.prefs-dialog-tabs-wrapper` 包裹 |
| **内容区** | 直接嵌入 `.tabs-pages` | 被 `.prefs-dialog-content` 包裹 |
| **Padding** | 容器统一控制 | 分层控制（header/tabs/content 各自有 padding） |
| **交互性** | 以只读展示为主 | 以表单输入为主 |
| **卡片内布局** | Label + Span 横向排列 | 表单控件垂直堆叠 |
| **图标技术** | 固定颜色 SVG 背景图 | `mask-image` + `currentColor` 动态着色 |
| **表格使用** | Peers 页使用 `<table>` | 不使用表格，纯卡片+表单 |

---

## 九、修改建议

### 如果你想让 PrefsDialog 和 Inspector 风格更统一：

1. **统一图标系统**：把 Inspector 的 `background-image` 图标改成 PrefsDialog 的 `mask-image` 方案，或反之。

2. **统一顶部结构**：可以给 Inspector 也加一个轻量的 header（比如显示 "Inspector" 标题），或去掉 PrefsDialog 的 header 让两者都只有标签按钮。

3. **统一 padding 策略**：Inspector 是容器级 padding，PrefsDialog 是分层 padding。建议统一为容器级 padding，减少维护成本。

4. **统一卡片类名**：`.inspector-card` 和 `.prefs-card` 样式几乎一样，可以合并为通用的 `.panel-card`。

---

*文档生成日期: 2026-04-16*
