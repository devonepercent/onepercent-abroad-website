import { useEffect, useState } from "react";

export function useRowSelection<T extends { id: string }>(rows: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Remove selections that no longer match the filters or have been deleted.
  useEffect(() => {
    const availableIds = new Set(rows.map(row => row.id));
    setSelectedIds(previous => {
      const next = new Set([...previous].filter(id => availableIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [rows]);

  const selectedRows = rows.filter(row => selectedIds.has(row.id));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  return {
    selectedIds,
    selectedRows,
    allSelected,
    checkboxState: allSelected ? true : selectedRows.length > 0 ? "indeterminate" as const : false,
    toggleRow: (id: string, checked: boolean) => {
      setSelectedIds(previous => {
        const next = new Set(previous);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    selectAll: (checked: boolean) => setSelectedIds(new Set(checked ? rows.map(row => row.id) : [])),
    clearSelection: () => setSelectedIds(new Set()),
  };
}
