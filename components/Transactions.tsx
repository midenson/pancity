"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  FileText,
  Wifi,
  ArrowDownLeft,
  Download,
  X,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch real transaction data from API
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawSession = localStorage.getItem("user_session");
      if (!rawSession) {
        router.push("/login");
        return;
      }

      const session = JSON.parse(rawSession);
      const token = session.token || session.accessToken;

      const response = await fetch(
        "https://pancity.com.ng/app/api/transactions/history/index.php",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setTransactions(result.data || []);
      } else {
        throw new Error(result.msg || "Failed to fetch history");
      }
    } catch (err: any) {
      setError(
        err.message || "Something went wrong while loading transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // PDF Download Logic
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    const canvas = await html2canvas(receiptRef.current, {
      backgroundColor: "#0f0a14",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`receipt-${selectedTx.id || "tx"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white font-sans pb-10">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-safe">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="bg-zinc-900 rounded-full h-10 w-10 text-white"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-lg font-bold">Transactions</h1>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="bg-zinc-900 p-2.5 rounded-full text-emerald-500 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="px-5">
        <div className="flex justify-between items-end mb-6">
          <p className="text-zinc-500 text-sm">
            View and manage your transactions
          </p>
          <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
            <FileText size={14} /> Statement
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {["All Category", "All Status", "Date"].map((filter) => (
            <button
              key={filter}
              className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full text-xs whitespace-nowrap text-zinc-300"
            >
              {filter} <Filter size={12} className="text-zinc-500" />
            </button>
          ))}
        </div>

        {/* State Handling: Loading, Error, Empty */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">
              Updating History...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-center space-y-3">
            <AlertCircle className="mx-auto text-red-500" size={32} />
            <p className="text-sm text-red-200 font-medium">{error}</p>
            <Button
              onClick={fetchTransactions}
              className="bg-red-500 text-white rounded-xl h-10 px-6"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-20 space-y-2">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-zinc-700" size={30} />
            </div>
            <p className="text-zinc-400 font-bold">No Transactions Found</p>
            <p className="text-zinc-600 text-xs">
              Your purchase history will appear here.
            </p>
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-1 mt-4">
          {!loading &&
            transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-900/50 transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.type?.toLowerCase().includes("deposit") ||
                      tx.type?.toLowerCase().includes("credit")
                        ? "bg-[#d4f01e]/20 text-[#d4f01e]"
                        : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {tx.type?.toLowerCase().includes("data") ||
                    tx.type?.toLowerCase().includes("exam") ? (
                      <Wifi size={20} />
                    ) : (
                      <ArrowDownLeft size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-[14px] font-bold text-zinc-100">
                      {tx.type}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {tx.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-black">
                    ₦
                    {parseFloat(tx.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-tighter ${
                        tx.status === "0" || tx.status === "Success"
                          ? "text-zinc-500"
                          : "text-red-500"
                      }`}
                    >
                      {tx.status === "0" || tx.status === "Success"
                        ? "Success"
                        : "Failed"}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        tx.status === "0" || tx.status === "Success"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md my-auto animate-in slide-in-from-bottom duration-300">
            {/* Header Actions */}
            <div className="flex justify-between mb-4 px-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="bg-zinc-900 p-3 rounded-full text-white"
              >
                <X size={20} />
              </button>
              <button
                onClick={downloadReceipt}
                className="flex items-center gap-2 bg-zinc-900 px-5 py-3 rounded-full text-sm font-bold text-white active:scale-95"
              >
                Download <Download size={18} />
              </button>
            </div>

            {/* Receipt Card */}
            <div
              ref={receiptRef}
              className="bg-[#14101a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800/50"
            >
              <div className="p-8 flex flex-col items-center">
                <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-4">
                  {selectedTx.type?.toLowerCase().includes("data") ? (
                    <Wifi size={28} />
                  ) : (
                    <ArrowDownLeft size={28} />
                  )}
                </div>
                <h2 className="text-3xl font-black mb-1">
                  ₦
                  {parseFloat(selectedTx.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </h2>
                <p className="text-zinc-500 font-bold text-sm mb-4">
                  {selectedTx.type}
                </p>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    selectedTx.status === "0" || selectedTx.status === "Success"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedTx.status === "0" ||
                      selectedTx.status === "Success"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />
                  {selectedTx.status === "0" || selectedTx.status === "Success"
                    ? "Successful"
                    : "Failed"}
                </div>
              </div>

              {/* Dynamic Banner: Only shows for MTN Data */}
              {(selectedTx.provider === "MTN" ||
                selectedTx.type?.includes("MTN")) && (
                <div className="mx-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-between mb-6">
                  <div className="space-y-1 text-white">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-tight">
                      To Check Your Data Balance Dial
                    </p>
                    <p className="text-sm font-black italic">
                      *323*4#{" "}
                      <span className="text-[10px] font-normal not-italic opacity-60">
                        OR
                      </span>{" "}
                      *460*260#
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-xl">
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-white rounded-full opacity-60"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="px-8 pb-10 space-y-5">
                <DetailRow
                  label="Provider"
                  value={selectedTx.provider || "Wallet"}
                />
                <DetailRow
                  label="Phone Number"
                  value={selectedTx.phone || "---"}
                />
                <DetailRow
                  label="Ref ID"
                  value={selectedTx.ref || selectedTx.id || "N/A"}
                />
                <DetailRow
                  label="Service"
                  value={selectedTx.plan || selectedTx.type}
                />
                <DetailRow
                  label="Type"
                  value={selectedTx.category || "Standard"}
                />
                <DetailRow label="Transaction Time" value={selectedTx.date} />

                <div className="pt-2 border-t border-zinc-800/50 space-y-4">
                  <DetailRow
                    label="Status Message"
                    value={selectedTx.status_msg || "Transaction processed"}
                    gray
                  />
                  <DetailRow
                    label="Wallet Balance"
                    value={`₦${selectedTx.balance_after || "---"}`}
                    gray
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  gray = false,
}: {
  label: string;
  value: string;
  gray?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm gap-4">
      <span className="text-zinc-500 font-medium whitespace-nowrap">
        {label}
      </span>
      <span
        className={`font-bold text-right break-all ${
          gray ? "text-zinc-500" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
