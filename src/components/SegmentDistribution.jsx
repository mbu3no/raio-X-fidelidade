import { BarChart3 } from 'lucide-react';

const SEGMENT_COLORS = {
  'Campeões': '#34d399',
  'Ação Ouro - Baixar App': '#fbbf24',
  'Risco Urgente - Salvar': '#f87171',
  'Forçar Resgate': '#fb923c',
  'Novatos Ativos': '#60a5fa',
  'Base Regular': '#a78bfa',
  'Compra Única': '#94a3b8',
  'Hibernando (90-180d)': '#f472b6',
  'Perdidos (+180d)': '#6b7280',
};

const SEGMENT_ORDER = [
  'Campeões', 'Ação Ouro - Baixar App', 'Risco Urgente - Salvar', 'Forçar Resgate',
  'Novatos Ativos', 'Base Regular', 'Compra Única', 'Hibernando (90-180d)', 'Perdidos (+180d)',
];

export default function SegmentDistribution({ data }) {
  if (data.length === 0) return null;

  const total = data.length;
  const segments = {};
  for (const c of data) {
    segments[c.SegmentoAcao] = (segments[c.SegmentoAcao] || 0) + 1;
  }

  const bars = SEGMENT_ORDER
    .filter((name) => segments[name])
    .map((name) => ({
      name,
      count: segments[name],
      pct: ((segments[name] / total) * 100).toFixed(1),
      color: SEGMENT_COLORS[name] || '#6b7280',
    }));

  // Separa ações de contexto
  const acoes = bars.filter(b => ['Campeões', 'Ação Ouro - Baixar App', 'Risco Urgente - Salvar', 'Forçar Resgate'].includes(b.name));
  const contexto = bars.filter(b => !['Campeões', 'Ação Ouro - Baixar App', 'Risco Urgente - Salvar', 'Forçar Resgate'].includes(b.name));

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-up stagger-3">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <BarChart3 className="w-4 h-4" style={{ color: '#a78bfa' }} />
        </div>
        <h2 className="text-sm font-semibold text-[--text-primary] tracking-tight">Distribuição de Segmentos</h2>
        <span className="text-[--text-muted] text-xs ml-auto font-mono-num">{total.toLocaleString('pt-BR')} clientes</span>
      </div>

      {/* Barra de composição */}
      <div className="flex rounded-lg overflow-hidden h-7 sm:h-9 mb-4 sm:mb-5" style={{ background: 'var(--surface-3)' }}>
        {bars.map((b) => (
          <div
            key={b.name}
            className="h-full transition-all duration-700 relative group"
            style={{ width: `${b.pct}%`, background: b.color, minWidth: b.count > 0 ? 3 : 0 }}
            title={`${b.name}: ${b.count.toLocaleString('pt-BR')} (${b.pct}%)`}
          >
            {parseFloat(b.pct) > 10 && (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-black/70">
                {b.pct}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legenda: Ações */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-widest text-[--text-muted] font-semibold mb-2">Segmentos de Ação</p>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {acoes.map((b) => (
            <div key={b.name} className="flex items-start gap-2.5">
              <div className="w-3 h-3 rounded-sm mt-0.5 shrink-0" style={{ background: b.color }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[--text-secondary] leading-tight break-words">{b.name}</p>
                <p className="text-xs text-[--text-muted] font-mono-num">
                  {b.count.toLocaleString('pt-BR')} ({b.pct}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda: Contexto */}
      {contexto.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[--text-muted] font-semibold mb-2">Demais Clientes (sem ação imediata)</p>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            {contexto.map((b) => (
              <div key={b.name} className="flex items-start gap-2.5">
                <div className="w-3 h-3 rounded-sm mt-0.5 shrink-0" style={{ background: b.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[--text-secondary] leading-tight break-words">{b.name}</p>
                  <p className="text-xs text-[--text-muted] font-mono-num">
                    {b.count.toLocaleString('pt-BR')} ({b.pct}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
