// ========== State ==========
const state = {
  lang: localStorage.getItem('genba-lang') || 'ja',
  theme: localStorage.getItem('genba-theme') || 'light',
  fontSize: localStorage.getItem('genba-fontsize') || 'medium',
  voiceEnabled: localStorage.getItem('genba-voice') !== 'false',
  voiceSpeed: parseFloat(localStorage.getItem('genba-voice-speed') || '1'),
  aiModel: localStorage.getItem('genba-model') || 'gemma3:latest',
  currentPage: 'home',
  translations: {},
  chatHistory: [],
  recentHistory: JSON.parse(localStorage.getItem('genba-recent') || '[]'),
};

// ========== Sample Machine Data ==========
const machines = [
  {
    id: 'cnc-001',
    icon: '🏭',
    name: { ja: 'CNC旋盤 CK6140', en: 'CNC Lathe CK6140', th: 'เครื่องกลึง CNC CK6140', vi: 'Máy tiện CNC CK6140' },
    desc: { ja: '金属加工用CNC旋盤', en: 'CNC lathe for metalworking', th: 'เครื่องกลึง CNC สำหรับงานโลหะ', vi: 'Máy tiện CNC gia công kim loại' },
    steps: {
      ja: ['電源スイッチをONにする', '原点復帰ボタンを押す（X軸→Z軸の順）', 'ワークをチャックに取り付ける', 'プログラムを選択して確認する', 'ドアを閉めて起動ボタンを押す'],
      en: ['Turn on the power switch', 'Press the home return button (X-axis then Z-axis)', 'Mount the workpiece on the chuck', 'Select and verify the program', 'Close the door and press the start button'],
      th: ['เปิดสวิตช์ไฟ', 'กดปุ่มกลับตำแหน่งเดิม (แกน X แล้วแกน Z)', 'ติดตั้งชิ้นงานบนหัวจับ', 'เลือกและตรวจสอบโปรแกรม', 'ปิดประตูและกดปุ่มเริ่ม'],
      vi: ['Bật công tắc nguồn', 'Nhấn nút về gốc (trục X rồi trục Z)', 'Gắn phôi vào mâm cặp', 'Chọn và kiểm tra chương trình', 'Đóng cửa và nhấn nút khởi động'],
    },
  },
  {
    id: 'press-001',
    icon: '🔨',
    name: { ja: 'プレス機 AP-100', en: 'Press Machine AP-100', th: 'เครื่องกด AP-100', vi: 'Máy dập AP-100' },
    desc: { ja: '100トン油圧プレス', en: '100-ton hydraulic press', th: 'เครื่องกดไฮดรอลิก 100 ตัน', vi: 'Máy ép thủy lực 100 tấn' },
    steps: {
      ja: ['安全柵が閉まっていることを確認', '油圧ポンプを起動する', '金型をセットする', '材料をセットし両手操作ボタンを同時押し', '完了後、油圧ポンプを停止する'],
      en: ['Verify safety fence is closed', 'Start the hydraulic pump', 'Set the die', 'Place material and press both-hand operation buttons simultaneously', 'After completion, stop the hydraulic pump'],
      th: ['ตรวจสอบว่ารั้วนิรภัยปิดแล้ว', 'เริ่มปั๊มไฮดรอลิก', 'ติดตั้งแม่พิมพ์', 'วางวัสดุและกดปุ่มทั้งสองมือพร้อมกัน', 'หลังเสร็จ หยุดปั๊มไฮดรอลิก'],
      vi: ['Kiểm tra hàng rào an toàn đã đóng', 'Khởi động bơm thủy lực', 'Lắp khuôn', 'Đặt vật liệu và nhấn đồng thời hai nút tay', 'Sau khi hoàn thành, tắt bơm thủy lực'],
    },
  },
  {
    id: 'welder-001',
    icon: '⚡',
    name: { ja: '溶接ロボット RW-200', en: 'Welding Robot RW-200', th: 'หุ่นยนต์เชื่อม RW-200', vi: 'Robot hàn RW-200' },
    desc: { ja: '自動アーク溶接ロボット', en: 'Automatic arc welding robot', th: 'หุ่นยนต์เชื่อมอาร์กอัตโนมัติ', vi: 'Robot hàn hồ quang tự động' },
    steps: {
      ja: ['溶接ガスのバルブを開く', 'ロボットコントローラの電源を入れる', 'ティーチングペンダントで動作確認', 'ワークを治具にセットする', '安全エリアから退避し起動する'],
      en: ['Open the welding gas valve', 'Turn on the robot controller', 'Verify operation with the teaching pendant', 'Set the workpiece on the jig', 'Evacuate the safety area and start'],
      th: ['เปิดวาล์วแก๊สเชื่อม', 'เปิดตัวควบคุมหุ่นยนต์', 'ตรวจสอบการทำงานด้วยจี้สอน', 'วางชิ้นงานบนจิ๊ก', 'ออกจากพื้นที่ปลอดภัยและเริ่ม'],
      vi: ['Mở van khí hàn', 'Bật bộ điều khiển robot', 'Kiểm tra hoạt động bằng bảng dạy', 'Đặt phôi lên đồ gá', 'Rời khỏi vùng an toàn và khởi động'],
    },
  },
];

// ========== Safety Manual Data ==========
const safetyDocs = {
  emergency: [
    { icon: '🔥', name: { ja: '火災発生時の対応', en: 'Fire Response', th: 'การตอบสนองเมื่อเกิดไฟไหม้', vi: 'Ứng phó khi cháy' } },
    { icon: '🏥', name: { ja: '怪我・事故発生時', en: 'Injury/Accident Response', th: 'การตอบสนองเมื่อเกิดการบาดเจ็บ', vi: 'Ứng phó tai nạn/chấn thương' } },
    { icon: '⚡', name: { ja: '感電事故対応', en: 'Electric Shock Response', th: 'การตอบสนองไฟฟ้าช็อต', vi: 'Ứng phó điện giật' } },
  ],
  daily: [
    { icon: '✅', name: { ja: '始業前点検チェックリスト', en: 'Pre-work Inspection Checklist', th: 'รายการตรวจสอบก่อนเริ่มงาน', vi: 'Bảng kiểm tra trước ca' } },
    { icon: '🔧', name: { ja: '設備日常点検表', en: 'Equipment Daily Checklist', th: 'แบบตรวจสอบอุปกรณ์ประจำวัน', vi: 'Bảng kiểm tra thiết bị hàng ngày' } },
  ],
  equipment: [
    { icon: '🦺', name: { ja: '保護具の正しい着用方法', en: 'Proper PPE Usage', th: 'วิธีสวมอุปกรณ์ป้องกันที่ถูกต้อง', vi: 'Cách sử dụng đồ bảo hộ đúng cách' } },
    { icon: '👓', name: { ja: '保護メガネ・ゴーグル', en: 'Safety Glasses & Goggles', th: 'แว่นตาและแว่นครอบตานิรภัย', vi: 'Kính bảo hộ' } },
    { icon: '🧤', name: { ja: '手袋の種類と選び方', en: 'Glove Types & Selection', th: 'ประเภทถุงมือและวิธีเลือก', vi: 'Các loại găng tay và cách chọn' } },
  ],
};

// ========== Shared Utilities ==========

/**
 * Format a date based on locale, with flexible options.
 * @param {Date|string|number} date - The date to format.
 * @param {object} [options] - Intl.DateTimeFormat options override.
 * @param {string} [lang] - Language code (ja, en, th, vi). Defaults to state.lang.
 * @returns {string} Formatted date string.
 */
function formatDate(date, options, lang) {
  const d = date instanceof Date ? date : new Date(date);
  const localeMap = { ja: 'ja-JP', en: 'en-US', th: 'th-TH', vi: 'vi-VN' };
  const locale = localeMap[lang || state.lang] || 'ja-JP';
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(d);
}

/**
 * Format a date as a short date only (no time).
 */
function formatDateShort(date, lang) {
  return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' }, lang);
}

// ========== Toast Notification System ==========

/**
 * Show a toast notification that auto-dismisses.
 * @param {string} message - The message to display.
 * @param {object} [opts] - Options: type ('info'|'success'|'warning'|'error'), duration (ms).
 */
function showToast(message, opts = {}) {
  const { type = 'info', duration = 3000 } = opts;

  // Ensure toast container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: 'calc(var(--header-height, 56px) + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '300',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      pointerEvents: 'none',
      width: '90%',
      maxWidth: '400px',
    });
    document.body.appendChild(container);
  }

  const colorMap = {
    info: { bg: '#e8f0fe', color: '#1a73e8', border: '#1a73e8' },
    success: { bg: '#e6f4ea', color: '#1e8e3e', border: '#1e8e3e' },
    warning: { bg: '#fef7e0', color: '#e37400', border: '#e37400' },
    error: { bg: '#fce8e6', color: '#d93025', border: '#d93025' },
  };

  const darkColorMap = {
    info: { bg: '#1a2744', color: '#8ab4f8', border: '#8ab4f8' },
    success: { bg: '#1b3a26', color: '#81c995', border: '#81c995' },
    warning: { bg: '#3e2e00', color: '#fdd663', border: '#fdd663' },
    error: { bg: '#3c1410', color: '#f28b82', border: '#f28b82' },
  };

  const isDark = state.theme === 'dark';
  const colors = (isDark ? darkColorMap : colorMap)[type] || colorMap.info;

  const iconMap = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };

  const toast = document.createElement('div');
  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    background: colors.bg,
    color: colors.color,
    borderLeft: `4px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '0.9em',
    fontWeight: '500',
    pointerEvents: 'auto',
    opacity: '0',
    transform: 'translateY(-12px)',
    transition: 'opacity 0.3s, transform 0.3s',
    width: '100%',
  });

  toast.innerHTML = `<span>${iconMap[type] || ''}</span><span style="flex:1">${message}</span>`;

  // Close button
  const closeBtn = document.createElement('button');
  Object.assign(closeBtn.style, {
    background: 'none',
    border: 'none',
    color: colors.color,
    cursor: 'pointer',
    fontSize: '1.1em',
    padding: '0 4px',
    lineHeight: '1',
  });
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => dismissToast(toast));
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }

  return toast;
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-12px)';
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 300);
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  applyFontSize();
  loadTranslations(state.lang);
  setupNavigation();
  setupLanguageModal();
  setupSettings();
  setupChat();
  setupVoice();
  renderMachines();
  renderSafetyDocs();
  renderRecentHistory();
});

// ========== i18n ==========
async function loadTranslations(lang) {
  try {
    const res = await fetch(`../languages/${lang}.json`);
    state.translations = await res.json();
    state.lang = lang;
    localStorage.setItem('genba-lang', lang);
    applyTranslations();
    document.getElementById('current-lang').textContent = lang.toUpperCase();
    document.getElementById('header-title').textContent = state.translations.app_name;
    document.getElementById('setting-lang').value = lang;
    renderMachines();
    renderSafetyDocs();
  } catch (e) {
    console.error('Failed to load translations:', e);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const keys = el.getAttribute('data-i18n').split('.');
    let val = state.translations;
    for (const k of keys) {
      val = val?.[k];
    }
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const keys = el.getAttribute('data-i18n-placeholder').split('.');
    let val = state.translations;
    for (const k of keys) {
      val = val?.[k];
    }
    if (val) el.placeholder = val;
  });
}

// ========== Navigation ==========
function setupNavigation() {
  document.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
    });
  });
}

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach((n) => {
    n.classList.toggle('active', n.dataset.page === page);
  });
}

// ========== Language Modal ==========
function setupLanguageModal() {
  const modal = document.getElementById('lang-modal');
  const btn = document.getElementById('lang-btn');
  const closeBtn = document.getElementById('lang-modal-close');

  btn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  document.querySelectorAll('.lang-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      loadTranslations(opt.dataset.lang);
      modal.classList.add('hidden');
    });
  });
}

// ========== Settings ==========
function setupSettings() {
  // Language
  document.getElementById('setting-lang').addEventListener('change', (e) => {
    loadTranslations(e.target.value);
  });

  // Font size
  const fontSelect = document.getElementById('setting-fontsize');
  fontSelect.value = state.fontSize;
  fontSelect.addEventListener('change', (e) => {
    state.fontSize = e.target.value;
    localStorage.setItem('genba-fontsize', state.fontSize);
    applyFontSize();
  });

  // Dark mode
  const darkToggle = document.getElementById('setting-darkmode');
  darkToggle.checked = state.theme === 'dark';
  darkToggle.addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('genba-theme', state.theme);
    applyTheme();
  });

  // Voice
  const voiceToggle = document.getElementById('setting-voice');
  voiceToggle.checked = state.voiceEnabled;
  voiceToggle.addEventListener('change', (e) => {
    state.voiceEnabled = e.target.checked;
    localStorage.setItem('genba-voice', state.voiceEnabled);
  });

  // Voice speed
  const speedSlider = document.getElementById('setting-voice-speed');
  speedSlider.value = state.voiceSpeed;
  speedSlider.addEventListener('input', (e) => {
    state.voiceSpeed = parseFloat(e.target.value);
    localStorage.setItem('genba-voice-speed', state.voiceSpeed);
  });

  // AI Model
  const modelSelect = document.getElementById('setting-model');
  modelSelect.value = state.aiModel;
  modelSelect.addEventListener('change', (e) => {
    state.aiModel = e.target.value;
    localStorage.setItem('genba-model', state.aiModel);
  });
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

function applyFontSize() {
  document.documentElement.setAttribute('data-fontsize', state.fontSize);
}

// ========== Machine Guide ==========
function renderMachines() {
  const list = document.getElementById('machine-list');
  const detail = document.getElementById('guide-detail');
  const lang = state.lang;

  list.innerHTML = machines
    .map(
      (m) => `
    <div class="card-item" data-machine="${m.id}">
      <span class="card-icon">${m.icon}</span>
      <div class="card-info">
        <div class="card-title">${m.name[lang] || m.name.en}</div>
        <div class="card-desc">${m.desc[lang] || m.desc.en}</div>
      </div>
      <span>›</span>
    </div>
  `
    )
    .join('');

  list.querySelectorAll('.card-item').forEach((card) => {
    card.addEventListener('click', () => {
      const machine = machines.find((m) => m.id === card.dataset.machine);
      showGuideDetail(machine);
    });
  });

  // Search
  document.getElementById('guide-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    list.querySelectorAll('.card-item').forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

function showGuideDetail(machine) {
  const lang = state.lang;
  const detail = document.getElementById('guide-detail');
  const stepsContainer = document.getElementById('guide-steps');
  const list = document.getElementById('machine-list');
  const searchBar = document.querySelector('#page-guide .search-bar');
  const stepLabel = state.translations.guide?.step || 'Step';

  const steps = machine.steps[lang] || machine.steps.en;
  stepsContainer.innerHTML = `
    <h3>${machine.name[lang] || machine.name.en}</h3>
    ${steps
      .map(
        (s, i) => `
      <div class="step-card">
        <span class="step-number">${i + 1}</span>
        <div class="step-text">${stepLabel} ${i + 1}: ${s}</div>
      </div>
    `
      )
      .join('')}
  `;

  list.classList.add('hidden');
  searchBar.classList.add('hidden');
  detail.classList.remove('hidden');

  detail.querySelector('.btn-back').onclick = () => {
    detail.classList.add('hidden');
    list.classList.remove('hidden');
    searchBar.classList.remove('hidden');
  };

  addRecentHistory('guide', machine.name[lang] || machine.name.en);
}

// ========== Safety Docs ==========
function renderSafetyDocs(category = null) {
  const container = document.getElementById('safety-docs');
  const lang = state.lang;

  const categories = category ? [category] : Object.keys(safetyDocs);
  let html = '';

  for (const cat of categories) {
    const docs = safetyDocs[cat] || [];
    html += docs
      .map(
        (d) => `
      <div class="card-item">
        <span class="card-icon">${d.icon}</span>
        <div class="card-info">
          <div class="card-title">${d.name[lang] || d.name.en}</div>
        </div>
      </div>
    `
      )
      .join('');
  }

  container.innerHTML = html;

  // Category filter
  document.querySelectorAll('.safety-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.safety-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      renderSafetyDocs(card.dataset.category);
    });
  });

  // Search
  document.getElementById('safety-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    container.querySelectorAll('.card-item').forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

// ========== Chat / AI ==========
function setupChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('btn-send');

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addChatBubble(text, 'user');
  addRecentHistory('troubleshoot', text.substring(0, 50));

  const thinkingText = state.translations.troubleshoot?.thinking || 'AI is generating a response...';
  const thinkingBubble = addChatBubble(thinkingText, 'thinking');

  try {
    const response = await callOllama(text);
    thinkingBubble.remove();
    addChatBubble(response, 'ai');
  } catch (e) {
    thinkingBubble.remove();
    const errorText = state.translations.common?.error || 'An error occurred';
    addChatBubble(`${errorText}: ${e.message}`, 'ai');
  }
}

function addChatBubble(text, type) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = text;

  if (type === 'ai') {
    const readBtn = document.createElement('button');
    readBtn.className = 'read-aloud-btn';
    readBtn.textContent = state.translations.voice?.read_aloud || '🔊 Read';
    readBtn.addEventListener('click', () => speak(text));
    bubble.appendChild(readBtn);
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

async function callOllama(prompt) {
  const lang = state.lang;
  const langNames = { ja: '日本語', en: 'English', th: 'ภาษาไทย', vi: 'Tiếng Việt' };
  const systemPrompt = `You are a factory floor assistant AI. Always respond in ${langNames[lang] || 'Japanese'}.
You help workers with machine operation, troubleshooting, and safety procedures.
Keep answers clear, concise, and step-by-step. Use simple language.`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.aiModel,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

// ========== Voice ==========
function setupVoice() {
  const voiceBtn = document.getElementById('btn-voice');
  let recognition = null;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap = { ja: 'ja-JP', en: 'en-US', th: 'th-TH', vi: 'vi-VN' };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('chat-input').value = transcript;
      voiceBtn.classList.remove('recording');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('recording');
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove('recording');
    };

    voiceBtn.addEventListener('click', () => {
      if (voiceBtn.classList.contains('recording')) {
        recognition.stop();
        voiceBtn.classList.remove('recording');
      } else {
        recognition.lang = langMap[state.lang] || 'ja-JP';
        recognition.start();
        voiceBtn.classList.add('recording');
      }
    });
  } else {
    voiceBtn.style.display = 'none';
  }
}

function speak(text) {
  if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langMap = { ja: 'ja-JP', en: 'en-US', th: 'th-TH', vi: 'vi-VN' };
  utterance.lang = langMap[state.lang] || 'ja-JP';
  utterance.rate = state.voiceSpeed;
  window.speechSynthesis.speak(utterance);
}

// ========== Recent History ==========
function addRecentHistory(type, text) {
  const entry = { type, text, time: new Date().toLocaleTimeString() };
  state.recentHistory.unshift(entry);
  if (state.recentHistory.length > 10) state.recentHistory.pop();
  localStorage.setItem('genba-recent', JSON.stringify(state.recentHistory));
  renderRecentHistory();
}

function renderRecentHistory() {
  const list = document.getElementById('recent-list');
  if (state.recentHistory.length === 0) {
    list.innerHTML = `<li class="empty-state" data-i18n="common.no_results">${state.translations.common?.no_results || '結果が見つかりません'}</li>`;
    return;
  }

  const icons = { guide: '📖', troubleshoot: '🔧', safety: '⚠️' };
  list.innerHTML = state.recentHistory
    .map((h) => `<li>${icons[h.type] || '📌'} ${h.text} <span style="float:right;color:var(--text-secondary);font-size:0.8em">${h.time}</span></li>`)
    .join('');
}
