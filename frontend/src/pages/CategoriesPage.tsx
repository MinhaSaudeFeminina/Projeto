import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createContentCategory,
  deleteContentCategory,
  listContentCategories,
  type ContentCategoryPayload,
  type ManagedContentCategory,
  updateContentCategory,
} from "@/services/api/adminCategoryApi";

type CategoryFormState = {
  name: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
  sort_order: "0",
  is_active: true,
};

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ManagedContentCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listContentCategories,
  });

  const sortedCategories = useMemo(
    () => [...(categoriesQuery.data ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [categoriesQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: ContentCategoryPayload) => editingCategory
      ? updateContentCategory(editingCategory.id, payload)
      : createContentCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["content-taxonomies"] });
      setShowForm(false);
      setEditingCategory(null);
      setForm(emptyForm);
      toast({ title: editingCategory ? "Categoria atualizada!" : "Categoria criada!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Confira os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["content-taxonomies"] });
      toast({ title: "Categoria excluída!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível excluir",
        description: error instanceof Error ? error.message : "Desative a categoria se ela já estiver em uso.",
        variant: "destructive",
      });
    },
  });

  function openNewForm() {
    setEditingCategory(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(category: ManagedContentCategory) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
    setShowForm(true);
  }

  function toPayload(): ContentCategoryPayload {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(toPayload());
  }

  function handleDelete(category: ManagedContentCategory) {
    if (window.confirm(`Excluir a categoria "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de conteúdo</p>
        </div>
        <Button onClick={openNewForm} className="gap-2"><Plus className="h-4 w-4" /> Nova categoria</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden lg:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando categorias</span>
                </TableCell>
              </TableRow>
            )}
            {categoriesQuery.isError && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                  Não foi possível carregar as categorias.
                </TableCell>
              </TableRow>
            )}
            {!categoriesQuery.isLoading && !categoriesQuery.isError && sortedCategories.map(c => (
              <TableRow key={c.id}>
                <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.description}</TableCell>
                <TableCell>{c.sort_order}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {c.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(c)} aria-label={`Editar ${c.name}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} aria-label={`Excluir ${c.name}`} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!categoriesQuery.isLoading && !categoriesQuery.isError && sortedCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma categoria cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nome</Label>
              <Input id="category-name" placeholder="Nome da categoria" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Input id="category-description" placeholder="Descrição breve" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-order">Ordem</Label>
                <Input id="category-order" type="number" min={0} max={9999} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} required />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch id="category-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <Label htmlFor="category-active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
