import { Bell, CircleHelp, Landmark, UserRound } from 'lucide-react';
import { useState } from 'react';

export function AppHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="app-header">
      <div className="brand">
        <span className="emblem" aria-hidden="true">
          <Landmark size={20} />
        </span>
        <span>Единая платформа „Цифровое правосудие“</span>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Уведомления">
          <Bell size={18} />
          <span className="counter">7</span>
        </button>
        <button className="icon-button" type="button" aria-label="Справка">
          <CircleHelp size={18} />
        </button>
        <div className="user-menu">
          <button className="button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <UserRound size={18} />
            Егорова О. Н.
          </button>
          {open && (
            <div className="user-popover">
              <strong>Егорова Ольга Николаевна</strong>
              <p>Секретарь судебного участка</p>
              <button className="button tertiary" type="button">
                Настройки профиля
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
