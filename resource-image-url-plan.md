# Resource `image_url` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `image_url` support to the Resource model using local filesystem storage, exposed in the show detail page and editable via the edit page.

**Architecture:** File uploads are stored on Laravel's `public` disk (`storage/app/public/resources/`), served via the storage symlink. The edit form uses Inertia's `forceFormData` with `_method: PUT` spoofing to support `multipart/form-data`. Old images are deleted on replacement.

**Tech Stack:** Laravel 12, Inertia.js v2, React 19, TailwindCSS v4, Pest v3

---

### Task 1: Migration — add `image_url` to `resources` table

**Files:**
- Create: `database/migrations/xxxx_add_image_url_to_resources_table.php`

**Step 1: Generate migration**

```bash
php artisan make:migration add_image_url_to_resources_table --table=resources --no-interaction
```

**Step 2: Write migration content**

```php
public function up(): void
{
    Schema::table('resources', function (Blueprint $table) {
        $table->string('image_url')->nullable()->after('description');
    });
}

public function down(): void
{
    Schema::table('resources', function (Blueprint $table) {
        $table->dropColumn('image_url');
    });
}
```

**Step 3: Run migration**

```bash
php artisan migrate
```

Expected: `Migrating: xxxx_add_image_url_to_resources_table` then `Migrated`.

**Step 4: Commit**

```bash
git add database/migrations/
git commit -m "feat: add image_url column to resources table"
```

---

### Task 2: Model — add `image_url` to `$fillable`

**Files:**
- Modify: `app/Models/Resource.php`

**Step 1: Update `$fillable`**

```php
protected $fillable = [
    'user_id',
    'title',
    'description',
    'image_url',
];
```

**Step 2: Commit**

```bash
git add app/Models/Resource.php
git commit -m "feat: add image_url to Resource fillable"
```

---

### Task 3: Storage symlink

**Step 1: Create symlink (run once)**

```bash
php artisan storage:link
```

Expected: `The [public/storage] link has been connected to [storage/app/public].`

This makes `storage/app/public/` accessible at `/storage/` in the browser.

---

### Task 4: Form Requests — add image validation

**Files:**
- Modify: `app/Http/Requests/Resources/CreateResourceRequest.php`
- Modify: `app/Http/Requests/Resources/UpdateResourceRequest.php`

**Step 1: Update `CreateResourceRequest::rules()`**

```php
public function rules(): array
{
    return [
        'title'       => ['required', 'string'],
        'description' => ['required', 'string'],
        'image'       => ['nullable', 'image', 'max:2048'],
    ];
}
```

**Step 2: Update `UpdateResourceRequest::rules()`**

```php
public function rules(): array
{
    return [
        'title'       => ['required', 'string'],
        'description' => ['required', 'string'],
        'image'       => ['nullable', 'image', 'max:2048'],
    ];
}
```

> The field is named `image` (the uploaded file object), not `image_url` (the stored path). `'image'` validation rule checks for valid image MIME types. `max:2048` = 2MB.

**Step 3: Write failing tests**

```bash
php artisan make:test --pest ResourceImageValidationTest --no-interaction
```

```php
// tests/Feature/ResourceImageValidationTest.php
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('rejects non-image files on create', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->post(route('resources.data.store'), [
            'title'       => 'Test',
            'description' => 'Test description',
            'image'       => $file,
        ])
        ->assertSessionHasErrors('image');
});

it('rejects files over 2MB on create', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg')->size(3000);

    $this->actingAs($user)
        ->post(route('resources.data.store'), [
            'title'       => 'Test',
            'description' => 'Test description',
            'image'       => $file,
        ])
        ->assertSessionHasErrors('image');
});
```

**Step 4: Run tests to verify they fail**

```bash
php artisan test --compact --filter=ResourceImageValidationTest
```

Expected: FAIL (image validation not yet wired to controller).

**Step 5: Commit form requests (tests will pass after controller task)**

```bash
git add app/Http/Requests/Resources/
git commit -m "feat: add image validation to resource form requests"
```

---

### Task 5: Controller — handle file upload/delete

**Files:**
- Modify: `app/Http/Controllers/Resources/ResourceDataController.php`

**Step 1: Add Storage import**

At the top of the file, add:

```php
use Illuminate\Support\Facades\Storage;
```

**Step 2: Update `store` method**

```php
public function store(CreateResourceRequest $request): RedirectResponse
{
    $resource = new Resource($request->safe()->except('image'));
    $resource->user_id = $request->user()->id;

    if ($request->hasFile('image')) {
        $resource->image_url = $request->file('image')->store('resources', 'public');
    }

    $this->resourceService->create($resource);

    return redirect()->route('resources.show', $resource->id);
}
```

**Step 3: Update `update` method**

```php
public function update(UpdateResourceRequest $request, Resource $resource): RedirectResponse
{
    $resource->fill($request->safe()->except('image'));

    if ($request->hasFile('image')) {
        if ($resource->image_url) {
            Storage::disk('public')->delete($resource->image_url);
        }
        $resource->image_url = $request->file('image')->store('resources', 'public');
    }

    $this->resourceService->editById($resource->id, $resource);

    return redirect()->route('resources.show', $resource->id);
}
```

> `store('resources', 'public')` saves to `storage/app/public/resources/` with a random filename and returns the relative path (e.g. `resources/abc123.jpg`). On update, the old file is deleted before saving the new one to avoid orphaned files on disk.

**Step 4: Run validation tests**

```bash
php artisan test --compact --filter=ResourceImageValidationTest
```

Expected: PASS.

**Step 5: Write upload/delete tests**

```php
it('stores image on create', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($user)
        ->post(route('resources.data.store'), [
            'title'       => 'Test',
            'description' => 'Test description',
            'image'       => $file,
        ])
        ->assertRedirect();

    $resource = \App\Models\Resource::latest()->first();
    expect($resource->image_url)->not->toBeNull();
    Storage::disk('public')->assertExists($resource->image_url);
});

it('replaces old image on update', function () {
    $user = User::factory()->create();
    $resource = \App\Models\Resource::factory()->create([
        'user_id'   => $user->id,
        'image_url' => 'resources/old.jpg',
    ]);
    Storage::disk('public')->put('resources/old.jpg', 'fake');

    $newFile = UploadedFile::fake()->image('new.jpg');

    $this->actingAs($user)
        ->put(route('resources.data.update', $resource->id), [
            'title'       => $resource->title,
            'description' => $resource->description,
            'image'       => $newFile,
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing('resources/old.jpg');
    $resource->refresh();
    Storage::disk('public')->assertExists($resource->image_url);
});
```

**Step 6: Run all tests**

```bash
php artisan test --compact --filter=ResourceImageValidationTest
```

Expected: all PASS.

**Step 7: Commit**

```bash
git add app/Http/Controllers/Resources/ResourceDataController.php tests/Feature/ResourceImageValidationTest.php
git commit -m "feat: handle image upload and deletion in ResourceDataController"
```

---

### Task 6: API Resource — expose `image_url` as full URL

**Files:**
- Modify: `app/Http/Resources/Api/V1/ResourceResource.php`

**Step 1: Add Storage import**

```php
use Illuminate\Support\Facades\Storage;
```

**Step 2: Add `image_url` to `toArray()`**

```php
public function toArray(Request $request): array
{
    return [
        'id'          => $this->id,
        'title'       => $this->title,
        'description' => $this->description,
        'image_url'   => $this->image_url
                            ? Storage::disk('public')->url($this->image_url)
                            : null,
        'created_at'  => $this->created_at,
        'updated_at'  => $this->updated_at,
        'user'        => $this->whenLoaded('user', fn () => $this->user->name),
    ];
}
```

> `Storage::disk('public')->url(...)` returns the full public URL (`/storage/resources/abc123.jpg`). The frontend receives a ready-to-use URL, not a raw storage path.

**Step 3: Also update the OpenAPI schema annotation**

Add this property to the `#[OA\Schema]` attribute:

```php
new OA\Property(property: 'image_url', type: 'string', nullable: true, example: '/storage/resources/abc123.jpg'),
```

**Step 4: Commit**

```bash
git add app/Http/Resources/Api/V1/ResourceResource.php
git commit -m "feat: expose image_url in ResourceResource"
```

---

### Task 7: TypeScript types — add `image_url`

**Files:**
- Find and modify the Resource type definition (likely `resources/js/types/index.d.ts` or a dedicated types file)

**Step 1: Locate the type**

```bash
grep -r "image_url\|ResourceData\|ResourceItem" resources/js/types/ resources/js/hooks/
```

**Step 2: Add `image_url` to the Resource type**

```ts
image_url: string | null;
```

**Step 3: Commit**

```bash
git add resources/js/types/
git commit -m "feat: add image_url to Resource TypeScript type"
```

---

### Task 8: Edit page — add image upload field

**Files:**
- Modify: `resources/js/pages/resources/edit.tsx`

**Step 1: Update `useForm` to include `image` and `_method`**

Replace the existing `useForm` call:

```tsx
const { data: formData, setData, post, processing, errors } = useForm<{
    title: string;
    description: string;
    image: File | null;
    _method: string;
}>({
    title: '',
    description: '',
    image: null,
    _method: 'PUT',
});
```

**Step 2: Update `useEffect` to preserve `_method`**

```tsx
useEffect(() => {
    if (resource) {
        setData(prev => ({
            ...prev,
            title: resource.title,
            description: resource.description,
        }));
    }
}, [resource]);
```

**Step 3: Update `handleSubmit` to use `post` with `forceFormData`**

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post(route('resources.data.update', id), {
        forceFormData: true,
    });
}
```

> Browsers cannot send `multipart/form-data` via PUT. `_method: 'PUT'` is Laravel's method spoofing — the request is sent as POST but Laravel treats it as PUT. `forceFormData: true` ensures Inertia always encodes as `multipart/form-data`, even when no file is selected.

**Step 4: Add image field to the form JSX**

Insert between the description field and the submit buttons:

```tsx
<div className="flex flex-col gap-1.5">
    <Label htmlFor="image">Image</Label>
    {resource.image_url && (
        <img
            src={resource.image_url}
            alt="Current image"
            className="h-40 w-auto rounded-lg object-cover"
        />
    )}
    <Input
        id="image"
        type="file"
        accept="image/*"
        onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
        aria-invalid={!!errors.image}
    />
    <p className="text-muted-foreground text-xs">Leave empty to keep the current image. Max 2MB.</p>
    {errors.image && <p className="text-destructive text-sm">{errors.image}</p>}
</div>
```

**Step 5: Commit**

```bash
git add resources/js/pages/resources/edit.tsx
git commit -m "feat: add image upload field to resource edit page"
```

---

### Task 9: Show page — display image

**Files:**
- Modify: `resources/js/pages/resources/show.tsx`

**Step 1: Add image display in the content card**

Inside the content card `<div>`, after `<Separator className="mb-6" />` and before the description `<p>`, add:

```tsx
{resource.image_url && (
    <img
        src={resource.image_url}
        alt={resource.title}
        className="mb-6 h-64 w-full rounded-lg object-cover"
    />
)}
```

**Step 2: Commit**

```bash
git add resources/js/pages/resources/show.tsx
git commit -m "feat: display image on resource detail page"
```

---

### Task 10: Build & verify

**Step 1: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

**Step 2: Run all resource tests**

```bash
php artisan test --compact --filter=Resource
```

Expected: all PASS.

**Step 3: Build frontend**

```bash
npm run build
```

Or ask the user to run `npm run dev` / `composer run dev` to see changes in the browser.

---

## Summary of files changed

| File | Change |
|------|--------|
| `database/migrations/xxxx_add_image_url_to_resources_table.php` | New — adds `image_url` column |
| `app/Models/Resource.php` | Add `image_url` to `$fillable` |
| `app/Http/Requests/Resources/CreateResourceRequest.php` | Add `image` validation rule |
| `app/Http/Requests/Resources/UpdateResourceRequest.php` | Add `image` validation rule |
| `app/Http/Controllers/Resources/ResourceDataController.php` | Handle file store/delete |
| `app/Http/Resources/Api/V1/ResourceResource.php` | Expose `image_url` as full URL |
| `resources/js/types/` | Add `image_url: string \| null` to Resource type |
| `resources/js/pages/resources/edit.tsx` | Add file input, switch to `post` + `forceFormData` |
| `resources/js/pages/resources/show.tsx` | Display image |
| `tests/Feature/ResourceImageValidationTest.php` | New — validation + upload/delete tests |
