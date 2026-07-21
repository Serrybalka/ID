import type {
  AuditEvent,
  BailiffOrder,
  DocumentError,
  DocumentFile,
  DocumentStatus,
  DocumentType,
  ExecutiveDocument,
  SendingHistoryEvent,
  SignatureFormat,
} from '../types/document';

const debtorNames = [
  'Иванов Сергей Петрович',
  'Петрова Анна Викторовна',
  'Сидоров Алексей Игоревич',
  'ООО "Вектор"',
  'Кузнецова Мария Андреевна',
  'Николаев Дмитрий Павлович',
  'АО "Городские сервисы"',
  'Смирнова Елена Олеговна',
  'Морозов Кирилл Денисович',
  'Федорова Наталья Юрьевна',
];

const claimantNames = ['УФНС России по г. Москве', 'ПАО "Банк Развитие"', 'ГБУ "Жилищник"', 'Администрация района', 'ООО "Правовой центр"'];
const statuses: DocumentStatus[] = ['Создан', 'Готов к подписанию', 'Подписан', 'Отправляется', 'Отправлен', 'Доставлен', 'Ошибка отправки', 'Есть постановления СПИ', 'Закрыт'];
const types: DocumentType[] = ['Исполнительный лист', 'Судебный приказ', 'Акт по делу об административном правонарушении'];
const signatureFormats: SignatureFormat[] = ['УКЭП XMLDSig', 'УКЭП CAdES-BES', 'УКЭП detached SIG'];
const courts = ['Судебный участок N 118', 'Судебный участок N 211', 'Судебный участок N 36', 'Судебный участок N 402'];
const signers = ['Егорова О. Н.', 'Ковалев С. И.', 'Матвеева А. Р.', 'Орлов П. В.'];

function dateByOffset(offset: number) {
  const date = new Date(2026, 6, 20 - offset);
  return date.toISOString().slice(0, 10);
}

function dateTimeByOffset(offset: number, hour = 10) {
  return `${dateByOffset(offset)}T${String(hour).padStart(2, '0')}:24:00`;
}

function makeOrders(index: number, enforcementNumber: string): BailiffOrder[] {
  if (index % 4 !== 0 && index % 7 !== 0) return [];
  const base: BailiffOrder = {
    id: `order-${index}-1`,
    number: `ПСПИ-${2026}-${String(index * 37).padStart(5, '0')}`,
    date: dateByOffset(index % 18),
    type: 'Постановление о возбуждении исполнительного производства',
    enforcementNumber,
    signer: 'СПИ Громова И. А.',
    signatureStatus: index % 7 === 0 ? 'Ожидает проверки' : 'Проверена',
    body: 'Постановление принято территориальным органом ФССП. Электронная подпись приложена к документу и доступна для проверки.',
  };
  return index % 12 === 0
    ? [
        base,
        {
          ...base,
          id: `order-${index}-2`,
          number: `ПСПИ-${2026}-${String(index * 41).padStart(5, '0')}`,
          type: 'Постановление о взыскании исполнительского сбора',
          signatureStatus: 'Проверена',
        },
      ]
    : [base];
}

function makeError(index: number, status: DocumentStatus): DocumentError[] {
  if (status !== 'Ошибка отправки' && index % 19 !== 0) return [];
  return [
    {
      id: `err-${index}`,
      title: 'Документ не был доставлен в ФССП',
      description: 'Во время отправки не удалось получить подтверждение от сервиса ФССП. Проверьте доступность сервиса и повторите отправку.',
      technicalDetails: `FSSP_GATEWAY_TIMEOUT; requestId=gw-${index}-${Date.now().toString().slice(-4)}; retryable=true`,
      dateTime: dateTimeByOffset(index % 14, 13),
      stage: 'Получение подтверждения доставки',
      recommendation: 'Повторите отправку. Если ошибка сохранится, передайте технические сведения в поддержку.',
    },
  ];
}

function makeHistory(index: number, status: DocumentStatus, hasOrders: boolean): SendingHistoryEvent[] {
  const events: SendingHistoryEvent[] = [
    {
      id: `hist-${index}-1`,
      dateTime: dateTimeByOffset(index % 25, 9),
      title: 'Документ создан',
      status: 'Успех',
      actor: signers[index % signers.length],
      version: '1.0',
      operationId: `op-create-${index}`,
    },
    {
      id: `hist-${index}-2`,
      dateTime: dateTimeByOffset(index % 20, 11),
      title: 'Документ подготовлен к подписанию',
      status: 'Успех',
      actor: 'Система',
      version: '1.0',
      operationId: `op-ready-${index}`,
    },
  ];
  if (!['Создан', 'Готов к подписанию'].includes(status)) {
    events.push({
      id: `hist-${index}-3`,
      dateTime: dateTimeByOffset(index % 16, 12),
      title: 'Документ подписан УКЭП',
      status: 'Успех',
      actor: signers[index % signers.length],
      version: '1.1',
      operationId: `op-sign-${index}`,
    });
  }
  if (['Отправляется', 'Отправлен', 'Доставлен', 'Ошибка отправки', 'Есть постановления СПИ', 'Закрыт'].includes(status)) {
    events.push({
      id: `hist-${index}-4`,
      dateTime: dateTimeByOffset(index % 13, 14),
      title: status === 'Ошибка отправки' ? 'Ошибка отправки' : 'Документ принят шлюзом',
      status: status === 'Ошибка отправки' ? 'Ошибка' : 'Успех',
      actor: 'Шлюз ФССП',
      version: '1.1',
      operationId: `op-send-${index}`,
      description: status === 'Ошибка отправки' ? 'Не получено подтверждение доставки от сервиса ФССП.' : undefined,
    });
  }
  if (hasOrders) {
    events.push({
      id: `hist-${index}-5`,
      dateTime: dateTimeByOffset(index % 10, 16),
      title: 'Получено постановление СПИ',
      status: 'Информация',
      actor: 'ФССП',
      version: '1.1',
      operationId: `op-order-${index}`,
    });
  }
  return events;
}

function makeFiles(index: number, hasOrders: boolean): DocumentFile[] {
  const files: DocumentFile[] = [
    { id: `file-${index}-pdf`, name: 'Исполнительный документ PDF', format: 'PDF', size: `${220 + index} КБ`, createdAt: dateByOffset(index % 19) },
    { id: `file-${index}-xml`, name: 'Исполнительный документ XML', format: 'XML', size: `${34 + index} КБ`, createdAt: dateByOffset(index % 19) },
    { id: `file-${index}-sig`, name: 'Файл электронной подписи SIG', format: 'SIG', size: `${8 + (index % 7)} КБ`, createdAt: dateByOffset(index % 14) },
    { id: `file-${index}-receipt`, name: 'Квитанция отправки', format: 'XML', size: `${12 + (index % 5)} КБ`, createdAt: dateByOffset(index % 10) },
  ];
  if (hasOrders) files.push({ id: `file-${index}-order`, name: 'Постановление СПИ', format: 'PDF', size: `${180 + index} КБ`, createdAt: dateByOffset(index % 8) });
  return files;
}

function makeAudit(index: number): AuditEvent[] {
  return [
    {
      id: `audit-${index}-1`,
      dateTime: dateTimeByOffset(index % 17, 10),
      user: signers[index % signers.length],
      role: 'Секретарь судебного участка',
      action: 'Просмотр карточки ИД',
      result: 'Успешно',
      workplace: `10.14.2.${20 + (index % 30)}`,
      changes: 'Без изменения данных',
      type: 'Просмотр',
    },
    {
      id: `audit-${index}-2`,
      dateTime: dateTimeByOffset(index % 15, 12),
      user: index % 2 === 0 ? signers[(index + 1) % signers.length] : 'Система',
      role: index % 2 === 0 ? 'Судья' : 'Интеграционный сервис',
      action: index % 2 === 0 ? 'Подписание документа' : 'Отправка в ФССП',
      result: index % 13 === 0 ? 'Ошибка' : 'Успешно',
      workplace: index % 2 === 0 ? `АРМ-${100 + index}` : 'system',
      changes: 'Статус, версия документа',
      type: index % 2 === 0 ? 'Подписание' : 'Отправка',
    },
  ];
}

export const documents: ExecutiveDocument[] = Array.from({ length: 96 }, (_, rawIndex) => {
  const index = rawIndex + 1;
  const status = statuses[index % statuses.length];
  const debtorName = debtorNames[index % debtorNames.length];
  const isCompany = debtorName.includes('ООО') || debtorName.includes('АО');
  const caseNumber = `${String(5 + (index % 8)).padStart(2, '0')}-${String(500 + index).padStart(4, '0')}/${120 + (index % 400)}/2026`;
  const documentNumber = `035614080500${String(6600000000000 + index * 3672607)}`;
  const enforcementNumber = index % 3 === 0 ? `ИП-${String(78000 + index * 17)}-${26}` : '';
  const orders = makeOrders(index, enforcementNumber || `ИП-${String(79000 + index * 11)}-26`);
  const errors = makeError(index, status);
  const effectiveDate = dateByOffset((index % 30) - 7);
  return {
    id: `doc-${index}`,
    caseNumber,
    documentNumber,
    type: types[index % types.length],
    decisionDate: dateByOffset(45 + (index % 35)),
    createdAt: dateByOffset(30 + (index % 25)),
    signedAt: ['Подписан', 'Отправляется', 'Отправлен', 'Доставлен', 'Есть постановления СПИ', 'Закрыт', 'Ошибка отправки'].includes(status)
      ? dateByOffset(24 + (index % 20))
      : undefined,
    sentAt: ['Отправляется', 'Отправлен', 'Доставлен', 'Есть постановления СПИ', 'Закрыт', 'Ошибка отправки'].includes(status) ? dateByOffset(14 + (index % 16)) : undefined,
    deliveredAt: ['Доставлен', 'Есть постановления СПИ', 'Закрыт'].includes(status) ? dateByOffset(8 + (index % 8)) : undefined,
    debtor: {
      fullName: debtorName,
      type: isCompany ? 'Юридическое лицо' : 'Физическое лицо',
      birthDate: isCompany ? '-' : `19${70 + (index % 24)}-${String(1 + (index % 12)).padStart(2, '0')}-${String(1 + (index % 27)).padStart(2, '0')}`,
      birthPlace: isCompany ? '-' : 'г. Москва',
      registrationAddress: `г. Москва, ул. Правовая, д. ${10 + index}, кв. ${index % 60}`,
      actualAddress: `г. Москва, пр-т Мировой, д. ${4 + (index % 40)}`,
      snils: `${String(100 + index).padStart(3, '0')}-${String(200 + index).padStart(3, '0')}-${String(300 + index).padStart(3, '0')} ${String(index % 99).padStart(2, '0')}`,
      inn: isCompany ? `77${String(1000000000 + index * 1789).slice(0, 10)}` : `50${String(1000000000 + index * 1789).slice(0, 10)}`,
    },
    claimant: {
      name: claimantNames[index % claimantNames.length],
      type: index % 3 === 0 ? 'Юридическое лицо' : 'Государственный орган',
      address: `г. Москва, ул. Взыскателей, д. ${index}`,
      inn: `77${String(1000000000 + index * 991).slice(0, 10)}`,
      bankDetails: `р/с 40702810${String(100000000000 + index).slice(0, 12)}, БИК 044525000`,
    },
    amount: 1800 + index * 4370 + (index % 6) * 990.45,
    status,
    fsspStatus: status === 'Ошибка отправки' ? 'Ошибка доставки' : status === 'Доставлен' || orders.length ? 'Принят ФССП' : status === 'Отправлен' ? 'Ожидает квитанцию' : 'Не отправлен',
    hasBailiffOrders: orders.length > 0,
    bailiffOrderStatus: orders.length ? 'Есть' : index % 6 === 0 ? 'Ожидаются' : 'Нет',
    enforcementNumber,
    signatureFormat: signatureFormats[index % signatureFormats.length],
    lastAction: status === 'Ошибка отправки' ? 'Требуется повторная отправка' : status === 'Создан' ? 'Ожидает проверки' : 'Обновлено состояние',
    court: 'Мировой суд города Москвы',
    courtDistrict: courts[index % courts.length],
    judge: ['Васильева Н. М.', 'Захаров П. Е.', 'Тихонова Л. А.', 'Романов А. С.'][index % 4],
    resolution: 'Взыскать задолженность, государственную пошлину и направить исполнительный документ для принудительного исполнения.',
    effectiveDate,
    dueDate: dateByOffset(-900 + (index % 40)),
    fsspDepartment: `ОСП по ЦАО N ${1 + (index % 5)} ГУФССП России по г. Москве`,
    bailiffName: ['Громова И. А.', 'Мельников Р. П.', 'Соколова Д. В.', 'Лебедев К. Н.'][index % 4],
    enforcementStartedAt: enforcementNumber ? dateByOffset(7 + (index % 9)) : undefined,
    enforcementStatus: enforcementNumber ? 'Возбуждено' : 'Не возбуждено',
    lastOrder: orders[0]?.type ?? 'Постановления не поступали',
    version: ['1.0', '1.1', '2.0'][index % 3],
    signer: signers[index % signers.length],
    orders,
    history: makeHistory(index, status, orders.length > 0),
    files: makeFiles(index, orders.length > 0),
    errors,
    audit: makeAudit(index),
  };
});

