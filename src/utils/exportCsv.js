export function exportCsv(data, filename = 'lista_clientes.csv') {
  if (!data.length) return;

  const columns = ['Cliente', 'Loja', 'DiasInativos', 'Receita', 'Saldo', 'TicketMedio', 'Compras', 'Resgates', 'Aplicativo', 'SegmentoAcao'];
  const header = columns.join(';');
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col];
      if (typeof val === 'number') return String(val).replace('.', ',');
      return String(val ?? '');
    }).join(';')
  );

  const csvContent = '\uFEFF' + [header, ...rows].join('\r\n'); // BOM para Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
