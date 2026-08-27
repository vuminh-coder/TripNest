<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Throwable;

class AccommodationController extends Controller
{
    //
    public function index(Request $request){
        try{
            $accommodations = Accommodation::limit(10)->get();
            return response()->json([
                "success" => true,
                "accommodations" => $accommodations
            ]);
        }catch(Throwable $ex){
            return response()->json(["success" => false,"message" => $ex->getMessage()]);
        }
    }
}
