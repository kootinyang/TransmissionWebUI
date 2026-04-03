/**
 * Mock Torrent Data Generator
 * 生成各种状态的假种子数据用于调试
 * 
 * 开关控制方式（三选一）：
 * 1. 修改下方 CONFIG.enable 的值
 * 2. 浏览器控制台执行：localStorage.setItem('mock_torrents_enabled', 'true' 或 'false')
 * 3. URL 添加参数：?mock_torrents=true 或 ?mock_torrents=false
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

  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMockData);
  } else {
    initMockData();
  }

  function initMockData() {
    // 检查开关
    if (!isEnabled()) {
      console.log('[MockData] Mock data is DISABLED. Enable it by:');
      console.log('  - Setting CONFIG.enable = true in mock-torrents.js');
      console.log('  - OR running: localStorage.setItem("mock_torrents_enabled", "true")');
      console.log('  - OR adding ?mock_torrents=true to URL');
      return;
    }

    console.log('[MockData] Initializing mock torrent data...');
    console.log('[MockData] To disable, run: localStorage.setItem("mock_torrents_enabled", "false")');
    
    // 模拟种子数据
    const mockTorrents = [
      {
        id: 1,
        name: 'ubuntu-22.04.3-desktop-amd64.iso',
        status: 4, // Downloading
        statusText: 'Downloading',
        totalSize: 4823456789,
        downloaded: 2218790123,
        uploadRatio: 0.05,
        percentDone: 0.46,
        rateDownload: 2621440, // 2.5 MB/s
        rateUpload: 153600, // 150 KB/s
        peersConnected: 12,
        peersTotal: 25,
        eta: 900, // 15 minutes
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 2,
        name: 'debian-12.2.0-amd64-DVD-1.iso',
        status: 6, // Seeding
        statusText: 'Seeding',
        totalSize: 4073741824,
        downloaded: 4073741824,
        uploadRatio: 2.45,
        percentDone: 1.0,
        rateDownload: 0,
        rateUpload: 870400, // 850 KB/s
        peersConnected: 8,
        peersTotal: 15,
        eta: -1,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 3,
        name: 'fedora-workstation-39-1.5.iso',
        status: 0, // Paused
        statusText: 'Paused',
        totalSize: 2254857830,
        downloaded: 1285271463,
        uploadRatio: 0.15,
        percentDone: 0.57,
        rateDownload: 0,
        rateUpload: 0,
        peersConnected: 0,
        peersTotal: 20,
        eta: 1800,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 4,
        name: 'archlinux-2024.01.01-x86_64.iso',
        status: 2, // Checking
        statusText: 'Verifying local data',
        totalSize: 805306368,
        downloaded: 805306368,
        uploadRatio: 0,
        percentDone: 0.72,
        rateDownload: 0,
        rateUpload: 0,
        peersConnected: 0,
        peersTotal: 0,
        eta: -1,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 5,
        name: 'linux-mint-21.2-cinnamon-64bit.iso',
        status: 1, // Queued to check
        statusText: 'Queued for verification',
        totalSize: 2684354560,
        downloaded: 2684354560,
        uploadRatio: 0.8,
        percentDone: 1.0,
        rateDownload: 0,
        rateUpload: 0,
        peersConnected: 0,
        peersTotal: 0,
        eta: -1,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 6,
        name: 'kali-linux-2024.1-installer-amd64.iso',
        status: 4, // Downloading
        statusText: 'Downloading',
        totalSize: 4294967296,
        downloaded: 3865470566,
        uploadRatio: 0.1,
        percentDone: 0.90,
        rateDownload: 5242880, // 5 MB/s
        rateUpload: 102400, // 100 KB/s
        peersConnected: 35,
        peersTotal: 50,
        eta: 82, // 1 min 22 sec
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 7,
        name: 'openSUSE-Leap-15.5-DVD-x86_64.iso',
        status: 6, // Seeding
        statusText: 'Seeding',
        totalSize: 5368709120,
        downloaded: 5368709120,
        uploadRatio: 5.67,
        percentDone: 1.0,
        rateDownload: 0,
        rateUpload: 2048000, // 2 MB/s
        peersConnected: 25,
        peersTotal: 40,
        eta: -1,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      },
      {
        id: 8,
        name: 'manjaro-kde-23.1.3-240113-linux66.iso',
        status: 0, // Paused
        statusText: 'Paused',
        totalSize: 3758096384,
        downloaded: 3758096384,
        uploadRatio: 1.23,
        percentDone: 1.0,
        rateDownload: 0,
        rateUpload: 0,
        peersConnected: 0,
        peersTotal: 18,
        eta: -1,
        metadataPercentComplete: 1,
        files: [],
        trackers: []
      }
    ];

    // 格式化字节数
    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 格式化速度
    function formatSpeed(bytesPerSecond) {
      if (bytesPerSecond === 0) return '0 kB/s';
      return formatBytes(bytesPerSecond) + '/s';
    }

    // 格式化时间（与效果图一致：整分钟时显示 “N min”，避免 “15m 0s”）
    function formatTime(seconds) {
      if (seconds < 0) return '∞';
      if (seconds === 0) return 'Done';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (minutes > 0) {
        return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`;
      }
      return `${secs}s`;
    }

    // 获取状态图标类名
    function getStatusClass(status) {
      switch (status) {
        case 4: return 'downloading';
        case 6: return 'seeding';
        case 0: return 'paused';
        case 2: return 'checking';
        case 1: return 'queued';
        default: return 'unknown';
      }
    }

    // 获取状态图标
    function getStatusIcon(status) {
      switch (status) {
        case 4: // Downloading
          return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
        case 6: // Seeding — 与 NewDesign.pen 一致（check-circle）
          return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        case 0: // Paused
          return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        case 2: // Checking
          return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
        default:
          return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
      }
    }

    // 渲染种子列表
    function renderTorrents() {
      const torrentList = document.getElementById('torrent-list');
      if (!torrentList) {
        console.log('[MockData] Torrent list element not found, retrying...');
        setTimeout(renderTorrents, 100);
        return;
      }

      // 清空现有内容
      torrentList.innerHTML = '';

      // 渲染每个种子
      mockTorrents.forEach(torrent => {
        const li = document.createElement('li');
        li.className = `torrent ${getStatusClass(torrent.status)}`;
        li.dataset.id = torrent.id;

        const percentDone = Math.round(torrent.percentDone * 100);
        const downloadedFormatted = formatBytes(torrent.downloaded);
        const totalFormatted = formatBytes(torrent.totalSize);
        const rateDownFormatted = formatSpeed(torrent.rateDownload);
        const rateUpFormatted = formatSpeed(torrent.rateUpload);
        const etaFormatted = formatTime(torrent.eta);

        // 根据状态显示不同信息
        let badgeText = percentDone + '%';
        let badgeClass = '';
        if (torrent.status === 6) {
          badgeText = 'Seeding';
          badgeClass = 'seeding';
        } else if (torrent.status === 0) {
          badgeText = 'Paused';
          badgeClass = 'paused';
        } else if (torrent.status === 2) {
          badgeText = 'Checking';
          badgeClass = 'checking';
        }

        // 构建速度显示
        let speedDisplay = '';
        if (torrent.status === 4) {
          speedDisplay = `↓ ${rateDownFormatted}  ↑ ${rateUpFormatted}`;
        } else if (torrent.status === 6) {
          speedDisplay = `↑ ${rateUpFormatted}`;
        }

        // 构建 peers 显示
        let peersDisplay = '';
        if (torrent.peersConnected > 0) {
          peersDisplay = `${torrent.peersConnected} of ${torrent.peersTotal} peers`;
        }

        // 构建 ETA 显示
        let etaDisplay = '';
        if (torrent.status === 4 && torrent.eta > 0) {
          etaDisplay = `
            <div class="eta">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${etaFormatted} remaining
            </div>
          `;
        } else if (torrent.status === 6) {
          etaDisplay = `
            <div class="eta">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              Ratio: ${torrent.uploadRatio.toFixed(2)}
            </div>
          `;
        }

        li.innerHTML = `
          <div class="icon">${getStatusIcon(torrent.status)}</div>
          <div class="torrent-info">
            <div class="torrent-name">${torrent.name}</div>
            <div class="torrent-meta">${downloadedFormatted} of ${totalFormatted}</div>
          </div>
          <div class="percent-done ${badgeClass}">${badgeText}</div>
          <div class="torrent-progress-bar">
            <div class="progress" style="width: ${percentDone}%"></div>
          </div>
          <div class="torrent-footer">
            <div class="torrent-stats-left">
              ${peersDisplay ? `<span class="peers">${peersDisplay}</span>` : ''}
              ${speedDisplay ? `<span class="speed">${speedDisplay}</span>` : ''}
            </div>
            ${etaDisplay}
          </div>
        `;

        torrentList.appendChild(li);
      });

      // 更新速度显示
      updateSpeedDisplay();
      
      console.log(`[MockData] Rendered ${mockTorrents.length} mock torrents`);
    }

    // 更新速度显示
    function updateSpeedDisplay() {
      const speedDown = document.getElementById('speed-down');
      const speedUp = document.getElementById('speed-up');
      
      if (speedDown && speedUp) {
        let totalDown = 0;
        let totalUp = 0;
        
        mockTorrents.forEach(t => {
          totalDown += t.rateDownload;
          totalUp += t.rateUpload;
        });
        
        speedDown.textContent = formatSpeed(totalDown);
        speedUp.textContent = formatSpeed(totalUp);
      }
    }

    // 延迟渲染，确保页面其他元素已加载
    setTimeout(renderTorrents, 500);

    // 模拟实时更新
    if (CONFIG.enableRealtimeUpdate) {
    setInterval(() => {
      // 随机更新一些种子的速度
      mockTorrents.forEach(torrent => {
        if (torrent.status === 4) { // Downloading
          torrent.rateDownload = Math.max(0, torrent.rateDownload + (Math.random() - 0.5) * 500000);
          torrent.rateUpload = Math.max(0, torrent.rateUpload + (Math.random() - 0.5) * 50000);
          torrent.downloaded = Math.min(torrent.totalSize, torrent.downloaded + torrent.rateDownload / 10);
          torrent.percentDone = torrent.downloaded / torrent.totalSize;
          
          // 下载完成
          if (torrent.percentDone >= 1) {
            torrent.percentDone = 1;
            torrent.status = 6; // Seeding
            torrent.statusText = 'Seeding';
            torrent.downloaded = torrent.totalSize;
          }
        } else if (torrent.status === 6) { // Seeding
          torrent.rateUpload = Math.max(0, torrent.rateUpload + (Math.random() - 0.5) * 100000);
          torrent.uploadRatio += torrent.rateUpload / torrent.totalSize / 100;
        }
      });
      
      updateSpeedDisplay();
      
      // 每5秒重新渲染一次列表
      if (Math.random() < 0.1) {
        renderTorrents();
      }
    }, 1000);

    }
    console.log('[MockData] Real-time update:', CONFIG.enableRealtimeUpdate ? 'ENABLED' : 'DISABLED');
    console.log('[MockData] Mock data generator initialized successfully');
  }
})();
