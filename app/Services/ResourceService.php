<?php

namespace App\Services;

use App\Models\Resource;
use App\Repositories\Interfaces\ResourceRepositoryInterface;
use App\Services\Interfaces\ResourceServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ResourceService implements ResourceServiceInterface
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly ResourceRepositoryInterface $resourceRepository,
    ) {}

    public function findAll(?int $perPage = 15, ?string $sortBy = null, ?string $order = null, ?string $q = null): LengthAwarePaginator
    {
        $allowedSortColumns = ['id', 'title', 'created_at', 'updated_at'];
        $allowedOrders = ['asc', 'desc'];
        $perPage = $perPage ?? 15;
        $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'created_at';
        $order = in_array($order, $allowedOrders) ? $order : 'desc';

        return $this->resourceRepository->findAll($perPage, $sortBy, $order, $q);
    }

    public function findById(int $id): Resource
    {
        return $this->resourceRepository->findById($id);
    }

    public function editById(int $id, Resource $data): Resource
    {
        $resource = $this->resourceRepository->findById($id);
        $resource->fill($data->toArray());
        $this->resourceRepository->editById($id, $resource);

        return $resource;
    }

    public function destroyById(int $id): void
    {
        $this->resourceRepository->destroyById($id);

    }

    public function create(Resource $resource): void
    {
        $this->resourceRepository->create($resource);
    }
}
