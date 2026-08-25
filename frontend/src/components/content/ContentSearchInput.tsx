import { Input } from "@/components/ui/input";

type ContentSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ContentSearchInput({ value, onChange }: ContentSearchInputProps) {
  return (
    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
      <label className="text-sm font-medium" htmlFor="content-search">Buscar conteúdos</label>
      <Input
        id="content-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Título, texto, categoria ou metadados"
      />
      <p className="text-xs text-muted-foreground">A busca encontra palavras com ou sem acentos.</p>
    </div>
  );
}

