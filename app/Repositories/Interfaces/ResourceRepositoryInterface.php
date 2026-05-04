<?php

namespace App\Repositories\Interfaces;

use App\Models\Resource;
use Illuminate\Pagination\LengthAwarePaginator;

interface ResourceRepositoryInterface
{
    public function findAll(int $perPage, string $sortBy, string $order, ?string $query = null): LengthAwarePaginator;

    public function findById(int $id): Resource;

    public function editById(int $id, Resource $resource): Resource;

    public function destroy(Resource $resource): void;

    public function create(Resource $resource): void;
}
