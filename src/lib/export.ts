export type PdfCell = string | number | null | undefined;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCell = (value: PdfCell) =>
  value === null || value === undefined ? "" : String(value);

export const printPdf = (
  title: string,
  headers: string[],
  rows: PdfCell[][]
) => {
  const printWindow = window.open("", "_blank", "width=1000,height=700");

  if (!printWindow) return;

  const headerHtml = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");
  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeHtml(formatCell(cell))}</td>`)
          .join("")}</tr>`
    )
    .join("");

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        color: #17202a;
        font-family: Arial, "Noto Sans", sans-serif;
        margin: 0;
      }
      h1 { font-size: 20px; margin: 0 0 4px; }
      p { color: #667085; font-size: 11px; margin: 0 0 14px; }
      table { border-collapse: collapse; font-size: 9px; width: 100%; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 7px; text-align: left; vertical-align: top; }
      th { background: #006b45; color: white; font-weight: 700; }
      tr { break-inside: avoid; }
      tbody tr:nth-child(even) { background: #f8fafc; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>Generated on ${escapeHtml(new Date().toLocaleString())}</p>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
