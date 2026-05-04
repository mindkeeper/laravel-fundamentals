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
class ApiController extends Controller {}
