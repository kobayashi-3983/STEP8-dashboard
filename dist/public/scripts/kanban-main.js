console.log('KANBAN JS LOADED');
import { APIClient } from './shared/apiClient.js';
const api = new APIClient('/api');
// ---------- DOM ----------
const searchInput = document.querySelector('.search-text');
// ---------- DBから読み込み ----------
async function loadTasks() {
    return await api.get('/kanban');
}
// ---------- DBへ保存（チェックリストなど自由に更新） ----------
async function updateTask(id, data) {
    return await api.put(`/kanban/${id}`, data);
}
// ---------- タスク描画 ----------
async function renderBoard() {
    const tasks = await loadTasks();
    document.querySelectorAll('.column').forEach((col) => {
        const status = col.dataset.status;
        col.querySelectorAll('.task').forEach((t) => t.remove());
        tasks
            .filter((t) => t.status === status)
            .forEach((task) => {
            const el = document.createElement('div');
            el.className = 'task';
            el.draggable = true;
            el.dataset.id = String(task.id);
            // checklistがnullの場合に備えて空配列に
            const checklist = task.checklist ?? [];
            el.innerHTML = `
          <div class="task-action">
            <button class="edit-task">✏️</button>
            <button class="delete-task">🗑️</button>
          </div>

          <h4>${task.title}</h4>
          <div class="dates">
            ${task.dateStart || ''} → ${task.dateEnd || ''}
          </div>

          <div class="checklist">
            ${checklist
                .map((c, i) => `
              <label>
                <input type="checkbox" class="check-item" data-id="${i}"
                  ${c.checked ? 'checked' : ''}>
                <span>${c.text}</span>
                <button class="del-check" data-id="${i}">×</button>
              </label>
            `)
                .join('')}
            <button class="add-check-btn">+ チェック項目追加</button>
          </div>
        `;
            col.insertBefore(el, col.querySelector('.add-task-btn'));
            // --- チェック項目追加 ---
            el.querySelector('.add-check-btn')?.addEventListener('click', async () => {
                const text = prompt('チェック項目を追加');
                if (!text)
                    return;
                checklist.push({ text, checked: false });
                await updateTask(task.id, { checklist });
                renderBoard();
            });
            // --- チェック状態変更 ---
            el.querySelectorAll('.check-item').forEach((cb) => {
                cb.addEventListener('change', async (e) => {
                    const idx = Number(e.target.dataset.id);
                    checklist[idx].checked = e.target.checked;
                    await updateTask(task.id, { checklist });
                });
            });
            // --- チェック項目削除 ---
            el.querySelectorAll('.del-check').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    const idx = Number(e.target.dataset.id);
                    checklist.splice(idx, 1);
                    await updateTask(task.id, { checklist });
                    renderBoard();
                });
            });
            // --- チェック項目編集 ---
            el.querySelectorAll('.checklist span').forEach((span, i) => {
                span.addEventListener('dblclick', async () => {
                    const txt = prompt('項目を編集', checklist[i].text);
                    if (txt == null)
                        return;
                    checklist[i].text = txt;
                    await updateTask(task.id, { checklist });
                    renderBoard();
                });
            });
            // --- タスク編集 ---
            el.querySelector('.edit-task')?.addEventListener('click', async () => {
                const title = prompt('タイトルを編集', task.title);
                if (title === null)
                    return;
                const start = prompt('開始日', task.dateStart || '') || null;
                const end = prompt('終了日', task.dateEnd || '') || null;
                await updateTask(task.id, {
                    title,
                    date_start: start,
                    date_end: end,
                });
                renderBoard();
            });
            // --- タスク削除 ---
            el.querySelector('.delete-task')?.addEventListener('click', async () => {
                if (!confirm('削除しますか？'))
                    return;
                await api.delete(`/kanban/${task.id}`);
                renderBoard();
            });
        });
    });
    enableDrag();
}
// ---------- タスク追加 ----------
document.querySelectorAll('.add-task-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const status = btn.parentElement.dataset.status;
        const title = prompt('タスク名を入力：');
        if (!title)
            return;
        const date_start = prompt('開始日') || null;
        const date_end = prompt('終了日') || null;
        // checklistをDBに保存できるように追加
        await api.post('/kanban', {
            title,
            status,
            date_start,
            date_end,
            checklist: [],
        });
        renderBoard();
    });
});
// ---------- ドラッグ＆ドロップ ----------
function enableDrag() {
    let dragId = null;
    document.querySelectorAll('.task').forEach((t) => {
        t.addEventListener('dragstart', () => {
            dragId = Number(t.dataset.id);
        });
    });
    document.querySelectorAll('.column').forEach((col) => {
        col.addEventListener('dragover', (e) => e.preventDefault());
        col.addEventListener('drop', async () => {
            if (dragId == null)
                return;
            const status = col.dataset.status;
            await updateTask(dragId, { status });
            renderBoard();
        });
    });
}
// ---------- 検索 ----------
searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    document.querySelectorAll('.task').forEach((task) => {
        const txt = task.textContent?.toLowerCase() || '';
        task.style.display = txt.includes(keyword) ? '' : 'none';
    });
});
// ---------- 初期化 ----------
renderBoard();
