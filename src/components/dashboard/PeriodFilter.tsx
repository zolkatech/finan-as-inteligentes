import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockFinancialData";

interface PeriodFilterProps {
  period: string;
  onPeriodChange: (period: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

const PeriodFilter = ({ period, onPeriodChange, category, onCategoryChange }: PeriodFilterProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card rounded-xl shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Período:</span>
        <div className="flex bg-secondary rounded-lg p-1">
          {['Semanal', 'Mensal', 'Anual'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange(p)}
              className={period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Categoria:</span>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-44 bg-secondary border-0">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PeriodFilter;
