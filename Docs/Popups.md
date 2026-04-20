# Transmission Web UI 弹窗/对话框清单

> 基于 `public_html/transmission-app.js` 与 `Docs/transmission-app（注释版）.js` 代码梳理

---

## 概述

项目中所有弹窗、对话框、面板统一通过 `TransmissionController.setCurrentPopup(popup, level)` 进行层级管理：

- **Level 0**：Inspector、OverflowMenu、PrefsDialog 等大型/常驻面板
- **Level 1**（默认）：各类操作对话框（About、Add、Remove、Rename 等）
- **Level 2**：右键上下文菜单（ContextMenu）
- 按 `ESC` 键可从高到低逐级关闭弹窗

---

## 1. AboutDialog (`ee`)

| 属性 | 说明 |
|------|------|
| **用途** | 显示关于 Transmission 的基本信息 |
| **内容** | 版本号、校验和、版权声明、官网链接 |
| **按钮** | Close |
| **触发方式** | Overflow Menu → `About` |

---

## 2. AddTorrentDialog (`N`)

| 属性 | 说明 |
|------|------|
| **用途** | 添加新的 Torrent 任务 |
| **内容** | - URL / Magnet 链接输入框<br>- 本地 `.torrent` 文件上传<br>- 目标下载目录选择<br>- 剩余磁盘空间显示<br>- 是否暂停开始（Paused） |
| **按钮** | Cancel / OK |
| **触发方式** | 点击 Toolbar `Open` 按钮 / 拖拽文件到页面 / 粘贴 Magnet 链接 |

---

## 3. ConfirmDialog (`k`)

| 属性 | 说明 |
|------|------|
| **用途** | 通用提示/确认对话框（仅显示信息，无确认操作） |
| **使用场景** | - 添加 Torrent 失败时的错误提示<br>- 重命名失败时的错误提示<br>- **ConnectionAlert**：连接服务器失败时弹出（标题 "Connection failed"） |
| **按钮** | Close（无 OK 按钮） |
| **触发方式** | 各类异步操作出错时自动弹出 |

---

## 4. ContextMenu (`te`)

| 属性 | 说明 |
|------|------|
| **用途** | Torrent 列表或 Inspector 文件列表的右键上下文菜单 |
| **内容** | Resume / Resume now / Pause / Move in queue / Remove / Trash data / Verify local data / Set location / Rename / Edit Labels / Reannounce peers / Select operation |
| **按钮** | 无，点击菜单项后自动关闭 |
| **触发方式** | 在 Torrent 项或 Inspector 文件项上右键 |

---

## 5. Inspector (`S`)

| 属性 | 说明 |
|------|------|
| **用途** | 右侧滑出的任务详情面板（以 popup 层级管理） |
| **标签页** | **Info**：活动状态、文件详情、基本信息（Have / Uploaded / State / Running time 等）<br>**Peers**：Peer 列表（上传/下载速度、进度、状态、地址、客户端）<br>**Tiers**：Tracker 服务器状态<br>**Files**：文件列表、下载优先级、 wanted 勾选 |
| **按钮** | 右上角 `×` 关闭 |
| **触发方式** | 点击 Toolbar `Inspector` 按钮 / 快捷键 `I` |

---

## 6. LabelsDialog (`ce`)

| 属性 | 说明 |
|------|------|
| **用途** | 编辑 Torrent 的标签 |
| **内容** | 标签输入框（支持逗号分隔多个标签） |
| **按钮** | Cancel / Save |
| **触发方式** | Context Menu / Overflow Menu → `Edit Labels…`（快捷键 `K`） |

---

## 7. MoveDialog (`oe`)

| 属性 | 说明 |
|------|------|
| **用途** | 修改 Torrent 的保存位置 |
| **内容** | Location 路径输入框 |
| **按钮** | Cancel / Apply |
| **触发方式** | Context Menu → `Set location…`（快捷键 `L`） |

---

## 8. OverflowMenu (`H`)

| 属性 | 说明 |
|------|------|
| **用途** | 右上角"更多选项"下拉菜单 |
| **内容** | **Display**：紧凑模式、高对比度、排序方式、排序方向<br>**Actions**：Edit preferences、Keyboard shortcuts、Pause all、Start all<br>**Help**：Statistics、About |
| **按钮** | 无，点击菜单项后自动关闭 |
| **触发方式** | 点击 Toolbar 右侧 `⋮` 按钮 / 快捷键 `M` |

---

## 9. PrefsDialog (`ie`)

| 属性 | 说明 |
|------|------|
| **用途** | 首选项设置对话框 |
| **标签页** | **Torrents**：下载目录、做种限制、自动启动等<br>**Speed**：全局速度限制、Turtle 模式、时间段限速<br>**Peers**：连接数限制、端口状态、DHT / LPD / PEX 开关、Blocklist 更新<br>**Network**：监听端口、端口转发、UPnP / NAT-PMP、加密模式 |
| **按钮** | Cancel / OK |
| **触发方式** | Overflow Menu → `Edit preferences`（快捷键 `P`） |

---

## 10. RemoveDialog (`ne`)

| 属性 | 说明 |
|------|------|
| **用途** | 删除 Torrent 前的确认对话框 |
| **内容** | 动态文案：根据选中数量和是否删除数据（Trash）显示不同提示 |
| **按钮** | Cancel / Remove 或 Cancel / Trash |
| **触发方式** | 点击 Toolbar `Delete` 按钮 / Context Menu → `Remove from list…` / `Trash data and remove from list…` |

---

## 11. RenameDialog (`ae`)

| 属性 | 说明 |
|------|------|
| **用途** | 重命名 Torrent 或具体文件 |
| **内容** | 新名称输入框 |
| **按钮** | Cancel / Rename |
| **触发方式** | Context Menu → `Rename…`（快捷键 `N`） |

---

## 12. ShortcutsDialog (`le`)

| 属性 | 说明 |
|------|------|
| **用途** | 键盘快捷键说明 |
| **内容** | 表格形式列出所有快捷键及对应操作 |
| **按钮** | Close（无 OK 按钮） |
| **触发方式** | Overflow Menu → `Keyboard shortcuts` |

---

## 13. StatisticsDialog (`de`)

| 属性 | 说明 |
|------|------|
| **用途** | 显示全局传输统计信息 |
| **内容** | **Current session**：已上传、已下载、分享率、运行时间<br>**Total**：累计上传、累计下载、总分享率、总运行时间 |
| **特点** | 每 5 秒自动刷新数据 |
| **按钮** | Close（无 OK 按钮） |
| **触发方式** | Overflow Menu → `Statistics`（快捷键 `S`） |

---

## 弹窗类名与代码对应关系

| 中文名称 | JS 类名/变量名 | 基础 DOM 构建函数 |
|----------|----------------|-------------------|
| AboutDialog | `ee` | `Z('about-dialog')` |
| AddTorrentDialog | `N` | `Z('add-dialog')` |
| ConfirmDialog | `k` | `Z('confirm-dialog')` |
| ContextMenu | `te` | 自定义 `div` |
| Inspector | `S` | `M()` tabs 组件 |
| LabelsDialog | `ce` | `Z('labels-dialog')` |
| MoveDialog | `oe` | `Z('move-dialog')` |
| OverflowMenu | `H` | 自定义 `div` |
| PrefsDialog | `ie` | `M()` tabs 组件 |
| RemoveDialog | `ne` | `Z('remove-dialog')` |
| RenameDialog | `ae` | `Z('rename-dialog')` |
| ShortcutsDialog | `le` | `Z('shortcuts-dialog')` |
| StatisticsDialog | `de` | `Z('statistics-dialog')` |

> **注**：`Z(name)` 是项目内部统一的基础对话框构建函数，生成包含 `dialog-container popup <name>` 类名的 `<dialog>` 元素，内部结构为 `dialog-window` → `dialog-logo` / `dialog-heading` / `dialog-message` / `dialog-workarea` / `dialog-buttons`。

---

## 动作触发入口（Action Manager）

以下 action 会直接或间接打开对应弹窗：

- `show-about-dialog` → AboutDialog
- `show-inspector` → Inspector
- `show-move-dialog` → MoveDialog
- `show-overflow-menu` → OverflowMenu
- `show-preferences-dialog` → PrefsDialog
- `show-shortcuts-dialog` → ShortcutsDialog
- `show-statistics-dialog` → StatisticsDialog
- `show-rename-dialog` → RenameDialog
- `show-labels-dialog` → LabelsDialog
- `open-torrent` → AddTorrentDialog
- `remove-selected-torrents` / `trash-selected-torrents` → RemoveDialog


快捷键
A   Select all
D   Deselect all
I   Torrent Inspector
K   Edit Labels…
L   Set location…
N   Rename…
O   Open torrent…
P   Edit preferences
R   Resume
S   Statistics
U   Pause
V   Verify local data
