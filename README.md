# Laravel Fundamental

A Laravel 12 + Inertia.js (React) application for managing resources with full CRUD functionality.

## Requirements

- PHP 8.2+
- Composer
- Node.js & npm
- A supported database (SQLite by default)

## Getting Started

### 1. Install dependencies

```bash
composer install
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database setup

Run migrations:

```bash
php artisan migrate
```

Run seeders (creates a default user + 10 fake users, each with 20 resources):

```bash
php artisan db:seed
```

Or migrate and seed in one command:

```bash
php artisan migrate:fresh --seed
```

### 4. Run the development server

```bash
composer run dev
```

This starts the Laravel server, queue worker, and Vite dev server concurrently.

Alternatively, run them separately:

```bash
php artisan serve
npm run dev
```

---

## Default User (for testing)

After seeding, you can log in with:

| Field    | Value             |
|----------|-------------------|
| Email    | user@example.com  |
| Password | password          |

---

## Available Pages

| URL                    | Description                          | Auth Required |
|------------------------|--------------------------------------|---------------|
| `/`                    | Welcome / landing page               | No            |
| `/login`               | Login page                           | No            |
| `/register`            | Registration page                    | No            |
| `/resources`           | List all resources (paginated)       | Yes           |
| `/resources/create`    | Create a new resource                | Yes           |
| `/resources/{id}`      | View a single resource               | Yes           |
| `/resources/{id}/edit` | Edit a resource                      | Yes           |
| `/settings/profile`    | Update profile information           | Yes           |
| `/settings/password`   | Change password                      | Yes           |

---

## Testing

Run all tests:

```bash
php artisan test --compact
```

Run a specific test file:

```bash
php artisan test --compact tests/Feature/ExampleTest.php
```

Filter by test name:

```bash
php artisan test --compact --filter=testName
```

This project uses [Pest](https://pestphp.com/) for testing.
