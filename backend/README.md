# CEEC 大考中心學測題庫 API

## 環境設定

複製 `.env.example` 為 `.env` 並填入配置：

```bash
cp .env.example .env
```

編輯 `.env` 文件，設置：
- `DATABASE_URL` - PostgreSQL 連接字符串
- `SECRET_KEY` - JWT 密鑰
- `API_HOST` 和 `API_PORT` - API 服務器配置

## 安裝和運行

### 方式 1：本地開發

```bash
# 安裝依賴
pip install -r requirements.txt

# 設置數據庫
python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"

# 啟動服務器
python app/main.py
```

### 方式 2：Docker

```bash
docker-compose up -d
```

### 方式 3：手動 Docker

```bash
# 構建鏡像
docker build -t nonsense-silencer-api .

# 運行容器
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/nonsense_silencer \
  -e SECRET_KEY=your-secret-key \
  nonsense-silencer-api
```

## API 文檔

啟動後訪問：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 主要端點

### 認證
- `POST /auth/register` - 用戶註冊
- `POST /auth/login` - 用戶登入
- `GET /auth/me` - 獲取當前用戶信息

### 題目
- `GET /questions/random` - 隨機抽取題目
- `GET /questions/search` - 搜尋題目
- `POST /questions/submit-answer` - 提交答案

### 進度
- `GET /progress/stats` - 用戶統計數據
- `GET /progress/wrong-questions` - 錯題列表
- `DELETE /progress/mastered/{question_id}` - 移除已掌握題目

## 爬蟲

### 爬取 CEEC 題目

```python
from app.scrapers.ceec_scraper import CEECScraper
import asyncio

scraper = CEECScraper()
questions = asyncio.run(scraper.scrape_all_questions())
```

### 解析 7000 單

```python
from app.scrapers.excel_parser import ExcelParser
import asyncio

parser = ExcelParser()
questions = asyncio.run(parser.parse_7000_words())
```

## 數據庫模型

- **users** - 用戶帳戶
- **questions** - 題庫
- **user_progress** - 用戶做題記錄
- **user_statistics** - 用戶統計數據
