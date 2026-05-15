# Route Model Binding

Route model binding lets Laravel automatically fetch a database record from a URL segment and inject it directly into your controller method. Instead of receiving a raw integer ID and manually calling something like `Resource::findOrFail($id)`, you simply type-hint the model (e.g. `Resource $resource`) and Laravel does the lookup for you. If no record is found, it returns a `404` response automatically — no extra code needed.

To set it up, make sure the route parameter name matches the controller parameter name. For example, `Route::get('/resources/{resource}', ...)` paired with `public function show(Resource $resource)` is all Laravel needs to wire them together. The same applies in Form Requests — if you access `$this->route('resource')` inside `authorize()`, it will return the already-resolved model, not a raw ID, so you can use it directly without querying the database again.

---

## Before vs After

### Routes

```php
// BEFORE - inconsistent, {id} is just a raw number
Route::get('/resources/{id}',    [ResourceController::class, 'show']);
Route::put('/resources/{resource}', [ResourceController::class, 'update']); // {resource} but controller ignored it
Route::delete('/resources/{resource}', [ResourceController::class, 'destroy']); // same problem

// AFTER - consistent, {resource} matches the model type-hint
Route::get('/resources/{resource}',    [ResourceController::class, 'show']);
Route::put('/resources/{resource}',    [ResourceController::class, 'update']);
Route::delete('/resources/{resource}', [ResourceController::class, 'destroy']);
```

---

### Controller: `show`

```php
// BEFORE - manual lookup
public function show(int $id): ResourceResource
{
    return new ResourceResource($this->resourceService->findById($id));
    //                                                  ^^^^^^^^^^
    //                          you call the DB yourself
}

// AFTER - Laravel injects the model automatically
public function show(Resource $resource): ResourceResource
{
    return new ResourceResource($resource);
    //                          ^^^^^^^^
    //                          already fetched, already a 404 if not found
}
```

---

### Controller: `update`

```php
// BEFORE - manual lookup inside the service
public function update(int $id, UpdateResourceRequest $request): ResourceResource
{
    $resource = $this->resourceService->editById($id, new Resource($request->validated()));
    //                                  ^^^^^^^^^^
    //          service had to do findById internally, then fill, then save
    return new ResourceResource($resource);
}

// AFTER - model is already injected, just fill and save
public function update(Resource $resource, UpdateResourceRequest $request): ResourceResource
{
    $resource->fill($request->validated());
    $this->resourceService->editById($resource->id, $resource);
    return new ResourceResource($resource);
}
```

---

### Controller: `destroy`

```php
// BEFORE - manual findById, then manual ownership check
public function destroy(int $id, Request $request): JsonResponse
{
    $resource = $this->resourceService->findById($id); // extra DB query
    if ($resource->user_id !== $request->user()->id) {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    $this->resourceService->destroyById($id);
    return response()->json(['message' => 'success']);
}

// AFTER - model already injected, no extra DB query
public function destroy(Resource $resource, Request $request): JsonResponse
{
    if ($resource->user_id !== $request->user()->id) {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    $this->resourceService->destroyById($resource->id);
    return response()->json(['message' => 'success']);
}
```

---

### Form Request: `authorize()`

This is the tricky part. The `UpdateResourceRequest` also needed to check ownership. Before route model binding, it called `Resource::find()` to get the model. After, the model is already bound to the route — so calling `Resource::find($this->route('resource'))` was passing an **entire model object** into `find()`, causing the crash.

```php
// BEFORE - fetches from DB again (redundant), and broke after binding
public function authorize(): bool
{
    $resource = Resource::find($this->route('resource'));
    //                                      ^^^^^^^^^^^
    //          used to return an int (202), now returns a Resource model
    //          so Resource::find(Resource) caused the error
    return $resource && $this->user()->id === $resource->user_id;
}

// AFTER - use the already-bound model directly
public function authorize(): bool
{
    $resource = $this->route('resource');
    //          ^^^^^^^^^^^^^^^^^^^^^^^^
    //          returns the already-resolved Resource model

    return $resource instanceof Resource && $this->user()->id === $resource->user_id;
}
```

---

## How Laravel Knows Which Model to Fetch

Laravel matches the **route parameter name** to the **type-hinted parameter name** in the controller:

```
Route:  /resources/{resource}
                    ^^^^^^^^
Controller: public function show(Resource $resource)
                                          ^^^^^^^^
```

Because both are named `resource`, Laravel automatically runs:
```php
Resource::findOrFail($id_from_url);
```

...and injects the result. If no record is found, it returns HTTP `404` without you writing any code.

---

## Summary of Benefits

| | Before | After |
|---|---|---|
| DB query for show | Manual (`findById`) | Automatic |
| DB query for update | Manual (inside service) | Automatic |
| DB query for destroy | Manual (`findById`) | Automatic |
| 404 handling | Manual (`findOrFail` in repo) | Automatic |
| Code complexity | Higher | Lower |
| Redundant queries | Yes (form request + controller) | No |
