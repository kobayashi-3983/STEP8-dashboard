🌟 パーソナルダッシュボード（Full-Stack TypeScript App）

個人向けに設計した パーソナルダッシュボード です。  
以下の 3 つの主要ウィジェットを備えており、日々のタスク管理・予定確認・天気チェックをすべて 1 つの画面で行えます。

・機能一覧

### 1. カンバンボード（Kanban）

- タスクの追加 / 編集 / 削除
- ドラッグ＆ドロップでステータス移動
- チェックリスト対応（追加・削除・編集・チェック）
- 日付（開始日 / 終了日）の保存

###　 2. カレンダー（Calendar）

- 月ごとのカレンダー表示
- 日付クリックで予定追加
- 予定一覧表示
- ローカルキャッシュ + DB 同期
- モーダル操作で直感的に入力可能

### 3. 天気ウィジェット（Weather）

- OpenWeather API を使用した天気表示
- 地域検索に対応
- 取得データのキャッシュで高速表示

---

・技術スタック

### フロントエンド

- TypeScript（strict モード）
- バニラ JS + HTML + CSS（レスポンシブ）
- モジュールベース構成
- Widget クラスによる共通 UI 管理

### バックエンド

- Node.js + Express
- TypeScript（tsconfig.server.json）
- REST API（/api/kanban・/api/calendar など）
- 環境ごとに **NeonDB / FakeDB を自動切替**

### データベース

- NeonDB（本番）
- Fake インメモリ DB（StackBlitz 開発用）

---

## ディレクトリ構成（概要）

project/
├── dist/ # ビルド出力（tsc で生成）
│
├── public/ # フロントエンド（ブラウザ側）
│ ├── scripts/
│ │ ├── shared/ # 共有ライブラリ（API クライアント等）
│ │ │ ├── apiClients.ts
│ │ │ ├── types.ts
│ │ │ └── Widgets.ts
│ │ │
│ │ ├── widgets/ # 各ウィジェット（小型版 UI）
│ │ │ ├── calendar-widgets.ts
│ │ │ ├── kanban-widgets.ts
│ │ │ ├── theme-toggle.ts
│ │ │ └── weather-widgets.ts
│ │ │
│ │ ├── apps/ # 各ページ専用スクリプト
│ │ │ ├── calendar-main.ts
│ │ │ ├── dashboard.ts
│ │ │ ├── kanban-main.ts
│ │ │ └── weather-main.ts
│ │ │
│ │ └── main.ts # エントリーポイント（トップページ）
│ │
│ ├── styles/ # CSS
│ │ ├── calendar.css
│ │ ├── kanban.css
│ │ ├── main.css
│ │ └── weather.css
│ │
│ ├── index.html # ダッシュボードトップ
│ ├── calendar.html
│ ├── kanban.html
│ └── weather.html
│
├── server/ # バックエンド（Express + TypeScript）
│ ├── data/
│ │ └── memoryDB.ts # StackBlitz 用インメモリ FakeDB
│ │
│ ├── routes/ # API ルート
│ │ ├── calendars.ts
│ │ ├── kanban.ts
│ │ └── weathers.ts
│ │
│ ├── sql/
│ │ └── schema.sql # 実 DB 用スキーマ
│ │
│ ├── index.ts # Express エントリーポイント
│ ├── shared/
│ │ ├── apiClients.ts
│ │ └── Widgets.ts
│ └── types.ts # 共有型定義
│
├── .env # 環境変数（本番のみ使用）
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.client.json
├── tsconfig.server.json
└── vercel.json # （デプロイする場合に必要）
