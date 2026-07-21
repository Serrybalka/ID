import { ArrowDownUp, MoreVertical } from 'lucide-react';
import type { Density, ExecutiveDocument } from '../../types/document';
import { canSign, formatMoney, signBlockReason } from '../../utils/documentLogic';
import { StatusBadge } from '../common/Badge';
import { defaultColumns } from './columns';

interface DocumentsTableProps {
  rows: ExecutiveDocument[];
  loading: boolean;
  selectedIds: Set<string>;
  activeId?: string;
  density: Density;
  visibleColumns: string[];
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  allPageSignableSelected: boolean;
  hasPageSelection: boolean;
  onToggleSort: (key: string) => void;
  onToggleRow: (doc: ExecutiveDocument) => void;
  onSelectPage: () => void;
  onOpenRow: (doc: ExecutiveDocument) => void;
  onOpenMenu: (doc: ExecutiveDocument, anchor: HTMLElement) => void;
}

export function DocumentsTable(props: DocumentsTableProps) {
  const columns = defaultColumns.filter((column) => props.visibleColumns.includes(column.key));
  if (props.loading) {
    return (
      <div className="table-wrap">
        <table className={`density-${props.density}`} aria-label="Загрузка реестра">
          <tbody>
            {Array.from({ length: 12 }, (_, index) => (
              <tr className="skeleton-row" key={index}>
                {Array.from({ length: 8 }, (_, cell) => (
                  <td key={cell}>
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap" tabIndex={0} aria-label="Реестр исполнительных документов">
      <table className={`density-${props.density}`} role="table">
        <thead>
          <tr>
            <th className="sticky-left" style={{ width: 54 }}>
              <input aria-label="Выбрать все доступные документы на странице" type="checkbox" checked={props.allPageSignableSelected} onChange={props.onSelectPage} />
            </th>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                <button className="button tertiary" type="button" onClick={() => props.onToggleSort(column.key)}>
                  {column.label}
                  <ArrowDownUp size={13} />
                </button>
              </th>
            ))}
            <th className="sticky-actions" style={{ width: 56 }}>
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((doc) => {
            const selected = props.selectedIds.has(doc.id);
            return (
              <tr
                key={doc.id}
                className={`${selected ? 'selected' : ''} ${props.activeId === doc.id ? 'active' : ''}`}
                tabIndex={0}
                onClick={() => props.onOpenRow(doc)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') props.onOpenRow(doc);
                  if (event.key === ' ') {
                    event.preventDefault();
                    props.onToggleRow(doc);
                  }
                }}
              >
                <td className="sticky-left" title={signBlockReason(doc)}>
                  <input
                    aria-label={`Выбрать документ ${doc.documentNumber}`}
                    type="checkbox"
                    checked={selected}
                    disabled={!canSign(doc)}
                    onChange={(event) => {
                      event.stopPropagation();
                      props.onToggleRow(doc);
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key}>{renderCell(doc, column.key)}</td>
                ))}
                <td className="sticky-actions">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Действия с документом ${doc.documentNumber}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onOpenMenu(doc, event.currentTarget);
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {props.rows.length === 0 && (
        <div className="empty-state">
          <div>
            <h3>Исполнительные документы не найдены</h3>
            <p>Измените параметры поиска или сбросьте фильтры</p>
          </div>
        </div>
      )}
      {props.hasPageSelection && <div className="table-action-hint">Выбраны доступные документы на странице. Можно выбрать все документы, соответствующие фильтру, через действие в панели.</div>}
    </div>
  );
}

function renderCell(doc: ExecutiveDocument, key: string) {
  switch (key) {
    case 'debtor':
      return doc.debtor.fullName;
    case 'amount':
      return formatMoney(doc.amount);
    case 'status':
      return <StatusBadge status={doc.status} />;
    case 'bailiffOrderStatus':
      return doc.hasBailiffOrders ? <StatusBadge status="Есть" /> : doc.bailiffOrderStatus;
    case 'sentAt':
      return doc.sentAt ?? 'Не отправлен';
    case 'enforcementNumber':
      return doc.enforcementNumber || 'Не присвоен';
    default:
      return String(doc[key as keyof ExecutiveDocument] ?? '');
  }
}
