<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Laravel Fundamental API',
    version: '1.0.0',
    description: 'API documentation for Laravel Fundamental project'
)]
#[OA\Server(
    url: '/api/v1',
    description: 'API V1'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Token',
    description: 'Enter the token from the login endpoint'
)]
class ApiController extends Controller {}
