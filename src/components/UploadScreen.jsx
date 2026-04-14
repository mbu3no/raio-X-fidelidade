import { Upload, FileSpreadsheet, Loader2, Zap, Sun, Moon, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useState, useRef } from 'react';
import { parseFile, detectFileType } from '../utils/processData';

const TIPO_META = {
  ativos:       { label: 'Ativos',    color: '#10b981', Icon: CheckCircle2 },
  inativos:     { label: 'Inativos',  color: '#f59e0b', Icon: AlertCircle },
  ambos:        { label: 'Ativos + Inativos', color: '#a78bfa', Icon: Users },
  desconhecido: { label: 'Tipo não identificado', color: '#94a3b8', Icon: AlertCircle },
  vazio:        { label: 'Arquivo vazio', color: '#ef4444', Icon: AlertCircle },
  erro:         { label: 'Erro ao ler',   color: '#ef4444', Icon: AlertCircle },
};

export default function UploadScreen({ onFilesReady, theme, onToggleTheme }) {
  const [files, setFiles] = useState([]); // { file, detect: {tipo,total,ativos,inativos} | null }
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  async function addFiles(list) {
    const valid = [...list].filter((f) => /\.(csv|xlsx|xls)$/i.test(f.name));
    const entries = valid.map((file) => ({ file, detect: null }));
    setFiles((prev) => [...prev, ...entries]);

    // Detecta tipo em paralelo
    entries.forEach(async (entry) => {
      try {
        const rows = await parseFile(entry.file);
        const detect = detectFileType(rows);
        setFiles((prev) =>
          prev.map((e) => (e.file === entry.file ? { ...e, detect } : e))
        );
      } catch {
        setFiles((prev) =>
          prev.map((e) => (e.file === entry.file ? { ...e, detect: { tipo: 'erro', total: 0 } } : e))
        );
      }
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleSelect(e) {
    addFiles(e.target.files);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleProcess() {
    if (files.length === 0) return;
    setLoading(true);
    try {
      await onFilesReady(files.map((e) => e.file));
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden"
      style={{ background: 'var(--surface-0)' }}>
      {/* Toggle tema */}
      <button
        onClick={onToggleTheme}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-xl transition-all hover:scale-105 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
        style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />

      <div className="w-full max-w-lg relative z-10 animate-fade-up">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 sm:mb-6 tracking-wider uppercase"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Zap className="w-3 h-3" />
            Dashboard de Ação
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Pop<span style={{ color: 'var(--accent)' }}>fidelidade</span>
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Importe os arquivos CSV ou Excel da plataforma para gerar seu raio-x de clientes.
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="glass-card rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300"
          style={{
            borderColor: dragOver ? 'rgba(167,139,250,0.5)' : undefined,
            boxShadow: dragOver ? '0 0 40px rgba(167,139,250,0.15)' : undefined,
          }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Arraste os arquivos CSV ou Excel aqui</p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>ou clique para selecionar</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 sm:mt-5 space-y-2 animate-fade-up">
            {files.map((entry, i) => {
              const f = entry.file;
              const d = entry.detect;
              const meta = d ? TIPO_META[d.tipo] : null;
              const BadgeIcon = meta?.Icon;
              return (
                <div key={i} className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                      <span className="font-mono-num text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="hover:text-red-400 text-xs transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Remover
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {!d ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analisando...
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                          style={{ background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}40` }}>
                          <BadgeIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                        {d.total > 0 && (
                          <span className="font-mono-num text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {d.total} registros
                            {d.tipo === 'ambos' && ` • ${d.ativos} ativos / ${d.inativos} inativos`}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full mt-3 sm:mt-4 font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]"
              style={{
                background: loading ? 'var(--surface-3)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: 'white',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(124, 58, 237, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Processar {files.length} arquivo{files.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
