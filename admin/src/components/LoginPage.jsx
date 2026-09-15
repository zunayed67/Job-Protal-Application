import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPageStyles as s } from "../assets/dummyStyles.js";
import axios from "axios";
import {
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  EyeOff,
  Eye,
  Lock,
  LogIn,
} from "lucide-react"; // FIX 1: Added Lock here

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({
          visible: false,
          message: "",
          type: "success",
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  // to submit the data and logged in
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setToast({
        visible: true,
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      if (res.data.user.role !== "admin") {
        setToast({
          visible: true,
          message: "Access Denied. Admins only.",
          type: "error",
        });
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToast({
        visible: true,
        message: "Login Successfull!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch {
      setToast({
        visible: true,
        message: "Invalid email or password",
        type: "error",
      });
    }
  };

  const closeToast = () =>
    setToast({ visible: false, message: "", type: "success" });

  const toastIcon =
    toast.type === "success" ? (
      <CheckCircle className={s.toastIconSuccess} size={20} />
    ) : (
      <AlertCircle className={s.toastIconError} size={20} />
    );

  const toastBorderColor =
    toast.type === "success" ? s.toastBorderSuccess : s.toastBorderError;

  return (
    <div className={s.pageContainer}>
      {toast.visible && (
        <div className={`${s.toastContainer} ${toastBorderColor}`} role="alert">
          {toastIcon}
          <p className={s.toastMessage}>{toast.message}</p>
          <button onClick={closeToast} className={s.toastCloseBtn}>
            <X size={18} />
          </button>
        </div>
      )}
      <div className={s.card}>
        <div className={s.header}>
          <h1 className={s.title}>Admin Panel</h1>{" "}
          {/* Fixed typo "Panle" to "Panel" */}
          <p className={s.subtitle}>Job Portal Administration</p>
        </div>
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formGroup}>
            <label htmlFor="email" className={s.label}>
              Email Address
            </label>
            <div className={s.inputWrapper}>
              <div className={s.iconWrapper}>
                <Mail className={s.iconDefault} size={18} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${s.inputBase} ${s.inputPr3}`}
                placeholder="Admin@jobportal.com"
                required
              />
            </div>
          </div>
          <div className={s.formGroup}>
            <label htmlFor="password" className={s.label}>
              Password
            </label>
            {/* FIX 2: Changed from s.iconWrapper to s.inputWrapper to match layout */}
            <div className={s.inputWrapper}>
              <div className={s.iconWrapper}>
                <Lock className={s.iconDefault} size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${s.inputBase} ${s.inputPr12}`}
                placeholder="*****"
                required
              />
              {/*toggle eye pass word*/}
              <div className={s.eyeButtonWrapper}>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className={s.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {/* submit button */}
          <button type="submit" className={s.submitBtn}>
            <LogIn size={18} className={s.submitIcon} />
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
