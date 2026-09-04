<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use Illuminate\Http\Request;
use Throwable;

class AmenityController extends Controller
{
    //
    public function index(Request $request){
        try{
            $amenities = Amenity::all();
            return response()->json([
                "success" => true,
                "amenities" => $amenities
            ]);

        }catch(Throwable $ex){
            return response()->json(([
                "success" => false,
                "message" => $ex->getMessage()
            ]),400);
        }
    }
}
