# TransmissionWebUI CSS 重构方案（保持现有界面样式完全不变）

## 目标与硬约束

- **视觉结果不变**：重构完成后，现有界面在所有关键状态下的表现与当前版本一致（建议以截图回归做到“像素级不变”）。
- **行为不变**：不改变 JS 逻辑与 DOM 结构（除非在后续阶段明确批准，并有同等回归保障）。
- **可分阶段落地**：每一步都可独立合并、可回滚，不依赖“最后一次大改”。
- **减少 !important 与重复覆盖**：最终目标是把 !important 收敛到极少数“明确的隔离/兼容”场景；同一元素的样式控制集中到单一来源（单一层/单一模块）。

## 现状摘要（基于仓库现文件）

- 当前线上入口只加载一个样式文件：`public_html/transmission-app.css`。
- `public_html/transmission-app.css` 是“上游编译产物（压缩）+ New Design 覆盖（未压缩）”的合并体，覆盖段落以 `New Design Styles - Merged from new-design-styles.css` 开始。
- 当前 `public_html/transmission-app.css` 内 **!important 出现次数约 813**（以仓库内统计为准）。
- `public_html/transmission-app.css.map` 的 `sourcesContent` 内嵌了上游 `assets/transmission-app.scss` 源码内容，这意味着“恢复可维护的源样式”在本仓库内是可行的（不必依赖外部拉取源码）。
- 仓库文档也明确提到当前形态偏向“直接改产物文件”，缺少完整构建流程；这正是 !important 与多处覆盖不断累积的主因之一。

## 为什么会出现大量 !important（问题成因拆解）

- **源样式不可维护**：当上游样式是压缩产物且无法稳定重建时，只能靠“更强的覆盖”补丁式改动，!important 会快速膨胀。
- **缺少明确层级**：同一组件的规则散落在不同位置、不同选择器强度不一致，导致“为了盖过上一段”不断加权。
- **缺少门禁**：没有“视觉回归”和“规范检查”，导致覆盖写法逐渐失控而不自知。

## 总体策略（不改 UI 的前提下逐步收敛复杂度）

用一句话概括：**先冻结现状并可验证，再引入层级与模块化，最后逐段迁移并删掉 !important**。

### 两条路线（推荐先走 A，再按需走 B）

- **路线 A（保守、风险最小）**：把现有 `transmission-app.css` 拆成“上游基座 + 覆盖层”，先做到“结构清晰但输出不变”，再在覆盖层内部逐步去 !important。
- **路线 B（更彻底、收益更大）**：从 sourcemap 内嵌 SCSS 恢复“可维护的源样式”，建立构建链路，把大量“覆盖式修补”转为“在源头修正”，从根上减少选择器对抗与 !important。

本方案默认按 **A →（可选）B** 执行，确保任何时刻 UI 都可保持不变且可回退。

## 阶段化落地计划

### Phase 0：建立“界面不变”的可执行验收基线（先做门禁，后做重构）

1. **冻结当前版本作为基线**
   - 保存当前 `public_html/transmission-app.css` 的一份只读备份（例如复制为 `transmission-app.legacy.css`，或用 git tag/分支标记）。
2. **定义关键界面与状态集合（最小覆盖集）**
   - 主界面：工具栏、状态栏、种子列表（空/多条/滚动/选中/悬浮）。
   - 弹窗：Add/Remove/Rename/Move/Prefs/About/Statistics/Shortcuts 等。
   - 交互态：hover/focus/disabled/选中/错误态；深色主题下的对比度与可读性。
   - 右键菜单与子菜单（含分隔线、禁用项、warning 项）。
3. **引入截图回归（强烈推荐自动化）**
   - 推荐 Playwright 做 UI 截图对比：固定 viewport、固定字体渲染参数、屏蔽动态时间/速度等文本差异（必要时对动态区域做 mask）。
   - 以 `Docs/screenshot/` 现有截图作为参考，但建议用自动化生成“当前版本的全套基线图”，后续每次改动跑对比。

验收标准：任何重构提交如果引入截图差异（非白名单），直接阻止合并。

### Phase 1：拆分与归档（输出不变）

目标：把“谁在控制样式”变得一眼可读，但**不改变最终加载顺序与效果**。

建议做法（两种任选其一）：

- **方式 1：多文件 + 保持加载顺序**
  - 从 `public_html/transmission-app.css` 中拆出：
    - `public_html/styles/vendor.css`：保留上游压缩段（尽量不改内容，仅做搬迁）。
    - `public_html/styles/overrides.css`：保留 New Design 覆盖段（原样迁移）。
  - 在 `public_html/index.html` 中按原有顺序引入两个 `<link>`：先 vendor 后 overrides。
  - 这样可显著降低“同文件内互相覆盖难追踪”的问题。

- **方式 2：仍然单文件，但加入明确的边界与索引**
  - 仍输出为单个 `transmission-app.css`，但把文件结构重排为：
    - vendor（原样、不编辑）
    - overrides（按模块分段）
    - 临时补丁（集中到文件末尾，严格限制）
  - 适合你必须保持“只替换一个 CSS 文件”的分发方式。

验收标准：截图回归 0 diff；`index.html` 的加载性能与行为不出现退化（字体、布局抖动等）。

### Phase 2：引入“可控层级”，替代 !important 的主要用途

目标：让覆盖关系由“选择器对抗/!important”转为“稳定的层级规则”，从而可以开始系统性删 !important。

推荐策略（现代浏览器）：**CSS Cascade Layers（@layer）**

1. 设计层级（示例）：
   - `@layer vendor;`（上游基座，尽量不动）
   - `@layer tokens;`（变量/主题）
   - `@layer base;`（基础元素与布局基线）
   - `@layer components;`（组件样式：toolbar/statusbar/dialog/context-menu/torrent-card…）
   - `@layer utilities;`（极少量工具类/修复类，原则上避免）
   - `@layer overrides;`（临时兼容与过渡层）
   - `@layer legacy;`（仅在迁移期保留：放置还没来得及拆解的旧覆盖）
2. 迁移原则：
   - 先把现存覆盖整体放进 `legacy` 层，保证“现状不变”。
   - 然后按组件逐个把规则迁移到 `components/base/tokens`，并在迁移过程中删掉对应 !important。
   - 每迁移一个组件就跑截图回归，确保 UI 不变。

如果需要兼容不支持 `@layer` 的环境：保留路线 A 的多文件顺序，并通过“统一选择器策略 + 限制覆盖入口”来达到类似效果（见 Phase 3）。

### Phase 3：系统性消除 !important（按模块逐个清理）

目标：把“同一元素多段代码在控制”收敛到“每个组件只有一个主模块在控制”。

推荐按组件分批（每批都可独立验收、独立回滚）：

1. **工具栏（Toolbar）**
2. **状态栏（Status Bar）**
3. **种子列表（Torrent list / card / row）**
4. **弹窗（Dialog）**
5. **右键菜单（Context menu）**
6. **Inspector 区域（如果存在）**

每个组件批次的操作清单：

- 抽取该组件所有相关规则到单一文件/单一段落（例如 `components/context-menu.css`）。
- 给规则分三类：布局、视觉（颜色/圆角/阴影）、状态（hover/disabled/selected）。
- 先删“明显无效/重复”的规则（可通过浏览器 computed style 验证是否被覆盖）。
- 再用以下顺序替代 !important：
  1. **调整层级（layer / 文件顺序）**
  2. **降低上游选择器冲突**：尽量避免深层后代选择器对抗；必要时使用 `:where()` 降低自身选择器权重，让层级生效更可控
  3. **把硬编码改为变量**：例如颜色、间距、圆角统一走 tokens，减少“同值散落”
  4. **只在迁移期保留 !important**：并集中放进 `legacy/overrides`，禁止在新模块新增

验收标准：
- 对应组件的 !important 数量明显下降（至少做到“新模块 0 !important”）。
- 截图回归 0 diff。
- 同一组件的样式控制点收敛为 1 处（不再跨文件互盖）。

### Phase 4：建立“风格规范 + 自动检查”，防止回归到“补丁式覆盖”

1. **Stylelint（或等价方案）**
   - 禁止在 `tokens/base/components` 使用 `!important`（仅允许在 `legacy/overrides`）。
   - 限制选择器最大嵌套深度、最大 specificity、禁止重复属性等。
2. **CSS 结构约定**
   - 明确每个组件文件负责的 DOM 范围与入口 class（例如 `.context-menu`, `.torrent-card` 等）。
   - 不允许“跨组件”选择器（例如从列表去改弹窗内部），必须通过 tokens 或组件内部规则实现。
3. **变更流程**
   - 任何样式变更必须附带：影响范围说明 + 对应截图回归更新（若确实需要改 UI，则走“设计变更流程”，而不是在重构阶段发生）。

## 推荐的目录与产物形态（建议目标架构）

> 这里给出一种可落地的目标结构；你也可以选择“仍然单 CSS 文件”的方式，但核心是：**有源、有层级、有门禁**。

- `src/styles/`
  - `vendor/`（上游基座：可从 sourcemap 的 sourcesContent 恢复 SCSS 后再编译，或临时保留 vendor.css）
  - `tokens/`（设计系统变量：颜色、圆角、间距、阴影、z-index）
  - `base/`（通用布局与元素基线）
  - `components/`（按 UI 模块拆分）
  - `overrides/`（迁移期少量兼容）
  - `index.css`（汇总入口：定义 layer 顺序并导入各模块）
- `public_html/`
  - `transmission-app.css`（最终发布产物：可由构建生成，或手工合并但必须可重现）

## 验证与回滚机制（保证“完全不变”的关键）

- **视觉回归优先于主观判断**：任何一次“我觉得没变”都不可靠，必须以截图对比为准。
- **小步提交 + 组件粒度迁移**：每次只迁移一个组件的规则，做到可定位、可回滚。
- **永远保留 legacy 层直到最后**：当一个组件完成迁移并稳定后，再从 legacy 删除对应规则。

## 可量化的成功标准（建议 KPI）

- `!important` 数量从 813 逐步下降到：
  - 迁移期：主要集中在 `legacy/overrides`，新模块接近 0
  - 完成期：全仓库仅保留极少数必要 !important（并有清晰原因与归属）
- 重复选择器/重复属性显著下降（可用静态分析工具统计）。
- 截图回归长期保持稳定（重构 PR 的 diff=0 成为常态）。

## 附：最小可执行的下一步（建议从这里开始）

1. 先把“当前版本基线截图”自动化跑起来（哪怕只覆盖主界面 + 2 个弹窗）。
2. 做 Phase 1 的拆分（vendor/overrides），确保输出不变。
3. 选一个最独立的模块（推荐右键菜单或工具栏）作为第一批次，把该模块的 !important 清到 0，并总结迁移模板。

