// shared/types.ts

export interface KanbanCard {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  status: 'not-stated' | 'in-progress' | 'complete';
}

export interface WidgetSettings {
  autoRefresh?: boolean;
  refreshInterval?: number;
}
