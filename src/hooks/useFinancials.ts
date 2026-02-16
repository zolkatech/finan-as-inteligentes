
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Transaction, Goal } from "@/data/mockFinancialData";

export interface SummaryData {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    incomeChange: number; // Placeholder for now
    expenseChange: number; // Placeholder for now
    lastMonthBalance: number; // Placeholder for now
}

export function useFinancials() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [summary, setSummary] = useState<SummaryData>({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeChange: 0,
        expenseChange: 0,
        lastMonthBalance: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchFinancials = async () => {
        try {
            setLoading(true);

            // Fetch Transactions
            const { data: transactionsData, error: transactionsError } = await supabase
                .from("transactions")
                .select("*")
                .order('date', { ascending: false });

            if (transactionsError) throw transactionsError;

            // Fetch Goals
            const { data: goalsData, error: goalsError } = await supabase
                .from("goals")
                .select("*");

            if (goalsError) throw goalsError;

            // Process Transactions
            const formattedTransactions: Transaction[] = (transactionsData || []).map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                type: t.type,
                category: t.category,
                date: t.date, // Keep as string ISO/Date for now, or convert if needed
                icon: mapCategoryToIcon(t.category) // Helper needed
            }));

            setTransactions(formattedTransactions);

            // Calculate Summary
            const income = formattedTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const expenses = formattedTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            setSummary(prev => ({
                ...prev,
                totalIncome: income,
                totalExpenses: expenses,
                balance: income - expenses
            }));

            // Process Goals
            const formattedGoals: Goal[] = (goalsData || []).map((g: any) => {
                const deadline = new Date(g.deadline);
                const today = new Date();
                const diffTime = Math.abs(deadline.getTime() - today.getTime());
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    id: g.id,
                    name: g.title,
                    target: Number(g.target_amount),
                    current: Number(g.current_amount),
                    daysLeft: daysLeft, // Approximation
                    icon: 'Shield' // Default or map if we add icon to DB
                };
            });

            setGoals(formattedGoals);

        } catch (error) {
            console.error("Error fetching financials:", error);
            toast.error("Erro ao carregar dados financeiros.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();

        // Subscriptions could be added here
    }, []);

    // Helper to map category to icon name (could be improved)
    const mapCategoryToIcon = (category: string): string => {
        const map: { [key: string]: string } = {
            'alimentacao': 'UtensilsCrossed',
            'transporte': 'Car',
            'lazer': 'Gamepad2',
            'saude': 'Heart',
            'educacao': 'GraduationCap',
            'moradia': 'Home',
            'compras': 'ShoppingBag',
            'salario': 'Wallet'
        };
        return map[category?.toLowerCase()] || 'Wallet';
    };

    const addTransaction = async (transaction: Omit<Transaction, "id" | "icon">) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from("transactions").insert([{
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                user_id: user.id
            }]);

            if (error) throw error;
            toast.success("Transação adicionada!");
            fetchFinancials();
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast.error("Erro ao adicionar transação.");
        }
    };

    return {
        transactions,
        goals,
        summary,
        loading,
        addTransaction,
        refresh: fetchFinancials
    };
}
