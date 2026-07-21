export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => Math.min(pageCount, Math.max(1, page - 2) + i));
  return (
    <div className="pagination">
      <span>
        {start}–{end} из {total}
      </span>
      <div className="toolbar-group">
        <label>
          Строк на странице{' '}
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {[25, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="button" disabled={page === 1} onClick={() => onPageChange(1)}>
          Первая
        </button>
        {pages.map((item) => (
          <button className={`button ${item === page ? 'primary' : ''}`} type="button" key={item} onClick={() => onPageChange(item)}>
            {item}
          </button>
        ))}
        <button className="button" type="button" disabled={page === pageCount} onClick={() => onPageChange(pageCount)}>
          Последняя
        </button>
      </div>
    </div>
  );
}
