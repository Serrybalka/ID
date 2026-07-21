import { Download, Maximize2, Minimize2, Printer, RefreshCw, Send, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import type { AuditEvent, ExecutiveDocument } from '../../types/document';
import { formatMoney, maskInn, maskSnils } from '../../utils/documentLogic';
import { StatusBadge } from '../common/Badge';

type DrawerTab = 'Общие сведения' | 'История отправки' | 'Постановления СПИ' | 'Файлы' | 'Ошибки' | 'Журнал действий';
const tabs: DrawerTab[] = ['Общие сведения', 'История отправки', 'Постановления СПИ', 'Файлы', 'Ошибки', 'Журнал действий'];

export function DocumentDrawer({
  document: currentDocument,
  open,
  expanded,
  sidebarOpen,
  onClose,
  onToggleExpanded,
  onSign,
  onToast,
}: {
  document?: ExecutiveDocument;
  open: boolean;
  expanded: boolean;
  sidebarOpen: boolean;
  onClose: () => void;
  onToggleExpanded: () => void;
  onSign: (document: ExecutiveDocument) => void;
  onToast: (title: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}) {
  const [tab, setTab] = useState<DrawerTab>('Общие сведения');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [auditType, setAuditType] = useState<AuditEvent['type'] | 'Все'>('Все');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) onClose();
    };
    window.document.addEventListener('keydown', onKey);
    return () => window.document.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  if (!currentDocument) return null;

  const mainAction = currentDocument.status === 'Ошибка отправки' ? 'Повторить отправку' : currentDocument.status === 'Есть постановления СПИ' ? 'Скачать постановление' : 'Подписать';
  const selectedOrder = currentDocument.orders.find((order) => order.id === selectedOrderId);

  return (
    <aside className={`drawer ${open ? 'open' : ''} ${expanded ? 'expanded' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label="Карточка исполнительного документа">
      <div className="drawer-header">
        <div>
          <strong>{currentDocument.type}</strong>
          <h2>ИД N {currentDocument.documentNumber}</h2>
          <p>
            Дело N {currentDocument.caseNumber} · {currentDocument.debtor.fullName}
          </p>
          <StatusBadge status={currentDocument.status} />
        </div>
        <div className="toolbar-group">
          <button className="button primary" type="button" onClick={() => (mainAction === 'Подписать' ? onSign(currentDocument) : onToast(`${mainAction}: операция поставлена в очередь`, 'success'))}>
            <Send size={16} /> {mainAction}
          </button>
          <button className="icon-button" type="button" aria-label="Скачать" onClick={() => onToast('Файл подготовлен к скачиванию', 'success')}>
            <Download size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Печать" onClick={() => onToast('Документ отправлен на печать', 'info')}>
            <Printer size={18} />
          </button>
          <button className="icon-button" type="button" aria-label={expanded ? 'Свернуть карточку' : 'Развернуть карточку'} onClick={onToggleExpanded}>
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="icon-button" type="button" aria-label="Закрыть карточку" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="drawer-body">
        <div className="drawer-tabs" role="tablist" aria-label="Разделы карточки">
          {tabs.map((item) => (
            <button className={`drawer-tab ${tab === item ? 'active' : ''}`} role="tab" aria-selected={tab === item} type="button" key={item} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        {tab === 'Общие сведения' && <GeneralTab document={currentDocument} expanded={expanded} />}
        {tab === 'История отправки' && <HistoryTab document={currentDocument} />}
        {tab === 'Постановления СПИ' && (
          <OrdersTab document={currentDocument} selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} selectedOrder={selectedOrder} onToast={onToast} />
        )}
        {tab === 'Файлы' && <FilesTab document={currentDocument} onToast={onToast} />}
        {tab === 'Ошибки' && <ErrorsTab document={currentDocument} onToast={onToast} />}
        {tab === 'Журнал действий' && <AuditTab document={currentDocument} auditType={auditType} onAuditType={setAuditType} />}
      </div>
    </aside>
  );
}

function GeneralTab({ document, expanded }: { document: ExecutiveDocument; expanded: boolean }) {
  return (
    <div className={expanded ? 'section-grid' : ''}>
      <Section title="Состояние документа" rows={[
        ['Текущий статус', <StatusBadge status={document.status} />],
        ['Дата создания', document.createdAt],
        ['Дата подписания', document.signedAt ?? 'Не подписан'],
        ['Дата отправки', document.sentAt ?? 'Не отправлен'],
        ['Дата доставки', document.deliveredAt ?? 'Нет подтверждения'],
        ['Формат ЭП', document.signatureFormat],
        ['Версия документа', document.version],
      ]} />
      <Section title="Сведения об исполнительном документе" rows={[
        ['Номер ИД', document.documentNumber],
        ['Вид ИД', document.type],
        ['Номер дела', document.caseNumber],
        ['Дата решения', document.decisionDate],
        ['Дата вступления в силу', document.effectiveDate],
        ['Суд', document.court],
        ['Судебный участок', document.courtDistrict],
        ['Мировой судья', document.judge],
        ['Резолютивная часть', document.resolution],
        ['Сумма взыскания', formatMoney(document.amount)],
        ['Срок предъявления', document.dueDate],
      ]} />
      <Section title="Сведения о должнике" rows={[
        ['ФИО / наименование', document.debtor.fullName],
        ['Тип должника', document.debtor.type],
        ['Дата рождения', document.debtor.birthDate],
        ['Место рождения', document.debtor.birthPlace],
        ['Адрес регистрации', document.debtor.registrationAddress],
        ['Фактический адрес', document.debtor.actualAddress],
        ['СНИЛС', maskSnils(document.debtor.snils)],
        ['ИНН', maskInn(document.debtor.inn)],
      ]} />
      <Section title="Сведения о взыскателе" rows={[
        ['Наименование / ФИО', document.claimant.name],
        ['Тип взыскателя', document.claimant.type],
        ['Адрес', document.claimant.address],
        ['ИНН', maskInn(document.claimant.inn)],
        ['Банковские реквизиты', document.claimant.bankDetails],
      ]} />
      <Section title="Исполнительное производство" rows={[
        ['Номер ИП', document.enforcementNumber || 'Не присвоен'],
        ['Орган ФССП', document.fsspDepartment],
        ['СПИ', document.bailiffName],
        ['Дата возбуждения', document.enforcementStartedAt ?? 'Не возбуждено'],
        ['Текущий статус', document.enforcementStatus],
        ['Последнее постановление', document.lastOrder],
      ]} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className="info-section">
      <h3>{title}</h3>
      {rows.map(([label, value]) => (
        <div className="kv" key={label}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </section>
  );
}

function HistoryTab({ document }: { document: ExecutiveDocument }) {
  return (
    <div className="timeline">
      {document.history.map((event) => (
        <div className="timeline-item" key={event.id}>
          <strong>{event.title}</strong> <StatusBadge status={event.status} />
          <p>{new Date(event.dateTime).toLocaleString('ru-RU')} · {event.actor} · версия {event.version}</p>
          <p>Операция: {event.operationId}</p>
          {event.description && <p className="badge danger">{event.description}</p>}
        </div>
      ))}
    </div>
  );
}

function OrdersTab({
  document,
  selectedOrderId,
  selectedOrder,
  onSelect,
  onToast,
}: {
  document: ExecutiveDocument;
  selectedOrderId: string | null;
  selectedOrder?: ExecutiveDocument['orders'][number];
  onSelect: (id: string | null) => void;
  onToast: (title: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}) {
  if (document.orders.length === 0) return <Empty title="Постановления СПИ не поступали" />;
  if (selectedOrderId && selectedOrder) {
    return (
      <section className="info-section">
        <button className="button tertiary" type="button" onClick={() => onSelect(null)}>Вернуться к списку постановлений</button>
        <h3>{selectedOrder.type}</h3>
        <p>{selectedOrder.body}</p>
        <Section title="Реквизиты постановления" rows={[
          ['Номер', selectedOrder.number],
          ['Дата', selectedOrder.date],
          ['Номер ИП', selectedOrder.enforcementNumber],
          ['Подписавшее лицо', selectedOrder.signer],
          ['Статус подписи', <StatusBadge status={selectedOrder.signatureStatus} />],
        ]} />
        <div className="toolbar-group">
          <button className="button" type="button" onClick={() => onToast('PDF постановления подготовлен', 'success')}>Скачать PDF</button>
          <button className="button" type="button" onClick={() => onToast('Постановление отправлено на печать', 'info')}>Печать</button>
          <button className="button" type="button" onClick={() => onToast('Подпись постановления проверена', 'success')}>Проверить подпись</button>
        </div>
      </section>
    );
  }
  return (
    <table>
      <thead><tr><th>Номер</th><th>Дата</th><th>Вид</th><th>Номер ИП</th><th>Подписант</th><th>Статус подписи</th><th>Действие</th></tr></thead>
      <tbody>
        {document.orders.map((order) => (
          <tr key={order.id}>
            <td>{order.number}</td>
            <td>{order.date}</td>
            <td>{order.type}</td>
            <td>{order.enforcementNumber}</td>
            <td>{order.signer}</td>
            <td><StatusBadge status={order.signatureStatus} /></td>
            <td><button className="button" type="button" onClick={() => onSelect(order.id)}>Открыть</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FilesTab({ document, onToast }: { document: ExecutiveDocument; onToast: (title: string, type?: 'success' | 'warning' | 'error' | 'info') => void }) {
  return (
    <table>
      <thead><tr><th>Название</th><th>Формат</th><th>Размер</th><th>Дата создания</th><th>Действия</th></tr></thead>
      <tbody>
        {document.files.map((file) => (
          <tr key={file.id}>
            <td>{file.name}</td>
            <td>{file.format}</td>
            <td>{file.size}</td>
            <td>{file.createdAt}</td>
            <td className="toolbar-group">
              <button className="button" type="button" onClick={() => onToast(`Открыт просмотр: ${file.name}`, 'info')}>Просмотр</button>
              <button className="button" type="button" onClick={() => onToast(`Файл скачан: ${file.name}`, 'success')}>Скачать</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ErrorsTab({ document, onToast }: { document: ExecutiveDocument; onToast: (title: string, type?: 'success' | 'warning' | 'error' | 'info') => void }) {
  if (document.errors.length === 0) return <Empty title="Ошибки не обнаружены" />;
  return (
    <>
      {document.errors.map((error) => (
        <section className="info-section" key={error.id}>
          <h3>{error.title}</h3>
          <p>{error.description}</p>
          <Section title="Подробности" rows={[
            ['Дата и время', new Date(error.dateTime).toLocaleString('ru-RU')],
            ['Этап', error.stage],
            ['Рекомендация', error.recommendation],
          ]} />
          <details>
            <summary>Технические сведения</summary>
            <code>{error.technicalDetails}</code>
          </details>
          <div className="toolbar-group">
            <button className="button primary" type="button" onClick={() => onToast('Повторная отправка запущена', 'success')}><RefreshCw size={16} /> Повторить отправку</button>
            <button className="button" type="button" onClick={() => onToast('Обращение в поддержку создано', 'success')}>Сообщить в техническую поддержку</button>
          </div>
        </section>
      ))}
    </>
  );
}

function AuditTab({ document, auditType, onAuditType }: { document: ExecutiveDocument; auditType: AuditEvent['type'] | 'Все'; onAuditType: (type: AuditEvent['type'] | 'Все') => void }) {
  const rows = auditType === 'Все' ? document.audit : document.audit.filter((event) => event.type === auditType);
  return (
    <>
      <label className="field">
        <span>Тип события</span>
        <select value={auditType} onChange={(event) => onAuditType(event.target.value as AuditEvent['type'] | 'Все')}>
          {['Все', 'Просмотр', 'Подписание', 'Отправка', 'Настройки'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <table>
        <thead><tr><th>Дата</th><th>Пользователь</th><th>Роль</th><th>Действие</th><th>Результат</th><th>IP / АРМ</th><th>Изменения</th></tr></thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.id}>
              <td>{new Date(event.dateTime).toLocaleString('ru-RU')}</td>
              <td>{event.user}</td>
              <td>{event.role}</td>
              <td>{event.action}</td>
              <td><StatusBadge status={event.result} /></td>
              <td>{event.workplace}</td>
              <td>{event.changes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="empty-state">
      <div>
        <h3>{title}</h3>
        <p>Данные будут отображены после поступления сведений из ФССП.</p>
      </div>
    </div>
  );
}
