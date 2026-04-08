# 种子状态颜色规范指南

## 1. 状态码与 CSS 类映射

| 状态码 | 状态名称 | JS 常量 | CSS 类 | 显示文本 |
|--------|----------|---------|--------|----------|
| 0 | 已暂停/停止 | `STOPPED` | `.paused` | "Paused" / "Seeding complete" |
| 1 | 等待校验 | `CHECK_WAIT` | `.verify.queued` | "Queued for verification" |
| 2 | 正在校验 | `CHECK` | `.verify` | "Verifying local data" |
| 3 | 等待下载 | `DOWNLOAD_WAIT` | `.leech.queued` | "Queued for download" |
| 4 | 正在下载 | `DOWNLOAD` | `.leech` | "Downloading" |
| 5 | 等待做种 | `SEED_WAIT` | `.seed.queued` | "Queued for seeding" |
| 6 | 正在做种 | `SEED` | `.seed` | "Seeding" |

### 特殊状态

| 条件 | CSS 类 | 说明 |
|------|--------|------|
| `error != 0` | `.error` | 错误状态（红色） |
| `metadata_percent_complete < 1` | `.magnet` | 获取元数据中（橙色） |

## 2. 颜色定义

### CSS 变量

```css
/* 下载相关 - 蓝紫色 */
--color-info: #222229;
--color-info-foreground: #b2b2ff;

/* 做种相关 - 绿色 */
--color-success: #222924;
--color-success-foreground: #b6ffce;

/* 校验/警告相关 - 橙色 */
--color-warning: #291c0f;
--color-warning-foreground: #ff8400;

/* 错误相关 - 红色 */
--color-error: #3d1f1f;
--color-error-foreground: #ff5c33;

/* 暂停/队列相关 - 灰色 */
--muted: #2e2e2e;
--muted-foreground: #b8b9b6;
```

### 颜色应用

| 状态 | 进度条颜色 | 图标 | 图标背景 | 选中边框 |
|------|-----------|------|----------|----------|
| 下载中 (leech) | `#b2b2ff` | 下载箭头 | `--color-info` | `#B2B2FF` |
| 做种中 (seed) | `#b6ffce` | 对勾圆圈 | `--color-success` | `#B6FFCE` |
| 校验中 (verify) | `#ff8400` | 警告圆圈 | `--color-warning` | `#FF8400` |
| 暂停 (paused) | `#b8b9b6` | 暂停圆圈 | `--muted` | `#B8B9B6` |
| 错误 (error) | `#ff5c33` | X圆圈 | `--color-error` | `#ff5c33` |
| 磁力 (magnet) | `#ff8400` | 磁力图标 | `--color-warning` | `#FF8400` |
| 队列中 (queued) | `#b8b9b6` | 同主状态 | 同主状态 | - |

## 3. 错误码定义

```javascript
const ERROR = {
  NONE: 0,              // 无错误
  TRACKER_WARNING: 1,   // Tracker 警告
  TRACKER_ERROR: 2,     // Tracker 错误
  LOCAL_ERROR: 3        // 本地错误
};
```

## 4. 使用示例

### HTML 结构

```html
<!-- 下载中 -->
<li class="torrent">
  <div class="icon"></div>
  <div class="torrent-progress-bar leech"></div>
</li>

<!-- 下载中但有错误 -->
<li class="torrent">
  <div class="icon"></div>
  <div class="torrent-progress-bar leech error"></div>
</li>

<!-- 队列中下载 -->
<li class="torrent">
  <div class="icon"></div>
  <div class="torrent-progress-bar leech queued"></div>
</li>
```

## 5. 更新记录

### 本次更新内容

1. **新增错误状态样式**:
   - 添加 `--color-error` 和 `--color-error-foreground` 变量
   - 错误状态进度条使用红色 `#ff5c33`
   - 错误状态图标使用 Lucide `x-circle` 图标
   - 选中时边框显示红色

2. **完善状态常量注释**:
   - 在 `mock-torrents.js` 中添加 CSS 类名映射注释
   - 添加 `ERROR` 错误码常量

3. **新增 Mock 数据示例**:
   - 错误状态示例（Tracker 错误）
   - 等待下载队列示例
   - 等待校验队列示例
   - 磁力链接获取元数据示例

## 6. 文件修改清单

- `transmission-app.css`: 添加错误状态样式和 CSS 变量
- `mock-torrents.js`: 添加状态注释、ERROR 常量、新示例种子
