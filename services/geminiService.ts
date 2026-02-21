
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MatchAnalysisResult, GroundingSource } from "../types";

const PRO_MODEL = 'gemini-3-pro-preview';

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async analyzeMatch(matchUrl: string): Promise<MatchAnalysisResult> {
    const ai = this.getAI();
    const now = new Date();
    const timeString = now.toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    const model = PRO_MODEL;
    const config: any = {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 32768 },
    };

    const prompt = `SISTEMA DE IDENTIFICACIÓN DE APUESTAS DE VALOR (VALUE BETS) - PROTOCOLO DEEP SCAN.
    URL DEL PARTIDO: ${matchUrl}
    HORA ACTUAL: ${timeString}

    INSTRUCCIONES CRÍTICAS DE SINCRONIZACIÓN:
    1. Utiliza Google Search para verificar el estado EN TIEMPO REAL del partido.
    2. Busca en Flashscore, SofaScore, Bet365 o portales de noticias deportivas para obtener:
       - Marcador exacto actual.
       - Minuto de juego.
       - Estadísticas de presión (Ataques peligrosos, posesión).
       - Córners totales y por equipo.
       - Tarjetas y expulsiones.
    3. Si el partido no ha comenzado, analiza las alineaciones confirmadas y las cuotas de apertura vs cuotas actuales.

    OBJETIVOS DE ANÁLISIS:
    1. ESCANEO DE MERCADOS: Evalúa Over 1.5/2.5 goles, BTTS, Doble Oportunidad, Hándicap Asiático, y MERCADOS DE CORNERS (Over/Under corners totales).
    2. FUENTE DE DATOS: Prioriza datos de los últimos 5-10 minutos para partidos en vivo.
    3. CÁLCULO DE VALOR (VALUE):
       - Probabilidad Implícita (PI) = 1 / Cuota actual detectada.
       - Probabilidad Estimada (PE) = Probabilidad real basada en xG live, ataques peligrosos y H2H.
       - EV% = (PE * Cuota) - 1.
    4. FILTRADO: Devuelve ÚNICAMENTE selecciones donde PE > PI (EV positivo). Prioriza cuotas entre 1.50 y 2.50.

    RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
    {
      "matchInfo": "Equipos y Competición",
      "liveStatus": { "score": "X-Y", "minute": "XX'", "isLive": true },
      "predictions": [
        { 
          "market": "Mercado específico", 
          "probability": 0.XX, 
          "impliedProbability": 0.XX, 
          "expectedValue": 0.XX, 
          "isValue": true, 
          "estimatedOdd": X.XX, 
          "currentOdd": X.XX,
          "riskLevel": "Bajo/Medio/Alto",
          "justification": "Por qué este mercado tiene valor estadístico real (xG, corners previstos, etc.)"
        }
      ],
      "conservativeOption": {
        "market": "Opción más conservadora (ej: Over 1.5 en lugar de 2.5)",
        "odd": X.XX,
        "probability": 0.XX
      },
      "rationale": "Resumen estratégico del partido y por qué la recomendación principal es la mejor.",
      "marketConfidence": 0.XX,
      "firstHalf": { "expectedGoals": "X.XX", "insight": "..." },
      "secondHalf": { "expectedGoals": "X.XX", "insight": "..." },
      "fullMatch": { "expectedGoals": "X.XX", "insight": "..." },
      "technicalAudit": {
        "statistics": "Detalle xG y stats live verificadas vía Google Search",
        "context": "Motivación y bajas actualizadas",
        "tactics": "Tendencias H2H y Home/Away",
        "players": "Impacto de jugadores clave",
        "advancedData": "Corners y tarjetas proyectados",
        "marketAnalysis": "Explicación del EV+ detectado comparando cuotas"
      },
      "lastUpdated": "${timeString}"
    }`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    try {
      let cleanedText = response.text || '{}';
      cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanedText);
      
      const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || 'Fuente de Valor',
          uri: chunk.web?.uri || '#'
        }))
        .filter((s: GroundingSource) => s.uri !== '#') || [];

      return { ...data, sources };
    } catch (e) {
      console.error("Error parsing response:", e);
      throw new Error("No se pudo completar el análisis de valor. Verifique la URL.");
    }
  }

  static async generateHypeVideo(imageB64: string, prompt: string, isPortrait: boolean = false) {
    const ai = this.getAI();
    const aspectRatio = isPortrait ? "9:16" : "16:9";
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic value analysis: ${prompt}`,
      image: { imageBytes: imageB64.split(',')[1], mimeType: 'image/png' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    return URL.createObjectURL(await videoResponse.blob());
  }
}
