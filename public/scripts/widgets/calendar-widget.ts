// 🌟 カレンダープレビューを main.ts から使える形で実装

type EventData = {
  date: string;
  text: string;
};

const API_URL = '/api/calendar';

// 今日を YYYY-MM-DD で返す
const getToday = (): string => new Date().toISOString().split('T')[0];

// サーバー + localStorage 同期
const fetchEvents = async (): Promise<EventData[]> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('サーバーエラー');

    const data = await res.json();

    // 同期保存
    localStorage.setItem('calendarEvents', JSON.stringify(data));
    return data;
  } catch {
    const stored = localStorage.getItem('calendarEvents');
    return stored ? JSON.parse(stored) : [];
  }
};

// メインの描画処理
export const renderCalendarPreview = async (): Promise<void> => {
  const todayDateEl = document.getElementById('today-date');
  const todayEventsEl = document.getElementById('today-events');
  const nextEventsEl = document.getElementById('next-events');
  const widget = document.querySelector('.widget.calendar-widget') as HTMLElement | null;

  if (!todayDateEl || !todayEventsEl || !nextEventsEl || !widget) return;

  const events = await fetchEvents();
  const today = new Date();
  const dateStr = getToday();
  const week = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];

  // 日付表示
  todayDateEl.textContent = `${today.getMonth() + 1}月${today.getDate()}日（${week}）`;

  // 今日の予定
  const todayList = events.filter((e) => e.date === dateStr);
  todayEventsEl.innerHTML = todayList.length
    ? todayList.map((e) => `<li>🕒 ${e.text}</li>`).join('')
    : `<li>予定はありません</li>`;

  // 次の予定
  const future = events
    .filter((e) => e.date > dateStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  nextEventsEl.innerHTML = future.length
    ? `<li>${future[0].date}：${future[0].text}</li>`
    : `<li>なし</li>`;

  // 🎯 widgetクリックで詳細ページへ遷移
  widget.style.cursor = 'pointer';
  widget.onclick = (ev) => {
    const target = ev.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;
    window.location.href = 'calendar.html';
  };
};

// 🌟 ストレージ / カスタムイベント対応（main.tsで呼べる）
export const setupCalendarPreviewWatchers = () => {
  // 他タブ連動
  window.addEventListener('storage', (event) => {
    if (event.key === 'calendarEvents' || event.key === 'calendarEventsUpdated') {
      renderCalendarPreview();
    }
  });

  // 同一タブ更新
  window.addEventListener('calendarUpdated', () => {
    renderCalendarPreview();
  });
};
