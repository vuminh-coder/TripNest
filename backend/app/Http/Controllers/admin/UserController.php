<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use Cloudinary as GlobalCloudinary;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Throwable;

class UserController extends Controller
{
    //
    public function create(Request $request){
        try{
            $dataUser = $request->validate([
                "full_name" => "required|min:6",
                "phone_number" => "sometimes",
                "id_card_number" => "sometimes",
                "address" => "sometimes",
                "avatar_url" => "sometimes|image|max:5120"
            ]);
            $data = $request->validate([
                "email" => "required|email",
                "role" => "sometimes",
                "status" => "sometimes",
            ]);

            $existEmail = Account::where("email",$data["email"])->first();
            if($existEmail != null){
                return response()->json([
                    "success" => false,
                    "message" => "Địa chỉ email đã tồn tại. Vui lòng chọn địa chỉ email khác"
                ]);
            }

            if(isset($data["phone_number"])){
                $exitsPhoneNumber = User::where("phone_number",$data["phone_number"])->first();
                if($exitsPhoneNumber){
                    return response()->json([
                    "success" => false,
                    "message" => "Số điện thoại đã tồn tại. Vui lòng chọn số điện thoại khác khác"
                ]);
                }
            }

            if($request->hasFile("avatar")){
                $cloudinary = new Cloudinary();

                $result = $cloudinary->uploadApi()->upload($request->file("avatar")->getRealPath(),["folder" => "avatars"]);

                $dataUser["avatar_url"] = $result["secure_url"];
            }
            
            $result = Account::create($data);
            $dataUser["account_id"] = $result->id;
            $resultUser = User::create($dataUser);

            return response()->json([
                "success" => true,
                "message" => "Thêm mới người dùng thành công!!"
                ]);
        }catch(Throwable $ex){
            return response()->json([
                "success" => false,
                "error" => $ex->getMessage(),
                "message" => "Có lỗi xảy ra. Vui lòng thử lại"
            ]);
        }
    }
}
