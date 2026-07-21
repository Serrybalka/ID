import type { DocumentFilter, DocumentStatus, ExecutiveDocument } from '../types/document';

export const emptyFilter: DocumentFilter = {
  caseNumber: '',
  documentNumber: '',
  type: '',
  debtor: '',
  status: '',
  signatureFormat: '',
  bailiffOrderStatus: '',
  decisionFrom: '',
  decisionTo: '',
  createdFrom: '',
  createdTo: '',
  sentFrom: '',
  sentTo: '',
  enforcementNumber: '',
  hasBailiffOrders: '',
  courtDistrict: '',
  amountFrom: '',
  amountTo: '',
  hasSendingError: '',
  signer: '',
};

export function canSign(document: ExecutiveDocument) {
  return document.status === 'Создан' || document.status === 'Готов к подписанию';
}

export function signBlockReason(document: ExecutiveDocument) {
  if (canSign(document)) return '';
  if (document.status === 'Ошибка отправки') return 'Сначала устраните ошибку формирования документа';
  if (document.status === 'Подписан') return 'Документ уже подписан';
  if (document.status === 'Закрыт') return 'Документ закрыт';
  return 'Статус документа не допускает подписание';
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(value);
}

export function maskSnils(value: string) {
  return value.replace(/^(\d{3})-\d{3}-\d{3}/, '$1-***-***');
}

export function maskInn(value: string) {
  return value.length > 6 ? `${value.slice(0, 4)}******${value.slice(-2)}` : value;
}

export function filterDocuments(
  documents: ExecutiveDocument[],
  quickQuery: string,
  filters: DocumentFilter,
  statusTab: DocumentStatus | 'Все' | 'Есть постановления СПИ',
) {
  const query = quickQuery.trim().toLowerCase();
  return documents.filter((doc) => {
    const tabMatches =
      statusTab === 'Все' ||
      (statusTab === 'Есть постановления СПИ' ? doc.hasBailiffOrders : doc.status === statusTab);
    if (!tabMatches) return false;

    const quickMatches =
      !query ||
      doc.caseNumber.toLowerCase().includes(query) ||
      doc.documentNumber.toLowerCase().includes(query) ||
      doc.debtor.fullName.toLowerCase().includes(query);
    if (!quickMatches) return false;

    const checks = [
      !filters.caseNumber || doc.caseNumber.toLowerCase().includes(filters.caseNumber.toLowerCase()),
      !filters.documentNumber || doc.documentNumber.toLowerCase().includes(filters.documentNumber.toLowerCase()),
      !filters.type || doc.type === filters.type,
      !filters.debtor || doc.debtor.fullName.toLowerCase().includes(filters.debtor.toLowerCase()),
      !filters.status || doc.status === filters.status,
      !filters.signatureFormat || doc.signatureFormat === filters.signatureFormat,
      !filters.bailiffOrderStatus || doc.bailiffOrderStatus === filters.bailiffOrderStatus,
      !filters.enforcementNumber || doc.enforcementNumber.toLowerCase().includes(filters.enforcementNumber.toLowerCase()),
      !filters.hasBailiffOrders || String(doc.hasBailiffOrders) === filters.hasBailiffOrders,
      !filters.courtDistrict || doc.courtDistrict === filters.courtDistrict,
      !filters.hasSendingError || String(doc.errors.length > 0 || doc.status === 'Ошибка отправки') === filters.hasSendingError,
      !filters.signer || doc.signer.toLowerCase().includes(filters.signer.toLowerCase()),
      !filters.amountFrom || doc.amount >= Number(filters.amountFrom),
      !filters.amountTo || doc.amount <= Number(filters.amountTo),
      inDateRange(doc.decisionDate, filters.decisionFrom, filters.decisionTo),
      inDateRange(doc.createdAt, filters.createdFrom, filters.createdTo),
      inDateRange(doc.sentAt ?? '', filters.sentFrom, filters.sentTo),
    ];
    return checks.every(Boolean);
  });
}

function inDateRange(value: string, from: string, to: string) {
  if (!from && !to) return true;
  if (!value) return false;
  const current = new Date(value).getTime();
  return (!from || current >= new Date(from).getTime()) && (!to || current <= new Date(to).getTime());
}

export function activeFilterEntries(filters: DocumentFilter) {
  return Object.entries(filters).filter(([, value]) => value !== '');
}
