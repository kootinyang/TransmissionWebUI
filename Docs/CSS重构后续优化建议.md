# CSS 重构后续优化建议

> 基于 Phase 1~11 已完成工作的验证结果，整理剩余优化空间与具体执行路径。

---

## 一、当前状态快照（验证日期：2026-04-23）

| 指标 | 基线 | 当前 | 目标 | 差距 |
|------|------|------|------|------|
| 总行数 | 2574 | **2395** | ≤ 1800 | 还需减 **595** 行 |
| `!important` | 106 | **80** | ≤ 10 | 还需减 **70** 个 |
| 未使用变量 | 8 | **0** | 0 | ✅ 已达标 |
| 重复选择器 | 多处 | **28 个** | 0 | 还需合并 |
| sourceMap / New Design 分界注释 | 有 | **仍有** | 无 | 未删除 |

**关键观察**：
- Phase 1（变量层）已彻底完成。
- Phase 2~9 的"合并同一选择器"工作已完成大部分，但仍有 **28 个选择器** 在上游层（line 1~861）和覆盖层（line 863~2395）同时存在。
- Phase 11（`!important` 清理）**尚未启动**，数量纹丝未动。
- 总行数缩减缓慢的核心原因：**覆盖层本身过于冗长**，即使上游层已压缩到 861 行，覆盖层仍有 1534 行。

---

## 二、剩余问题拆解与优化建议

### 优先级 1：删除历史分界标记（5 分钟，零风险）

**问题**：第 862 行的 `/*# sourceMappingURL=transmission-app.css.map */` 和第 865~867 行的 `/* New Design Styles - Merged from new-design-styles.css */` 仍然存在。这些标记在重构完成后已失去意义，且暗示"文件仍是两段拼接"，与"单文件唯一源码"的目标矛盾。

**操作**：
```css
/* 删除以下行（约 862~867） */
/*# sourceMappingURL=transmission-app.css.map */

/* ============================================
   New Design Styles - Merged from new-design-styles.css
   ============================================ */
```

**验收**：文件不再出现 `sourceMappingURL`、`New Design`、`Merged from` 字样。

---

### 优先级 2：合并剩余 28 个重复选择器（中等工作量，风险低）

**问题**：以下选择器在上游层和覆盖层各有一处定义，导致"同一元素由两段代码控制"，是维护负担的主要来源。

#### 2.1 Inspector 相关（8 个）

| 选择器 | 上游层位置 | 覆盖层位置 | 建议操作 |
|--------|-----------|-----------|---------|
| `.inspector-info-page` | ~line 780 | ~line 1800 | 合并为覆盖层定义，删除上游 |
| `.inspector-info-page:not(.hidden)` | ~line 781 | ~line 1801 | 同上 |
| `.inspector-info-magnet button` | ~line 790 | ~line 1810 | 同上 |
| `#torrent-inspector-name` | ~line 800 | ~line 1820 | 同上 |
| `.peer-list` | ~line 850 | ~line 1900 | 同上 |
| `.peer-list th` | ~line 851 | ~line 1901 | 同上 |
| `.file-priority-radiobox` | ~line 830 | ~line 1850 | 同上 |
| `.file-priority-radiobox>*` / `*.normal` / `*.checked` | ~line 831~833 | ~line 1851~1853 | 同上 |

> **注意**：`:root`（5 次）和 `:root .contrast-more`（2 次）属于合法的分媒体查询定义，**不应视为需要消除的重复**。

#### 2.2 PrefsDialog 相关（2 个）

| 选择器 | 说明 |
|--------|------|
| `#prefs-dialog .alt-speed-label` | 两处定义，合并为一处 |
| `.flexible-space` | 上游和覆盖层各有一次，合并 |

#### 2.3 通用组件（2 个）

| 选择器 | 说明 |
|--------|------|
| `.dialog-window` | 出现 3 次，检查是否分属不同组件（如 about-dialog、statistics-dialog），若是则保留差异定义；若属性完全相同则合并 |
| `.tabs-container` | 出现 3 次，同上处理 |

**合并模板**（以 `.inspector-info-page` 为例）：
```css
/* 步骤 1：找到上游层定义（约 line 780） */
.inspector-info-page {
  color: var(--color-fg-primary);
  padding: 10px;
}

/* 步骤 2：找到覆盖层定义（约 line 1800） */
.inspector-info-page {
  color: var(--foreground);
  padding: 16px;
  background: var(--card);
  border-radius: 8px;
}

/* 步骤 3：合并结果 —— 保留覆盖层（最终生效值），删除上游层 */
/* 上游层整段删除 */
.inspector-info-page {
  color: var(--foreground);
  padding: 16px;
  background: var(--card);
  border-radius: 8px;
}
```

**验收**：
- 用 DevTools 选中元素，对比合并前后的 `Computed` 面板，关键属性必须一致。
- 重复选择器数量从 28 降到 0（`:root` 等媒体查询例外不计入）。

---

### 优先级 3：系统性消除 `!important`（工作量最大，收益最显著）

**问题**：80 个 `!important` 是方案目标（≤10）的 8 倍。它们不再是"必要的优先级对抗工具"，而是过去补丁式覆盖的残留。

#### 3.1 按模块分布

| 模块 | 数量 | 所在大致行号 | 处理策略 |
|------|------|-------------|---------|
| **PrefsDialog 表单控件** | ~25 | 2180~2350 | 批量删除，必要时提升选择器特异性 |
| **Overflow Menu** | ~15 | 2038~2060 | 同上 |
| **Peer List** | ~5 | 1944~1966 | 同上 |
| **Dialog 宽度限制** | 2 | 2442~2446 | 用更具体的选择器替代 |
| **Toggle Switch / Checkbox** | ~15 | 2210~2245 | 批量删除 |
| **其他零散** | ~18 | 散落各处 | 逐条审查 |

#### 3.2 处理策略（按优先级排序）

**策略 A：直接删除（预计可解决 60% 以上）**

合并同一选择器后，大量 `!important` 已失去存在的理由。例如：

```css
/* 重构前 —— 上游层和覆盖层在打架 */
.overflow-menu {
  background: var(--color-bg-popup);
}
/* 覆盖层为了打赢 */
.overflow-menu {
  background: var(--card) !important;
}

/* 重构后 —— 上游层已删除，只剩一处定义 */
.overflow-menu {
  background: var(--card); /* !important 可直接删 */
}
```

**策略 B：提升选择器特异性（预计解决 30%）**

当 `!important` 是为了覆盖浏览器默认样式或其他第三方样式时，用更具体的选择器替代：

```css
/* 重构前 */
.tabs-button {
  background: transparent !important;
}

/* 重构后 */
.tabs-container .tabs-button {
  background: transparent;
}
```

**策略 C：保留（预计保留 ≤10 个）**

只允许以下场景保留 `!important`：
- 覆盖浏览器 UA 样式：`appearance: none !important;`
- 覆盖第三方库不可控样式
- 需要强制生效的 accessibility 相关属性

**禁止保留的场景**：
- 用于覆盖项目自身 CSS 的 `!important`
- 用于"打赢"上游层的 `!important`（上游已合并，不再存在跨层对抗）

#### 3.3 推荐执行顺序

按模块分批处理，每批独立验证：

1. **Peer List**（5 个，影响面最小）
2. **Dialog 宽度**（2 个，简单）
3. **Overflow Menu**（15 个，集中）
4. **PrefsDialog 表单控件**（25 个，最多但最集中）
5. **Toggle Switch / Checkbox**（15 个）
6. **零散剩余**（18 个）

---

### 优先级 4：精简覆盖层内部冗余（压降总行数的关键）

**问题**：即使上游层完全清空，覆盖层仍有 1534 行。要压到 1800 行以内，覆盖层自身需要再减约 300~400 行。

#### 4.1 常见冗余模式

**模式 A：同一属性的多值覆盖**

```css
/* 冗余：line-height 被连续定义两次 */
.tabs-container-close {
  line-height: 1;
  /* ... 其他 10 条属性 ... */
  line-height: 1.2;
}
```

**模式 B：已被默认值覆盖的属性**

```css
/* 冗余：margin 在更具体的选择器中被覆盖 */
.torrent {
  margin: 8px; /* 实际生效值由 .torrent-list .torrent 控制为 12px */
}
```

**模式 C：浏览器默认已提供的属性**

```css
/* 冗余：div 默认就是 block */
.some-div {
  display: block;
}
```

**模式 D：过长的选择器链**

```css
/* 可简化 */
#mainwin-toolbar #toolbar-open::before,
#mainwin-toolbar [data-action="open-torrent"]::before {
  /* ... */
}
/* 简化为 */
#mainwin-toolbar [data-action="open-torrent"]::before {
  /* ... */
}
```

#### 4.2 具体检查清单

| 检查项 | 预期减行 |
|--------|---------|
| 删除 `.tabs-button`、`.tabs-container-close` 等组件中无效的 `margin/padding/line-height` 重复定义 | ~50 行 |
| 合并工具栏按钮的 `::before` 伪元素定义（当前每个按钮独立 5~8 行，可提取公共部分） | ~80 行 |
| 简化种子列表中 `:has()` 选择器的重复结构（hover/selected 各状态有大量重复） | ~100 行 |
| 删除 Inspector 和 PrefsDialog 中已失效的上游层属性残留 | ~50 行 |
| 删除无意义的 `display: block`、`position: static` 等默认值 | ~30 行 |
| 压缩注释块（当前覆盖层有大量 `/* ===== ... ===== */` 装饰性注释） | ~50 行 |

---

## 三、最小可执行的下一步（推荐顺序）

不要一次性处理全部。按以下顺序，每完成一步就验证一次：

### Step 1：删除历史分界注释（5 分钟）
- 删除第 862 行的 `sourceMappingURL`
- 删除第 865~867 行的 `New Design Styles` 大注释
- **预期减行**：~5 行
- **风险**：零

### Step 2：先 commit 当前未提交的改动
- 当前工作区有 144 行删除（Inspector/PrefsDialog/Peer List/Overflow Menu 的上游重复规则），这些是正确的方向，应先 commit。

### Step 3：处理 Peer List 的 `!important`（10 分钟）
- 仅 5 个，集中在线 1944~1966
- 合并 `.peer-list` 定义后，大部分可直接删除 `!important`
- **预期减 important**：5 个
- **风险**：低（影响面明确）

### Step 4：批量删除 Overflow Menu 的 `!important`（15 分钟）
- 集中在线 2038~2060，一次性处理
- **预期减 important**：15 个

### Step 5：合并剩余的 28 个重复选择器（30 分钟）
- 按 Inspector → PrefsDialog → 通用组件的顺序
- 每合并一个就用 DevTools 验证 Computed 面板

### Step 6：处理 PrefsDialog 表单控件的 `!important`（20 分钟）
- 集中在线 2180~2350
- 这是数量最多的一批，但集中度高，适合批量处理
- **预期减 important**：25 个

### Step 7：精简覆盖层内部冗余（40 分钟）
- 按"检查清单"逐项扫描删除
- **预期减行**：~300 行

---

## 四、验收标准（每步必做）

1. **DevTools 对比**：打开重构前后两个版本，选中同一元素，对比 `Computed` 面板中的 `background-color`、`color`、`border`、`padding`、`margin`、`font-size`、`box-shadow`。
2. **功能冒烟**：Inspector 开关、PrefsDialog 开关、种子选中/悬停、右键菜单展开、工具栏按钮悬停。
3. **量化指标**：每完成一步，记录当前行数和 `!important` 数量，确保趋势向下。

---

## 五、风险提醒

| 风险 | 可能性 | 缓解措施 |
|------|--------|---------|
| 合并选择器时误删有效属性 | 中 | 严格使用 DevTools Computed 面板对比 |
| 删除 `!important` 后样式回退到浏览器默认 | 低 | 删除前先确认该选择器已没有更高优先级的冲突 |
| 精简冗余时误删 JS 动态依赖的属性 | 低 | 对不确定的属性，先在 JS 中 grep 确认无动态赋值 |

**回滚命令**：
```bash
git checkout public_html/transmission-app.css
```
