# Swagger Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Swagger UI via `darkaonline/l5-swagger` to document the existing API endpoints.

**Architecture:** Install l5-swagger, add an OpenAPI info annotation to a dedicated controller, then annotate `AuthController` with `@OA\` docblocks. Swagger UI will be served at `/api/documentation`.

**Tech Stack:** Laravel 12, PHP 8.2, darkaonline/l5-swagger (OpenAPI 3.0), PHPDoc annotations

---

### Task 1: Install `darkaonline/l5-swagger`

**Files:**
- Modify: `composer.json` (via composer command)
- Create: `config/l5-swagger.php` (via publish command)

**Step 1: Install the package**

```bash
composer require darkaonline/l5-swagger
```

Expected output: Package installed successfully.

**Step 2: Publish config and views**

```bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

Expected: `config/l5-swagger.php` and swagger view files published.

**Step 3: Verify config published**

```bash
ls config/l5-swagger.php
```

Expected: file exists.

**Step 4: Commit**

```bash
git add composer.json composer.lock config/l5-swagger.php
git commit -m "feat: install darkaonline/l5-swagger"
```

---

### Task 2: Configure l5-swagger

**Files:**
- Modify: `config/l5-swagger.php`
- Modify: `.env` (add `L5_SWAGGER_GENERATE_ALWAYS=true`)

**Step 1: Set scan paths in config**

In `config/l5-swagger.php`, find the `annotations` key under `defaults.paths` and set it to scan `app/Http/Controllers/Api`:

```php
'annotations' => base_path('app/Http/Controllers/Api'),
```

**Step 2: Enable auto-generation in .env**

Add to `.env`:

```
L5_SWAGGER_GENERATE_ALWAYS=true
```

**Step 3: Verify the route is registered**

```bash
php artisan route:list --path=api/documentation
```

Expected: GET `/api/documentation` route appears.

**Step 4: Commit**

```bash
git add config/l5-swagger.php .env
git commit -m "feat: configure l5-swagger scan path and auto-generation"
```

---

### Task 3: Add OpenAPI base annotation

**Files:**
- Create: `app/Http/Controllers/Api/ApiController.php`

**Step 1: Create base controller with OpenAPI info annotation**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

/**
 * @OA\Info(
 *     title="Laravel Fundamental API",
 *     version="1.0.0",
 *     description="API documentation for Laravel Fundamental project"
 * )
 *
 * @OA\Server(
 *     url="/api/v1",
 *     description="API V1"
 * )
 */
class ApiController extends Controller
{
}
```

**Step 2: Verify no PHP errors**

```bash
php artisan config:clear && php artisan route:list --path=api/documentation
```

Expected: No errors, route listed.

**Step 3: Commit**

```bash
git add app/Http/Controllers/Api/ApiController.php
git commit -m "feat: add OpenAPI base info annotation"
```

---

### Task 4: Annotate AuthController

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`

**Step 1: Add `@OA\` annotations to the `login` method**

Add the following PHPDoc block above the `login` method:

```php
/**
 * @OA\Post(
 *     path="/login",
 *     summary="Authenticate user and return token",
 *     tags={"Auth"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email","password"},
 *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
 *             @OA\Property(property="password", type="string", format="password", example="secret")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Login successful",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="success"),
 *             @OA\Property(property="token", type="string", example="1|abc123..."),
 *             @OA\Property(property="user", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="John Doe"),
 *                 @OA\Property(property="email", type="string", example="user@example.com")
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error"
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Invalid credentials"
 *     )
 * )
 */
public function login(LoginRequest $request): JsonResponse
```

**Step 2: Generate swagger docs**

```bash
php artisan l5-swagger:generate
```

Expected: OpenAPI JSON generated in `storage/api-docs/`.

**Step 3: Verify JSON file created**

```bash
ls storage/api-docs/
```

Expected: `api-docs.json` present.

**Step 4: Run pint formatter**

```bash
vendor/bin/pint --dirty --format agent
```

**Step 5: Commit**

```bash
git add app/Http/Controllers/Api/V1/AuthController.php storage/api-docs/
git commit -m "feat: add swagger annotations to AuthController login endpoint"
```

---

### Task 5: Write feature test for Swagger UI route

**Files:**
- Create: `tests/Feature/SwaggerTest.php`

**Step 1: Create the test**

```bash
php artisan make:test --pest SwaggerTest
```

**Step 2: Write the test**

```php
<?php

it('serves swagger ui documentation page', function () {
    $response = $this->get('/api/documentation');

    $response->assertStatus(200);
});

it('serves swagger json spec', function () {
    $response = $this->get('/docs/api-docs.json');

    $response->assertStatus(200)
        ->assertJsonStructure(['openapi', 'info', 'paths']);
});
```

**Step 3: Run tests**

```bash
php artisan test --compact --filter=SwaggerTest
```

Expected: 2 tests pass.

**Step 4: Commit**

```bash
git add tests/Feature/SwaggerTest.php
git commit -m "test: add swagger UI and spec route tests"
```

---

### Task 6: Verify end-to-end

**Step 1: Clear caches and regenerate**

```bash
php artisan config:clear && php artisan l5-swagger:generate
```

**Step 2: Run all tests**

```bash
php artisan test --compact
```

Expected: All tests pass.

**Step 3: Check the docs URL**

```bash
php artisan route:list --path=api/documentation
```

Expected: Route is registered and returns 200.
