<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Services\Interfaces\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthServiceInterface $authService,
    ) {}

    #[OA\Post(
        path: '/login',
        summary: 'Authenticate user and return token',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Login successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'success'),
                        new OA\Property(property: 'token', type: 'string', example: '1|abc123...'),
                        new OA\Property(
                            property: 'user',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                                new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 401, description: 'Invalid credentials'),
        ]
    )]
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password,
        );

        return response()->json([
            'message' => 'success',
            'token' => $result['token'],
            'user' => $result['user'],
        ], 201);
    }
}
