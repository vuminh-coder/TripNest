<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Throwable;

class UserController extends Controller
{
    //
    public function create(Request $request){
        try{
            
            return response()->json(["success" => true,"data" => $request->all()]);
        }catch(Throwable $ex){
            return response()->json([
                "success" => false,
                "message" => $ex->getMessage()
            ]);
        }
    }
}
