
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

export const VeoVideoGen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    setError(null);
    try {
      const url = await GeminiService.generateHypeVideo(image, prompt, aspectRatio === '9:16');
      setVideoUrl(url);
    } catch (err: any) {
      if (err.message?.includes('Requested entity was not found')) {
        setHasKey(false);
      }
      setError(err.message || 'La generación de video falló.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Generador de Video Veo</h2>
        <p className="text-slate-400">
          Para generar videos cinematográficos con IA usando Veo, necesitas seleccionar una API key con facturación habilitada.
        </p>
        <button 
          onClick={handleSelectKey}
          className="px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          Seleccionar API Key de AI Studio
        </button>
        <p className="text-xs text-slate-500">
          Requiere un proyecto de GCP de pago. Ver <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">documentación</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Anima Momentos del Partido</h2>
        <p className="text-slate-400">Sube una foto de un jugador, estadio o momento y mira cómo Veo le da vida.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Foto de Origen</label>
            <div className="relative border-2 border-dashed border-slate-800 rounded-2xl p-4 bg-slate-900/50 hover:bg-slate-900 transition-colors">
              {image ? (
                <div className="relative group">
                  <img src={image} className="w-full aspect-video object-cover rounded-lg" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Subir Imagen
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Prompt de IA</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej. La multitud se vuelve loca mientras el delantero anota un cabezazo en el último minuto..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex flex-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                16:9 HORIZONTAL
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                9:16 VERTICAL
              </button>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading || !image || !prompt}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : 'Animar con Veo'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm italic">{error}</p>}
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-emerald-400 font-medium text-lg animate-pulse">Veo está imaginando tu video...</p>
              <p className="text-slate-500 text-sm px-10">Esto puede tomar 2-3 minutos. Generación de video de alta calidad en progreso.</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full space-y-4">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className={`w-full max-h-[600px] object-contain rounded-2xl shadow-2xl ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}
              />
              <a 
                href={videoUrl} 
                download="video-hype.mp4"
                className="block text-center text-sm text-emerald-400 hover:underline"
              >
                Descargar Obra Maestra
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-600 space-y-2">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <p className="font-medium">Vista Previa del Video</p>
              <p className="text-xs">El contenido cinematográfico generado aparecerá aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
