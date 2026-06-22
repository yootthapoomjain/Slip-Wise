import { ExpenseForm } from "@/components/ExpenseForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useGetExpense, getGetExpenseQueryKey } from "@workspace/api-client-react";

export default function EditExpense() {
  const [, params] = useRoute("/expenses/:id/edit");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: expense, isLoading } = useGetExpense(id, {
    query: {
      enabled: !!id,
      queryKey: getGetExpenseQueryKey(id)
    }
  });

  return (
    <div className="space-y-4 pb-8">
      <header className="pt-2 flex items-center gap-3 mb-6">
        <Link href="/expenses" className="p-2 -ml-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Expense</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : expense ? (
        <ExpenseForm initialData={expense} isEdit />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Expense not found.
        </div>
      )}
    </div>
  );
}