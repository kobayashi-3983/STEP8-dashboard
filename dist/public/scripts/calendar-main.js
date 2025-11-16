"use strict";
// ==========================
// 📅 カレンダー本体ページ
// ==========================
const API_URL = '/api/calendar';
const getToday = () => new Date().toISOString().split('T')[0];
// ---------------------------------------
// 📌 DB → localStorage 同期取得
// ---------------------------------------
const fetchEvents = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok)
            throw new Error('fetch error');
        const data = await res.json(); // DB からの id 付きデータ
        localStorage.setItem('calendarEvents', JSON.stringify(data));
        return data;
    }
    catch {
        const stored = localStorage.getItem('calendarEvents');
        return stored ? JSON.parse(stored) : [];
    }
};
// ---------------------------------------
// 📌 予定追加（サーバー → localStorage）
// ---------------------------------------
const postEvent = async (date, text) => {
    let events = await fetchEvents();
    try {
        const created = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, text }),
        }).then((res) => res.json());
        events.push(created);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
    catch {
        const fakeId = Date.now();
        const fallback = { id: fakeId, date, text };
        events.push(fallback);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
    window.dispatchEvent(new Event('calendarUpdated'));
    localStorage.setItem('calendarEventsUpdated', Date.now().toString());
};
// ---------------------------------------
// 📌 削除
// ---------------------------------------
const deleteEvent = async (id) => {
    let events = await fetchEvents();
    events = events.filter((e) => e.id !== id);
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    }
    catch {
        console.warn('API unreachable, local delete only');
    }
    window.dispatchEvent(new Event('calendarUpdated'));
    localStorage.setItem('calendarEventsUpdated', Date.now().toString());
};
// ---------------------------------------
// 📅 カレンダー描画
// ---------------------------------------
const renderCalendar = async () => {
    const calendarContainer = document.getElementById('calendar');
    const eventList = document.getElementById('event-list');
    if (!calendarContainer)
        return;
    let current = new Date();
    let events = await fetchEvents();
    // ---------------------------
    // 📌 月更新
    // ---------------------------
    const updateCalendar = () => {
        const year = current.getFullYear();
        const month = current.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let html = `
      <div class="calendar-header">
        <button id="prev-month">←</button>
        <h2>${year}年 ${month + 1}月</h2>
        <button id="next-month">→</button>
      </div>
      <div id="calendar-grid">
        ${['日', '月', '火', '水', '木', '金', '土']
            .map((d) => `<div class="calendar-day-name">${d}</div>`)
            .join('')}
    `;
        // 空白
        for (let i = 0; i < firstDay.getDay(); i++)
            html += `<div class="calendar-day empty"></div>`;
        // 日付
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = new Date(year, month, day).toISOString().split('T')[0];
            const dayEvents = events.filter((e) => e.date === dateStr);
            const isToday = dateStr === getToday() ? 'today' : '';
            html += `
        <div class="calendar-day ${isToday}" data-date="${dateStr}">
          <div class="date-number">${day}</div>
          ${dayEvents
                .map((e) => `<div class="event" data-id="${e.id}">${e.text}</div>`)
                .join('')}
        </div>
      `;
        }
        html += `</div>`;
        calendarContainer.innerHTML = html;
        document
            .getElementById('prev-month')
            ?.addEventListener('click', () => changeMonth(-1));
        document
            .getElementById('next-month')
            ?.addEventListener('click', () => changeMonth(1));
        document.querySelectorAll('.calendar-day').forEach((el) => {
            const date = el.getAttribute('data-date');
            if (!date)
                return;
            el.addEventListener('click', () => openModal(date));
        });
        if (eventList)
            renderEventList(events);
    };
    // ---------------------------
    // 📌 予定一覧の表示
    // ---------------------------
    const renderEventList = (events) => {
        if (!eventList)
            return;
        if (events.length === 0) {
            eventList.innerHTML = '<li>予定はまだありません。</li>';
            return;
        }
        const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
        eventList.innerHTML = sorted
            .map((e) => `<li>${e.date}：${e.text}
             <button class="delete-btn" data-id="${e.id}">削除</button>
           </li>`)
            .join('');
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                const id = Number(btn.getAttribute('data-id'));
                if (confirm('この予定を削除しますか？')) {
                    await deleteEvent(id);
                }
            });
        });
    };
    const changeMonth = (d) => {
        current.setMonth(current.getMonth() + d);
        updateCalendar();
    };
    // ==============================================
    // ⭐⭐⭐ 修正版 openModal（イベント完全にリセット版）⭐⭐⭐
    // ==============================================
    const openModal = (date) => {
        const modal = document.getElementById('event-modal');
        const dateLabel = document.getElementById('selected-date');
        const textarea = document.getElementById('event-text');
        dateLabel.textContent = `${date} の予定`;
        textarea.value = '';
        modal.classList.remove('hidden');
        const saveBtn = document.getElementById('save-event');
        const closeBtn = document.getElementById('close-modal');
        // 🔥 古いイベントリスナーごと削除
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        // 🔥 保存
        newSaveBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text)
                return;
            await postEvent(date, text);
            modal.classList.add('hidden');
        });
        // 🔥 閉じる
        newCloseBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    };
    updateCalendar();
};
// -------------------------
// ⭐ 予定更新のたびに即再描画
// -------------------------
window.addEventListener('calendarUpdated', () => {
    renderCalendar();
});
// 初期読み込み
document.addEventListener('DOMContentLoaded', renderCalendar);
