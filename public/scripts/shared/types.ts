// public/scripts/shared/types.ts

// Kanban カード
export type KanbanCard = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dateStart?: string;
  dateEnd?: string;
  checklist?: { text: string; checked: boolean }[];
  createdAt?: string;
  updatedAt?: string;
};

// Widget 設定
export type WidgetSettings = {
  title?: string;
  refreshInterval?: number;
};
