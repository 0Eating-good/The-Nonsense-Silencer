# Stop the Chatter - 學測題目智能抽籤練習系統

**標語**: Stop the Chatter, Mind What Matters.

## 📖 概述

Stop the Chatter 是一個全功能的學測題目練習系統，提供：

- 🎰 **智能抽籤系統**：模擬廟裡實體抽籤的視覺效果
- 📚 **自動題庫同步**：從大考中心即時爬取最新題目
- 🔤 **英文 7000 單**：Level 3-6 英翻中選擇題
- ✅ **錯題追蹤**：自動記錄錯誤並提供複習
- 📱 **跨裝置同步**：多設備無縫進度同步
- 📝 **計算紙功能**：支援手寫的虛擬計算紙
- 📊 **詳細統計**：掌握學習進度和薄弱環節

## 🏗️ 技術架構

```
Frontend: React 18 + TypeScript + Vite + Tailwind CSS
Backend:  Python 3.11 + FastAPI + SQLAlchemy
Database: PostgreSQL
Deployment: Docker + Docker Compose
```

## 🚀 快速開始

### 先決條件
- Docker & Docker Compose
- 或 Node.js 16+、Python 3.11+、PostgreSQL

### 方式 1: Docker Compose（推薦）

```bash
# 複製環境設置
cp backend/.env.example backend/.env

# 啟動所有服務
docker-compose up -d

# 訪問應用
# 前端: http://localhost:5173
# API: http://localhost:8000/docs
```

### 方式 2: 本地開發

**後端**
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

**前端**
```bash
cd frontend
npm install
npm run dev
```

## 📋 項目結構

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # API 路由
│   │   ├── scrapers/         # 爬蟲模組
│   │   ├── main.py           # FastAPI 主應用
│   │   ├── models.py         # 資料庫模型
│   │   ├── schemas.py        # API 規格
│   │   └── database.py       # 資料庫連接
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/            # 頁面元件
│   │   ├── stores/           # Zustand 狀態管理
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🎯 核心功能

### 登入/註冊
- 郵箱註冊和登入
- JWT 認證
- 跨設備會話同步

### 抽籤做題
- 隨機抽取題目
- 按科目、難度篩選
- 實時答題反饋
- 詳細解析說明
- 計算紙功能

### 錯題複習
- 自動保存錯誤題目
- 錯題列表管理
- 追蹤錯誤次數
- 智能複習推薦

### 學習統計
- 做題總數
- 正確率
- 已掌握題目
- 科目分布

## 🔗 API 端點

### 認證
- `POST /auth/register` - 註冊
- `POST /auth/login` - 登入
- `GET /auth/me` - 當前用戶

### 題目
- `GET /questions/random` - 隨機題目
- `GET /questions/search` - 搜尋題目
- `POST /questions/submit-answer` - 提交答案

### 進度
- `GET /progress/stats` - 統計數據
- `GET /progress/wrong-questions` - 錯題列表
- `DELETE /progress/mastered/{id}` - 移除已掌握

## 📊 題庫來源

1. **大考中心學測題**
   - 自動爬取 CEEC 官網
   - 年份、難度、答對率標註
   - 包含各科目範圍

2. **7000 單英翻中**
   - Level 3-6 選擇題
   - 自動導入系統
   - 支持快速篇幅轉換

## 🚢 部署到線上

### Vercel (前端)
```bash
npm run build
vercel --prod
```

### Railway (後端)
1. 連接 GitHub repo
2. 設置環境變數
3. 自動部署

## 🛠️ 開發指南

### 環境設置
```bash
# 後端
cd backend
cp .env.example .env
pip install -r requirements.txt

# 前端
cd frontend
npm install
```

### 運行開發伺服器
```bash
# 後端
python app/main.py

# 前端
npm run dev
```

### 構建生產版本
```bash
# 後端 (Docker)
docker build -t nonsense-silencer-api ./backend

# 前端
npm run build
```

## 🔒 安全性

- JWT 令牌認證
- CORS 跨域保護
- SQL 注入防護 (SQLAlchemy)
- 密碼加密 (bcrypt)
- 環境變數配置

## 📝 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📧 聯絡

項目維護者：0Eating-good
開發時間：2026年5月

---

**Stop the Chatter, Mind What Matters.** 🎰
