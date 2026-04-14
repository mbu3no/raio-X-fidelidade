import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Remove acentos, lowercase, strip parentheses/special chars
function normalize(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()$%]/g, '')
    .replace(/r\$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fuzzy column match: checks if normalized candidate is contained in normalized key or vice-versa
function fuzzyMatch(normKey, normCandidate) {
  if (normKey === normCandidate) return true;
  // "ticket medio r$" contains "ticket medio" → match
  if (normKey.includes(normCandidate) || normCandidate.includes(normKey)) return true;
  return false;
}

// Retorna o valor da coluna mais provável
function getCol(row, normalizedKeys, candidates) {
  // Match exato
  for (const c of candidates) {
    if (c in row) return row[c];
  }
  // Match normalizado exato
  for (const [origKey, normKey] of normalizedKeys) {
    for (const c of candidates) {
      if (normKey === normalize(c)) return row[origKey];
    }
  }
  // Match fuzzy (contém)
  for (const [origKey, normKey] of normalizedKeys) {
    for (const c of candidates) {
      if (fuzzyMatch(normKey, normalize(c))) return row[origKey];
    }
  }
  return undefined;
}

// Converte string financeira para float
function parseFinanceiro(val) {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim().replace(/[R$\s]/g, '');
  if (str === '' || str === '-') return 0;
  if (str.includes(',')) {
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseData(val) {
  if (!val || val === '' || val === '-') return null;
  const str = String(val).trim();
  // dd/mm/yyyy
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return new Date(+y, +m - 1, +d);
  }
  // ISO yyyy-mm-dd or yyyy-mm-dd HH:MM:SS
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

// Converte float strings ("1.0", "45.0") e inteiros para int
function parseNumSafe(val) {
  if (val == null || val === '' || val === '-') return 0;
  const num = parseFloat(String(val).trim().replace(',', '.'));
  return isNaN(num) ? 0 : Math.round(num);
}

function diffDays(a, b) {
  if (!a || !b) return 0;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// Nomes reais encontrados nos CSVs + variações comuns
const COL_MAP = {
  cliente:      ['Cliente'],
  categoria:    ['Categoria'],
  loja:         ['Loja de Cadastro', 'Loja'],
  dataPrimeira: ['Data Primeira Compra', 'Data da Primeira Compra'],
  diasInativos: ['Dias Inativo', 'Dias Inativos'],
  dataUltima:   ['Data Última Compra', 'Data da Última Compra', 'Data Ultima Compra'],
  dataResgate:  ['Data Último Resgate', 'Data do Último Resgate', 'Data Ultimo Resgate'],
  ticketMedio:  ['Ticket Médio (R$)', 'Ticket Médio', 'Ticket Medio'],
  receita:      ['Receita (R$)', 'Receita'],
  saldo:        ['Saldo'],
  compras:      ['Compras'],
  resgates:     ['Resgates'],
  aplicativo:   ['Aplicativo'],
};

export function processFiles(parsedArrays) {
  const raw = parsedArrays.flat().filter((row) => {
    return Object.values(row).some((v) => v != null && String(v).trim() !== '');
  });

  if (raw.length === 0) return [];

  const sampleRow = raw[0];
  const normalizedKeys = Object.keys(sampleRow).map((k) => [k, normalize(k)]);

  console.log('[Popfidelidade] Colunas detectadas:', Object.keys(sampleRow));
  console.log('[Popfidelidade] Primeira linha raw:', sampleRow);

  // Verifica qual coluna real mapeia para cada campo
  const resolvedCols = {};
  for (const [field, candidates] of Object.entries(COL_MAP)) {
    const testVal = getCol(sampleRow, normalizedKeys, candidates);
    resolvedCols[field] = testVal !== undefined ? 'OK' : 'MISSING';
  }
  console.log('[Popfidelidade] Mapeamento de colunas:', resolvedCols);

  const cleaned = raw.map((row) => {
    const diasInativos = parseNumSafe(getCol(row, normalizedKeys, COL_MAP.diasInativos));
    const ticketMedio = parseFinanceiro(getCol(row, normalizedKeys, COL_MAP.ticketMedio));
    const receita = parseFinanceiro(getCol(row, normalizedKeys, COL_MAP.receita));
    const saldo = parseFinanceiro(getCol(row, normalizedKeys, COL_MAP.saldo));
    const compras = parseNumSafe(getCol(row, normalizedKeys, COL_MAP.compras));
    const resgates = parseNumSafe(getCol(row, normalizedKeys, COL_MAP.resgates));
    const dataPrimeira = parseData(getCol(row, normalizedKeys, COL_MAP.dataPrimeira));
    const dataUltima = parseData(getCol(row, normalizedKeys, COL_MAP.dataUltima));
    const dataUltimoResgate = parseData(getCol(row, normalizedKeys, COL_MAP.dataResgate));
    const appVal = String(getCol(row, normalizedKeys, COL_MAP.aplicativo) || '').trim().toLowerCase();
    const aplicativo = appVal === 'sim' || appVal === 's' || appVal === 'yes' ? 'Sim' : 'Não';

    const cicloDeVidaDias = diffDays(dataPrimeira, dataUltima);
    const frequenciaMediaDias = compras > 1 ? Math.round(cicloDeVidaDias / compras) : 0;
    const riscoFugaPct = frequenciaMediaDias > 0
      ? Math.round((diasInativos / frequenciaMediaDias) * 100)
      : 0;

    return {
      Cliente: String(getCol(row, normalizedKeys, COL_MAP.cliente) || '').trim(),
      Categoria: String(getCol(row, normalizedKeys, COL_MAP.categoria) || '').trim(),
      Loja: String(getCol(row, normalizedKeys, COL_MAP.loja) || '').trim(),
      DataPrimeiraCompra: dataPrimeira,
      DiasInativos: diasInativos,
      DataUltimaCompra: dataUltima,
      DataUltimoResgate: dataUltimoResgate,
      TicketMedio: ticketMedio,
      Receita: receita,
      Saldo: saldo,
      Compras: compras,
      Resgates: resgates,
      Aplicativo: aplicativo,
      CicloDeVidaDias: cicloDeVidaDias,
      FrequenciaMediaDias: frequenciaMediaDias,
      RiscoFugaPct: riscoFugaPct,
      SegmentoAcao: '',
    };
  });

  // Log sample para debug
  if (cleaned.length > 0) {
    const s = cleaned[0];
    console.log('[Popfidelidade] Amostra processada:', {
      Cliente: s.Cliente, DiasInativos: s.DiasInativos, TicketMedio: s.TicketMedio,
      Receita: s.Receita, Saldo: s.Saldo, Compras: s.Compras, Resgates: s.Resgates,
      Aplicativo: s.Aplicativo,
    });
    console.log('[Popfidelidade] Total registros:', cleaned.length);
  }

  // Segmentação (ordem importa! — as 4 regras de ação primeiro, depois sub-segmentos)
  for (const c of cleaned) {
    if (c.TicketMedio > 100 && c.Compras > 5 && c.Aplicativo === 'Não') {
      c.SegmentoAcao = 'Ação Ouro - Baixar App';
    } else if (c.Receita > 500 && c.DiasInativos > 30 && c.DiasInativos < 90) {
      c.SegmentoAcao = 'Risco Urgente - Salvar';
    } else if (c.Saldo > 1000 && c.Resgates === 0 && c.DiasInativos > 45) {
      c.SegmentoAcao = 'Forçar Resgate';
    } else if (c.Compras > 20 && c.DiasInativos <= 15) {
      c.SegmentoAcao = 'Campeões';
    // Sub-segmentos do antigo "Outros" — dão contexto ao grupo residual
    } else if (c.DiasInativos > 180) {
      c.SegmentoAcao = 'Perdidos (+180d)';
    } else if (c.DiasInativos > 90) {
      c.SegmentoAcao = 'Hibernando (90-180d)';
    } else if (c.Compras <= 1) {
      c.SegmentoAcao = 'Compra Única';
    } else if (c.Compras <= 5 && c.DiasInativos <= 30) {
      c.SegmentoAcao = 'Novatos Ativos';
    } else {
      c.SegmentoAcao = 'Base Regular';
    }
  }

  // Log distribuição de segmentos
  const dist = {};
  for (const c of cleaned) dist[c.SegmentoAcao] = (dist[c.SegmentoAcao] || 0) + 1;
  console.log('[Popfidelidade] Distribuição segmentos:', dist);

  return cleaned;
}

// Detecta se o arquivo contém ativos, inativos ou ambos
// Heurística: usa a coluna "Dias Inativo(s)" com corte de 30 dias (padrão plataforma).
// - 100% rows > 30 dias → "inativos"
// - 100% rows ≤ 30 dias → "ativos"
// - misto → "ambos"
export function detectFileType(rows) {
  const valid = (rows || []).filter((r) =>
    Object.values(r).some((v) => v != null && String(v).trim() !== '')
  );
  if (valid.length === 0) return { tipo: 'vazio', total: 0, ativos: 0, inativos: 0 };

  const normalizedKeys = Object.keys(valid[0]).map((k) => [k, normalize(k)]);
  let ativos = 0;
  let inativos = 0;
  let semDado = 0;

  for (const row of valid) {
    const raw = getCol(row, normalizedKeys, COL_MAP.diasInativos);
    if (raw == null || String(raw).trim() === '' || String(raw).trim() === '-') {
      semDado++;
      continue;
    }
    const dias = parseNumSafe(raw);
    if (dias > 30) inativos++;
    else ativos++;
  }

  const total = valid.length;
  let tipo;
  if (semDado === total) tipo = 'desconhecido';
  else if (inativos === 0) tipo = 'ativos';
  else if (ativos === 0) tipo = 'inativos';
  else tipo = 'ambos';

  return { tipo, total, ativos, inativos, semDado };
}

// Parse genérico: CSV ou Excel
export function parseFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcelFile(file);
  }
  return parseCsvFile(file);
}

function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
        console.log(`[Popfidelidade] Excel parseado: ${data.length} linhas da aba "${sheetName}"`);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    function tryParse(encoding) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding,
        complete: (results) => {
          if (results.data.length > 0) {
            const cols = Object.keys(results.data[0]);
            const colsNorm = cols.map(normalize);
            const hasCompras = colsNorm.some((c) => c.includes('compras'));
            const hasCliente = colsNorm.some((c) => c.includes('cliente'));

            if (!hasCompras && !hasCliente && encoding === 'UTF-8') {
              console.log('[Popfidelidade] Colunas não encontradas com UTF-8, tentando Latin-1...');
              tryParse('ISO-8859-1');
              return;
            }
          }
          console.log(`[Popfidelidade] CSV parseado com ${encoding}:`, results.data.length, 'linhas');
          resolve(results.data);
        },
        error: (err) => {
          if (encoding === 'UTF-8') {
            tryParse('ISO-8859-1');
          } else {
            reject(err);
          }
        },
      });
    }
    tryParse('UTF-8');
  });
}
