import type { DocumentFilter } from '../../types/document';

const labels: Record<keyof DocumentFilter, string> = {
  caseNumber: 'Дело',
  documentNumber: 'ИД',
  type: 'Вид',
  debtor: 'Должник',
  status: 'Статус',
  signatureFormat: 'ЭП',
  bailiffOrderStatus: 'Постановление',
  decisionFrom: 'Решение от',
  decisionTo: 'Решение до',
  createdFrom: 'Создан от',
  createdTo: 'Создан до',
  sentFrom: 'Отправка от',
  sentTo: 'Отправка до',
  enforcementNumber: 'ИП',
  hasBailiffOrders: 'Есть СПИ',
  courtDistrict: 'Участок',
  amountFrom: 'Сумма от',
  amountTo: 'Сумма до',
  hasSendingError: 'Ошибка',
  signer: 'Подписант',
};

export function ActiveFilters({ filters, onRemove }: { filters: DocumentFilter; onRemove: (key: keyof DocumentFilter) => void }) {
  const entries = Object.entries(filters).filter(([, value]) => value !== '') as [keyof DocumentFilter, string][];
  if (entries.length === 0) return null;
  return (
    <div className="chips" aria-label="Активные фильтры">
      {entries.map(([key, value]) => (
        <span className="chip" key={key}>
          {labels[key]}: {value === 'true' ? 'Да' : value === 'false' ? 'Нет' : value}
          <button className="button tertiary" type="button" aria-label={`Удалить фильтр ${labels[key]}`} onClick={() => onRemove(key)}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
