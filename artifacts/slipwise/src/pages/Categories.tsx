import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Lock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import type { Category } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EMOJI_OPTIONS = [
  "🍜","☕","🍕","🍣","🍺","🥗","🍰","🥤","🧋","🍱",
  "🛒","👗","💄","👟","🛍️","📱","💻","⌚","📷","🎒",
  "🚗","🚌","✈️","🚂","🛵","🚕","🚲","⛽","🛺","🚁",
  "🏠","🔧","🏡","🛋️","🧹","🪴","🛁","🪟","🔑","🧺",
  "💡","💧","⚡","📡","🌡️","🔌","📶","🏗️","🌊","🔥",
  "🎮","🎬","🎵","📚","🎨","🎭","🎪","🎯","🎲","🧩",
  "🏥","💊","🏃","🧘","🦷","🩺","💉","🏋️","🧬","❤️‍🩹",
  "💼","📊","📝","💰","📈","🏦","🤝","📋","🖨️","🗂️",
  "🎓","📖","✏️","🖊️","📐","🔬","🧪","🏫","📜","🎒",
  "🎁","🌍","💎","🎀","🪅","🌺","🌙","⭐","🔮","🎠",
  "🐶","🐱","🐠","🐇","🦜","🌱","🌿","🍀","🌸","🦋",
  "👶","👨‍👩‍👧","🏖️","⛺","🎿","🏊","🚴","🧗","🏌️","🤸",
];

const COLOR_OPTIONS = [
  "#f97316","#ef4444","#ec4899","#e879f9","#8b5cf6",
  "#6366f1","#3b82f6","#06b6d4","#10b981","#22c55e",
  "#84cc16","#eab308","#f59e0b","#a16207","#64748b",
  "#94a3b8","#6b7280","#374151","#1e293b","#0f172a",
];

interface CategoryFormState {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
}

const DEFAULT_FORM: CategoryFormState = { name: "", nameEn: "", icon: "", color: "#6366f1" };

function getDisplayIcon(cat: Category): string {
  if (cat.icon && cat.icon.length <= 4 && /\p{Emoji}/u.test(cat.icon)) return cat.icon;
  const match = cat.name.match(/^\p{Emoji}/u);
  if (match) return match[0];
  return "📦";
}

function getDisplayName(cat: Category, language: string): string {
  if (language === "en" && cat.nameEn) return cat.nameEn;
  return cat.name;
}

export default function Categories() {
  const { t, language } = usePreferences();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState<Partial<CategoryFormState>>({});

  const { data: categories, isLoading } = useListCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const defaults = categories?.filter(c => c.isDefault) ?? [];
  const custom = categories?.filter(c => !c.isDefault) ?? [];

  const QUERY_KEY = getListCategoriesQueryKey();

  function openAdd() {
    setEditingCategory(null);
    setForm(DEFAULT_FORM);
    setErrors({});
    setShowIconPicker(false);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      nameEn: cat.nameEn ?? "",
      icon: getDisplayIcon(cat),
      color: cat.color ?? "#6366f1",
    });
    setErrors({});
    setShowIconPicker(false);
    setDialogOpen(true);
  }

  function validate(): boolean {
    const e: Partial<CategoryFormState> = {};
    if (!form.name.trim()) e.name = t.categoryManagement.thaiNameRequired;
    if (!form.icon) e.icon = t.categoryManagement.iconRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      icon: form.icon,
      color: form.color,
    };

    try {
      if (editingCategory) {
        await updateMut.mutateAsync({ id: editingCategory.id, data: payload });
      } else {
        await createMut.mutateAsync({ data: payload });
      }
      await qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: t.categoryManagement.saved });
      setDialogOpen(false);
    } catch {
      toast({ title: t.categoryManagement.saveFailed, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync({ id: deleteTarget.id });
      await qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: t.categoryManagement.deleted });
    } catch {
      toast({ title: t.categoryManagement.deleteFailed, variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t.categoryManagement.title}</h1>
        <Button
          size="sm"
          className="rounded-2xl h-9 px-4 gap-1.5"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4" />
          {t.common.add}
        </Button>
      </header>

      {/* Default categories */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
          {t.categoryManagement.defaults}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {defaults.map(cat => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 relative min-h-[72px]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: (cat.color ?? "#6366f1") + "22" }}
                >
                  {getDisplayIcon(cat)}
                </div>
                <span className="text-[10px] text-center text-muted-foreground leading-tight line-clamp-2">
                  {getDisplayName(cat, language)}
                </span>
                <Lock className="absolute top-1.5 right-1.5 w-2.5 h-2.5 text-muted-foreground/40" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Custom categories */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
          {t.categoryManagement.custom}
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : custom.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-2xl">
              🏷️
            </div>
            <div>
              <p className="font-semibold">{t.categoryManagement.noCustom}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.categoryManagement.noCustomDesc}</p>
            </div>
            <Button variant="outline" className="rounded-2xl mt-1 gap-2" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              {t.categoryManagement.addFirst}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {custom.map(cat => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: (cat.color ?? "#6366f1") + "22" }}
                  >
                    {getDisplayIcon(cat)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{cat.name}</p>
                    {cat.nameEn && (
                      <p className="text-xs text-muted-foreground truncate">{cat.nameEn}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-xl"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(cat)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t.categoryManagement.editCategory : t.categoryManagement.addCategory}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Icon + Color row */}
            <div className="flex gap-4 items-start">
              {/* Icon picker trigger */}
              <div className="flex flex-col items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">{t.categoryManagement.icon}</Label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(p => !p)}
                  className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl transition-colors"
                  style={{
                    backgroundColor: form.color + "22",
                    borderColor: showIconPicker ? form.color : "transparent",
                  }}
                >
                  {form.icon || "＋"}
                </button>
                {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
              </div>

              {/* Color swatches */}
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{t.categoryManagement.color}</Label>
                <div className="grid grid-cols-10 gap-1 mt-1.5">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-6 h-6 rounded-lg transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: form.color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Emoji grid */}
            <AnimatePresence>
              {showIconPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-secondary rounded-2xl p-3 grid grid-cols-10 gap-1 max-h-40 overflow-y-auto">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, icon: emoji }));
                          setErrors(e => ({ ...e, icon: undefined }));
                          setShowIconPicker(false);
                        }}
                        className={`w-7 h-7 rounded-lg text-base flex items-center justify-center hover:bg-background transition-colors ${
                          form.icon === emoji ? "bg-background ring-2 ring-primary" : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thai name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">{t.categoryManagement.thaiName} *</Label>
              <Input
                id="cat-name"
                placeholder="เช่น ดนตรี"
                value={form.name}
                onChange={e => {
                  setForm(f => ({ ...f, name: e.target.value }));
                  if (errors.name) setErrors(er => ({ ...er, name: undefined }));
                }}
                className="rounded-xl"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* English name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name-en">
                {t.categoryManagement.englishName}{" "}
                <span className="text-muted-foreground text-xs">{t.common.optional}</span>
              </Label>
              <Input
                id="cat-name-en"
                placeholder="e.g. Music"
                value={form.nameEn}
                onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t.common.loading}
                </span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  {t.common.save}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.categoryManagement.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <span className="flex items-center gap-2 mt-1">
                  <span>{getDisplayIcon(deleteTarget)}</span>
                  <span className="font-semibold text-foreground">{deleteTarget.name}</span>
                  <span className="text-muted-foreground">— {t.categoryManagement.confirmDeleteDesc}</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-row">
            <AlertDialogCancel className="flex-1 rounded-xl">
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
