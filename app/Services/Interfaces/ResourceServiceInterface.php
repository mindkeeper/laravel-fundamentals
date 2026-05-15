<?php

namespace App\Services\Interfaces;

use App\Models\Resource;
use Illuminate\Pagination\LengthAwarePaginator;

interface ResourceServiceInterface
{
    public function findAll(?int $perPage = 15, ?string $sortBy = null, ?string $order = null, ?string $q = null, ?int $userId = null): LengthAwarePaginator;

    public function findById(int $id): Resource;

    public function editById(int $id, Resource $resource): Resource;

    public function destroy(Resource $resource): void;

    public function create(Resource $resource): void;
}
