# TransmissionWebUI CSS 冗余清理重构方案

## 一、现状对比分析

### 1.1 文件规模对比

| 文件 | 原始版本 (originGitVersion) | 当前版本 (public_html) | 变化 |
|------|---------------------------|----------------------|------|
| `transmission-app.css` | 43,340 字节 (2行) | 142,410 字节 (2,891行) | **+228%** |
| `index.html` | 3,679 字节 (117行) | 4,089 字节 (123行) | +11% |
| `transmission-app.js` | 112,965 字节 | 124,806 字节 | +10% |

### 1.2 CSS 核心指标对比

| 指标 | 原始版本 | 当前版本 | 变化 |
|------|---------|---------|------|
| `!important` 数量 | ~20 (压缩后) | **813** | **+40倍** |
| SVG Data URI 数量 | ~10 | **69** | +6倍 |
| `::before` 伪元素 | ~5 | **55** | +11倍 |
| 选择器重复定义 | 极少 | **16组** | — |

### 1.3 关键差异说明

**原始版本结构：**
```
transmission-app.css (43KB, 压缩单行)
  └── 上游编译产物：包含 CSS 变量、深色/浅色模式媒体查询、完整组件样式
```

**当前版本结构：**
```
transmission-app.css (142KB, 2891行)
  ├── 第1-2行: 原始上游压缩 CSS (保留原样)
  └── 第4-2891行: "New Design Styles" 覆盖层 (~99KB)
      ├── CSS 变量重新定义 (覆盖上游变量)
      ├── 工具栏覆盖 (Toolbar)
      ├── 状态栏覆盖 (Status Bar)
      ├── 种子列表覆盖 (Torrent List)
      ├── Inspector 面板覆盖
      ├── 右键菜单覆盖 (Overflow Menu)
      ├── 设置对话框覆盖 (Prefs Dialog)
      ├── 各类弹窗覆盖 (Dialogs)
      └── 响应式媒体查询
```

---

## 二、冗余代码成因分析

### 2.1 问题根源："补丁式覆盖"模式

当前 CSS 采用了**最粗暴但最保险**的覆盖策略：保留上游压缩 CSS 不动，在其后追加大量 `!important` 规则强制覆盖。这导致：

1. **优先级军备竞赛**：每一层覆盖都加上 `!important`，导致后续维护只能继续叠加 `!important`
2. **选择器重复定义**：同一元素在原始 CSS 和覆盖层中各定义一次，浏览器需要计算两次
3. **伪元素替换原始元素**：用 `display:none !important` 隐藏原始 SVG 图标，再用 `::before` + background-image 重建，造成 DOM 和 CSS 的双重浪费

### 2.2 冗余代码分类统计

#### 类型 A：优先级冗余（`!important` 泛滥）
```css
/* 典型模式：覆盖层中几乎每个属性都带 !important */
#toolbar-open {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
}
#toolbar-delete {
  background-color: var(--destructive) !important;
  color: #000000 !important;
}
/* ... 796 处类似代码 */
```

**问题**：如果原始 CSS 中对应规则的选择器优先级低于覆盖层，根本无需 `!important`。当前大量使用 `!important` 是因为：
- 原始 CSS 是压缩的，无法快速判断其选择器优先级
- 为了"绝对保险"，统一加了 `!important`

#### 类型 B：结构冗余（隐藏 + 重建）
```css
/* 1. 先隐藏原始图标 */
#mainwin-toolbar button svg,
.mainwin-toolbar button svg {
  display: none !important;
}

/* 2. 再用 ::before 重建一个新图标 */
#toolbar-open::before,
[data-action="open-torrent"]::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,...");
  /* ... */
}
```

**问题**：原始 SVG 仍存在于 DOM 中，只是被 `display:none` 隐藏。CSS 中同时维护了两套图标系统。

#### 类型 C：选择器重复定义
```css
/* 第1处 */
.tabs-container {
  background: var(--background) !important;
  border-left: 1px solid var(--border) !important;
  /* ... */
}

/* 第2处 */
@media (width >= 600px) {
  .tabs-container {
    min-width: 450px !important;
    width: 450px !important;
  }
}

/* 第3处 */
#prefs-dialog.tabs-container {
  padding: 16px 20px 12px 20px !important;
  gap: 12px !important;
  /* ... */
}
```

**问题**：`.tabs-container` 被分散在 3 处定义，维护时需同时修改多个位置。

#### 类型 D：硬编码值散落
```css
/* 颜色硬编码 —— 应该使用变量 */
#toolbar-open:hover { background-color: #e67700; }
#toolbar-delete:hover { background-color: #e04e2a; }
#toolbar-start:hover { background-color: #3a3a3a; }

/* 尺寸硬编码 —— 应该使用变量 */
#toolbar-overflow {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
}
```

#### 类型 E：重复的组合选择器
```css
/* 10+ 个弹窗共用同一套样式，但每个都单独列一遍 */
.popup.about-dialog .dialog-window,
.popup.confirm-dialog .dialog-window,
.popup.move-dialog .dialog-window,
.popup.shortcuts-dialog .dialog-window,
.popup.statistics-dialog .dialog-window,
.popup.rename-dialog .dialog-window,
.popup.labels-dialog .dialog-window,
.popup.add-dialog .dialog-window,
.popup.open-torrent .dialog-window,
.popup.remove-dialog .dialog-window {
  /* 完全相同的属性 */
}
```

---

## 三、重构目标

### 3.1 核心目标

| 目标 | 当前状态 | 目标状态 | 衡量标准 |
|------|---------|---------|---------|
| 消除冗余 !important | 813 处 | < 50 处 | 静态扫描 |
| 统一设计变量 | 大量硬编码 | 100% 变量化 | 人工审查 |
| 消除隐藏+重建模式 | 8 处 display:none + 55 个 ::before | 直接替换原始样式 | 代码审查 |
| 组件样式单一来源 | 16 组重复选择器 | 每组仅定义 1 次 | 静态扫描 |
| 文件体积 | 142KB | < 80KB | 文件大小 |

### 3.2 硬约束（不可妥协）

1. **像素级视觉一致性**：重构前后，同一状态下的界面必须完全一致
2. **不改变 JS 逻辑**：DOM 结构、class 名称、ID 名称全部保持
3. **不改变构建产物**：最终仍输出单个 `transmission-app.css` 文件
4. **浏览器兼容性不变**：保持 Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+

---

## 四、重构策略

### 4.1 总体思路：三层架构

```
┌─────────────────────────────────────────┐
│  Layer 3: Components (组件层)            │
│  - 按 UI 模块拆分的样式                    │
│  - 完全替代原始样式，无 !important        │
│  - 使用 @layer 隔离优先级                  │
├─────────────────────────────────────────┤
│  Layer 2: Tokens (变量层)                │
│  - 颜色、尺寸、间距、阴影等设计变量         │
│  - 统一主题管理                           │
├─────────────────────────────────────────┤
│  Layer 1: Vendor (上游层)                │
│  - 保留上游原始压缩 CSS                    │
│  - 迁移期作为 fallback                    │
└─────────────────────────────────────────┘
```

### 4.2 关键技术：CSS Cascade Layers (@layer)

利用 `@layer` 规则管理优先级，**彻底替代 `!important`**：

```css
/* 定义层级顺序（后声明的层优先级更高） */
@layer vendor, tokens, base, components, utilities;

/* Vendor 层：上游原始样式 */
@layer vendor {
  /* 保留或精简后的原始 CSS */
}

/* Tokens 层：设计系统变量 */
@layer tokens {
  :root {
    --background: #111111;
    --foreground: #ffffff;
    --card: #1a1a1a;
    --primary: #ff8400;
    /* ... */
  }
}

/* Components 层：组件样式 */
@layer components {
  #mainwin-toolbar {
    /* 无需 !important，因为 components 层优先级高于 vendor 层 */
    background-color: var(--card);
  }
}
```

**优势**：
- 同优先级选择器在不同层中时，**后声明的层自动胜出**
- 不再需要 `!important` 来强制覆盖
- 代码意图清晰："这是组件层对 vendor 层的覆盖"

### 4.3 图标系统重构策略

**当前方案（隐藏+重建）**：
```css
/* 隐藏原始 SVG */
button svg { display: none !important; }
/* 用 ::before 重建 */
button::before { background-image: url(...); }
```

**重构方案（直接替换）**：
```css
/* 方案 1：修改 JS 中生成 SVG 的 fill/stroke 颜色（推荐） */
/* 上游 JS 中图标使用 currentColor，只需控制父元素 color */

/* 方案 2：用 CSS mask-image 替换 SVG 内容（不动 JS） */
.toolbar-button svg {
  -webkit-mask-image: url("data:image/svg+xml,...");
  mask-image: url("data:image/svg+xml,...");
  background-color: currentColor;
  /* 原始 SVG path 被 mask 覆盖 */
}

/* 方案 3：在 vendor 层直接修改对应规则（最干净） */
@layer vendor {
  /* 替换原始 CSS 中对应图标的 background-image */
}
```

**推荐**：优先使用方案 1（如果 JS 中图标确实使用 `currentColor`），否则用方案 2。

---

## 五、分阶段实施计划

### Phase 0：建立基线与验证工具（1-2 天）

#### 步骤 0.1：创建 Git 分支
```bash
git checkout -b css-refactor
```

#### 步骤 0.2：备份当前版本
```bash
cp public_html/transmission-app.css public_html/transmission-app.css.backup
cp public_html/index.html public_html/index.html.backup
```

#### 步骤 0.3：建立视觉回归基线
- 使用浏览器开发者工具的 "Capture screenshot" 功能
- 或使用 Playwright 脚本截取以下状态的页面：
  1. 主界面（空列表状态）
  2. 主界面（多条种子 + 选中状态）
  3. Inspector 面板展开
  4. 右键菜单展开
  5. Open Torrent 弹窗
  6. Preferences 弹窗
  7. Remove 确认弹窗
- 将所有截图保存到 `Docs/screenshot/baseline/`

#### 验收标准
- 基线截图完整覆盖上述 7 个状态
- 截图使用固定 viewport（推荐 1440x900）

---

### Phase 1：文件拆分与 @layer 框架搭建（1 天）

#### 步骤 1.1：创建目录结构
```
public_html/
├── index.html                          # 保持不变（仍加载单 CSS）
├── transmission-app.css               # 最终产物（构建输出）
└── styles/                            # 源码目录（新增）
    ├── 00-vendor.css                  # 上游原始 CSS（精简版）
    ├── 10-tokens.css                  # 设计系统变量
    ├── 20-base.css                    # 基础元素样式
    ├── 30-components/
    │   ├── toolbar.css                # 工具栏
    │   ├── statusbar.css              # 状态栏
    │   ├── torrent-list.css           # 种子列表
    │   ├── inspector.css              # 检查器面板
    │   ├── overflow-menu.css          # 右键菜单
    │   ├── dialogs.css                # 各类弹窗
    │   └── prefs-dialog.css           # 设置对话框
    ├── 40-utilities.css               # 工具类（极少）
    └── index.css                      # 入口文件：定义 @layer 并导入所有模块
```

#### 步骤 1.2：编写 `styles/index.css`
```css
/* 定义层级顺序 */
@layer vendor, tokens, base, components, utilities;

/* 导入各层 */
@import url("00-vendor.css") layer(vendor);
@import url("10-tokens.css") layer(tokens);
@import url("20-base.css") layer(base);

/* 组件层按模块导入 */
@import url("30-components/toolbar.css") layer(components);
@import url("30-components/statusbar.css") layer(components);
@import url("30-components/torrent-list.css") layer(components);
@import url("30-components/inspector.css") layer(components);
@import url("30-components/overflow-menu.css") layer(components);
@import url("30-components/dialogs.css") layer(components);
@import url("30-components/prefs-dialog.css") layer(components);

@import url("40-utilities.css") layer(utilities);
```

#### 步骤 1.3：提取 `00-vendor.css`

从当前 `transmission-app.css` 中提取前 2 行（原始上游压缩 CSS），作为 `vendor` 层的基础。

**注意**：后续会逐渐精简 vendor 层——对于已经被 New Design 完全覆盖的组件，直接从 vendor 层删除对应规则。

#### 步骤 1.4：提取 `10-tokens.css`

将当前覆盖层中重新定义的所有 CSS 变量集中到 `tokens.css`：

```css
@layer tokens {
  :root {
    /* 颜色系统 */
    --background: #111111;
    --foreground: #ffffff;
    --card: #1a1a1a;
    --card-foreground: #ffffff;
    --primary: #ff8400;
    --primary-foreground: #111111;
    --secondary: #2e2e2e;
    --secondary-foreground: #ffffff;
    --muted: #2e2e2e;
    --muted-foreground: #b8b9b6;
    --border: #2e2e2e;
    --destructive: #ff5c33;
    
    /* 语义颜色 */
    --color-info: #222229;
    --color-info-foreground: #b2b2ff;
    --color-success: #222924;
    --color-success-foreground: #b6ffce;
    --color-warning: #291c0f;
    --color-warning-foreground: #ff8400;
    --color-error: #3d1f1f;
    --color-error-foreground: #ff5c33;
    
    /* 尺寸 */
    --toolbar-height: 56px;
    --statusbar-height: 56px;
    --card-radius: 12px;
    --card-padding: 20px;
    --card-gap: 16px;
    --button-height: 40px;
    --button-radius: 6px;
    --progress-height: 8px;
    --progress-radius: 999px;
    --icon-size: 48px;
    --icon-size-compact: 20px;
    
    /* 保留上游兼容变量 */
    --z-index-popup: 2;
    --black: #000;
    --white: #fff;
  }
}
```

#### 验收标准
- `styles/index.css` 可正常解析，无语法错误
- 所有模块文件已创建（内容可为空或仅含注释）
- 未改变 `public_html/transmission-app.css`（重构期间仍使用原文件）

---

### Phase 2：组件逐个迁移（核心工作，按模块分批）

**每个组件的迁移流程相同**：
1. 从当前 `transmission-app.css` 中提取该组件的所有规则
2. 移除所有 `!important`（利用 `@layer` 保证优先级）
3. 合并重复的选择器定义
4. 将硬编码值替换为 CSS 变量
5. 优化图标处理（消除隐藏+重建模式）
6. 在 `transmission-app.css` 中测试替换效果
7. 截图对比验证

#### 批次 A：工具栏 + 状态栏（建议首批，相对独立）

**当前代码位置**：`transmission-app.css` 第 87-453 行

**迁移目标文件**：`styles/30-components/toolbar.css` + `statusbar.css`

**迁移示例（工具栏按钮）**：

```css
/* ========== 重构前（当前代码）========== */
#toolbar-open,
[data-action="open-torrent"] {
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
}
#toolbar-open::before,
[data-action="open-torrent"]::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,...");
  /* ... */
}
#toolbar-open:hover,
[data-action="open-torrent"]:hover {
  background-color: #e67700;
}

/* ========== 重构后（迁移代码）========== */
@layer components {
  /* 基础按钮样式 */
  #mainwin-toolbar button,
  .mainwin-toolbar button {
    height: var(--button-height);
    min-width: auto;
    padding: var(--button-padding);
    border-radius: var(--button-radius);
    border: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--button-gap);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
    margin-right: 0;
    
    /* 图标统一使用 currentColor */
    svg {
      width: 16px;
      height: 16px;
      color: inherit;
    }
  }

  /* 各按钮变体 */
  #toolbar-open,
  [data-action="open-torrent"] {
    background-color: var(--primary);
    color: var(--primary-foreground);
    
    &:hover {
      background-color: var(--primary-hover); /* 新增变量 */
    }
  }

  #toolbar-delete,
  [data-action="remove-selected-torrents"] {
    background-color: var(--destructive);
    color: var(--black);
    
    &:hover {
      background-color: var(--destructive-hover);
    }
  }
  
  /* ... 其他按钮 */
}
```

**关键改进**：
- 移除所有 `!important`
- 移除 `::before` 伪元素重建图标（假设改用 JS 中的 SVG `currentColor`）
- 硬编码的 hover 色 `#e67700` → 变量 `--primary-hover`

#### 批次 B：种子列表（工作量最大，需仔细验证）

**当前代码位置**：`transmission-app.css` 第 455-979 行

**重点优化项**：
1. **卡片边框状态**：合并 `hover` 和 `selected` 的 20+ 条规则
2. **状态图标**：用 `mask-image` 替代 `::before` + background-image
3. **进度条**：简化 `::before` 填充逻辑

#### 批次 C：Inspector 面板

**当前代码位置**：`transmission-app.css` 第 982-1785 行

#### 批次 D：弹窗系统（对话框）

**当前代码位置**：`transmission-app.css` 第 2366-2891 行

**重点优化项**：
1. **合并共用选择器**：10 个弹窗共用完全相同的样式，应提取为 `.dialog-popup` 基础类

```css
/* 重构前：10 个选择器重复 */
.popup.about-dialog .dialog-window,
.popup.confirm-dialog .dialog-window,
/* ... */
.popup.remove-dialog .dialog-window {
  /* 相同属性 */
}

/* 重构后：提取基础类 */
@layer components {
  .popup .dialog-window {
    background: var(--card);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: 12px;
    /* ... */
  }
  
  /* 仅覆盖差异 */
  .popup.rename-dialog .dialog-window,
  .popup.confirm-dialog .dialog-window,
  .popup.move-dialog .dialog-window,
  .popup.labels-dialog .dialog-window,
  .popup.remove-dialog .dialog-window,
  .popup.about-dialog .dialog-window {
    width: min(440px, calc(100vw - 32px));
  }
  
  .popup.add-dialog .dialog-window,
  .popup.open-torrent .dialog-window,
  .popup.shortcuts-dialog .dialog-window,
  .popup.statistics-dialog .dialog-window {
    width: min(480px, calc(100vw - 32px));
  }
}
```

---

### Phase 3：Vendor 层精简（在组件层稳定后进行）

当所有组件都完成迁移并验证无误后，可以精简 `vendor` 层：

1. **完全移除已被覆盖的规则**：如果某条原始规则在所有状态下都被组件层覆盖，直接从 vendor 层删除
2. **合并未变更的规则**：如果某组件完全未修改，保留其原始规则在 vendor 层

**预期效果**：
- `vendor.css` 从 43KB 精简到约 15-20KB（仅保留未修改组件的样式）
- `transmission-app.css` 总大小从 142KB 降至 60-80KB

---

### Phase 4：构建脚本与最终合并（0.5 天）

#### 步骤 4.1：编写合并脚本

由于项目没有构建流程，使用简单的 Node.js 脚本或 PowerShell 脚本合并：

```javascript
// scripts/build-css.js
const fs = require('fs');
const path = require('path');

const styleDir = path.join(__dirname, '../public_html/styles');
const entryFile = path.join(styleDir, 'index.css');

function processImport(css, baseDir) {
  // 解析 @import 并内联内容
  // 解析 @layer 并输出扁平化 CSS（兼容旧浏览器时使用）
  // ...
}

// 输出到 transmission-app.css
fs.writeFileSync(
  path.join(__dirname, '../public_html/transmission-app.css'),
  processedCss
);
```

#### 步骤 4.2：更新 `index.html`

**重构期间**：开发时使用拆分后的文件（便于调试）
```html
<link href="./styles/index.css" rel="stylesheet" />
```

**发布时**：使用合并后的单文件
```html
<link href="./transmission-app.css" rel="stylesheet" />
```

---

## 六、消除 `!important` 的技术指南

### 6.1 逐条替换策略

对于每一条 `!important`，按以下顺序尝试替代：

| 优先级 | 替代方案 | 适用场景 |
|--------|---------|---------|
| 1 | **移除 `!important`** | 在 `@layer` 架构下，组件层自然高于 vendor 层，大部分可直接移除 |
| 2 | **增强选择器特异性** | `button { ... }` → `#mainwin-toolbar button { ... }` |
| 3 | **使用 `:where()` 降低上游权重** | 在 vendor 层用 `:where(#toolbar-open) { ... }` 降低原始权重 |
| 4 | **调整规则顺序** | 同层同权重选择器，后声明的生效 |
| 5 | **保留 `!important`** | 仅用于第三方库的不可控样式覆盖（极少） |

### 6.2 典型案例

```css
/* 案例 1：直接移除（最普遍） */
/* 重构前 */
#mainwin-toolbar {
  background-color: var(--card) !important;
  border-bottom: none !important;
}
/* 重构后 */
@layer components {
  #mainwin-toolbar {
    background-color: var(--card);
    border-bottom: none;
  }
}

/* 案例 2：增强选择器 */
/* 重构前 */
.tabs-button {
  background: transparent !important;
}
/* 重构后 */
@layer components {
  .tabs-container .tabs-button {
    background: transparent;
  }
}

/* 案例 3：保留 !important（极少数） */
/* 用于覆盖浏览器默认样式 */
.menu-item input[type="checkbox"] {
  appearance: none !important; /* 必须保留 */
}
```

---

## 七、质量保证措施

### 7.1 视觉回归检查清单

每完成一个组件的迁移，必须验证以下状态：

- [ ] 正常状态（无交互）
- [ ] Hover 状态
- [ ] 选中/激活状态
- [ ] 禁用状态
- [ ] 空状态（无数据）
- [ ] 深色模式（如适用）

### 7.2 自动化检查脚本

```powershell
# check-css.ps1
$css = Get-Content "public_html/styles" -Recurse -Filter "*.css" | Get-Content -Raw

# 统计 !important
$importantCount = ([regex]::Matches($css, '!important')).Count
Write-Output "!important count: $importantCount (target: < 50)"

# 统计 display:none !important
$hideCount = ([regex]::Matches($css, 'display:\s*none\s*!important')).Count
Write-Output "display:none !important: $hideCount (target: 0)"

# 统计硬编码颜色（排除变量定义）
$hexColors = [regex]::Matches($css, '#[0-9a-fA-F]{3,8}')
Write-Output "Hardcoded colors: $($hexColors.Count) (target: minimize)"

# 统计重复选择器
# ...
```

### 7.3 浏览器 DevTools 验证法

1. 打开浏览器 DevTools → Elements 面板
2. 选中目标元素
3. 查看 Computed 标签页
4. 对比重构前后的每一个 computed property
5. 特别关注：
   - `background-color`
   - `color`
   - `font-size`
   - `padding`
   - `margin`
   - `border`
   - `box-shadow`

---

## 八、风险与回滚方案

### 8.1 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| @layer 兼容性问题 | 低 | 高 | 提供 fallback：不支持 @layer 的浏览器使用传统顺序覆盖 |
| 优先级计算错误导致样式异常 | 中 | 中 | 每组件迁移后立即截图对比 |
| 遗漏某条 !important 的依赖 | 中 | 低 | 完整功能测试（点击所有按钮、打开所有弹窗） |
| 构建脚本错误 | 低 | 低 | 保留手动合并方案作为 fallback |

### 8.2 回滚方案

```bash
# 紧急回滚到重构前版本
cp public_html/transmission-app.css.backup public_html/transmission-app.css
cp public_html/index.html.backup public_html/index.html

# 或从 Git 恢复
git checkout main -- public_html/transmission-app.css public_html/index.html
```

---

## 九、预期成果

### 9.1 代码质量指标

| 指标 | 重构前 | 重构后 | 改善 |
|------|--------|--------|------|
| 文件大小 | 142KB | ~70KB | **-51%** |
| `!important` 数量 | 813 | < 50 | **-94%** |
| 选择器重复定义 | 16 组 | 0 组 | **-100%** |
| 隐藏+重建模式 | 8 处 | 0 处 | **-100%** |
| 硬编码颜色值 | ~100 处 | < 10 处 | **-90%** |
| CSS 变量数量 | ~30 个 | ~50 个 | **+67%** |

### 9.2 可维护性提升

1. **新增功能更快**：修改工具栏颜色只需改 `--toolbar-bg` 变量
2. **主题切换更简单**：深色/浅色模式通过切换 CSS 变量实现
3. **代码审查更容易**：每个组件独立文件，变更范围清晰
4. **新开发者上手更快**：文件结构自解释，无需阅读 2891 行 CSS

---

## 十、附录

### 附录 A：原始 CSS 变量清单（需保留兼容）

```css
/* 上游原始变量 —— 重构期间保留，逐步替换为 tokens 变量 */
--z-index-popup
--logo-size
--toolbar-height
--black
--blue-100, --blue-200, --blue-300, --blue-400
--dark-mode-black, --dark-mode-white
--default-accent-color-dark
--default-border-dark, --default-border-light
--default-tinted
--green-100, --green-300, --green-400, --green-500
--grey, --grey-200, --grey-40, --grey-500, --grey-900
--nice-grey
--red-500
--white
--yellow-300
```

### 附录 B：New Design 新增变量清单

```css
/* 已在使用中的 New Design 变量 */
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--color-error, --color-error-foreground
--border, --input, --ring
--color-info, --color-info-foreground
--color-success, --color-success-foreground
--color-warning, --color-warning-foreground
```

### 附录 C：快速参考——当前 !important 最多的选择器

| 选择器模式 | !important 数量 | 所属组件 |
|-----------|----------------|---------|
| `.popup.* .dialog-*` | ~200 | 弹窗系统 |
| `.inspector-*` / `.peer-list` | ~150 | Inspector |
| `#torrent-list .torrent*` | ~120 | 种子列表 |
| `#mainwin-toolbar*` / `#mainwin-statusbar*` | ~80 | 工具栏+状态栏 |
| `.overflow-menu*` | ~60 | 右键菜单 |
| `.tabs-container*` / `.tabs-button*` | ~50 | 标签页 |
| `#prefs-dialog*` / `.prefs-*` | ~50 | 设置对话框 |
| `.file-priority-radiobox*` | ~30 | 文件优先级 |

---

*文档版本: 1.0*
*创建日期: 2026-04-21*
*适用范围: public_html/transmission-app.css 冗余清理重构*
