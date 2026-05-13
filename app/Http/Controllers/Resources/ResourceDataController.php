<?php

namespace App\Http\Controllers\Resources;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ResourceResource;
use App\Services\Interfaces\ResourceServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ResourceDataController extends Controller
{
    public function __construct(
        private readonly ResourceServiceInterface $resourceService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $paginated = $this->resourceService->findAll(
            perPage: $request->integer('per_page') ?: 15,
            sortBy: null,
            order: 'desc',
            q: $request->string('q')->value() ?: null,
        );

        return ResourceResource::collection($paginated);
    }
}
