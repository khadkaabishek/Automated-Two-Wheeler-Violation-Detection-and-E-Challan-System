export default function Pagination({ meta, onPageChange }) {
  if (!meta) return null;
  const { page, totalPages, total, limit } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span>
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </span>
      <div className="pagination__controls">
        <button
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </button>
        <span style={{ padding: '5px 8px', fontFamily: 'var(--font-mono)' }}>
          {page} / {totalPages}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function Pagination({ page, totalPages, limit = 10, onPageChange, onLimitChange }) {