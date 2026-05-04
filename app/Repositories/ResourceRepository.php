<?php

namespace App\Repositories;

use App\Models\Resource;
use App\Repositories\Interfaces\ResourceRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ResourceRepository implements ResourceRepositoryInterface
{
    public function findAll(int $perPage, string $sortBy, string $order, ?string $q = null): LengthAwarePaginator
    {
        return Resource::with('user')->when($q, fn ($query) => $query->where('title', 'like', "%{$q}%"))->orderBy($sortBy, $order)->paginate($perPage);
    }

    public function findById(int $id): Resource
    {
        return Resource::findOrFail($id);
    }

    public function editById(int $id, Resource $resource): Resource
    {
        $resource->save();

        return $resource;
    }

    public function destroy(Resource $resource): void
    {
        $resource->delete();
    }

    public function create(Resource $resource): void
    {
        $resource->save();
    }
}
