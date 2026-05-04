<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    )
    {}

    public function login(LoginRequest $request):JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password,
        );
        return response()->json([
            'message' => 'success',
            'token' => $result['token'],
            'user' => $result['user']
        ],201);
    }
}
