
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MatchAnalysis } from './components/MatchAnalysis';
import { VeoVideoGen } from './components/VeoVideoGen';
import { HistoryLog } from './components/HistoryLog';
import { LiveOddsBar } from './components/LiveOddsBar';
import { AppTab, SavedPick, MatchAnalysisResult } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYSIS);
  const [savedPicks, setSavedPicks] = useState<SavedPick[]>([]);
  const [liveSyncMatch, setLiveSyncMatch] = useState<MatchAnalysisResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string>('');

  const handleSavePick = (pick: SavedPick) => {
    setSavedPicks(prev => [pick, ...prev]);
  };

  const performSync = async (url: string) => {
    if (!url) return;
    setSyncLoading(true);
    try {
      const result = await GeminiService.analyzeMatch(url);
      setLiveSyncMatch(result);
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleManualSync = () => {
    if (originalUrl) performSync(originalUrl);
  };

  // Efecto para auto-sincronizar si el partido está en vivo (cada 60 segundos para máxima precisión)
  useEffect(() => {
    let interval: any;
    if (liveSyncMatch?.liveStatus?.isLive && originalUrl) {
      interval = setInterval(() => {
        performSync(originalUrl);
      }, 60000); // 1 minuto
    }
    return () => clearInterval(interval);
  }, [liveSyncMatch, originalUrl]);

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      savedCount={savedPicks.length}
    >
      <div className="py-6">
        {activeTab === AppTab.ANALYSIS && (
          <MatchAnalysis 
            onSavePick={handleSavePick} 
            onSyncMatch={(res, url) => {
              setLiveSyncMatch(res);
              if (url) setOriginalUrl(url);
            }}
            currentResult={liveSyncMatch}
          />
        )}
        {activeTab === AppTab.HISTORY && (
          <HistoryLog 
            picks={savedPicks} 
            onClear={() => setSavedPicks([])} 
          />
        )}
        {activeTab === AppTab.VEO && <VeoVideoGen />}
      </div>
      
      <LiveOddsBar 
        data={liveSyncMatch} 
        onRefresh={handleManualSync} 
        loading={syncLoading} 
      />
    </Layout>
  );
};

export default App;
