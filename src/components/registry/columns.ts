export interface ColumnDef {
  key: string;
  label: string;
  width: number;
}

export const defaultColumns: ColumnDef[] = [
  { key: 'caseNumber', label: 'Дело N', width: 150 },
  { key: 'documentNumber', label: 'Номер ИД', width: 250 },
  { key: 'type', label: 'Вид ИД', width: 170 },
  { key: 'decisionDate', label: 'Дата решения', width: 120 },
  { key: 'createdAt', label: 'Дата создания ИД', width: 135 },
  { key: 'debtor', label: 'Должник', width: 210 },
  { key: 'amount', label: 'Сумма взыскания', width: 145 },
  { key: 'status', label: 'Статус ИД', width: 180 },
  { key: 'sentAt', label: 'Дата отправки', width: 125 },
  { key: 'fsspStatus', label: 'Статус ФССП', width: 145 },
  { key: 'bailiffOrderStatus', label: 'Постановление СПИ', width: 160 },
  { key: 'enforcementNumber', label: 'Номер ИП', width: 135 },
  { key: 'signatureFormat', label: 'Формат ЭП', width: 150 },
  { key: 'lastAction', label: 'Последнее действие', width: 180 },
];
