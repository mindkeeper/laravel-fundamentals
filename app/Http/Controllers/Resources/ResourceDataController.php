<?php

namespace App\Http\Controllers\Resources;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ResourceResource;
use App\Models\Resource;
use App\Services\Interfaces\ResourceServiceInterface;
use Illuminate\Http\JsonResponse;
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
            userId: $request->user()->id,
        );

        return ResourceResource::collection($paginated);
    }

    public function show(Resource $resource): ResourceResource
    {
        return new ResourceResource($resource);
    }

    public function destroy(Request $request, Resource $resource): JsonResponse
    {
        if ($request->user()->id !== $resource->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->resourceService->destroy($resource);

        return response()->json(null, 204);
    }

    public function update(Request $request, Resource $resource): ResourceResource|JsonResponse
    {
        if ($request->user()->id !== $resource->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
        ]);

        $resource->fill($validated);
        $this->resourceService->editById($resource->id, $resource);

        return new ResourceResource($resource);
    }
}
