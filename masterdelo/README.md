# МастерДело

Веб-приложение для управления заказами мастеров-самозанятых.

## Стек

- **Backend**: FastAPI + SQLAlchemy 2 (async) + SQLite/PostgreSQL
- **Frontend**: React 18 + TypeScript + Tailwind CSS + TanStack Query
- **PDF**: ReportLab с кириллицей (DejaVuSans)

---

## Быстрый старт (dev)

### Бэкенд

```bash
cd masterdelo/backend

# Создать .env (уже скопирован из .env.example при сборке)
cp .env.example .env

# Установить зависимости
pip install -r requirements.txt

# Скачать шрифты для PDF
python download_fonts.py

# Применить миграции
alembic upgrade head

# Создать тестовые данные
python seed.py

# Запустить сервер
uvicorn main:app --reload
```

### Фронтенд (новый терминал)

```bash
cd masterdelo/frontend
npm install
npm run dev
```

Открыть: http://localhost:5173

Тестовый логин: **test@test.ru** / **test12345**

API docs: http://localhost:8000/docs

---

## Docker (dev)

```bash
cd masterdelo
docker-compose up --build
```

Открыть: http://localhost:5173

---

## Docker (production)

```bash
cd masterdelo
docker-compose -f docker-compose.prod.yml up --build -d
```

Открыть: http://localhost

---

## Переключение на PostgreSQL

В `backend/.env`:

```env
DB_TYPE=postgresql
DB_USER=masterdelo
DB_PASSWORD=secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=masterdelo
```

Применить миграции:

```bash
alembic upgrade head
```

---

## Структура проекта

```
masterdelo/
├── backend/             # FastAPI приложение
│   ├── core/            # Конфиг, БД, auth
│   ├── models/          # SQLAlchemy модели
│   ├── schemas/         # Pydantic схемы
│   ├── routers/         # API роутеры
│   ├── services/        # PDF генерация, scheduler
│   ├── fonts/           # DejaVuSans для PDF
│   ├── static/uploads/  # Загруженные фото
│   ├── main.py          # Точка входа
│   ├── seed.py          # Тестовые данные
│   └── alembic/         # Миграции
└── frontend/            # React приложение
    └── src/
        ├── pages/       # Страницы
        ├── components/  # Компоненты
        ├── api/         # HTTP клиенты
        ├── hooks/       # TanStack Query хуки
        ├── store/       # Zustand (auth)
        └── utils/       # Форматтеры, константы
```

---

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| GET | /api/auth/me | Текущий пользователь |
| GET | /api/orders | Список заказов |
| POST | /api/orders | Создать заказ |
| GET | /api/orders/{id} | Заказ с деталями |
| PATCH | /api/orders/{id}/status | Сменить статус |
| GET | /api/clients | Список клиентов |
| POST | /api/pdf/invoice/{id} | Скачать счёт |
| GET | /api/pdf/act/{id} | Скачать акт |

Полная документация: http://localhost:8000/docs

---

## Миграции

```bash
# Применить все миграции
alembic upgrade head

# Создать новую миграцию
alembic revision --autogenerate -m "описание"

# Откатить одну миграцию
alembic downgrade -1
```
