<?php

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
            'title' => 'Test',
            'description' => 'Test description',
            'image' => $file,
        ])
        ->assertSessionHasErrors('image');
});

it('rejects files over 2MB on create', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg')->size(3000);

    $this->actingAs($user)
        ->post(route('resources.data.store'), [
            'title' => 'Test',
            'description' => 'Test description',
            'image' => $file,
        ])
        ->assertSessionHasErrors('image');
});

it('stores image on create', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($user)
        ->post(route('resources.data.store'), [
            'title' => 'Test',
            'description' => 'Test description',
            'image' => $file,
        ])
        ->assertRedirect();

    $resource = App\Models\Resource::latest()->first();
    expect($resource->image_url)->not->toBeNull();
    Storage::disk('public')->assertExists($resource->image_url);
});

it('rejects files over 2MB on update', function () {
    $user = User::factory()->create();
    $resource = App\Models\Resource::factory()->create(['user_id' => $user->id]);
    $file = UploadedFile::fake()->image('photo.jpg')->size(3000);

    $this->actingAs($user)
        ->put(route('resources.data.update', $resource->id), [
            'title' => $resource->title,
            'description' => $resource->description,
            'image' => $file,
        ])
        ->assertSessionHasErrors('image');
});

it('replaces old image on update', function () {
    $user = User::factory()->create();
    $resource = App\Models\Resource::factory()->create([
        'user_id' => $user->id,
        'image_url' => 'resources/old.jpg',
    ]);
    Storage::disk('public')->put('resources/old.jpg', 'fake');

    $newFile = UploadedFile::fake()->image('new.jpg');

    $this->actingAs($user)
        ->put(route('resources.data.update', $resource->id), [
            'title' => $resource->title,
            'description' => $resource->description,
            'image' => $newFile,
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing('resources/old.jpg');
    $resource->refresh();
    Storage::disk('public')->assertExists($resource->image_url);
});
