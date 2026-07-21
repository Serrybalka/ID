import type { DocumentStatus, ExecutiveDocument } from '../../types/document';

export type StatusTab = 'Все' | DocumentStatus | 'Есть постановления СПИ';

const tabs: StatusTab[] = ['Все', 'Создан', 'Подписан', 'Отправлен', 'Доставлен', 'Ошибка отправки', 'Есть постановления СПИ', 'Закрыт'];

export function StatusTabs({ documents, active, onChange }: { documents: ExecutiveDocument[]; active: StatusTab; onChange: (tab: StatusTab) => void }) {
  const count = (tab: StatusTab) => {
    if (tab === 'Все') return documents.length;
    if (tab === 'Есть постановления СПИ') return documents.filter((doc) => doc.hasBailiffOrders).length;
    return documents.filter((doc) => doc.status === tab).length;
  };
  return (
    <div className="status-tabs" role="tablist" aria-label="Фильтр по статусам">
      {tabs.map((tab) => (
        <button className={`status-tab ${active === tab ? 'active' : ''}`} role="tab" aria-selected={active === tab} type="button" key={tab} onClick={() => onChange(tab)}>
          {tab} <strong>{count(tab)}</strong>
        </button>
      ))}
    </div>
  );
}
