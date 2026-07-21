export type DocumentStatus =
  | 'Создан'
  | 'Готов к подписанию'
  | 'Подписан'
  | 'Отправляется'
  | 'Отправлен'
  | 'Доставлен'
  | 'Ошибка отправки'
  | 'Есть постановления СПИ'
  | 'Закрыт';

export type DocumentType = 'Исполнительный лист' | 'Судебный приказ' | 'Акт по делу об административном правонарушении';
export type SignatureFormat = 'УКЭП XMLDSig' | 'УКЭП CAdES-BES' | 'УКЭП detached SIG';
export type Density = 'compact' | 'standard' | 'comfortable';

export interface Debtor {
  fullName: string;
  type: 'Физическое лицо' | 'Юридическое лицо';
  birthDate: string;
  birthPlace: string;
  registrationAddress: string;
  actualAddress: string;
  snils: string;
  inn: string;
}

export interface Claimant {
  name: string;
  type: 'Государственный орган' | 'Физическое лицо' | 'Юридическое лицо';
  address: string;
  inn: string;
  bankDetails: string;
}

export interface BailiffOrder {
  id: string;
  number: string;
  date: string;
  type: string;
  enforcementNumber: string;
  signer: string;
  signatureStatus: 'Проверена' | 'Ожидает проверки' | 'Ошибка проверки';
  body: string;
}

export interface SendingHistoryEvent {
  id: string;
  dateTime: string;
  title: string;
  status: 'Успех' | 'В работе' | 'Ошибка' | 'Информация';
  actor: string;
  version: string;
  operationId: string;
  description?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  format: 'PDF' | 'XML' | 'SIG' | 'TXT';
  size: string;
  createdAt: string;
}

export interface DocumentError {
  id: string;
  title: string;
  description: string;
  technicalDetails: string;
  dateTime: string;
  stage: string;
  recommendation: string;
}

export interface AuditEvent {
  id: string;
  dateTime: string;
  user: string;
  role: string;
  action: string;
  result: 'Успешно' | 'Ошибка' | 'Отменено';
  workplace: string;
  changes: string;
  type: 'Просмотр' | 'Подписание' | 'Отправка' | 'Настройки';
}

export interface ExecutiveDocument {
  id: string;
  caseNumber: string;
  documentNumber: string;
  type: DocumentType;
  decisionDate: string;
  createdAt: string;
  signedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  debtor: Debtor;
  claimant: Claimant;
  amount: number;
  status: DocumentStatus;
  fsspStatus: string;
  hasBailiffOrders: boolean;
  bailiffOrderStatus: 'Нет' | 'Есть' | 'Ожидаются' | 'Ошибка проверки';
  enforcementNumber: string;
  signatureFormat: SignatureFormat;
  lastAction: string;
  court: string;
  courtDistrict: string;
  judge: string;
  resolution: string;
  effectiveDate: string;
  dueDate: string;
  fsspDepartment: string;
  bailiffName: string;
  enforcementStartedAt?: string;
  enforcementStatus: string;
  lastOrder: string;
  version: string;
  signer: string;
  orders: BailiffOrder[];
  history: SendingHistoryEvent[];
  files: DocumentFile[];
  errors: DocumentError[];
  audit: AuditEvent[];
}

export interface DocumentFilter {
  caseNumber: string;
  documentNumber: string;
  type: string;
  debtor: string;
  status: string;
  signatureFormat: string;
  bailiffOrderStatus: string;
  decisionFrom: string;
  decisionTo: string;
  createdFrom: string;
  createdTo: string;
  sentFrom: string;
  sentTo: string;
  enforcementNumber: string;
  hasBailiffOrders: string;
  courtDistrict: string;
  amountFrom: string;
  amountTo: string;
  hasSendingError: string;
  signer: string;
}

export interface SigningResult {
  documentId: string;
  documentNumber: string;
  debtorName: string;
  status: 'success' | 'failed';
  message: string;
}
