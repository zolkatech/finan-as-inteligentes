export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  daysLeft: number;
  icon: string;
}

export const categories = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed', color: 'hsl(11, 70%, 62%)' },
  { id: 'transporte', name: 'Transporte', icon: 'Car', color: 'hsl(199, 89%, 48%)' },
  { id: 'lazer', name: 'Lazer', icon: 'Gamepad2', color: 'hsl(262, 83%, 58%)' },
  { id: 'saude', name: 'Saúde', icon: 'Heart', color: 'hsl(340, 82%, 52%)' },
  { id: 'educacao', name: 'Educação', icon: 'GraduationCap', color: 'hsl(47, 96%, 53%)' },
  { id: 'moradia', name: 'Moradia', icon: 'Home', color: 'hsl(142, 76%, 36%)' },
  { id: 'compras', name: 'Compras', icon: 'ShoppingBag', color: 'hsl(280, 87%, 65%)' },
  { id: 'salario', name: 'Salário', icon: 'Wallet', color: 'hsl(142, 76%, 36%)' },
];

export const transactions: Transaction[] = [
  { id: '1', description: 'Supermercado Extra', amount: 342.50, type: 'expense', category: 'alimentacao', date: '2024-01-28', icon: 'UtensilsCrossed' },
  { id: '2', description: 'Salário Janeiro', amount: 8500.00, type: 'income', category: 'salario', date: '2024-01-25', icon: 'Wallet' },
  { id: '3', description: 'Uber', amount: 45.90, type: 'expense', category: 'transporte', date: '2024-01-27', icon: 'Car' },
  { id: '4', description: 'Netflix', amount: 55.90, type: 'expense', category: 'lazer', date: '2024-01-20', icon: 'Gamepad2' },
  { id: '5', description: 'Farmácia', amount: 89.00, type: 'expense', category: 'saude', date: '2024-01-22', icon: 'Heart' },
  { id: '6', description: 'Curso Udemy', amount: 27.90, type: 'expense', category: 'educacao', date: '2024-01-18', icon: 'GraduationCap' },
  { id: '7', description: 'Aluguel', amount: 1800.00, type: 'expense', category: 'moradia', date: '2024-01-10', icon: 'Home' },
  { id: '8', description: 'Freelance Design', amount: 1200.00, type: 'income', category: 'salario', date: '2024-01-15', icon: 'Wallet' },
  { id: '9', description: 'Zara', amount: 299.90, type: 'expense', category: 'compras', date: '2024-01-24', icon: 'ShoppingBag' },
  { id: '10', description: 'iFood', amount: 68.50, type: 'expense', category: 'alimentacao', date: '2024-01-26', icon: 'UtensilsCrossed' },
];

export const categoryExpenses: CategoryData[] = [
  { name: 'Alimentação', value: 1250, color: 'hsl(11, 70%, 62%)', icon: 'UtensilsCrossed' },
  { name: 'Transporte', value: 580, color: 'hsl(199, 89%, 48%)', icon: 'Car' },
  { name: 'Lazer', value: 420, color: 'hsl(262, 83%, 58%)', icon: 'Gamepad2' },
  { name: 'Moradia', value: 1800, color: 'hsl(142, 76%, 36%)', icon: 'Home' },
  { name: 'Saúde', value: 320, color: 'hsl(340, 82%, 52%)', icon: 'Heart' },
  { name: 'Compras', value: 650, color: 'hsl(280, 87%, 65%)', icon: 'ShoppingBag' },
];

export const monthlyData: MonthlyData[] = [
  { month: 'Ago', income: 8200, expenses: 5800, balance: 2400 },
  { month: 'Set', income: 8500, expenses: 6200, balance: 2300 },
  { month: 'Out', income: 9100, expenses: 5900, balance: 3200 },
  { month: 'Nov', income: 8800, expenses: 6500, balance: 2300 },
  { month: 'Dez', income: 10200, expenses: 7800, balance: 2400 },
  { month: 'Jan', income: 9700, expenses: 5020, balance: 4680 },
];

export const goals: Goal[] = [
  { id: '1', name: 'Fundo de Emergência', target: 15000, current: 8500, daysLeft: 45, icon: 'Shield' },
  { id: '2', name: 'Viagem Europa', target: 12000, current: 4200, daysLeft: 120, icon: 'Plane' },
  { id: '3', name: 'Novo Notebook', target: 5000, current: 3800, daysLeft: 15, icon: 'Laptop' },
];

export const summaryData = {
  totalIncome: 9700,
  totalExpenses: 5020,
  balance: 4680,
  incomeChange: 12.5,
  expenseChange: -8.3,
  balanceChange: 35.2,
  lastMonthBalance: 2300,
};
