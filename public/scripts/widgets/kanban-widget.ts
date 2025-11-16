// public/scripts/widgets/kanban-widget.ts

import { Widget } from '../shared/Widget.js';
import { KanbanCard } from '../shared/types.js';
import { APIClient } from '../shared/apiClient.js';

const STATUSES = [
  { key: 'not-stated', label: '未着手' },
  { key: 'in-progress', label: '進行中' },
  { key: 'complete', label: '完了' },
];

export class KanbanWidget extends Widget {
  constructor(private api: APIClient) {
    super('#kanban-widget-board');
  }

  /** カード描画 */
  renderCards(cards: KanbanCard[]) {
    const boardHTML = STATUSES.map(({ key, label }) => {
      const filtered = cards.filter((t) => t.status === key).slice(0, 3);

      const taskHTML = filtered.length
        ? filtered
            .map(
              (t) => `
          <div class="kanban-widget-task">
            <div class="title">${t.title}</div>
            <div class="dates">${t.dateStart || ''} → ${t.dateEnd || ''}</div>
          </div>
        `
            )
            .join('')
        : `<div class="no-task">タスクなし</div>`;

      return `
        <div class="kanban-widget-column" data-status="${key}">
          <h3>${label}</h3>
          <div class="kanban-widget-tasks">${taskHTML}</div>
        </div>
      `;
    }).join('');

    this.render(`
      <div class="kanban-widget-board">${boardHTML}</div>
      <div class="kanban-widget-footer">
        <a href="kanban.html" class="open-kanban-link">➡ 詳細を開く</a>
      </div>
    `);
  }

  /** APIからデータ取得 */
  async loadCards() {
    try {
      const cards = await this.api.get<KanbanCard[]>('/kanban');
      this.renderCards(cards);
    } catch (err) {
      console.error('KanbanWidget Error:', err);
      this.render(`
        <div class="widget-error">
          ⚠ カンバン情報を取得できませんでした。
        </div>
      `);
    }
  }
}
