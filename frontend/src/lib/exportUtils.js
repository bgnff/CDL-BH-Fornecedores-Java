/**
 * Utilitário de exportação para CSV compatível com Excel brasileiro.
 * Utiliza BOM UTF-8 (\uFEFF) e delimitador ponto-e-vírgula (;) para garantir
 * que o Excel abra automaticamente com caracteres acentuados e colunas separadas.
 */

export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    throw new Error('Nenhum dado disponível para exportação.');
  }

  // Sanitiza célula para CSV (escapa aspas e quebras de linha)
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Linha de cabeçalho
  const headerLine = headers.map(h => formatCell(h.label)).join(';');

  // Linhas de dados
  const dataLines = rows.map(row => {
    return headers.map(h => {
      const val = typeof h.key === 'function' ? h.key(row) : row[h.key];
      return formatCell(val);
    }).join(';');
  });

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
