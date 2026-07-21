import { Download, Filter, RefreshCw, Search, Settings2, SlidersHorizontal } from 'lucide-react';

interface RegistryToolbarProps {
  selectedCount: number;
  signableSelectedCount: number;
  quickQuery: string;
  activeFilterCount: number;
  onQuickQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onOpenFilters: () => void;
  onOpenColumns: () => void;
  onOpenDensity: () => void;
  onSign: () => void;
  onRefresh: () => void;
}

export function RegistryToolbar(props: RegistryToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="button primary" type="button" disabled={props.signableSelectedCount === 0} onClick={props.onSign}>
          Подписать{props.signableSelectedCount > 0 ? ` (${props.signableSelectedCount})` : ''}
        </button>
        <span>Выбрано документов: {props.selectedCount}</span>
        <button className="button" type="button">
          <Download size={16} /> Экспорт
        </button>
        <button className="button" type="button" onClick={props.onRefresh}>
          <RefreshCw size={16} /> Обновить
        </button>
      </div>
      <div className="toolbar-group">
        <input
          className="search"
          aria-label="Быстрый поиск"
          placeholder="Номер дела, номер ИД или должник"
          value={props.quickQuery}
          onChange={(event) => props.onQuickQueryChange(event.target.value)}
        />
        <button className="button" type="button" onClick={props.onSearch}>
          <Search size={16} /> Найти
        </button>
        <button className="button" type="button" onClick={props.onReset}>
          Сбросить
        </button>
        <button className="button" type="button" onClick={props.onOpenFilters}>
          <Filter size={16} /> Фильтры{props.activeFilterCount > 0 ? ` · ${props.activeFilterCount}` : ''}
        </button>
        <button className="icon-button" type="button" aria-label="Настройка колонок" onClick={props.onOpenColumns}>
          <Settings2 size={18} />
        </button>
        <button className="icon-button" type="button" aria-label="Настройка плотности таблицы" onClick={props.onOpenDensity}>
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
