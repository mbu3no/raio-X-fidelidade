import { Clock, CalendarDays, Users, AlertTriangle } from 'lucide-react';

function buildFrequencyBuckets(data) {
  const buckets = [
    { label: '0-7 dias', min: 0, max: 7, count: 0, desc: 'Semanal' },
    { label: '8-14 dias', min: 8, max: 14, count: 0, desc: 'Quinzenal' },
    { label: '15-30 dias', min: 15, max: 30, count: 0, desc: 'Mensal' },
    { label: '31-60 dias', min: 31, max: 60, count: 0, desc: 'Bimestral' },
    { label: '61-90 dias', min: 61, max: 90, count: 0, desc: 'Trimestral' },
    { label: '90+ dias', min: 91, max: Infinity, count: 0, desc: 'Esporádico' },
  ];
  const withFreq = data.filter((c) => c.FrequenciaMediaDias > 0);
  for (const c of withFreq) {
    const b = buckets.find((b) => c.FrequenciaMediaDias >= b.min && c.FrequenciaMediaDias <= b.max);
    if (b) b.count++;
  }
  const total = withFreq.length || 1;
  return buckets.map((b) => ({ ...b, pct: ((b.count / total) * 100).toFixed(1) }));
}

function Stat({ label, value, sub, color }) {
  return (
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-extrabold font-mono-num" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function BehaviorSection({ data }) {
  if (data.length === 0) return null;

  const total = data.length;
  const withFreq = data.filter((c) => c.FrequenciaMediaDias > 0);
  const avgDays = withFreq.length > 0
    ? (withFreq.reduce((s, c) => s + c.FrequenciaMediaDias, 0) / withFreq.length).toFixed(1)
    : '0';

  // Classificação simples: cliente está atrasado se DiasInativos > FrequenciaMediaDias
  const noPrazo = data.filter((c) => c.FrequenciaMediaDias > 0 && c.DiasInativos <= c.FrequenciaMediaDias).length;
  const atrasados = data.filter((c) => c.FrequenciaMediaDias > 0 && c.DiasInativos > c.FrequenciaMediaDias).length;

  const ativos = data.filter((c) => c.DiasInativos <= 30).length;
  const alerta = data.filter((c) => c.DiasInativos > 30 && c.DiasInativos <= 90).length;
  const frios = data.filter((c) => c.DiasInativos > 90 && c.DiasInativos <= 180).length;
  const perdidos = data.filter((c) => c.DiasInativos > 180).length;

  const buckets = buildFrequencyBuckets(data);
  const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm sm:text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Comportamento</h2>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>

      {/* Linha 1: Média + Situação da base */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Média de dias */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Clock className="w-4 h-4" style={{ color: '#60a5fa' }} />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Média de dias entre compras
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-num" style={{ color: '#60a5fa' }}>
            {avgDays} dias
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Em média, um cliente volta a cada {avgDays} dias.
            Calculado sobre {withFreq.length.toLocaleString('pt-BR')} clientes com mais de 1 compra.
          </p>
        </div>

        {/* No prazo vs atrasados */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Clientes fora do ciclo
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-num" style={{ color: '#f87171' }}>
            {atrasados.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Estão demorando mais que o habitual para voltar.
            {noPrazo > 0 && <> Outros <strong style={{ color: 'var(--text-secondary)' }}>{noPrazo.toLocaleString('pt-BR')}</strong> estão dentro do prazo normal.</>}
          </p>
        </div>

        {/* Situação por faixa de inatividade */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <Users className="w-4 h-4" style={{ color: '#a78bfa' }} />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Situação da base
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Ativos" value={ativos.toLocaleString('pt-BR')} sub={`${((ativos / total) * 100).toFixed(1)}%`} color="#34d399" />
            <Stat label="Alerta" value={alerta.toLocaleString('pt-BR')} sub={`${((alerta / total) * 100).toFixed(1)}%`} color="#fb923c" />
            <Stat label="Frios" value={frios.toLocaleString('pt-BR')} sub={`${((frios / total) * 100).toFixed(1)}%`} color="#f87171" />
            <Stat label="Perdidos" value={perdidos.toLocaleString('pt-BR')} sub={`${((perdidos / total) * 100).toFixed(1)}%`} color="#6b7280" />
          </div>
          <p className="text-[10px] mt-2 leading-snug" style={{ color: 'var(--text-muted)' }}>
            Ativos: 0-30d | Alerta: 31-90d | Frios: 91-180d | Perdidos: +180d sem compra
          </p>
        </div>
      </div>

      {/* Frequência de compra */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-up stagger-4">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Frequência de compra
          </p>
        </div>
        <p className="text-xs mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
          A cada quantos dias os clientes costumam voltar a comprar.
        </p>
        <div className="space-y-2 sm:space-y-2.5">
          {buckets.map((b) => (
            <div key={b.label} className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] sm:text-xs font-mono-num w-16 sm:w-20 shrink-0 text-right" style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
              <div className="flex-1 h-5 sm:h-6 rounded-md overflow-hidden relative" style={{ background: 'var(--surface-3)' }}>
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${Math.max((b.count / maxBucketCount) * 100, b.count > 0 ? 2 : 0)}%`,
                    background: 'linear-gradient(90deg, var(--accent), rgba(167,139,250,0.6))',
                  }}
                />
                {b.count > 0 && (
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {b.count.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-mono-num w-12 sm:w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>{b.pct}%</span>
              <span className="text-[10px] w-20 shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
