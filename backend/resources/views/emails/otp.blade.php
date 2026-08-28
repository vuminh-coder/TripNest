<!DOCTYPE html>

<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP đặt lại mật khẩu - TripNest</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif; color: #333333;">

```
<div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background-color: #2563eb; padding: 25px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
            TripNest
        </h1>

        <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">
            Đặt phòng dễ dàng - Trải nghiệm tuyệt vời
        </p>
    </div>

    <!-- Body -->
    <div style="padding: 35px 40px;">

        <h2 style="margin-top: 0; color: #222222;">
            Xin chào!
        </h2>

        <p style="font-size: 15px; line-height: 1.7;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản
            TripNest của bạn.
        </p>

        <p style="font-size: 15px; line-height: 1.7;">
            Để tiếp tục quá trình đặt lại mật khẩu, vui lòng sử dụng mã
            OTP bên dưới để xác minh rằng bạn là chủ sở hữu của tài khoản.
        </p>

        <!-- OTP -->
        <div style="margin: 30px 0; padding: 25px; background-color: #f0f7ff; border-radius: 8px; text-align: center; border: 1px solid #dbeafe;">

            <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                MÃ XÁC THỰC OTP
            </p>

            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
                {{ $otp }}
            </div>

            <p style="margin: 15px 0 0; font-size: 13px; color: #666666;">
                Mã có hiệu lực trong <strong>5 phút</strong>.
            </p>

        </div>

        <p style="font-size: 15px; line-height: 1.7;">
            Vui lòng không chia sẻ mã OTP này với bất kỳ ai, kể cả người
            tự nhận là nhân viên TripNest. TripNest sẽ không bao giờ yêu
            cầu bạn cung cấp mã OTP, mật khẩu hoặc thông tin bảo mật
            thông qua email, tin nhắn hoặc điện thoại.
        </p>

        <p style="font-size: 15px; line-height: 1.7;">
            Nếu bạn không thực hiện yêu cầu đặt lại mật khẩu này, bạn có
            thể bỏ qua email này. Tài khoản của bạn vẫn được bảo vệ và
            mật khẩu hiện tại sẽ không thay đổi.
        </p>

        <div style="margin-top: 30px; padding: 15px; background-color: #fff7ed; border-left: 4px solid #f97316;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #7c2d12;">
                <strong>Lưu ý bảo mật:</strong>
                Mã OTP chỉ được sử dụng một lần và sẽ hết hạn sau 5 phút.
                Không chia sẻ mã này với bất kỳ người nào.
            </p>
        </div>

        <p style="margin-top: 30px; font-size: 15px; line-height: 1.7;">
            Cảm ơn bạn đã sử dụng dịch vụ của TripNest.
            Chúc bạn có những trải nghiệm tuyệt vời!
        </p>

        <p style="font-size: 15px; margin-bottom: 0;">
            Trân trọng,<br>
            <strong>Đội ngũ TripNest</strong>
        </p>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #eeeeee;">

        <p style="margin: 0; font-size: 12px; color: #888888;">
            Email này được gửi tự động, vui lòng không trả lời email này.
        </p>

        <p style="margin: 8px 0 0; font-size: 12px; color: #aaaaaa;">
            © {{ date('Y') }} TripNest. All rights reserved.
        </p>

    </div>

</div>
```

</body>
</html>
