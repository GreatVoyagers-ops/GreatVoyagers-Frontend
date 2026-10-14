// Spreadsheet libraries are loaded on demand so they don't weigh down the rest of the admin.

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

const cellText = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

/** Reads the first sheet of an .xlsx or .csv file as rows of trimmed strings, dropping empty rows. */
export async function readSpreadsheet(file) {
  const name = file.name.toLowerCase();
  let rows;
  if (name.endsWith(".csv")) {
    rows = parseCsv(await file.text());
  } else if (name.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    rows = await readSheet(file);
  } else {
    throw new Error("Choose an .xlsx or .csv file. For old .xls files, open them in Excel and use Save As → .xlsx first.");
  }
  return rows.map((row) => row.map(cellText)).filter((row) => row.some(Boolean));
}

/** Downloads `objects` as an .xlsx file. Each column: { header, value(object), width }. */
export async function downloadXlsx(objects, columns, fileName) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(objects, {
    columns: columns.map((column) => ({
      header: { value: column.header, fontWeight: "bold" },
      cell: (object) => {
        const value = column.value(object);
        return { value: value === undefined || value === "" ? null : value, ...(value instanceof Date && { format: "dd/mm/yyyy" }) };
      },
      width: column.width ?? 18,
    })),
  }).toFile(fileName);
}

export const exportFileName = (kind) => `greatvoyagers-${kind}-${new Date().toISOString().slice(0, 10)}.xlsx`;
