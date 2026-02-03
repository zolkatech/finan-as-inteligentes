import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import PeriodFilter from "@/components/dashboard/PeriodFilter";
import ExpensesPieChart from "@/components/dashboard/ExpensesPieChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import BalanceLineChart from "@/components/dashboard/BalanceLineChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import GoalsWidget from "@/components/dashboard/GoalsWidget";

const Index = () => {
  const [period, setPeriod] = useState("Mensal");
  const [category, setCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        
        <SummaryCards />
        
        <PeriodFilter 
          period={period}
          onPeriodChange={setPeriod}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ExpensesPieChart />
          <div className="lg:col-span-2">
            <IncomeExpenseChart />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <BalanceLineChart />
          </div>
          <GoalsWidget />
        </div>

        {/* Recent Transactions - Full Width */}
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Index;
