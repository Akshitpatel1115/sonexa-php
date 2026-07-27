import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiX } from "react-icons/fi";

import Input from "../common/Input";
import Button from "../common/Button";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const ForgotPasswordForm = ({ initialEmail = "", autoTrigger = false, onSuccess = null, onCancel = null }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(135); // 2 minutes 15 seconds

  const navigate = useNavigate();
  const toast = useToast();
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (autoTrigger && initialEmail && step === 1 && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      handleRequestOtp();
    }
  }, [autoTrigger, initialEmail, step]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const isPasswordValid = () => {
    const p = newPassword;
    return (
      p.length >= 8 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /\d/.test(p) &&
      /[^A-Za-z0-9]/.test(p)
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Verification code sent successfully.");
      setTimer(135);
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-reset-otp", { email, otp });
      toast.success("OTP verified. Please enter your new password.");
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid()) {
      toast.error("Password does not meet all requirements.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      toast.success("Password reset successful!");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/5 glass-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer z-10"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        <p className="mt-2 text-text-secondary">
          {step === 1 && "Enter your email to receive a verification code."}
          {step === 2 && `We've sent a 6-digit code to ${email}.`}
          {step === 3 && "Enter your new password below."}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={FiMail}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Verification Code (OTP)"
            type="text"
            name="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) setOtp(val);
            }}
            icon={FiLock}
            required
            maxLength={6}
          />
          <Button type="submit" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={timer > 0 || isLoading}
              onClick={handleRequestOtp}
              className="text-sm font-semibold text-primary transition hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-500"
            >
              {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="text-xs text-gray-400 transition hover:text-white"
            >
              Entered the wrong email? Start over
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              icon={FiLock}
              required
            />
            {/* Smooth slide down for the strength meter */}
            <div
              className={`mt-2 transition-all duration-300 overflow-hidden ${
                isPasswordFocused || (newPassword.length > 0 && !isPasswordValid())
                  ? "max-h-[300px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <PasswordStrengthMeter password={newPassword} />
            </div>
          </div>
          
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={FiLock}
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading || !isPasswordValid() || newPassword !== confirmPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}

      {!autoTrigger && (
        <>
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <p className="text-center text-text-secondary">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary transition hover:text-primary-hover"
            >
              Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
