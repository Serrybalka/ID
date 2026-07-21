import { useMemo, useState } from 'react';
import { documents as initialDocuments } from '../data/documents';
import { ActiveFilters } from '../components/registry/ActiveFilters';
import { ColumnSettings } from '../components/registry/ColumnSettings';
import { DocumentsTable } from '../components/registry/DocumentsTable';
import { defaultColumns } from '../components/registry/columns';
import { DensitySettings } from '../components/registry/DensitySettings';
import { RegistryToolbar } from '../components/registry/RegistryToolbar';
import { StatusTabs, type StatusTab } from '../components/registry/StatusTabs';
import { TablePagination } from '../components/registry/TablePagination';
import { FiltersModal } from '../components/filters/FiltersModal';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { DocumentDrawer } from '../components/document-details/DocumentDrawer';
import { SigningModal } from '../components/signing/SigningModal';
import { ToastStack, type ToastMessage } from '../components/common/Toast';
import type { Density, DocumentFilter, ExecutiveDocument, SigningResult } from '../types/document';
import { activeFilterEntries, canSign, emptyFilter, filterDocuments } from '../utils/documentLogic';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function ExecutiveDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('id.sidebar.open', false);
  const [visibleColumns, setVisibleColumns] = useLocalStorage('id.columns', defaultColumns.map((column) => column.key));
  const [density, setDensity] = useLocalStorage<Density>('id.density', 'standard');
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<StatusTab>('Все');
  const [quickQuery, setQuickQuery] = useState('');
  const [filters, setFilters] = useState<DocumentFilter>(emptyFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDocId, setActiveDocId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage('id.page.size', 25);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [densityOpen, setDensityOpen] = useState(false);
  const [signingDocs, setSigningDocs] = useState<ExecutiveDocument[] | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [rowMenu, setRowMenu] = useState<{ doc: ExecutiveDocument; x: number; y: number } | null>(null);

  const filtered = useMemo(() => filterDocuments(documents, quickQuery, filters, statusTab), [documents, filters, quickQuery, statusTab]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => compareDocuments(a, b, sortKey, sortDirection)), [filtered, sortDirection, sortKey]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeDoc = documents.find((doc) => doc.id === activeDocId);
  const selectedDocuments = documents.filter((doc) => selectedIds.has(doc.id));
  const signableSelected = selectedDocuments.filter(canSign);
  const pageSignable = pageRows.filter(canSign);
  const activeFilterCount = activeFilterEntries(filters).length;

  const toast = (title: string, type: ToastMessage['type'] = 'info', description?: string) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, title, type, description }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  };

  const toggleRow = (doc: ExecutiveDocument) => {
    if (!canSign(doc)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(doc.id)) next.delete(doc.id);
      else next.add(doc.id);
      return next;
    });
  };

  const selectPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = pageSignable.every((doc) => next.has(doc.id));
      pageSignable.forEach((doc) => (allSelected ? next.delete(doc.id) : next.add(doc.id)));
      return next;
    });
  };

  const handleSignComplete = (results: SigningResult[]) => {
    const successIds = new Set(results.filter((result) => result.status === 'success').map((result) => result.documentId));
    setDocuments((items) => items.map((doc) => (successIds.has(doc.id) ? { ...doc, status: 'Отправлен', signedAt: '2026-07-21', sentAt: '2026-07-21', lastAction: 'Подписан и отправлен' } : doc)));
    if (results.some((result) => result.status === 'failed')) toast('Подписание завершено с частичным успехом', 'warning');
    else toast('Документы подписаны и отправлены', 'success');
    setSelectedIds((current) => new Set([...current].filter((id) => !successIds.has(id))));
  };

  const resetSearchAndFilters = () => {
    setQuickQuery('');
    setFilters(emptyFilter);
    setPage(1);
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`main-area ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <section className="page" aria-label="Исполнительные документы">
          <div className="page-title-row">
            <div>
              <h1>Исполнительные документы</h1>
              <p className="page-subtitle">Просмотр, подписание и контроль отправки исполнительных документов в ФССП</p>
            </div>
            <span className="badge warning" role="alert">Автономный режим: используются локальные mock-данные</span>
          </div>
          <StatusTabs documents={documents} active={statusTab} onChange={(tab) => { setStatusTab(tab); setPage(1); }} />
          <div className="surface">
            <RegistryToolbar
              selectedCount={selectedIds.size}
              signableSelectedCount={signableSelected.length}
              quickQuery={quickQuery}
              activeFilterCount={activeFilterCount}
              onQuickQueryChange={setQuickQuery}
              onSearch={() => { setPage(1); toast('Поиск выполнен', 'success'); }}
              onReset={resetSearchAndFilters}
              onOpenFilters={() => setFiltersOpen(true)}
              onOpenColumns={() => { setColumnsOpen((value) => !value); setDensityOpen(false); }}
              onOpenDensity={() => { setDensityOpen((value) => !value); setColumnsOpen(false); }}
              onSign={() => setSigningDocs(selectedDocuments)}
              onRefresh={() => {
                setLoading(true);
                window.setTimeout(() => { setLoading(false); toast('Реестр обновлен', 'success'); }, 700);
              }}
            />
            <div style={{ position: 'relative' }}>
              {columnsOpen && (
                <ColumnSettings
                  columns={defaultColumns}
                  visibleColumns={visibleColumns}
                  onChange={setVisibleColumns}
                  onReset={() => setVisibleColumns(defaultColumns.map((column) => column.key))}
                />
              )}
              {densityOpen && <DensitySettings density={density} onChange={setDensity} />}
            </div>
            <ActiveFilters filters={filters} onRemove={(key) => setFilters((current) => ({ ...current, [key]: '' }))} />
            <DocumentsTable
              rows={pageRows}
              loading={loading}
              selectedIds={selectedIds}
              activeId={activeDocId}
              density={density}
              visibleColumns={visibleColumns}
              sortKey={sortKey}
              sortDirection={sortDirection}
              allPageSignableSelected={pageSignable.length > 0 && pageSignable.every((doc) => selectedIds.has(doc.id))}
              hasPageSelection={pageSignable.some((doc) => selectedIds.has(doc.id))}
              onToggleSort={(key) => {
                setSortKey(key);
                setSortDirection((direction) => (sortKey === key && direction === 'asc' ? 'desc' : 'asc'));
              }}
              onToggleRow={toggleRow}
              onSelectPage={selectPage}
              onOpenRow={(doc) => {
                setActiveDocId(doc.id);
                setDrawerOpen(true);
              }}
              onOpenMenu={(doc, anchor) => {
                const rect = anchor.getBoundingClientRect();
                setRowMenu({ doc, x: rect.right - 260, y: rect.bottom + 4 });
              }}
            />
            <TablePagination page={currentPage} pageSize={pageSize} total={sorted.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          </div>
        </section>
      </main>
      <DocumentDrawer
        document={activeDoc}
        open={drawerOpen}
        expanded={drawerExpanded}
        sidebarOpen={sidebarOpen}
        onClose={() => setDrawerOpen(false)}
        onToggleExpanded={() => setDrawerExpanded((value) => !value)}
        onSign={(doc) => setSigningDocs([doc])}
        onToast={toast}
      />
      {filtersOpen && (
        <FiltersModal
          value={filters}
          onApply={(next) => {
            setFilters(next);
            setPage(1);
            setFiltersOpen(false);
            toast('Фильтры применены', 'success');
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
      {signingDocs && <SigningModal documents={signingDocs} onClose={() => setSigningDocs(null)} onComplete={handleSignComplete} />}
      {rowMenu && <RowMenu doc={rowMenu.doc} x={rowMenu.x} y={rowMenu.y} onClose={() => setRowMenu(null)} onOpen={() => { setActiveDocId(rowMenu.doc.id); setDrawerOpen(true); setRowMenu(null); }} onSign={() => { setSigningDocs([rowMenu.doc]); setRowMenu(null); }} onToast={toast} />}
      <ToastStack toasts={toasts} />
    </div>
  );
}

function RowMenu({
  doc,
  x,
  y,
  onClose,
  onOpen,
  onSign,
  onToast,
}: {
  doc: ExecutiveDocument;
  x: number;
  y: number;
  onClose: () => void;
  onOpen: () => void;
  onSign: () => void;
  onToast: (title: string, type?: ToastMessage['type']) => void;
}) {
  const actions = [
    { label: 'Открыть карточку', action: onOpen, disabled: false },
    { label: 'Подписать', action: onSign, disabled: !canSign(doc) },
    { label: 'Скачать PDF', action: () => onToast('PDF скачан', 'success'), disabled: false },
    { label: 'Скачать XML', action: () => onToast('XML скачан', 'success'), disabled: false },
    { label: 'Проверить подпись', action: () => onToast('Подпись проверена', 'success'), disabled: doc.status === 'Создан' },
    { label: 'Повторить отправку', action: () => onToast('Повторная отправка запущена', 'success'), disabled: doc.status !== 'Ошибка отправки' },
    { label: 'Просмотреть постановления СПИ', action: onOpen, disabled: !doc.hasBailiffOrders },
    { label: 'Печать', action: () => onToast('Документ отправлен на печать', 'info'), disabled: false },
    { label: 'Скопировать номер ИД', action: () => { navigator.clipboard?.writeText(doc.documentNumber); onToast('Номер ИД скопирован', 'success'); }, disabled: false },
  ];
  return (
    <div className="modal-backdrop" style={{ background: 'transparent', placeItems: 'start' }} onClick={onClose}>
      <div className="popover" style={{ position: 'fixed', left: x, top: y, right: 'auto' }} onClick={(event) => event.stopPropagation()}>
        {actions.map((item) => (
          <button className="nav-item" type="button" key={item.label} disabled={item.disabled} title={item.disabled ? 'Действие недоступно для текущего статуса' : item.label} onClick={item.action}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function compareDocuments(a: ExecutiveDocument, b: ExecutiveDocument, key: string, direction: 'asc' | 'desc') {
  const av = getComparable(a, key);
  const bv = getComparable(b, key);
  const result = av > bv ? 1 : av < bv ? -1 : 0;
  return direction === 'asc' ? result : -result;
}

function getComparable(doc: ExecutiveDocument, key: string): string | number {
  switch (key) {
    case 'debtor':
      return doc.debtor.fullName;
    case 'amount':
      return doc.amount;
    default: {
      const value = doc[key as keyof ExecutiveDocument];
      return typeof value === 'number' || typeof value === 'string' ? value : '';
    }
  }
}
