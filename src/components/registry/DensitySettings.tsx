import type { Density } from '../../types/document';

export function DensitySettings({ density, onChange }: { density: Density; onChange: (density: Density) => void }) {
  const items: { label: string; value: Density }[] = [
    { label: 'Компактная', value: 'compact' },
    { label: 'Стандартная', value: 'standard' },
    { label: 'Просторная', value: 'comfortable' },
  ];
  return (
    <div className="popover">
      <strong>Плотность таблицы</strong>
      {items.map((item) => (
        <label className="field" key={item.value}>
          <span>
            <input type="radio" name="density" checked={density === item.value} onChange={() => onChange(item.value)} /> {item.label}
          </span>
        </label>
      ))}
    </div>
  );
}
