import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projetosAPI } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, RotateCcw, Star } from 'lucide-react';

const PROJETOS_FALLBACK = [
  'Projeto Afeto',
  'Afeto Empreendedorismo',
  'Alimentando Vidas',
  'Brincadeira é Coisa Séria',
  'Brinquedoteca Itinerante',
  'Despertar Empreendedor',
  'Liderança Jovem',
  'Natal de Todo Mundo',
  'Programa Educação e Trabalho (PET)',
  'Protagonizar en Cena',
  'Sorridente',
  'Ver é Bom Demais',
  'Outro'
];

export default function FornecedorFilters({ 
  search, 
  onSearchChange, 
  projeto, 
  onProjetoChange,
  apenasFavoritos,
  onApenasFavoritosChange
}) {
  const { data: projetosData = [] } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetosAPI.list(),
  });

  const listaProjetos = projetosData.length > 0
    ? projetosData.map((p) => p.nome)
    : PROJETOS_FALLBACK;

  const hasActiveFilters = search.trim() !== '' || (projeto && projeto !== 'all') || apenasFavoritos;

  const handleClearFilters = () => {
    onSearchChange('');
    onProjetoChange('all');
    if (onApenasFavoritosChange) onApenasFavoritosChange(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Campo de Busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, empresa, CNPJ, telefone ou palavra-chave..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-9 h-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            title="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtro de Projeto */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={projeto || 'all'} onValueChange={onProjetoChange}>
          <SelectTrigger className="w-full sm:w-56 h-10">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {listaProjetos.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão Filtro Apenas Favoritos */}
      {onApenasFavoritosChange && (
        <Button
          type="button"
          variant={apenasFavoritos ? "default" : "outline"}
          size="sm"
          onClick={() => onApenasFavoritosChange(!apenasFavoritos)}
          className={`h-10 text-xs gap-1.5 shrink-0 transition-all cursor-pointer ${
            apenasFavoritos
              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
              : "text-muted-foreground hover:text-amber-500 hover:border-amber-300"
          }`}
          title={apenasFavoritos ? "Mostrando apenas favoritos" : "Filtrar apenas favoritos"}
        >
          <Star className={`h-3.5 w-3.5 ${apenasFavoritos ? "fill-white text-white" : "text-amber-400"}`} />
          <span>Favoritos</span>
        </Button>
      )}

      {/* Botão Limpar Filtros */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="h-10 text-xs gap-1.5 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Restaurar todos os filtros"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
