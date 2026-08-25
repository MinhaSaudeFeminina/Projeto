import { Input } from "@/components/ui/input";
import type { ContentTaxonomies } from "@/services/api/taxonomyApi";

export type ContentFilterValues = {
  status: string;
  categoryId: string;
  lifeStageId: string;
  ageRangeId: string;
  authorId: string;
};

type ContentFiltersProps = {
  values: ContentFilterValues;
  taxonomies: ContentTaxonomies;
  onChange: (values: ContentFilterValues) => void;
};

const selectClassName = "h-10 w-full rounded-md border bg-background px-3 text-sm";

export function ContentFilters({ values, taxonomies, onChange }: ContentFiltersProps) {
  function setValue(field: keyof ContentFilterValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="content-status">Estado editorial</label>
        <select id="content-status" className={selectClassName} value={values.status} onChange={(event) => setValue("status", event.target.value)}>
          <option value="">Todos os estados</option>
          <option value="draft">Rascunho</option>
          <option value="in_review">Em revisão</option>
          <option value="approved">Aprovado</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="content-category">Categoria</label>
        <select id="content-category" className={selectClassName} value={values.categoryId} onChange={(event) => setValue("categoryId", event.target.value)}>
          <option value="">Todas as categorias</option>
          {taxonomies.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="content-life-stage">Fase da vida</label>
        <select id="content-life-stage" className={selectClassName} value={values.lifeStageId} onChange={(event) => setValue("lifeStageId", event.target.value)}>
          <option value="">Todas as fases</option>
          {taxonomies.life_stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="content-age-range">Faixa etária</label>
        <select id="content-age-range" className={selectClassName} value={values.ageRangeId} onChange={(event) => setValue("ageRangeId", event.target.value)}>
          <option value="">Todas as faixas</option>
          {taxonomies.age_ranges.map((range) => <option key={range.id} value={range.id}>{range.label}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="content-author">ID da autoria</label>
        <Input
          id="content-author"
          type="number"
          min="1"
          value={values.authorId}
          onChange={(event) => setValue("authorId", event.target.value)}
          placeholder="Todas"
        />
      </div>
    </>
  );
}

