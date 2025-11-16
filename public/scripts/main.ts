// ================================
// 📅 カレンダープレビュー
// ================================
import {
  renderCalendarPreview,
  setupCalendarPreviewWatchers,
} from './widgets/calendar-widget.js';

// ================================
// 🪧 他ウィジェット
// ================================
import { KanbanWidget } from './widgets/kanban-widget.js';
import { WeatherWidget } from './widgets/weather-widget.js';
import { APIClient } from './shared/apiClient.js';
import { initThemeToggle } from './widgets/theme-toggle.js';

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------
  // ⭐ ① ウィジェットの表示/非表示
  // -----------------------------
  const widgetIds: Array<'kanban' | 'weather' | 'calendar'> = [
    'kanban',
    'weather',
    'calendar',
  ];

  widgetIds.forEach((id) => {
    const state = localStorage.getItem(`widget-${id}`);
    const el = document.getElementById(`widget-${id}`);
    if (el && state === 'hidden') {
      el.style.display = 'none';
    }
  });

  // -----------------------------
  // 🌗 テーマ切り替え
  // -----------------------------
  initThemeToggle();

  // -----------------------------
  // 🔥 カレンダーのプレビュー処理
  // -----------------------------
  renderCalendarPreview();
  setupCalendarPreviewWatchers();

  // -----------------------------
  // 🔗 API クライアント
  // -----------------------------
  const api = new APIClient('/api');

  // -----------------------------
  // 🪧 カンバンウィジェット
  // -----------------------------
  const kanban = new KanbanWidget(api);
  kanban.loadCards();

  // -----------------------------
  // ⛅ 天気ウィジェット
  // -----------------------------
  const weather = new WeatherWidget('#widget-weather');
  weather.init();

  // -----------------------------
  // ⚙ ④ 設定モーダル
  // -----------------------------
  initWidgetSettingsModal();
});

/* ======================================================
   ⚙ 設定モーダルの処理（ガラス風）
====================================================== */
function initWidgetSettingsModal() {
  const btn = document.getElementById('settings-btn')!;
  const modal = document.getElementById('settings-modal')!;
  const save = document.getElementById('settings-save')!;

  const toggles = {
    kanban: document.getElementById('set-kanban') as HTMLInputElement,
    weather: document.getElementById('set-weather') as HTMLInputElement,
    calendar: document.getElementById('set-calendar') as HTMLInputElement,
  };

  // 開く
  btn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  // 外側クリック → 閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // 保存
  save.addEventListener('click', () => {
    Object.entries(toggles).forEach(([key, input]) => {
      localStorage.setItem(
        `widget-${key}`,
        input.checked ? 'visible' : 'hidden'
      );
    });

    modal.classList.add('hidden');
    location.reload();
  });

  // 保存済み設定をUIに反映
  Object.entries(toggles).forEach(([key, input]) => {
    const state = localStorage.getItem(`widget-${key}`);
    input.checked = state !== 'hidden';
  });
}
