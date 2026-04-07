import { useState, useMemo, useEffect } from 'react';
import { parseFile, processFiles } from './utils/processData';
import UploadScreen from './components/UploadScreen';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import SegmentDistribution from './components/SegmentDistribution';
import ActionCards from './components/ActionCards';
import BehaviorSection from './components/BehaviorSection';
import StoreBreakdown from './components/StoreBreakdown';
import ClientTable from './components/ClientTable';

export default function App() {
  const [allData, setAllData] = useState(null);
  const [selectedLoja, setSelectedLoja] = useState('__todas__');
  const [selectedSegmento, setSelectedSegmento] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('pop-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pop-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  async function handleFilesReady(files) {
    const parsed = await Promise.all(files.map(parseFile));
    const processed = processFiles(parsed);
    setAllData(processed);
  }

  function handleReset() {
    setAllData(null);
    setSelectedLoja('__todas__');
    setSelectedSegmento(null);
  }

  const lojas = useMemo(() => {
    if (!allData) return [];
    return [...new Set(allData.map((c) => c.Loja).filter(Boolean))].sort();
  }, [allData]);

  const filteredData = useMemo(() => {
    if (!allData) return [];
    if (selectedLoja === '__todas__') return allData;
    return allData.filter((c) => c.Loja === selectedLoja);
  }, [allData, selectedLoja]);

  if (!allData) {
    return <UploadScreen onFilesReady={handleFilesReady} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
      <Header
        lojas={lojas}
        selectedLoja={selectedLoja}
        onLojaChange={setSelectedLoja}
        onReset={handleReset}
        totalClientes={filteredData.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <KpiCards data={filteredData} />
        <SegmentDistribution data={filteredData} />
        <ActionCards
          data={filteredData}
          selectedSegmento={selectedSegmento}
          onSelectSegmento={setSelectedSegmento}
        />
        <BehaviorSection data={filteredData} />
        <StoreBreakdown data={filteredData} />
        <ClientTable data={filteredData} segmento={selectedSegmento} />
      </main>
    </div>
  );
}
