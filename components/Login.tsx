"use client";
//49ad460295
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ArrowUpRight } from "lucide-react";

const Login = () => {
  // 1. Initialize with empty strings to prevent the "uncontrolled" warning
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://pancity.com.ng/app/api/user/index.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      // 2. Capture as text first
      const rawText = await response.text();

      /**
       * FRONTEND FIX:
       * .trim() removes leading/trailing spaces.
       * .replace(/^\uFEFF/, "") removes the invisible BOM character ghost.
       */
      const cleanText = rawText.trim().replace(/^\uFEFF/, "");

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (jsonErr) {
        console.error("Parsing failed. Raw response was:", rawText);
        setError("Server returned an invalid format. Please contact support.");
        setLoading(false);
        return;
      }

      if (result.status === "success") {
        /**
         * 3. SYNC STORAGE KEY:
         * We save the object under 'user_session' so the Airtime page
         * can find it easily.
         */
        const sessionData = {
          token: result.token || "",
          user_data: result.user_data || {},
        };

        localStorage.setItem("user_session", JSON.stringify(sessionData));

        // Backward compatibility key
        localStorage.setItem("userToken", result.token || "");

        // 4. Navigate
        router.push("/dashboard");
      } else {
        setError(result.msg || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Connection failed. Please check your internet or server CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-sans text-black">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Abstract Dot Logo */}
        <div className="mb-10">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="15" r="5" fill="black" />
            <circle cx="15" cy="25" r="5" fill="black" />
            <circle cx="25" cy="25" r="5" fill="black" />
            <circle cx="35" cy="25" r="5" fill="black" />
            <circle cx="25" cy="35" r="5" fill="black" />
            <circle cx="17" cy="17" r="4" fill="black" />
            <circle cx="33" cy="33" r="4" fill="black" />
            <path
              d="M18 18L22 22M28 22L32 18M18 32L22 28M28 28L32 32"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center w-full">
          Welcome back, User <span className="text-2xl ml-1">😎</span>
        </h1>

        {/* Subheading Link */}
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="text-xs text-black underline decoration-gray-400 underline-offset-4 mb-10 hover:text-gray-600 transition-colors"
        >
          Don't have an account? Sign up
        </button>

        {/* Form Container */}
        <form className="w-full space-y-5" onSubmit={handleLogin}>
          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 font-medium ml-1">
              Your phone
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="08012345678"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-md text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 font-medium ml-1">
              Your password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="..............."
                className="w-full pl-4 pr-12 py-3.5 border border-gray-200 rounded-md text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors bg-white tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-100">
              <p className="text-red-600 text-xs font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#bdf522] hover:bg-[#b0eb14] text-black font-semibold py-4 px-4 rounded-md text-sm transition-all relative disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && (
              <ArrowUpRight
                className="absolute right-4 w-5 h-5"
                strokeWidth={2.5}
              />
            )}
          </button>

          {/* Footer Options */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="w-4 h-4 rounded-sm border border-gray-300 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                <input type="checkbox" className="hidden peer" />
                <svg
                  className="w-3 h-3 text-black hidden peer-checked:block"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Remember me</span>
            </label>

            <button
              type="button"
              className="text-xs text-gray-600 underline decoration-gray-400 underline-offset-4 hover:text-black transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
