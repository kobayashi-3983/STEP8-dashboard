"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.db = {
    kanbanCards: [
        {
            id: 1,
            title: '最初のタスク',
            description: 'パーソナルダッシュボードの設計を確認する',
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
    weatherCache: [],
    calendarEvents: [],
};
