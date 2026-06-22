import { ExpenseForm } from "@/components/ExpenseForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewExpense() {
  return (
    <div className="space-y-4 pb-8">
      <header className="pt-2 flex items-center gap-3 mb-6">
        <Link href="/expenses" className="p-2 -ml-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
      </header>

      <ExpenseForm />
    </div>
  );
}