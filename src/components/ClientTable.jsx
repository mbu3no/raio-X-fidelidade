import { Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useMemo } from 'react';

function formatBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function inactiveBadge(dias) {
  if (dias > 90) return { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.2)' };
  if (dias > 30) return { bg: 'rgba(251,146,60,0.12)', color: '#fb923c', border: 'rgba(251,146,60,0.2)' };
  return { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.2)' };
}

const SEG_COLORS = {
  'Ação Ouro - Baixar App': '#fbbf24',
  'Risco Urgente - Salvar': '#f87171',
  'Forçar Resgate': '#fb923c',
  'Campeões': '#34d399',
  'Novatos Ativos': '#60a5fa',
  'Base Regular': '#a78bfa',
  'Compra Única': '#94a3b8',
  'Hibernando (90-180d)': '#f472b6',
  'Perdidos (+180d)': '#6b7280',
};

const COLUMNS = [
  { key: 'Cliente', label: 'Cliente', align: 'left' },
  { key: 'Loja', label: 'Loja', align: 'left' },
  { key: 'SegmentoAcao', label: 'Segmento', align: 'left' },
  { key: 'DiasInativos', label: 'Inativos', align: 'right' },
  { key: 'Compras', label: 'Compras', align: 'right' },
  { key: 'TicketMedio', label: 'Ticket Med.', align: 'right' },
  { key: 'Receita', label: 'Receita', align: 'right' },
  { key: 'Saldo', label: 'Saldo', align: 'right' },
  { key: 'Aplicativo', label: 'App', align: 'center', noSort: true },
];

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3" style={{ color: 'var(--accent)' }} />
    : <ArrowDown className="w-3 h-3" style={{ color: 'var(--accent)' }} />;
}

export default function ClientTable({ data, segmento }) {
  const [sortKey, setSortKey] = useState('Receita');
  const [sortDir, setSortDir] = useState('desc');

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = segmento
    ? data.filter((c) => c.SegmentoAcao === segmento)
    : data;

  // Primeiro: seleciona os 100 de maior receita (o verdadeiro Top 100)
  const top100Base = useMemo(() => {
    return [...filtered].sort((a, b) => b.Receita - a.Receita).slice(0, 100);
  }, [filtered]);

  // Depois: ordena DENTRO dos 100 pelo critério escolhido pelo usuário
  const top100 = useMemo(() => {
    return [...top100Base].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [top100Base, sortKey, sortDir]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-up stagger-5">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-glow)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-xs sm:text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {segmento ? `Top 100 — ${segmento}` : 'Top 100 — Todos os Clientes'}
        </h2>
        <span className="text-xs ml-auto font-mono-num" style={{ color: 'var(--text-muted)' }}>
          {filtered.length.toLocaleString('pt-BR')} no total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '720px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={col.noSort ? undefined : () => toggleSort(col.key)}
                  className={`px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.noSort ? '' : 'cursor-pointer select-none hover:text-[--text-secondary] transition-colors'}`}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                    {col.label}
                    {!col.noSort && <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top100.map((c, i) => {
              const badge = inactiveBadge(c.DiasInativos);
              const segColor = SEG_COLORS[c.SegmentoAcao] || '#6b7280';
              return (
                <tr key={i} className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 font-medium text-xs sm:text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{c.Cliente}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs max-w-[120px] sm:max-w-[150px] truncate" style={{ color: 'var(--text-muted)' }}>{c.Loja}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: segColor }}>
                      {['Base Regular', 'Compra Única', 'Novatos Ativos'].includes(c.SegmentoAcao) ? c.SegmentoAcao : c.SegmentoAcao}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold font-mono-num"
                      style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {c.DiasInativos}d
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-right font-mono-num text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{c.Compras}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-right font-mono-num text-xs sm:text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{formatBRL(c.TicketMedio)}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-right font-mono-num text-xs sm:text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatBRL(c.Receita)}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-right font-mono-num text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{c.Saldo.toLocaleString('pt-BR')}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-2.5 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${c.Aplicativo === 'Sim' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  </td>
                </tr>
              );
            })}
            {top100.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 sm:px-6 py-10 sm:py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Selecione um card de ação para filtrar a tabela.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
