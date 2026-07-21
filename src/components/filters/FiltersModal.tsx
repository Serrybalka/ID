import { useState } from 'react';
import type { DocumentFilter } from '../../types/document';
import { emptyFilter } from '../../utils/documentLogic';
import { Modal } from '../common/Modal';

const fields: { key: keyof DocumentFilter; label: string; type?: 'text' | 'date' | 'number' | 'select'; options?: string[] }[] = [
  { key: 'caseNumber', label: 'Номер дела' },
  { key: 'documentNumber', label: 'Номер ИД' },
  { key: 'type', label: 'Вид исполнительного документа', type: 'select', options: ['', 'Исполнительный лист', 'Судебный приказ', 'Акт по делу об административном правонарушении'] },
  { key: 'debtor', label: 'Должник' },
  { key: 'status', label: 'Статус ИД', type: 'select', options: ['', 'Создан', 'Готов к подписанию', 'Подписан', 'Отправлен', 'Доставлен', 'Ошибка отправки', 'Закрыт'] },
  { key: 'signatureFormat', label: 'Формат электронной подписи', type: 'select', options: ['', 'УКЭП XMLDSig', 'УКЭП CAdES-BES', 'УКЭП detached SIG'] },
  { key: 'bailiffOrderStatus', label: 'Статус постановления СПИ', type: 'select', options: ['', 'Нет', 'Есть', 'Ожидаются', 'Ошибка проверки'] },
  { key: 'decisionFrom', label: 'Дата вынесения решения от', type: 'date' },
  { key: 'decisionTo', label: 'Дата вынесения решения до', type: 'date' },
  { key: 'createdFrom', label: 'Дата создания ИД от', type: 'date' },
  { key: 'createdTo', label: 'Дата создания ИД до', type: 'date' },
  { key: 'sentFrom', label: 'Дата отправки от', type: 'date' },
  { key: 'sentTo', label: 'Дата отправки до', type: 'date' },
  { key: 'enforcementNumber', label: 'Номер исполнительного производства' },
  { key: 'hasBailiffOrders', label: 'Наличие постановления СПИ', type: 'select', options: ['', 'true', 'false'] },
  { key: 'courtDistrict', label: 'Судебный участок', type: 'select', options: ['', 'Судебный участок N 118', 'Судебный участок N 211', 'Судебный участок N 36', 'Судебный участок N 402'] },
  { key: 'amountFrom', label: 'Размер взыскания от', type: 'number' },
  { key: 'amountTo', label: 'Размер взыскания до', type: 'number' },
  { key: 'hasSendingError', label: 'Наличие ошибки отправки', type: 'select', options: ['', 'true', 'false'] },
  { key: 'signer', label: 'Подписант' },
];

export function FiltersModal({ value, onApply, onClose }: { value: DocumentFilter; onApply: (filters: DocumentFilter) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  const setField = (key: keyof DocumentFilter, fieldValue: string) => setDraft((current) => ({ ...current, [key]: fieldValue }));
  return (
    <Modal
      title="Фильтры исполнительных документов"
      onClose={onClose}
      footer={
        <>
          <button className="button primary" type="button" onClick={() => onApply(draft)}>
            Применить
          </button>
          <button className="button" type="button" onClick={() => setDraft(emptyFilter)}>
            Сбросить фильтры
          </button>
          <button className="button tertiary" type="button" onClick={onClose}>
            Отмена
          </button>
        </>
      }
    >
      <div className="filter-grid">
        {fields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select value={draft[field.key]} onChange={(event) => setField(field.key, event.target.value)}>
                {field.options?.map((option) => (
                  <option key={option || 'empty'} value={option}>
                    {option === '' ? 'Не выбрано' : option === 'true' ? 'Да' : option === 'false' ? 'Нет' : option}
                  </option>
                ))}
              </select>
            ) : (
              <input type={field.type ?? 'text'} value={draft[field.key]} onChange={(event) => setField(field.key, event.target.value)} />
            )}
          </label>
        ))}
      </div>
    </Modal>
  );
}
