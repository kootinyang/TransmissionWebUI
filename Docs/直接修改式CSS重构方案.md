# TransmissionWebUI 直接修改式 CSS 重构方案

> **前提确认**
> - `transmission-app.b.css` 已删除，不再参与加载
> - `index.html` 唯一加载的样式文件为 `public_html/transmission-app.css`
> - 项目无 CSS 构建流程，修改后浏览器直接生效
> - Git 作为版本控制，可随时回滚

---

## 一、现状摘要（基于实际文件审计）

### 1.1 文件结构

`public_html/transmission-app.css`（2574 行）当前呈明显的"两段式"结构：

```
Line 1   ~ 1436    上游原始 CSS（已从压缩状态格式化展开）
Line 1437           /*# sourceMappingURL=transmission-app.css.map */
Line 1438 ~ 2574    New Design Styles 覆盖层
```

这种分界是历史遗留。由于上游层已展开为可编辑的格式化代码，**现在完全具备直接合并、精简的条件**。

### 1.2 关键指标

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| 总行数 | 2574 | ≤ 1800 |
| `!important` | 106 | ≤ 10 |
| CSS 变量定义数 | ~75 | ~45 |
| 冗余选择器定义 | 多处（如 `.tabs-container-close` × 4） | 每类仅 1 处 |
| 未使用变量 | 8 个（见下表） | 0 |

### 1.3 已确认的未使用变量

以下变量在 CSS 与 JS 中均未被引用，可安全删除：

| 变量名 | 说明 |
|--------|------|
| `--color-bg-hover` |  hover 背景色，当前由具体选择器直接控制 |
| `--color-bg-warn` | 警告背景，未被任何规则使用 |
| `--color-dialog-border` | 弹窗边框，未被使用 |
| `--color-fg-tabs` | Tab 文字颜色，未被使用 |
| `--color-fg-tertiary` | 三级文字色，未被使用 |
| `--color-fg-warn` | 警告文字色，未被使用 |
| `--color-progressbar-background-2` | 进度条背景，未被使用 |
| `--image-lock-fill` | 锁图标，未被使用 |

> **注意**：`--progress` 虽然在 CSS 中未以 `var()` 形式出现，但 `transmission-app.js` 中有 1 处动态赋值，**必须保留**。

---

## 二、重构原则

1. **视觉零变化**：重构前后，同一状态下的 computed style 必须完全一致。
2. **单文件、无构建**：继续维护 `transmission-app.css` 单文件，不引入 Sass/Less/PostCSS 等构建工具。
3. **先合并后精简**：先将"上游层"与"覆盖层"中同一选择器的定义合并为一处，再删除冗余属性。
4. **!important 最后清**：合并完成后再系统性移除 `!important`，避免过早移除导致优先级失控。
5. **变量最小化**：只保留"真正在页面中被展示"所依赖的颜色与图标变量。

---

## 三、实施策略：直接修改单文件

### 3.1 核心思路

不引入 `@layer`，也不拆分多文件。而是把 `transmission-app.css` 当作**唯一源码**进行整理：

- **删除** sourcemap 注释行（第 1437 行）
- **删除** "New Design Styles" 这类历史分界注释
- **合并** 同一选择器的分散定义
- **删除** 被完全覆盖的属性（后定义的值与前定义相同，或前定义被后定义 100% 覆盖）
- **删除** 未使用的 CSS 变量

### 3.2 冗余判定标准（新增）

除传统的"后定义完全覆盖前定义"之外，以下情况也应判定为冗余：

**类型 D：值完全一致的重复定义**

```css
/* 主定义 */
.tabs-container {
  padding: 16px 20px 12px 20px;
  gap: 12px;
  overflow: hidden;
}

/* 组件差异定义 —— 全部属性值与主定义相同，属于冗余 */
#prefs-dialog.tabs-container {
  padding: 16px 20px 12px 20px;
  gap: 12px;
  overflow: hidden;
}
```

> 即使高优先级选择器（如 `#id.class`）重复定义了低优先级选择器（如 `.class`）的同名属性，**只要值完全相同**，对最终 `computed style` 没有影响，应直接删除。

### 3.3 合并顺序

按选择器的功能模块分批处理，每批独立验收：

```
Phase 1: 变量层（Tokens）
Phase 2: 基础布局（:root, html, body, 滚动条）
Phase 3: 工具栏（Toolbar）
Phase 4: 状态栏（Statusbar）
Phase 5: 种子列表（Torrent List）
Phase 6: Inspector 面板
Phase 7: 弹窗与对话框（Dialogs）
Phase 8: PrefsDialog
Phase 9: 右键菜单（Overflow Menu）
Phase 10: Tabs 组件（含 .tabs-container-close）
Phase 11: 杂项与清理
```

---

## 四、分阶段实施计划

### Phase 1：变量层精简（Tokens）

**目标**：删除未使用变量，合并重复定义，将散落的颜色值统一收敛到变量。

**操作步骤**：
1. 删除已确认的 8 个未使用变量。
2. 检查 `--black` 定义了两处（`#000` 和 `#000000`），统一为 `#000`。
3. 检查 `--toolbar-height` 定义了两处（`50px` 上游值 和 `56px` New Design 值），确认实际使用 `56px`，删除上游 `50px`。
4. 将覆盖层中硬编码的颜色值（如 `#000000`）替换为已有变量（如 `--black`）。

**验收标准**：
- `:root` 块行数减少 ≥ 20%
- 页面各组件颜色无变化

---

### Phase 2 ~ 9：按组件合并冗余定义

**通用操作流程**（以每个组件为单位循环执行）：

```
1. 用 Grep 找出该组件所有相关选择器在上游层和覆盖层中的定义位置
2. 将同一选择器的定义逐条对比
3. 若覆盖层完全覆盖上游层 → 删除上游层该选择器
4. 若覆盖层只覆盖部分属性 → 将剩余有效属性合并到覆盖层，删除上游层
5. 若上游层和覆盖层属性互补 → 合并为一处完整定义
6. 删除所有 !important（验证后再删，见 Phase 11）
```

**关键检查点**：
- 合并后必须在浏览器 DevTools 中检查 `Computed` 面板，确认每个属性值与重构前一致。
- 特别关注 `background-color`、`color`、`border`、`padding`、`margin`、`box-shadow`。

---

### Phase 10：Tabs 组件专项（以 `.tabs-container-close` 为例）

这是本方案的示范模块，展示"合并 → 去重 → 清理"的完整流程。

#### 当前状态（4 处定义）

```css
/* ===== 上游层 line 768 ===== */
.tabs-container-close {
  font-size: 150%;
  cursor: pointer;
  background: var(--color-bg-primary);
  border: 0;
  color: var(--color-fg-primary);
}

/* ===== 覆盖层 line 1948 ===== */
.tabs-container-close {
  position: static;
  width: 32px;
  height: 32px;
  background-color: var(--background);
  color: var(--foreground);
  border-radius: 6px;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
}

/* ===== 覆盖层 line 1949 ===== */
.tabs-container-close:hover {
  opacity: 0.9;
}

/* ===== 覆盖层 line 2468-2469 ===== */
#prefs-dialog .tabs-container-close,
#inspector .tabs-container-close {
  background-color: var(--card);
  margin-left: auto;
  flex-shrink: 0;
  color: var(--white);
}
```

#### 重构后（2 处定义）

```css
/* ===== 合并后的通用样式 ===== */
.tabs-container-close {
  position: static;
  width: 32px;
  height: 32px;
  background-color: var(--background);
  color: var(--foreground);
  border-radius: 6px;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
}

.tabs-container-close:hover {
  opacity: 0.9;
}

/* ===== 组件差异（仅保留真正不同的属性） ===== */
#prefs-dialog .tabs-container-close,
#inspector .tabs-container-close {
  background-color: var(--card);
  margin-left: auto;
  flex-shrink: 0;
  color: var(--white);
}
```

#### 变更说明

| 操作 | 理由 |
|------|------|
| 删除上游 line 768 | 所有属性被 line 1948 覆盖（`font-size:150%` → `18px`，`background` → `var(--background)`，`color` → `var(--foreground)`，`border:0` → `border:none`） |
| 保留 line 1948 | 作为唯一主样式来源 |
| 保留 line 1949 | hover 状态独立存在 |
| 保留 line 2468-2469 | 这是真正的组件差异，无法合并到通用样式 |

**验收标准**：
- Inspector 和 PrefsDialog 的关闭按钮尺寸、颜色、位置、hover 效果与重构前 pixel 级一致。

---

### Phase 11：!important 系统性消除

**目标**：将 106 处 `!important` 降至 ≤ 10 处。

**策略**：

合并完成后，大部分 `!important` 已经失去存在的意义——因为冗余定义被删除了，不再有"选择器打架"的问题。此时按以下顺序处理：

| 优先级 | 操作 | 示例 |
|--------|------|------|
| 1 | **直接删除** | 合并后已无冲突的 `background-color: var(--card) !important;` |
| 2 | **增强选择器特异性**替代 | `.tabs-button { background: transparent !important; }` → `.tabs-container .tabs-button { background: transparent; }` |
| 3 | **保留**（极少数） | 浏览器默认样式覆盖，如 `appearance: none !important;` |

**禁止保留的场景**：
- 用于覆盖项目自身 CSS 的 `!important`（这是过去的补丁遗迹）
- 用于覆盖上游 CSS 的 `!important`（上游层已合并，不再存在"跨层覆盖"）

---

## 五、颜色精简方案

### 5.1 当前问题

存在两套颜色体系并存：

1. **上游旧体系**：`--color-bg-primary`、`--color-fg-primary`、`--color-fg-secondary`、`--default-tinted` 等
2. **New Design 体系**：`--background`、`--foreground`、`--card`、`--muted-foreground` 等

两套变量互相映射、互相覆盖，造成理解和维护负担。

### 5.2 精简策略

**原则**：以 New Design 体系为主干，上游旧体系中"仍在使用且无法被新体系直接替代"的变量保留，其余删除或映射。

**具体操作**：

```css
/* 重构前：两套变量 */
:root {
  --color-bg-primary: var(--black);     /* 旧体系 */
  --background: #111111;                 /* 新体系 */
}
#toolbar {
  background-color: var(--color-bg-primary);  /* 旧 */
}
#mainwin-toolbar {
  background-color: var(--card);              /* 新 */
}

/* 重构后：统一到新体系 */
:root {
  --background: #111111;
  --card: #1a1a1a;
  /* 删除 --color-bg-primary */
}
#toolbar {
  background-color: var(--background);
}
#mainwin-toolbar {
  background-color: var(--card);
}
```

**保留的旧变量**（因 JS 动态使用或语义特殊）：
- `--default-tinted`（进度条背景等仍在使用）
- `--nice-grey`（多处使用）
- 状态色：`--green-100`、`--red-500`、`--yellow-300` 等（语义明确，保留）

**删除的旧变量**：
- `--color-bg-primary` → 改用 `--background`
- `--color-fg-primary` → 改用 `--foreground`
- `--color-fg-secondary` → 改用 `--muted-foreground`
- `--color-border-default` → 改用 `--border`
- 其他已列出的未使用变量

---

## 六、图标精简方案

### 6.1 当前状态

CSS 中定义了以下图标变量：

| 变量 | 用途 | 保留/删除 |
|------|------|-----------|
| `--app-image-url` | application MIME 类型图标 | 保留 |
| `--audio-image-url` | audio MIME 类型图标 | 保留 |
| `--folder-image-url` | 文件夹图标（使用 6 次） | 保留 |
| `--font-image-url` | font MIME 类型图标 | 保留 |
| `--image-image-url` | image MIME 类型图标 | 保留 |
| `--package-image-url` | package MIME 类型图标 | 保留 |
| `--text-image-url` | text MIME 类型图标 | 保留 |
| `--video-image-url` | video MIME 类型图标 | 保留 |
| `--image-baseline` | 基线图标 | 保留（仍在使用） |
| `--image-chevron-dn` | 向下箭头 | 保留 |
| `--image-chevron-up` | 向上箭头 | 保留 |
| `--image-lock-fill` | 锁图标 | **删除**（未使用） |
| `--image-magnet` | 磁力链接图标 | 保留 |
| `--image-turtle` | 限速乌龟图标 | 保留 |

### 6.2 精简操作

1. **删除 `--image-lock-fill`**：CSS 与 JS 中均无引用。
2. **保留其余图标**：均为功能性图标，页面运行时会根据 torrent 的 MIME 类型动态展示。
3. **不删除 lucide 引用**：`transmission-app.js` 中使用了 lucide 图标库，CSS 中未直接出现 lucide 字符串（只在 `data:image/svg+xml` 中），这些 SVG 是图标的实际载体，不能删除。

---

## 七、验收标准

### 7.1 每阶段必做检查

1. **浏览器 DevTools 对比**
   - 打开重构前后的两个版本（可用 `git stash` 切换）
   - 选中同一元素，对比 `Computed` 面板中的关键属性
   - 必须一致：`background-color`、`color`、`border`、`padding`、`margin`、`font-size`、`box-shadow`

2. **功能检查**
   - 打开/关闭 Inspector 面板
   - 打开/关闭 PrefsDialog
   - 切换种子选中状态
   - 悬停工具栏按钮
   - 右键菜单展开

3. **截图对比（推荐）**
   - 使用浏览器全屏截图，对比重构前后

### 7.2 最终量化指标

| 指标 | 当前 | 目标 | 验收方式 |
|------|------|------|---------|
| 文件行数 | 2574 | ≤ 1800 | `wc -l` |
| `!important` | 106 | ≤ 10 | `grep -c '!important'` |
| 未使用变量 | 8 | 0 | 脚本扫描 + 人工确认 |
| 重复选择器 | 多处 | 0 | 人工审查 |
| 视觉一致性 | — | 100% | 截图对比 |

---

## 八、风险与回滚

| 风险 | 可能性 | 缓解措施 |
|------|--------|---------|
| 合并时误删有效属性 | 中 | 每阶段改完后立即用 DevTools 对比 computed style |
| 删除变量后发现有动态使用 | 低 | 已用脚本扫描 JS，但仍有遗漏可能；保留 `--progress` 这类边缘案例 |
| 上游原始层某些属性被覆盖层依赖 | 中 | 合并时不是简单删除上游，而是将"有效属性"迁移到合并后的定义中 |

**回滚命令**：
```bash
git checkout public_html/transmission-app.css
```

---

## 九、最小可执行的下一步

不要一次性改完整个文件。建议从 **Phase 10（Tabs 组件）** 开始：

1. 合并 `.tabs-container-close` 的 4 处定义为 2 处
2. 合并 `.tabs-container`、`.tabs-buttons`、`.tabs-button` 的分散定义
3. 验证 Inspector 和 PrefsDialog 的视觉一致性
4. 总结合并模式，再推广到其他组件

这个模块改动范围小、影响面明确（只有 Inspector 和 PrefsDialog 两个组件使用 Tabs），是验证"直接修改式重构"可行性的最佳切入点。
