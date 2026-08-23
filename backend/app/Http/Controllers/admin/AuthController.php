<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\AuthController as MainAuthController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Alias login method calling the unified AuthController
     */
    public function login(Request $request): JsonResponse
    {
        return app(MainAuthController::class)->login($request);
    }
}
