/**
 * Mock Torrent Data Generator
 * 拦截 RPC 请求，返回假数据供 transmission-app.js 渲染
 * 
 * 开关控制方式（三选一）：
 * 1. 修改下方 CONFIG.enable 的值
 * 2. 浏览器控制台执行：localStorage.setItem('mock_torrents_enabled', 'true' 或 'false')
 * 3. URL 添加参数：?mock_torrents=true 或 ?mock_torrents=false
 * 
 * 数据格式：与正式 RPC 响应一致，使用 format: "table" 格式
 * torrents[0] 为字段名数组，torrents[1..n] 为数据行数组
 */

(function() {
  'use strict';

  // ==================== 配置开关 ====================
  const CONFIG = {
    // 主开关：设置为 true 启用假数据，false 禁用
    enable: true,
    
    // 是否启用实时更新（速度波动、进度增长）
    enableRealtimeUpdate: true,
    
    // 更新间隔（毫秒）
    updateInterval: 1000
  };
  // =================================================

  // 检查开关状态（优先级：URL参数 > localStorage > 代码配置）
  function isEnabled() {
    // 1. 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock_torrents')) {
      return urlParams.get('mock_torrents') === 'true';
    }
    
    // 2. 检查 localStorage
    const storageValue = localStorage.getItem('mock_torrents_enabled');
    if (storageValue !== null) {
      return storageValue === 'true';
    }
    
    // 3. 使用代码配置
    return CONFIG.enable;
  }

  // 如果禁用了假数据，直接返回
  if (!isEnabled()) {
    console.log('[MockData] Mock data is DISABLED. Enable it by:');
    console.log('  - Setting CONFIG.enable = true in mock-torrents.js');
    console.log('  - OR running: localStorage.setItem("mock_torrents_enabled", "true")');
    console.log('  - OR adding ?mock_torrents=true to URL');
    return;
  }

  // ==================== 数据定义 ====================
  
  // 字段名定义（与正式 RPC 响应一致）
  const FIELDS = [
    'id', 'added_date', 'file_count', 'name', 'primary_mime_type', 'total_size',
    'error', 'error_string', 'eta', 'is_finished', 'is_stalled', 'labels',
    'left_until_done', 'metadata_percent_complete', 'peers_connected',
    'peers_getting_from_us', 'peers_sending_to_us', 'percent_done',
    'queue_position', 'rate_download', 'rate_upload', 'recheck_progress',
    'seed_ratio_mode', 'seed_ratio_limit', 'size_when_done', 'status',
    'trackers', 'download_dir', 'uploaded_ever', 'upload_ratio', 'webseeds_sending_to_us'
  ];

  // 状态常量（与 transmission-app.js 一致）
  // CSS 类名映射：
  // STOPPED(0) -> .paused (灰色)
  // CHECK_WAIT(1) -> .verify.queued (灰色)
  // CHECK(2) -> .verify (橙色)
  // DOWNLOAD_WAIT(3) -> .leech.queued (灰色)
  // DOWNLOAD(4) -> .leech (蓝紫色)
  // SEED_WAIT(5) -> .seed.queued (灰色)
  // SEED(6) -> .seed (绿色)
  // error != 0 -> .error (红色)
  // metadata_percent_complete < 1 -> .magnet (橙色)
  const STATUS = {
    STOPPED: 0,        // 暂停
    CHECK_WAIT: 1,     // 等待校验
    CHECK: 2,          // 正在校验
    DOWNLOAD_WAIT: 3,  // 等待下载
    DOWNLOAD: 4,       // 正在下载
    SEED_WAIT: 5,      // 等待做种
    SEED: 6            // 正在做种
  };
  
  // 错误码常量
  const ERROR = {
    NONE: 0,              // 无错误
    TRACKER_WARNING: 1,   // Tracker 警告
    TRACKER_ERROR: 2,     // Tracker 错误
    LOCAL_ERROR: 3        // 本地错误
  };

  // 创建种子数据行
  function createTorrentRow(data) {
    const row = new Array(FIELDS.length);
    FIELDS.forEach((field, idx) => {
      row[idx] = data[field] !== undefined ? data[field] : getDefaultValue(field);
    });
    return row;
  }

  // 字段默认值
  function getDefaultValue(field) {
    const defaults = {
      'id': 0,
      'added_date': Math.floor(Date.now() / 1000) - 86400,
      'file_count': 1,
      'name': '',
      'primary_mime_type': 'application/octet-stream',
      'total_size': 0,
      'error': 0,
      'error_string': '',
      'eta': -1,
      'is_finished': false,
      'is_stalled': false,
      'labels': [],
      'left_until_done': 0,
      'metadata_percent_complete': 1,
      'peers_connected': 0,
      'peers_getting_from_us': 0,
      'peers_sending_to_us': 0,
      'percent_done': 0,
      'queue_position': 0,
      'rate_download': 0,
      'rate_upload': 0,
      'recheck_progress': 0,
      'seed_ratio_mode': 0,
      'seed_ratio_limit': 2.0,
      'size_when_done': 0,
      'status': 0,
      'trackers': [],
      'download_dir': '/downloads',
      'uploaded_ever': 0,
      'upload_ratio': 0,
      'webseeds_sending_to_us': 0
    };
    return defaults[field];
  }

  // 构建表格格式的种子数据 [header, row1, row2, ...]
  let mockTorrentsTable = [
    FIELDS,
    // 种子 1: 正在下载的高清电影
    createTorrentRow({
      id: 1,
      added_date: Math.floor(Date.now() / 1000) - 3600,
      file_count: 7,
      name: '【高清影视之家发布 www.HDBTHD.com】盒中之海[国语配音+中文字幕].He.Zhong.Zhi.Hai.2024.2160p.WEB-DL.H264.DDP-DreamHD',
      primary_mime_type: 'video/mp4',
      total_size: 9965972936,
      error: 0,
      error_string: '',
      eta: 1800,
      is_finished: false,
      is_stalled: false,
      labels: [],
      left_until_done: 5315912852,
      metadata_percent_complete: 1,
      peers_connected: 12,
      peers_getting_from_us: 0,
      peers_sending_to_us: 8,
      percent_done: 0.4666,
      queue_position: 0,
      rate_download: 2949120,
      rate_upload: 51200,
      size_when_done: 9965972936,
      status: STATUS.DOWNLOAD,
      trackers: [{ announce: 'http://tracker1.itzmx.com:8080/announce', id: 0, scrape: 'http://tracker1.itzmx.com:8080/scrape', sitename: 'itzmx', tier: 0 }],
      uploaded_ever: 156384256,
      upload_ratio: 0.0157
    }),
    // 种子 2: 刚开始下载的电影
    createTorrentRow({
      id: 2,
      added_date: Math.floor(Date.now() / 1000) - 600,
      file_count: 4,
      name: '【高清影视之家发布 www.WHATMV.com】阿凡达：火与烬[杜比视界版本][国英多音轨+简繁英双语特效字幕].2025.2160p.iTunes.WEB-DL.DDP.7.1.Atmos.DV.H.265-DreamHD',
      primary_mime_type: 'video/x-matroska',
      total_size: 38964496150,
      error: 0,
      error_string: '',
      eta: 86400,
      is_finished: false,
      is_stalled: false,
      labels: [],
      left_until_done: 38961098752,
      metadata_percent_complete: 1,
      peers_connected: 24,
      peers_getting_from_us: 0,
      peers_sending_to_us: 15,
      percent_done: 0.000087,
      queue_position: 1,
      rate_download: 458752,
      rate_upload: 0,
      size_when_done: 38964496150,
      status: STATUS.DOWNLOAD,
      trackers: [{ announce: 'http://tracker1.itzmx.com:8080/announce', id: 1, scrape: 'http://tracker1.itzmx.com:8080/scrape', sitename: 'itzmx', tier: 0 }],
      uploaded_ever: 0,
      upload_ratio: 0
    }),
    // 种子 3: 正在做种（已完成）
    createTorrentRow({
      id: 3,
      added_date: Math.floor(Date.now() / 1000) - 172800,
      file_count: 1,
      name: 'ubuntu-22.04.3-desktop-amd64.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 4823456789,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: true,
      is_stalled: false,
      labels: ['linux', 'iso'],
      left_until_done: 0,
      metadata_percent_complete: 1,
      peers_connected: 42,
      peers_getting_from_us: 18,
      peers_sending_to_us: 0,
      percent_done: 1,
      queue_position: 2,
      rate_download: 0,
      rate_upload: 1126400,
      size_when_done: 4823456789,
      status: STATUS.SEED,
      trackers: [{ announce: 'http://tracker.example.com/announce', id: 0, scrape: 'http://tracker.example.com/scrape', sitename: 'example', tier: 0 }],
      uploaded_ever: 11817589234,
      upload_ratio: 2.45
    }),
    // 种子 4: 暂停的下载
    createTorrentRow({
      id: 4,
      added_date: Math.floor(Date.now() / 1000) - 259200,
      file_count: 1,
      name: 'debian-12.2.0-amd64-DVD-1.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 4073741824,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: false,
      is_stalled: false,
      labels: [],
      left_until_done: 1748470361,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 0.57,
      queue_position: 3,
      rate_download: 0,
      rate_upload: 0,
      size_when_done: 4073741824,
      status: STATUS.STOPPED,
      trackers: [],
      uploaded_ever: 611061273,
      upload_ratio: 0.15
    }),
    // 种子 5: 正在校验
    createTorrentRow({
      id: 5,
      added_date: Math.floor(Date.now() / 1000) - 1800,
      file_count: 1,
      name: 'archlinux-2024.01.01-x86_64.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 805306368,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: false,
      is_stalled: false,
      labels: [],
      left_until_done: 225485783,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 0.72,
      queue_position: 4,
      rate_download: 0,
      rate_upload: 0,
      recheck_progress: 0.72,
      size_when_done: 805306368,
      status: STATUS.CHECK,
      trackers: [],
      uploaded_ever: 0,
      upload_ratio: 0
    }),
    // 种子 6: 已完成但暂停
    createTorrentRow({
      id: 6,
      added_date: Math.floor(Date.now() / 1000) - 604800,
      file_count: 1,
      name: 'linux-mint-21.2-cinnamon-64bit.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 2684354560,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: true,
      is_stalled: false,
      labels: [],
      left_until_done: 0,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 1,
      queue_position: 5,
      rate_download: 0,
      rate_upload: 0,
      size_when_done: 2684354560,
      status: STATUS.STOPPED,
      trackers: [],
      uploaded_ever: 2147483648,
      upload_ratio: 0.8
    }),
    // 种子 7: 快下载完成
    createTorrentRow({
      id: 7,
      added_date: Math.floor(Date.now() / 1000) - 7200,
      file_count: 1,
      name: 'kali-linux-2024.1-installer-amd64.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 4294967296,
      error: 0,
      error_string: '',
      eta: 180,
      is_finished: false,
      is_stalled: false,
      labels: ['security'],
      left_until_done: 42949673,
      metadata_percent_complete: 1,
      peers_connected: 35,
      peers_getting_from_us: 0,
      peers_sending_to_us: 28,
      percent_done: 0.99,
      queue_position: 6,
      rate_download: 2424832,
      rate_upload: 102400,
      size_when_done: 4294967296,
      status: STATUS.DOWNLOAD,
      trackers: [{ announce: 'http://tracker.security.com/announce', id: 0, scrape: 'http://tracker.security.com/scrape', sitename: 'security', tier: 0 }],
      uploaded_ever: 429496730,
      upload_ratio: 0.1
    }),
    // 种子 8: 正在做种（高分享率）
    createTorrentRow({
      id: 8,
      added_date: Math.floor(Date.now() / 1000) - 1209600,
      file_count: 1,
      name: 'openSUSE-Leap-15.5-DVD-x86_64.iso',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 5368709120,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: true,
      is_stalled: false,
      labels: [],
      left_until_done: 0,
      metadata_percent_complete: 1,
      peers_connected: 56,
      peers_getting_from_us: 32,
      peers_sending_to_us: 0,
      percent_done: 1,
      queue_position: 7,
      rate_download: 0,
      rate_upload: 3584000,
      size_when_done: 5368709120,
      status: STATUS.SEED,
      trackers: [{ announce: 'http://tracker.opensuse.org/announce', id: 0, scrape: 'http://tracker.opensuse.org/scrape', sitename: 'opensuse', tier: 0 }],
      uploaded_ever: 30440669824,
      upload_ratio: 5.67
    }),
    // 种子 9: Tracker 错误（下载中但有错误）
    createTorrentRow({
      id: 9,
      added_date: Math.floor(Date.now() / 1000) - 86400,
      file_count: 1,
      name: 'Error Example - Tracker Returned Error',
      primary_mime_type: 'video/x-matroska',
      total_size: 2147483648,
      error: ERROR.TRACKER_ERROR,
      error_string: 'Torrent not found on tracker',
      eta: -1,
      is_finished: false,
      is_stalled: true,
      labels: [],
      left_until_done: 1073741824,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 0.5,
      queue_position: 8,
      rate_download: 0,
      rate_upload: 0,
      size_when_done: 2147483648,
      status: STATUS.DOWNLOAD,
      trackers: [{ announce: 'http://tracker.error.com/announce', id: 0, scrape: 'http://tracker.error.com/scrape', sitename: 'error', tier: 0 }],
      uploaded_ever: 0,
      upload_ratio: 0
    }),
    // 种子 10: 等待下载（队列中）
    createTorrentRow({
      id: 10,
      added_date: Math.floor(Date.now() / 1000) - 3600,
      file_count: 1,
      name: 'Queued for Download Example',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 1073741824,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: false,
      is_stalled: false,
      labels: ['queued'],
      left_until_done: 1073741824,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 0,
      queue_position: 9,
      rate_download: 0,
      rate_upload: 0,
      size_when_done: 1073741824,
      status: STATUS.DOWNLOAD_WAIT,
      trackers: [{ announce: 'http://tracker.example.com/announce', id: 0, scrape: 'http://tracker.example.com/scrape', sitename: 'example', tier: 0 }],
      uploaded_ever: 0,
      upload_ratio: 0
    }),
    // 种子 11: 等待校验（队列中）
    createTorrentRow({
      id: 11,
      added_date: Math.floor(Date.now() / 1000) - 7200,
      file_count: 1,
      name: 'Queued for Verification Example',
      primary_mime_type: 'application/x-iso9660-image',
      total_size: 3221225472,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: true,
      is_stalled: false,
      labels: [],
      left_until_done: 0,
      metadata_percent_complete: 1,
      peers_connected: 0,
      peers_getting_from_us: 0,
      peers_sending_to_us: 0,
      percent_done: 1,
      queue_position: 10,
      rate_download: 0,
      rate_upload: 0,
      recheck_progress: 0,
      size_when_done: 3221225472,
      status: STATUS.CHECK_WAIT,
      trackers: [],
      uploaded_ever: 1610612736,
      upload_ratio: 0.5
    }),
    // 种子 12: 正在获取元数据（Magnet）
    createTorrentRow({
      id: 12,
      added_date: Math.floor(Date.now() / 1000) - 300,
      file_count: 0,
      name: 'Magnet Link - Metadata Downloading...',
      primary_mime_type: 'application/x-bittorrent',
      total_size: 0,
      error: 0,
      error_string: '',
      eta: -1,
      is_finished: false,
      is_stalled: false,
      labels: ['magnet'],
      left_until_done: 0,
      metadata_percent_complete: 0.35,
      peers_connected: 8,
      peers_getting_from_us: 0,
      peers_sending_to_us: 3,
      percent_done: 0,
      queue_position: 11,
      rate_download: 51200,
      rate_upload: 0,
      size_when_done: 0,
      status: STATUS.DOWNLOAD,
      trackers: [{ announce: 'http://tracker.magnet.com/announce', id: 0, scrape: 'http://tracker.magnet.com/scrape', sitename: 'magnet', tier: 0 }],
      uploaded_ever: 0,
      upload_ratio: 0
    })
  ];

  // 辅助函数
  function getField(row, fieldName) {
    const idx = FIELDS.indexOf(fieldName);
    return idx >= 0 ? row[idx] : undefined;
  }

  function setField(row, fieldName, value) {
    const idx = FIELDS.indexOf(fieldName);
    if (idx >= 0) row[idx] = value;
  }

  // ==================== RPC 响应生成 ====================

  function createTorrentGetResponse(params) {
    const fields = params.fields || FIELDS;
    const ids = params.ids;
    
    let filteredRows = mockTorrentsTable.slice(1);
    if (ids && ids !== 'recently_active') {
      if (Array.isArray(ids)) {
        filteredRows = filteredRows.filter(row => ids.includes(getField(row, 'id')));
      }
    }

    const resultFields = fields.length > 0 ? fields : FIELDS;
    const result = [resultFields];
    
    for (const row of filteredRows) {
      const newRow = resultFields.map(field => getField(row, field));
      result.push(newRow);
    }

    return {
      result: {
        torrents: result,
        removed: []
      }
    };
  }

  function createSessionGetResponse() {
    return {
      result: {
        'alt-speed-down': 50,
        'alt-speed-enabled': false,
        'alt-speed-time-begin': 540,
        'alt-speed-time-day': 127,
        'alt-speed-time-enabled': false,
        'alt-speed-time-end': 1020,
        'alt-speed-up': 50,
        'blocklist-enabled': false,
        'blocklist-size': 0,
        'cache-size-mb': 4,
        'config-dir': '/config',
        'dht-enabled': true,
        'download-dir': '/downloads',
        'download-dir-free-space': 107374182400,
        'download-queue-enabled': true,
        'download-queue-size': 5,
        'encryption': 'preferred',
        'idle-seeding-limit': 30,
        'idle-seeding-limit-enabled': false,
        'incomplete-dir': '/downloads/incomplete',
        'incomplete-dir-enabled': false,
        'lpd-enabled': false,
        'peer-limit-global': 200,
        'peer-limit-per-torrent': 50,
        'peer-port': 51413,
        'peer-port-random-on-start': false,
        'pex-enabled': true,
        'port-forwarding-enabled': true,
        'queue-stalled-enabled': true,
        'queue-stalled-minutes': 30,
        'rename-partial-files': true,
        'rpc-version': 16,
        'rpc-version-minimum': 14,
        'script-torrent-done-enabled': false,
        'script-torrent-done-filename': '',
        'seed-queue-enabled': false,
        'seed-queue-size': 10,
        'seedRatioLimit': 2,
        'seedRatioLimited': true,
        'speed-limit-down': 100,
        'speed-limit-down-enabled': false,
        'speed-limit-up': 100,
        'speed-limit-up-enabled': false,
        'start-added-torrents': true,
        'trash-original-torrent-files': false,
        'units': {
          'memory-bytes': 1024,
          'memory-units': ['KiB', 'MiB', 'GiB', 'TiB'],
          'size-bytes': 1000,
          'size-units': ['kB', 'MB', 'GB', 'TB'],
          'speed-bytes': 1000,
          'speed-units': ['kB/s', 'MB/s', 'GB/s', 'TB/s']
        },
        'utp-enabled': true,
        'version': '4.0.5'
      }
    };
  }

  function createSessionStatsResponse() {
    let totalDown = 0;
    let totalUp = 0;
    for (let i = 1; i < mockTorrentsTable.length; i++) {
      const row = mockTorrentsTable[i];
      totalDown += getField(row, 'rate_download');
      totalUp += getField(row, 'rate_upload');
    }

    return {
      result: {
        'activeTorrentCount': mockTorrentsTable.length - 1,
        'downloadSpeed': totalDown,
        'pausedTorrentCount': 0,
        'torrentCount': mockTorrentsTable.length - 1,
        'uploadSpeed': totalUp
      }
    };
  }

  function createMockResponse(method, params) {
    switch (method) {
      case 'torrent_get':
        return createTorrentGetResponse(params);
      case 'session_get':
        return createSessionGetResponse();
      case 'session_stats':
        return createSessionStatsResponse();
      default:
        return { result: {} };
    }
  }

  // ==================== Fetch 拦截 ====================
  
  console.log('[MockData] Initializing mock data...');
  
  const originalFetch = window.fetch.bind(window);
  
  window.fetch = function(input, init) {
    let url;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = String(input);
    }
    
    // 检查是否是 RPC 请求 - 匹配包含 /rpc 的 URL
    if (url && url.includes('/rpc')) {
      console.log('[MockData] Intercepted RPC request:', url);
      
      // 获取请求体
      let body = null;
      if (init && init.body) {
        body = init.body;
      }
      
      if (body && typeof body === 'string') {
        try {
          const parsedData = JSON.parse(body);
          const method = parsedData.method;
          const params = parsedData.params || {};
          
          console.log('[MockData] RPC method:', method);
          
          // 创建模拟响应
          const mockResponse = createMockResponse(method, params);
          
          console.log('[MockData] Returning mock response for', method);
          return Promise.resolve(new Response(JSON.stringify(mockResponse), {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        } catch (e) {
          console.error('[MockData] Error parsing request:', e);
        }
      }
    }
    
    // 非 RPC 请求，使用原始的 fetch
    return originalFetch.apply(this, arguments);
  };

  console.log('[MockData] Fetch interceptor installed');

  // ==================== 实时更新 ====================
  
  if (CONFIG.enableRealtimeUpdate) {
    setInterval(() => {
      for (let i = 1; i < mockTorrentsTable.length; i++) {
        const row = mockTorrentsTable[i];
        const status = getField(row, 'status');
        
        if (status === STATUS.DOWNLOAD) {
          let rateDownload = getField(row, 'rate_download');
          let rateUpload = getField(row, 'rate_upload');
          let leftUntilDone = getField(row, 'left_until_done');
          let sizeWhenDone = getField(row, 'size_when_done');
          let percentDone = getField(row, 'percent_done');
          
          rateDownload = Math.max(0, rateDownload + (Math.random() - 0.5) * 500000);
          rateUpload = Math.max(0, rateUpload + (Math.random() - 0.5) * 50000);
          
          const downloaded = (sizeWhenDone - leftUntilDone) + rateDownload / 10;
          leftUntilDone = Math.max(0, sizeWhenDone - downloaded);
          percentDone = 1 - (leftUntilDone / sizeWhenDone);
          
          setField(row, 'rate_download', Math.floor(rateDownload));
          setField(row, 'rate_upload', Math.floor(rateUpload));
          setField(row, 'left_until_done', Math.floor(leftUntilDone));
          setField(row, 'percent_done', percentDone);
          
          if (rateDownload > 0 && leftUntilDone > 0) {
            setField(row, 'eta', Math.floor(leftUntilDone / rateDownload));
          }
          
          if (percentDone >= 0.9999) {
            setField(row, 'percent_done', 1);
            setField(row, 'status', STATUS.SEED);
            setField(row, 'left_until_done', 0);
            setField(row, 'is_finished', true);
            setField(row, 'rate_download', 0);
            setField(row, 'eta', -1);
          }
        } else if (status === STATUS.SEED) {
          let rateUpload = getField(row, 'rate_upload');
          let uploadRatio = getField(row, 'upload_ratio');
          let sizeWhenDone = getField(row, 'size_when_done');
          let uploadedEver = getField(row, 'uploaded_ever');
          
          rateUpload = Math.max(0, rateUpload + (Math.random() - 0.5) * 100000);
          uploadedEver += Math.floor(rateUpload / 10);
          uploadRatio = uploadedEver / sizeWhenDone;
          
          setField(row, 'rate_upload', Math.floor(rateUpload));
          setField(row, 'uploaded_ever', uploadedEver);
          setField(row, 'upload_ratio', uploadRatio);
        }
      }
    }, CONFIG.updateInterval);
  }

  // ==================== 暴露 API ====================
  
  window.mockTorrents = {
    getData: () => mockTorrentsTable,
    getFields: () => FIELDS,
    getRow: (id) => mockTorrentsTable.find(row => getField(row, 'id') === id),
    updateRow: (id, data) => {
      const row = mockTorrentsTable.find(row => getField(row, 'id') === id);
      if (row) {
        Object.entries(data).forEach(([key, value]) => setField(row, key, value));
      }
    },
    STATUS
  };

  console.log('[MockData] Mock data initialized successfully');
  console.log('[MockData] Torrent count:', mockTorrentsTable.length - 1);
  console.log('[MockData] Real-time update:', CONFIG.enableRealtimeUpdate ? 'ENABLED' : 'DISABLED');
  console.log('[MockData] Access via window.mockTorrents');
})();
