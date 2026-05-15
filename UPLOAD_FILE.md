---

Implementation Plan: image_url for Resource

Step 1 — Migration

Add image_url (nullable string) to the resources table.

// database/migrations/xxxx_add_image_url_to_resources_table.php
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

Explanation: nullable() because existing records and resources without images are valid.

---

Step 2 — Model

Add image_url to $fillable in Resource.

protected $fillable = [
'user_id',
'title',
'description',
'image_url',
];

---

Step 3 — Storage symlink

Run once to make storage/app/public accessible via /storage:

php artisan storage:link

Images will be stored at storage/app/public/resources/ and served at /storage/resources/filename.jpg.

---

Step 4 — Form Requests

CreateResourceRequest — add optional image validation:

public function rules(): array
{
return [
'title' => ['required', 'string'],
'description' => ['required', 'string'],
'image' => ['nullable', 'image', 'max:2048'], // 2MB max
];
}

UpdateResourceRequest — same addition:

public function rules(): array
{
return [
'title' => ['required', 'string'],
'description' => ['required', 'string'],
'image' => ['nullable', 'image', 'max:2048'],
];
}

Explanation: The field is named image (the uploaded file), not image_url (which is the stored path). Validating as image ensures only image MIME types are accepted.

---

Step 5 — Controller

The controller must handle file storage and old file deletion on update. Since image is a file (not a validated scalar), it can't go through $request->validated() directly into the model — we handle it manually.

store method:

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

update method:

public function update(UpdateResourceRequest $request, Resource $resource): RedirectResponse
  {
      $resource->fill($request->safe()->except('image'));

      if ($request->hasFile('image')) {
          // Delete old image if it exists
          if ($resource->image_url) {
              Storage::disk('public')->delete($resource->image_url);
          }
          $resource->image_url = $request->file('image')->store('resources', 'public');
      }

      $this->resourceService->editById($resource->id, $resource);

      return redirect()->route('resources.show', $resource->id);

}

Add use Illuminate\Support\Facades\Storage; at the top.

Explanation: store('resources', 'public') saves the file to storage/app/public/resources/ with a random filename and returns the relative path (e.g. resources/abc123.jpg). We store that path in image_url. On update, we delete the old file before storing the new one
to avoid orphaned files.

---

Step 6 — API Resource

Expose image_url as a full public URL in ResourceResource:

public function toArray(Request $request): array
  {
      return [
          'id'          => $this->id,
          'title'       => $this->title,
          'description' => $this->description,
          'image_url'   => $this->image_url
                              ? Storage::disk('public')->url($this->image_url)
: null,
'created_at' => $this->created_at,
'updated_at' => $this->updated_at,
'user' => $this->whenLoaded('user', fn () => $this->user->name),
];
}

Add use Illuminate\Support\Facades\Storage;.

Explanation: Storage::disk('public')->url(...) generates the correct full URL (/storage/resources/abc123.jpg). The frontend receives a ready-to-use URL, not a raw path.

---

Step 7 — Edit page (React)

The edit form must switch to multipart/form-data. Inertia's useForm supports this by calling post() with \_method: 'PUT' (method spoofing), since browsers can't send multipart via PUT natively.

const { data: formData, setData, post, processing, errors } = useForm<{
title: string;
description: string;
image: File | null;
\_method: string;
}>({
title: '',
description: '',
image: null,
\_method: 'PUT',
});

useEffect(() => {
if (resource) {
setData(prev => ({
...prev,
title: resource.title,
description: resource.description,
}));
}
}, [resource]);

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
post(route('resources.data.update', id), {
forceFormData: true,
});
}

Add the image field in the form JSX (between description and submit button):

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

Explanation: forceFormData: true tells Inertia to always encode the request as multipart/form-data, even when no file is selected. The \_method: 'PUT' hidden field is what Laravel uses for method spoofing — the route stays the same. Without forceFormData, Inertia
would send JSON when the file field is empty.

---

Step 8 — Show page (React)

Add the image display in the content card, right after the <Separator>:

{resource.image_url && (
<img
          src={resource.image_url}
          alt={resource.title}
          className="mb-6 h-64 w-full rounded-lg object-cover"
      />
)}

---

Step 9 — TypeScript types

Update your resource type definition (wherever Resource is typed, likely resources/js/types/index.d.ts or similar):

image_url: string | null;

---

Step 10 — Run & verify

php artisan migrate
php artisan storage:link # only needed once
npm run build # or ask user to run npm run dev

---

That covers all layers. Ready to implement? I can execute all steps now.
