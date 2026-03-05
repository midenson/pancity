"use client";

import React, { useState, useEffect } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  Zap,
  Info,
  Loader2,
  ChevronRight,
  History,
  AlertCircle,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const EXAM_PROVIDERS = [
  { id: "1", name: "WAEC", amount: 3450, service: "Result checker PIN" },
  { id: "2", name: "NECO", amount: 1500, service: "Result checker PIN" },
  { id: "3", name: "JAMB", amount: 4700, service: "UTME/DE Registration" },
];

export default function ExamPinsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedExam, setSelectedExam] = useState(EXAM_PROVIDERS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    quantity: "1",
    profile_code: "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    setIsDarkMode(savedTheme !== "light");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      (name === "phone" || name === "quantity") &&
      value !== "" &&
      !/^\d+$/.test(value)
    )
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePurchase = async () => {
    setError(null);
    await Haptics.impact({ style: ImpactStyle.Heavy });
    setLoading(true);

    try {
      const rawSession = localStorage.getItem("user_session");
      if (!rawSession) throw new Error("Please log in to continue");

      const session = JSON.parse(rawSession);
      // Ensure we have a clean string token
      const token =
        typeof session.token === "string" ? session.token : session.accessToken;

      if (!token) throw new Error("Session invalid. Please log in again.");

      const response = await fetch(
        "https://pancity.com.ng/app/api/exam/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Variation 1: Standard token header
            Token: token,
            // Variation 2: Standard Authorization header
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            // Variation 3: Token inside the body (Common for this specific API)
            token: token,
            provider: selectedExam.id,
            quantity: formData.quantity,
            phone: formData.phone,
            profile_code: selectedExam.id === "3" ? formData.profile_code : "",
            ref: `EXAM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          }),
        }
      );

      const rawText = await response.text();
      let result;

      try {
        const cleanJson = rawText.replace(/^\uFEFF/, "").trim();
        result = JSON.parse(cleanJson);
      } catch (parseError) {
        throw new Error("Server communication error. Please try again.");
      }

      if (
        response.ok &&
        (result.status === "success" || result.status === "successful")
      ) {
        await Haptics.notification({ type: NotificationType.Success });
        alert(`Transaction Successful! PIN: ${result.pin || result.msg}`);
        setFormData({ phone: "", quantity: "1", profile_code: "" });
      } else {
        // If the server says "Invalid token", it's likely the value stored in localStorage is wrong
        throw new Error(result.msg || "Transaction failed");
      }
    } catch (err: any) {
      await Haptics.notification({ type: NotificationType.Error });
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans pb-10 pt-safe px-5 ${
        isDarkMode ? "bg-[#0f0a14] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="flex justify-between items-center py-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className={`rounded-full h-9 w-9 ${
            isDarkMode
              ? "bg-zinc-900 text-white"
              : "bg-white shadow-sm text-slate-600"
          }`}
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-base font-bold tracking-tight">Exam Pins</h1>
        <button className="text-emerald-500 font-bold text-[10px] uppercase flex items-center gap-1 bg-emerald-500/10 px-3 py-2 rounded-full">
          <History size={12} /> History
        </button>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <p
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ml-1 ${
              isDarkMode ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            <Zap size={12} className="fill-orange-400 text-orange-400" /> Select
            Provider
          </p>

          <div className="grid grid-cols-3 gap-3 w-full">
            {EXAM_PROVIDERS.map((exam) => (
              <button
                key={exam.id}
                onClick={async () => {
                  setSelectedExam(exam);
                  setError(null);
                  await Haptics.impact({ style: ImpactStyle.Light });
                }}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-[1.8rem] transition-all border-2 w-full ${
                  selectedExam.id === exam.id
                    ? isDarkMode
                      ? "bg-[#1c1425] border-emerald-500 shadow-lg shadow-emerald-500/10"
                      : "bg-white border-emerald-500 shadow-lg shadow-emerald-100/50"
                    : isDarkMode
                    ? "bg-zinc-900/40 border-transparent opacity-40"
                    : "bg-slate-100/50 border-transparent opacity-60"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                    selectedExam.id === exam.id
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  {exam.name.substring(0, 4)}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-tighter ${
                    selectedExam.id === exam.id
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                >
                  {exam.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card
          className={`border-none rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${
            isDarkMode ? "bg-[#1c1425]" : "bg-white shadow-slate-200/60"
          }`}
        >
          <CardContent className="p-7 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-tight">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500/50 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Service Type
              </label>
              <div
                className={`w-full h-14 rounded-2xl border px-5 flex items-center justify-between ${
                  isDarkMode
                    ? "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                    : "bg-slate-50 border-slate-100 text-slate-700"
                }`}
              >
                <span className="font-bold text-sm">
                  {selectedExam.service}
                </span>
                <ChevronRight className="rotate-90 text-slate-400" size={16} />
              </div>
            </div>

            {selectedExam.id === "3" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label
                  className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                    isDarkMode ? "text-zinc-500" : "text-slate-400"
                  }`}
                >
                  Profile Code
                </label>
                <Input
                  name="profile_code"
                  placeholder="Enter confirmation code"
                  value={formData.profile_code}
                  onChange={handleInputChange}
                  className={`h-14 rounded-2xl border-none font-bold text-sm px-5 ${
                    isDarkMode
                      ? "bg-zinc-900 text-white placeholder:text-zinc-700"
                      : "bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
            )}

            <div className="space-y-2">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Phone Number
              </label>
              <Input
                name="phone"
                type="tel"
                placeholder="Enter registered phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`h-14 rounded-2xl border-none font-bold text-sm px-5 ${
                  isDarkMode
                    ? "bg-zinc-900 text-white placeholder:text-zinc-700"
                    : "bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-2">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDarkMode ? "text-zinc-500" : "text-slate-400"
                }`}
              >
                Total Amount
              </label>
              <div
                className={`h-14 rounded-2xl border px-5 flex items-center ${
                  isDarkMode
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <span className="text-lg font-black text-emerald-500">
                  ₦
                  {(
                    selectedExam.amount * parseInt(formData.quantity || "1")
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedExam.id !== "3" && (
              <div className="space-y-2">
                <label
                  className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                    isDarkMode ? "text-zinc-500" : "text-slate-400"
                  }`}
                >
                  Quantity
                </label>
                <div className="flex gap-2 w-full">
                  {["1", "2", "3", "5"].map((q) => (
                    <button
                      key={q}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, quantity: q }))
                      }
                      className={`flex-1 h-12 rounded-xl font-bold text-xs transition-all border ${
                        formData.quantity === q
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : isDarkMode
                          ? "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"
                          : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`p-4 rounded-2xl flex gap-3 border ${
                isDarkMode
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <Info className="text-emerald-500 shrink-0" size={18} />
              <p
                className={`text-[10px] leading-relaxed font-medium ${
                  isDarkMode ? "text-zinc-500" : "text-slate-500"
                }`}
              >
                {selectedExam.id === "3"
                  ? "Note: Send 'NIN' [space] [Your NIN] to 55019 or 66019 to get your profile code."
                  : "Exam pins are generated instantly. Go to History to view past purchases."}
              </p>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={
                loading ||
                !formData.phone ||
                (selectedExam.id === "3" && !formData.profile_code)
              }
              className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : selectedExam.id === "3" ? (
                "Get Details"
              ) : (
                "Purchase Now"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
