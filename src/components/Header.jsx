import { Activity, RotateCcw, Sun, Moon } from 'lucide-react';

export default function Header({ lojas, selectedLoja, onLojaChange, onReset, totalClientes, theme, onToggleTheme }) {
  return (
    <header className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-fade-in"
      style={{
        background: `linear-gradient(180deg, var(--surface-1) 0%, transparent 100%)`,
        borderBottom: '1px solid var(--border)',
      }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-glow)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
            Raio-X <span style={{ color: 'var(--accent)' }}>Popfidelidade</span>
          </h1>
          {totalClientes > 0 && (
            <p className="text-xs mt-0.5 font-mono-num" style={{ color: 'var(--text-muted)' }}>
              {totalClientes.toLocaleString('pt-BR')} clientes na base
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <label className="text-xs font-medium uppercase tracking-wider mr-2 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Loja</label>
          <select
            value={selectedLoja}
            onChange={(e) => onLojaChange(e.target.value)}
            className="appearance-none rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-9 text-sm font-medium focus:outline-none transition-all cursor-pointer w-full sm:w-auto min-h-[44px]"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <option value="__todas__">Todas as Lojas</option>
            {lojas.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Toggle Tema */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 sm:p-2 rounded-lg transition-all hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onReset}
          className="p-2.5 sm:p-2 rounded-lg transition-all hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          title="Importar novos arquivos"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
