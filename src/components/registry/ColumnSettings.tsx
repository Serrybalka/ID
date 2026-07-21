import type { ColumnDef } from './columns';

export function ColumnSettings({
  columns,
  visibleColumns,
  onChange,
  onReset,
}: {
  columns: ColumnDef[];
  visibleColumns: string[];
  onChange: (keys: string[]) => void;
  onReset: () => void;
}) {
  return (
    <div className="popover">
      <strong>Колонки таблицы</strong>
      {columns.map((column) => (
        <label className="field" key={column.key}>
          <span>
            <input
              type="checkbox"
              checked={visibleColumns.includes(column.key)}
              onChange={() => {
                const next = visibleColumns.includes(column.key) ? visibleColumns.filter((key) => key !== column.key) : [...visibleColumns, column.key];
                onChange(next);
              }}
            />{' '}
            {column.label}
          </span>
        </label>
      ))}
      <button className="button" type="button" onClick={onReset}>
        Восстановить по умолчанию
      </button>
    </div>
  );
}
