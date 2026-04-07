import { MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useMemo } from 'react';

function formatBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const COLUMNS = [
  { key: 'name', label: 'Loja', align: 'left' },
  { key: 'total', label: 'Clientes', align: 'right' },
  { key: 'receita', label: 'Receita', align: 'right' },
  { key: '_bar', label: 'Participação', align: 'left', noSort: true },
  { key: 'compras', label: 'Compras', align: 'right' },
  { key: 'inativos90', label: 'Inat. 90d+', align: 'right' },
  { key: 'appPct', label: '% App', align: 'right' },
];

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3" style={{ color: 'var(--accent)' }} />
    : <ArrowDown className="w-3 h-3" style={{ color: 'var(--accent)' }} />;
}

export default function StoreBreakdown({ data }) {
  const [sortKey, setSortKey] = useState('receita');
  const [sortDir, setSortDir] = useState('desc');

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const storeData = useMemo(() => {
    if (data.length === 0) return [];
    const stores = {};
    for (const c of data) {
      const loja = c.Loja || 'Sem loja';
      if (!stores[loja]) stores[loja] = { name: loja, total: 0, receita: 0, compras: 0, inativos90: 0, comApp: 0 };
      stores[loja].total++;
      stores[loja].receita += c.Receita;
      stores[loja].compras += c.Compras;
      if (c.DiasInativos > 90) stores[loja].inativos90++;
      if (c.Aplicativo === 'Sim') stores[loja].comApp++;
    }
    return Object.values(stores).map((s) => ({
      ...s,
      appPct: s.total > 0 ? (s.comApp / s.total) * 100 : 0,
    }));
  }, [data]);

  const sorted = useMemo(() => {
    return [...storeData].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [storeData, sortKey, sortDir]);

  const maxReceita = Math.max(...sorted.map((s) => s.receita), 1);

  if (sorted.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-4 sm:mb-6 animate-fade-up stagger-4">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <MapPin className="w-4 h-4" style={{ color: '#fbbf24' }} />
        </div>
        <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Desempenho por Loja</h2>
        <span className="text-xs ml-auto font-mono-num" style={{ color: 'var(--text-muted)' }}>
          {sorted.length} lojas
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '640px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={col.noSort ? undefined : () => toggleSort(col.key)}
                  className={`px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.noSort ? '' : 'cursor-pointer select-none hover:text-[--text-secondary] transition-colors'}`}
                  style={{ color: 'var(--text-muted)', minWidth: col.key === '_bar' ? 120 : undefined }}
                >
                  <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    {!col.noSort && <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const pct = (s.receita / maxReceita) * 100;
              return (
                <tr key={s.name} className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm max-w-[150px] sm:max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-mono-num text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{s.total.toLocaleString('pt-BR')}</td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-mono-num text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatBRL(s.receita)}</td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-mono-num text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{s.compras.toLocaleString('pt-BR')}</td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right">
                    <span className="font-mono-num text-xs sm:text-sm" style={{ color: s.inativos90 > s.total * 0.3 ? '#f87171' : 'var(--text-muted)' }}>
                      {s.inativos90.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right">
                    <span className="font-mono-num text-xs sm:text-sm" style={{ color: s.appPct > 10 ? '#34d399' : 'var(--text-muted)' }}>
                      {s.appPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
