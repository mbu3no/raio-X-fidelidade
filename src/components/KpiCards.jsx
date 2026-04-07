import { TrendingUp, Smartphone, Skull, DollarSign, ShoppingCart, Repeat } from 'lucide-react';

export default function KpiCards({ data }) {
  const total = data.length;
  if (total === 0) return null;

  const engajamento = data.filter((c) => c.Resgates > 0).length;
  const digital = data.filter((c) => c.Aplicativo === 'Sim').length;
  const mortos = data.filter((c) => c.DiasInativos > 180).length;
  const receitaTotal = data.reduce((s, c) => s + c.Receita, 0);
  const ticketMedioGeral = data.filter(c => c.TicketMedio > 0).length > 0
    ? data.reduce((s, c) => s + c.TicketMedio, 0) / data.filter(c => c.TicketMedio > 0).length
    : 0;
  const comprasTotal = data.reduce((s, c) => s + c.Compras, 0);

  const kpis = [
    {
      label: 'Taxa de Engajamento',
      value: `${((engajamento / total) * 100).toFixed(1)}%`,
      sub: `${engajamento.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} fizeram resgate`,
      icon: TrendingUp,
      color: '#34d399',
      glow: 'rgba(52, 211, 153, 0.12)',
      ring: 'rgba(52, 211, 153, 0.2)',
    },
    {
      label: 'Adoção Digital',
      value: `${((digital / total) * 100).toFixed(1)}%`,
      sub: `${digital.toLocaleString('pt-BR')} usam o aplicativo`,
      icon: Smartphone,
      color: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.12)',
      ring: 'rgba(96, 165, 250, 0.2)',
    },
    {
      label: 'Mortalidade Base',
      value: mortos.toLocaleString('pt-BR'),
      sub: `Inativos há mais de 180 dias (${((mortos / total) * 100).toFixed(1)}%)`,
      icon: Skull,
      color: '#f87171',
      glow: 'rgba(248, 113, 113, 0.12)',
      ring: 'rgba(248, 113, 113, 0.2)',
    },
    {
      label: 'Receita Total',
      value: receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      sub: `Ticket médio geral: ${ticketMedioGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      icon: DollarSign,
      color: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.12)',
      ring: 'rgba(167, 139, 250, 0.2)',
    },
    {
      label: 'Total de Compras',
      value: comprasTotal.toLocaleString('pt-BR'),
      sub: `Média de ${(comprasTotal / total).toFixed(1)} compras por cliente`,
      icon: ShoppingCart,
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.12)',
      ring: 'rgba(251, 191, 36, 0.2)',
    },
    {
      label: 'Resgates Realizados',
      value: data.reduce((s, c) => s + c.Resgates, 0).toLocaleString('pt-BR'),
      sub: `${engajamento.toLocaleString('pt-BR')} clientes ativos em resgate`,
      icon: Repeat,
      color: '#fb923c',
      glow: 'rgba(251, 146, 60, 0.12)',
      ring: 'rgba(251, 146, 60, 0.2)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`glass-card rounded-2xl p-4 sm:p-6 animate-fade-up stagger-${i + 1}`}
        >
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: kpi.glow, border: `1px solid ${kpi.ring}` }}>
              <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: kpi.color }} />
            </div>
            <span className="text-[--text-muted] text-[11px] sm:text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-num tracking-tight" style={{ color: kpi.color }}>
            {kpi.value}
          </p>
          <p className="text-[--text-muted] text-xs mt-1.5 sm:mt-2">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}
