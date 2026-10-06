type CsvValue = string | number | null | undefined;

export function createCsv(headers: string[], rows: CsvValue[][]): string {
  const escapeCell = (value: CsvValue) => {
    const text = String(value ?? "");
    // Treat spreadsheet formulas and international phone numbers as text.
    const safeText = /^[=+\-@\t\r\n]/.test(text.trimStart()) || /^[\t\r\n]/.test(text)
      ? `'${text}`
      : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };

  return "\uFEFF" + [headers, ...rows].map(row => row.map(escapeCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, headers: string[], rows: CsvValue[][]) {
  const blob = new Blob([createCsv(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
