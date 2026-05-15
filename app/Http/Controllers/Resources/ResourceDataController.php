<?php

namespace App\Http\Controllers\Resources;

use App\Http\Controllers\Controller;
use App\Http\Requests\Resources\CreateResourceRequest;
use App\Http\Requests\Resources\DeleteResourceRequest;
use App\Http\Requests\Resources\UpdateResourceRequest;
use App\Http\Resources\Api\V1\ResourceResource;
use App\Models\Resource;
use App\Services\Interfaces\ResourceServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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

    public function store(CreateResourceRequest $request): RedirectResponse
    {
        $resource = new Resource($request->validated());
        $resource->user_id = $request->user()->id;
        $this->resourceService->create($resource);

        return redirect()->route('resources.show', $resource->id);
    }

    public function show(Resource $resource): ResourceResource
    {
        return new ResourceResource($resource);
    }

    public function destroy(DeleteResourceRequest $request, Resource $resource): JsonResponse
    {
        $this->resourceService->destroy($resource);

        return response()->json(null, 204);
    }

    public function update(UpdateResourceRequest $request, Resource $resource): RedirectResponse
    {
        $resource->fill($request->validated());
        $this->resourceService->editById($resource->id, $resource);

        return redirect()->route('resources.show', $resource->id);
    }
}
