import React, { useState } from "react";
import {
  TbX,
  TbBrandGoogle,
  TbShieldLock,
  TbMail,
  TbLock,
} from 'react-icons/tb';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';
import {useDispatch} from "react-redux";
export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  //redux
  const dispatch = useDispatch();
  // end redux

  if (!isOpen) return null;

  // Đăng nhập bằng Email + Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    const dataUpToSever = { email: email, password: password };
    fetch("http://localhost:8000/api/auth/not-goole/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataUpToSever),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "🎉 Đăng nhập thành công!",
            text: "Chào mừng bạn quay trở lại TripNest.",
            position: "top-end",
            toast: true,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          localStorage.setItem("token", data.token);
          dispatch({"type": "UPDATE",payload: data.user});
          onClose();
        } else {
          Swal.fire({
            icon: "error",
            title: "❌ Đăng nhập thất bại!",
            text: data.message,
            position: "top-end",
            toast: true,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    )
  };

  // Đăng nhập bằng Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const targetEmail = email.trim() || "demo.traveler@gmail.com";

    const googleName = targetEmail
      .split("@")[0]
      .replace(".", " ")
      .toUpperCase();

    const googlePayload = {
      email: targetEmail,
      google_id:
        "google-sub-" +
        Math.abs(
          targetEmail
            .split("")
            .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0),
        ),
      name: googleName,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    };

    try {
      const res = await apiService.googleLogin(googlePayload);

      if (res.token && res.user) {
        const userData = {
          ...res.user,
          token: res.token,
        };

        localStorage.setItem("tripnest_user", JSON.stringify(userData));

        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }

        onClose();
      } else {
        setError(res.message || "Đăng nhập Google không thành công.");
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi đăng nhập Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{
          width: "420px",
          maxWidth: "95vw",
          padding: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "0.9rem",
            borderBottom: "1px solid #ebebeb",
          }}
        >
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: "static" }}
          >
            <TbX />
          </button>

          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Đăng nhập vào TripNest
          </h2>

          <div style={{ width: "36px" }} />
        </div>

        {/* Form */}
        <div style={{ paddingTop: "1rem" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              margin: "0 0 1rem",
              color: "#222",
            }}
          >
            Chào mừng trở lại 👋
          </h3>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff0f3",
                color: "#e00b41",
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Email + Password */}
          <form
            onSubmit={handleEmailLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {/* Email */}
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.65rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TbMail
                style={{
                  color: "#717171",
                  fontSize: "1.15rem",
                }}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Password */}
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.65rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TbLock
                style={{
                  color: "#717171",
                  fontSize: "1.15rem",
                }}
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Forgot password */}
            <div
              style={{
                textAlign: "right",
              }}
            >
              <button
                type="button"
                style={{
                  border: "none",
                  background: "none",
                  color: "#ff385c",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              className="primary-gradient-btn"
              disabled={loading}
              style={{
                padding: "0.7rem",
                borderRadius: "8px",
                fontWeight: 700,
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              margin: "1rem 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#ebebeb",
              }}
            />

            <span
              style={{
                fontSize: "0.7rem",
                color: "#717171",
              }}
            >
              HOẶC
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#ebebeb",
              }}
            />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "0.7rem",
              borderRadius: "8px",
              border: "1px solid #dadce0",
              background: "#fff",
              color: "#3c4043",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <TbBrandGoogle
              style={{
                fontSize: "1.3rem",
                color: "#ea4335",
              }}
            />

            {loading ? "Đang xác thực..." : "Đăng nhập với Google"}
          </button>

          {/* Security */}
          <div
            style={{
              marginTop: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              color: "#717171",
              fontSize: "0.75rem",
            }}
          >
            <TbShieldLock
              style={{
                fontSize: "1rem",
                color: "#0d8a43",
              }}
            />

            <span>Thông tin đăng nhập được bảo mật</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
