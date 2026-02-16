import { useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import PeriodFilter from "@/components/dashboard/PeriodFilter";
import { categories } from "@/data/mockFinancialData";
import ExpensesPieChart from "@/components/dashboard/ExpensesPieChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TodayEventsWidget from "@/components/dashboard/TodayEventsWidget";

import { useFinancials } from "@/hooks/useFinancials";
import { useEvents } from "@/hooks/useEvents";
import { isSameDay, isSameMonth, isSameWeek, isSameYear } from "date-fns";
import { Loader2 } from "lucide-react";


const Index = () => {
  const [period, setPeriod] = useState("Mensal");
  const [category, setCategory] = useState("all");

  const { transactions, loading: financialsLoading } = useFinancials();
  const { events, loading: eventsLoading } = useEvents();

  const loading = financialsLoading || eventsLoading;

  // Filter today's events for the widget
  const todayEvents = useMemo(() => {
    const today = new Date();
    return events.filter(e => isSameDay(e.start, today)).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  // Calculate Summary based on CURRENT MONTH only (ignoring filters)
  const summary = useMemo(() => {
    const now = new Date();
    const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.date), now));

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expenses;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      incomeChange: 0,
      expenseChange: 0,
      lastMonthBalance: 0,
    };
  }, [transactions]);

  // Filter transactions for List and Charts
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      let matchesPeriod = true;
      let matchesCategory = true;

      // Period Filter
      if (period === "Semanal") matchesPeriod = isSameWeek(tDate, now);
      if (period === "Mensal") matchesPeriod = isSameMonth(tDate, now);
      if (period === "Anual") matchesPeriod = isSameYear(tDate, now);

      // Category Filter (Standardized to use Name)
      if (category !== "all") {
        matchesCategory = t.category === category;
      }

      return matchesPeriod && matchesCategory;
    });
  }, [transactions, period, category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

        <SummaryCards summary={summary} eventsCount={todayEvents.length} />

        <PeriodFilter
          period={period}
          onPeriodChange={setPeriod}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ExpensesPieChart transactions={filteredTransactions} />
          <div className="lg:col-span-2">
            <IncomeExpenseChart transactions={filteredTransactions} />
          </div>
        </div>

        {/* Transactions and Events Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={filteredTransactions} />
          </div>
          <div>
            <TodayEventsWidget events={todayEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
