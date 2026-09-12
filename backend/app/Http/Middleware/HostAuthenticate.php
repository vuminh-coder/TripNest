<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Account;
use Symfony\Component\HttpFoundation\Response;

class HostAuthenticate
{
    /**
     * Handle an incoming request for Host Portal endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->bearerToken();
            if ($token && !str_starts_with($token, 'demo-')) {
                $account = Auth::guard('api')->user();
                if ($account) {
                    return $next($request);
                }
            }
        } catch (\Throwable $e) {
            // Ignore JWT errors and fall through
        }

        // For local dev, demo users, or unauthenticated host browsing:
        // Automatically link to default Host Account (Account #3: minhhoang.dalat@gmail.com)
        $demoHostAccount = Account::where('role', 'host')->first() ?? Account::find(3);
        if ($demoHostAccount) {
            Auth::guard('api')->setUser($demoHostAccount);
        }

        return $next($request);
    }
}
