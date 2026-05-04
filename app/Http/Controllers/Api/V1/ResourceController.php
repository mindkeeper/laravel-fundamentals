<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Resources\CreateResourceRequest;
use App\Http\Requests\Api\V1\Resources\FindAllResourceRequest;
use App\Http\Requests\Api\V1\Resources\UpdateResourceRequest;
use App\Http\Resources\Api\V1\ResourceResource;
use App\Models\Resource;
use App\Services\Interfaces\ResourceServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

class ResourceController extends Controller
{
    public function __construct(
        private readonly ResourceServiceInterface $resourceService,
    ) {}

    #[OA\Get(
        path: '/resources',
        summary: 'List all resources',
        tags: ['Resources'],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, example: 15)),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, example: 1)),
            new OA\Parameter(name: 'sort_by', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['id', 'title', 'created_at', 'updated_at'], example: 'created_at')),
            new OA\Parameter(name: 'order', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'], example: 'desc')),
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of resources',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/ResourceResource')),
                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                        new OA\Property(property: 'last_page', type: 'integer', example: 5),
                        new OA\Property(property: 'per_page', type: 'integer', example: 15),
                        new OA\Property(property: 'total', type: 'integer', example: 75),
                    ]
                )
            ),
        ]
    )]
    public function index(FindAllResourceRequest $request): AnonymousResourceCollection
    {
        $paginated = $this->resourceService->findAll(
            $request->integer('per_page') ?: null,
            $request->string('sort_by')->value() ?: null,
            $request->string('order')->value() ?: null,
            $request->string('q')->value() ?: null,
        );

        return ResourceResource::collection($paginated);
    }

    #[OA\Post(
        path: '/resources',
        summary: 'Create a new resource',
        security: [['sanctum' => []]],
        tags: ['Resources'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'description'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'My Resource'),
                    new OA\Property(property: 'description', type: 'string', example: 'A detailed description'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Resource created', content: new OA\JsonContent(ref: '#/components/schemas/ResourceResource')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateResourceRequest $request): JsonResponse
    {
        $resource = new Resource($request->validated());
        $resource->user_id = $request->user()->id;
        $this->resourceService->create($resource);

        return (new ResourceResource($resource))->response()->setStatusCode(201);
    }

    #[OA\Get(
        path: '/resources/{id}',
        summary: 'Get a resource by ID',
        tags: ['Resources'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Resource found', content: new OA\JsonContent(ref: '#/components/schemas/ResourceResource')),
            new OA\Response(response: 404, description: 'Resource not found'),
        ]
    )]
    public function show(Resource $resource): ResourceResource
    {
        return new ResourceResource($resource);
    }

    #[OA\Put(
        path: '/resources/{id}',
        summary: 'Update a resource',
        security: [['sanctum' => []]],
        tags: ['Resources'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Updated title'),
                    new OA\Property(property: 'description', type: 'string', example: 'Updated description'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Resource updated', content: new OA\JsonContent(ref: '#/components/schemas/ResourceResource')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - not the owner'),
            new OA\Response(response: 404, description: 'Resource not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Resource $resource, UpdateResourceRequest $request): ResourceResource
    {
        $resource->fill($request->validated());
        $this->resourceService->editById($resource->id, $resource);

        return new ResourceResource($resource);
    }

    #[OA\Delete(
        path: '/resources/{id}',
        summary: 'Delete a resource',
        security: [['sanctum' => []]],
        tags: ['Resources'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Resource deleted',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'success'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - not the owner'),
            new OA\Response(response: 404, description: 'Resource not found'),
        ]
    )]
    public function destroy(Resource $resource, Request $request): JsonResponse
    {
        if ($resource->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->resourceService->destroy($resource);

        return response()->json([
            'message' => 'success',
        ]);
    }
}
