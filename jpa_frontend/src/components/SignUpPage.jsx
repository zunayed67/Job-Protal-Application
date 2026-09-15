import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock, // 1. Added Lock import to fix the white screen crash
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { signUpPageStyles as s } from "../assets/dummyStyles";
import API from "../utils/api";
import { useEffect, useState, useCallback } from "react"; // 2. Added useCallback
import { Link, useNavigate } from "react-router-dom";

// 3. Removed STORAGE_KEY as it is not used in the signup page

// toast
const Toast = ({ message, type = "success", onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  // 4. Wrapped handleClose in useCallback
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  // 5. Added handleClose to dependency array
  useEffect(() => {
    const timer = setTimeout(handleClose, 3000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  const borderClass =
    type === "success" ? s.toast.borderSuccess : s.toast.borderError;

  return (
    <div
      className={`${s.toast.container} ${borderClass} ${isExiting ? s.toast.containerExiting : s.toast.containerEntered}`}
      style={{ animation: "slideIn 0.3s ease-out" }}
    >
      {type === "success" ? (
        <CheckCircle className={s.toast.iconSuccess} />
      ) : (
        <X className={s.toast.iconError} />
      )}
      <p className={s.toast.message}>{message}</p>
      <button
        onClick={handleClose}
        className={s.toast.closeButton}
        aria-label="Close notification"
      >
        <X className={s.toast.closeIcon} />
      </button>
    </div>
  );
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(Math.min(strength, 4));
    }
  }; // takes the user input

  // to validate the form fields

  // Validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ message: "All fields are required", type: "error" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setToast({ message: "Please enter a valid email", type: "error" });
      return false;
    }
    if (formData.password.length < 6) {
      setToast({
        message: "Password must be at least 6 characters",
        type: "error",
      });
      return false;
    }
    return true;
  };

  // to register as a user
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const res = await API.post("/auth/register", formData);
      setToast({ message: res.data.message, type: "success" });
      setIsVerifying(true);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "SignUP Failed",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // to verify by otp
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    // Fixed logical error here: changed !otp.length !== 6 to otp.length !== 6
    if (!otp || otp.length !== 6) {
      setToast({
        message: "Please enter a valid 6 digits code",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await API.post("/auth/verify-email", {
        email: formData.email,
        otp,
      });
      setToast({
        message: res.data.message,
        type: "success",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Verification failed",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // to return the color according to strength
  const getPasswordStrengthClass = (level) => {
    if (passwordStrength < level) return s.passwordStrengthEmpty;
    if (level <= 2) return s.passwordStrengthWeak;
    if (level === 3) return s.passwordStrengthMedium;
    return s.passwordStrengthStrong;
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={s.container}>
        <Link
          to={isVerifying ? "#" : "/login"}
          onClick={(e) => {
            if (isVerifying) {
              e.preventDefault();
              setIsVerifying(false);
            }
          }}
          className={s.backButton}
        >
          <ArrowLeft className={s.backIcon} />
          <span className={s.backText}>
            {isVerifying ? "Back to Signup" : "Sign In"}
          </span>
        </Link>

        <div className={s.cardWrapper}>
          <div className={s.animatedBorder}>
            <div className={s.animatedBorderInner}>
              <h2 className={s.title}>
                {isVerifying ? "Verify Code" : "Join JobPortal"}
              </h2>
              <p className={s.subtitle}>
                {isVerifying
                  ? `We've sent a 6-digit code to ${formData.email}`
                  : "Create your account and start your journey."}
              </p>

              {isVerifying ? (
                <form onSubmit={handleVerifyOTP} className={s.formVerifying}>
                  <div className={s.inputGroup}>
                    <label htmlFor="otp" className={s.otpLabel}>
                      Enter Verification Code
                    </label>
                    <div className={s.inputWrapper}>
                      <ShieldCheck className={s.inputIcon} />
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        required
                        className={s.otpInput}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={s.verifyButton}
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className={s.resendLink}>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={s.resendButton}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className={s.form}>
                  <div className={s.inputGroup}>
                    <label htmlFor="name" className={s.inputLabel}>
                      Full Name
                    </label>
                    <div className={s.inputWrapper}>
                      <User className={s.inputIcon} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={s.input}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className={s.inputGroup}>
                    <label htmlFor="email" className={s.inputLabel}>
                      Email
                    </label>
                    <div className={s.inputWrapper}>
                      <Mail className={s.inputIcon} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={s.input}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className={s.inputGroup}>
                    <label htmlFor="password" className={s.inputLabel}>
                      Password
                    </label>
                    <div className={s.inputWrapper}>
                      <Lock className={s.inputIcon} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={s.inputWithButton}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={s.passwordToggle}
                      >
                        {showPassword ? (
                          <EyeOff className={s.passwordToggleIcon} />
                        ) : (
                          <Eye className={s.passwordToggleIcon} />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className={s.passwordStrengthWrapper}>
                        <div className={s.passwordStrengthBar}>
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`${s.passwordStrengthSegment} ${getPasswordStrengthClass(level)}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={s.submitButton}
                  >
                    {isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        <CheckCircle className={s.buttonIcon} />
                        <span>Sign Up</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {!isVerifying && (
                <div className={s.footer}>
                  <p className={s.footerText}>
                    Already have an account?{" "}
                    <Link to="/login" className={s.footerLink}>
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div aria-hidden className={s.blob1} style={{ filter: "blur(36px)" }} />
        <div aria-hidden className={s.blob2} style={{ filter: "blur(46px)" }} />
      </div>

      <style>{s.globalStyles}</style>
    </>
  );
};

export default SignUpPage;
