import { BriefcaseBusiness, CreditCard, FileCheck2, Home, PanelLeftClose, PanelLeftOpen, ScrollText, Settings, ShieldCheck } from 'lucide-react';

const items = [
  { label: 'Главная', icon: Home },
  { label: 'Судебные дела', icon: BriefcaseBusiness },
  { label: 'Исполнительные документы', icon: FileCheck2 },
  { label: 'Аудит', icon: ShieldCheck },
  { label: 'Платежи', icon: CreditCard },
  { label: 'Отчеты', icon: ScrollText },
  { label: 'Настройки', icon: Settings },
];

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Основная навигация">
      <button className="nav-item" type="button" onClick={onToggle} title={open ? 'Свернуть меню' : 'Развернуть меню'}>
        {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        {open && <span>{open ? 'Свернуть' : 'Развернуть'}</span>}
      </button>
      <nav className="nav-list">
        {items.map(({ label, icon: Icon }) => (
          <button className={`nav-item ${label === 'Исполнительные документы' ? 'active' : ''}`} key={label} type="button" title={label} aria-current={label === 'Исполнительные документы' ? 'page' : undefined}>
            <Icon size={20} />
            {open && <span>{label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
