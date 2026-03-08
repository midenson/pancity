import BuyAirtimePage from "@/components/Airtime";
import BuyCablePage from "@/components/BuyCable";
import BuyDataPage from "@/components/BuyData";
import BuyElectricityPage from "@/components/BuyElectricity";
import ExamPinsPage from "@/components/Exam";
import FintechDashboard from "@/components/Homepage";
import Login from "@/components/Login";
import PricingsPage from "@/components/Pricing";
import ProfilePage from "@/components/Profile";
import PersonalDetailsScreen from "@/components/Signup";
import FundAccountPage from "@/components/Topup";
import TransactionList from "@/components/TransactionsList";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* <FintechDashboard /> */}
      {/* <BuyAirtimePage /> */}
      {/* <BuyDataPage /> */}
      {/* <ExamPinsPage /> */}
      {/* <FundAccountPage /> */}
      {/* <PersonalDetailsScreen /> */}
      <PricingsPage />
      {/* <FundAccountPage /> */}
      {/* <TransactionList /> */}
      {/* <BuyElectricityPage /> */}
      {/* <BuyCablePage /> */}
      {/* <ProfilePage /> */}
      {/* <Login /> */}
    </div>
  );
}
