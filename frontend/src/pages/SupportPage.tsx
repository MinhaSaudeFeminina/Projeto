import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit, ExternalLink, Loader2, Phone, Plus, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createSupportContact,
  deleteSupportContact,
  listSupportContacts,
  type SupportContact,
  type SupportContactPayload,
  updateSupportContact,
} from "@/services/api/supportContactApi";

type SupportContactFormState = {
  name: string;
  description: string;
  type: string;
  phone: string;
  link: string;
  cta_label: string;
  sort_order: string;
  is_highlighted: boolean;
  is_active: boolean;
};

const emptyForm: SupportContactFormState = {
  name: "",
  description: "",
  type: "",
  phone: "",
  link: "",
  cta_label: "",
  sort_order: "0",
  is_highlighted: false,
  is_active: true,
};

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [form, setForm] = useState<SupportContactFormState>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["support-contacts"],
    queryFn: listSupportContacts,
  });

  const contacts = useMemo(
    () => [...(contactsQuery.data ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [contactsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: SupportContactPayload) => editingContact
      ? updateSupportContact(editingContact.id, payload)
      : createSupportContact(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support-contacts"] });
      setShowForm(false);
      setEditingContact(null);
      setForm(emptyForm);
      toast({ title: editingContact ? "Contato atualizado!" : "Contato criado!" });
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
    mutationFn: deleteSupportContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support-contacts"] });
      toast({ title: "Contato excluído!" });
    },
    onError: (error) => {
      toast({
        title: "Não foi possível excluir",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  function openNewForm() {
    setEditingContact(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(contact: SupportContact) {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      description: contact.description,
      type: contact.type,
      phone: contact.phone ?? "",
      link: contact.link ?? "",
      cta_label: contact.cta_label,
      sort_order: String(contact.sort_order),
      is_highlighted: contact.is_highlighted,
      is_active: contact.is_active,
    });
    setShowForm(true);
  }

  function toPayload(): SupportContactPayload {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      phone: form.phone.trim() || null,
      link: form.link.trim() || null,
      cta_label: form.cta_label.trim(),
      sort_order: Number(form.sort_order || 0),
      is_highlighted: form.is_highlighted,
      is_active: form.is_active,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(toPayload());
  }

  function handleDelete(contact: SupportContact) {
    if (window.confirm(`Excluir o contato "${contact.name}"?`)) {
      deleteMutation.mutate(contact.id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Apoio e Contatos Úteis</h1>
          <p className="text-muted-foreground">Gerencie informações de apoio exibidas no app</p>
        </div>
        <Button onClick={openNewForm} className="gap-2"><Plus className="h-4 w-4" /> Novo contato</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {contactsQuery.isLoading && (
          <div className="col-span-full rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando contatos de apoio
            </span>
          </div>
        )}
        {contactsQuery.isError && (
          <div className="col-span-full rounded-xl border bg-card p-8 text-center text-destructive">
            Não foi possível carregar os contatos de apoio.
          </div>
        )}
        {!contactsQuery.isLoading && !contactsQuery.isError && contacts.map(c => (
          <Card key={c.id} className={`shadow-sm hover:shadow-md transition-shadow ${c.is_highlighted ? "border-primary/50 bg-primary/5" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {c.is_highlighted && <Star className="h-4 w-4 text-primary fill-primary" />}
                  {c.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(c)} aria-label={`Editar ${c.name}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} aria-label={`Excluir ${c.name}`} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{c.description}</p>
              {c.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">{c.phone}</span>
                </div>
              )}
              {c.link && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-info" />
                  <a href={c.link} className="text-info hover:underline truncate" target="_blank" rel="noreferrer">{c.link}</a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Button size="sm" variant={c.is_highlighted ? "default" : "outline"}>
                  {c.cta_label}
                </Button>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {c.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!contactsQuery.isLoading && !contactsQuery.isError && contacts.length === 0 && (
          <div className="col-span-full rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Nenhum contato de apoio cadastrado.
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Editar Contato" : "Novo Contato"}</DialogTitle>
            <DialogDescription className="sr-only">
              Formulário de cadastro e edição de contato de apoio.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="support-name">Nome do serviço</Label>
              <Input id="support-name" placeholder="Ex: Central 180" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support-description">Descrição</Label>
              <Textarea id="support-description" placeholder="Descrição do serviço" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="support-phone">Telefone</Label>
                <Input id="support-phone" placeholder="Ex: 180" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-link">Link</Label>
                <Input id="support-link" type="url" placeholder="https://..." value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="support-type">Tipo</Label>
                <Input id="support-type" placeholder="Ex: emergência, apoio" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-order">Ordem</Label>
                <Input id="support-order" type="number" min={0} max={9999} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support-cta">Botão de ação</Label>
              <Input id="support-cta" placeholder="Ex: Ligar agora" value={form.cta_label} onChange={(event) => setForm({ ...form, cta_label: event.target.value })} required />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch id="support-highlighted" checked={form.is_highlighted} onCheckedChange={(checked) => setForm({ ...form, is_highlighted: checked })} />
                <Label htmlFor="support-highlighted">Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="support-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <Label htmlFor="support-active">Ativo</Label>
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
