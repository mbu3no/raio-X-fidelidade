import { Download, Smartphone, AlertTriangle, Gift, Trophy } from 'lucide-react';
import { exportCsv } from '../utils/exportCsv';

const SEGMENT_CONFIG = {
  'Ação Ouro - Baixar App': {
    icon: Smartphone,
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.12)',
    ring: 'rgba(251, 191, 36, 0.25)',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    quemSao: 'Ticket médio acima de R$ 100, mais de 5 compras, mas não usam o aplicativo.',
    acao: 'Enviar campanha para baixar o app — são clientes fiéis que falta digitalizar.',
    regra: 'Ticket > R$100 + Compras > 5 + Sem App',
  },
  'Risco Urgente - Salvar': {
    icon: AlertTriangle,
    color: '#f87171',
    glow: 'rgba(248, 113, 113, 0.12)',
    ring: 'rgba(248, 113, 113, 0.25)',
    gradient: 'linear-gradient(135deg, #dc2626, #f87171)',
    quemSao: 'Receita acima de R$ 500 e estão de 30 a 90 dias sem comprar.',
    acao: 'Contato urgente (SMS, ligação, oferta exclusiva) antes que virem perdidos.',
    regra: 'Receita > R$500 + Inativos 30-90 dias',
  },
  'Forçar Resgate': {
    icon: Gift,
    color: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.12)',
    ring: 'rgba(251, 146, 60, 0.25)',
    gradient: 'linear-gradient(135deg, #c2410c, #f97316)',
    quemSao: 'Mais de 1.000 pontos acumulados, nunca resgataram e estão inativos há +45 dias.',
    acao: 'Avisar que têm saldo disponível para resgate — traz o cliente de volta.',
    regra: 'Saldo > 1.000 + 0 Resgates + Inativos > 45d',
  },
  'Campeões': {
    icon: Trophy,
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.12)',
    ring: 'rgba(52, 211, 153, 0.25)',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    quemSao: 'Mais de 20 compras e compraram nos últimos 15 dias.',
    acao: 'Manter o relacionamento — reconhecer, oferecer benefícios VIP.',
    regra: 'Compras > 20 + Inativos ≤ 15 dias',
  },
};

const SEGMENT_ORDER = ['Ação Ouro - Baixar App', 'Risco Urgente - Salvar', 'Forçar Resgate', 'Campeões'];

function formatBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ActionCards({ data, selectedSegmento, onSelectSegmento }) {
  const segments = SEGMENT_ORDER.map((name) => {
    const clients = data.filter((c) => c.SegmentoAcao === name);
    const receita = clients.reduce((sum, c) => sum + c.Receita, 0);
    return { name, clients, receita, config: SEGMENT_CONFIG[name] };
  });

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-sm sm:text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Listas de Ação</h2>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>
      <p className="text-xs mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
        Cada card abaixo é um grupo de clientes filtrado por regras de negócio. Clique para ver a lista na tabela. Use "Exportar Lista" para gerar o CSV da campanha.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {segments.map((seg, i) => {
          const isSelected = selectedSegmento === seg.name;
          const cfg = seg.config;
          return (
            <div
              key={seg.name}
              onClick={() => onSelectSegmento(isSelected ? null : seg.name)}
              className={`glass-card rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 animate-fade-up stagger-${i + 1}`}
              style={{
                borderColor: isSelected ? cfg.ring : undefined,
                boxShadow: isSelected ? `0 0 30px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.3)` : undefined,
              }}
            >
              {/* Header do card */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: cfg.glow, border: `1px solid ${cfg.ring}` }}>
                  <seg.config.icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {seg.name}
                  </h3>
                  <p className="text-[10px] font-mono-num mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Regra: {cfg.regra}
                  </p>
                </div>
              </div>

              {/* Números */}
              <div className="flex items-baseline gap-4 sm:gap-6 mb-3">
                <div>
                  <p className="text-2xl font-extrabold font-mono-num tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {seg.clients.length.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>clientes</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-mono-num" style={{ color: cfg.color }}>
                    {formatBRL(seg.receita)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>receita em jogo</p>
                </div>
              </div>

              {/* Explicação */}
              <div className="rounded-xl p-3 mb-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Quem são:</strong> {cfg.quemSao}
                </p>
                <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: cfg.color }}>O que fazer:</strong> {cfg.acao}
                </p>
              </div>

              {/* Botão */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportCsv(seg.clients, `${seg.name.replace(/\s/g, '_')}.csv`);
                }}
                className="w-full text-white text-xs font-semibold py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] min-h-[44px]"
                style={{ background: cfg.gradient }}
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Lista para Campanha
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
