import { GoogleGenAI } from "@google/genai";

// Gemini API Service
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export class GeminiService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenAI({ apiKey });
      this.model = "gemini-2.0-flash";
    }
    
    this.listAvailableModels();
  }

  async listAvailableModels() {
    try {
      const models = await this.genAI.models.list();
      console.log("Available Gemini Models:", models);
      return models;
    } catch (error) {
      console.error("Error listing models:", error);
      return null;
    }
  }

  async generateContent(prompt, context = {}) {
    if (!this.genAI || !this.model) {
      return {
        success: false,
        error: 'Gemini API is not configured. Please check your environment variables.',
        response: 'I apologize, but the AI service is not properly configured. Please contact support.',
      };
    }

    try {
      const systemPrompt = `You are an AI assistant specializing in heatwave forecasting and weather analysis for India. You have access to real-time heatwave data including:

- Temperature predictions for various regions
- Heatwave probability scores
- Risk assessments and safety recommendations
- Historical weather patterns
- Geographic coordinates and location data

Your role is to:
1. Provide accurate heatwave information and safety advice
2. Analyze weather patterns and risks
3. Give location-specific recommendations
4. Help users understand heatwave risks and precautions
5. When mentioning coordinates, always provide them in format: "lat: XX.XXXX, lng: XX.XXXX"
6. Be helpful, clear, and prioritize safety

Current context:
- User location: ${context.userLocation ? `${context.userLocation.lat}, ${context.userLocation.lng}` : "Not available"}
- Current temperature data: ${context.currentData ? `${context.currentData.length} regions available` : "Loading..."}
- Heatwave alerts: ${context.heatwaveAlerts || "None active"}

User question: ${prompt}`;

      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: systemPrompt,
      });

      const response = result.text;

      return {
        success: true,
        response: response,
        coordinates: this.extractCoordinates(response),
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        success: false,
        error: "Failed to get AI response. Please try again.",
        response:
          "I apologize, but I'm having trouble connecting right now. Please try your question again.",
      };
    }
  }

  extractCoordinates(text) {
    const coordPattern = /lat:\s*(-?\d+\.?\d*),?\s*lng:\s*(-?\d+\.?\d*)/gi;
    const matches = text.match(coordPattern);

    if (matches && matches.length > 0) {
      const coords = [];
      matches.forEach((match) => {
        const numbers = match.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length >= 2) {
          coords.push({
            lat: parseFloat(numbers[0]),
            lng: parseFloat(numbers[1]),
          });
        }
      });
      return coords;
    }

    // Also look for common coordinate patterns
    const latLngPattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g;
    const latLngMatches = text.match(latLngPattern);

    if (latLngMatches && latLngMatches.length > 0) {
      const coords = [];
      latLngMatches.forEach((match) => {
        const numbers = match.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length >= 2) {
          const lat = parseFloat(numbers[0]);
          const lng = parseFloat(numbers[1]);
          // Valid lat/lng ranges
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            coords.push({ lat, lng });
          }
        }
      });
      return coords;
    }

    return null;
  }

  async getHeatwaveSummary(data, userLocation) {
    const regions = data?.slice(0, 10) || [];
    const highRiskRegions = regions.filter((r) => r.hw_prob > 0.6);
    const avgTemp =
      regions.reduce((sum, r) => sum + (r.tmax_pred || 0), 0) / regions.length;

    const prompt = `Provide a brief heatwave summary for India based on this data:
    - Average temperature: ${avgTemp.toFixed(1)}°C
    - High-risk regions: ${highRiskRegions.length}
    - Regions monitored: ${regions.length}
    - User location: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : "Unknown"}
    
    Give a concise summary with key insights and safety recommendations.`;

    return this.generateContent(prompt, { userLocation, currentData: data });
  }

  async analyzeLocationRisk(lat, lng, data) {
    const nearbyData = data?.filter((point) => {
      const distance = this.calculateDistance(lat, lng, point.lat, point.lon);
      return distance < 100; // Within 100km
    });

    const prompt = `Analyze heatwave risk for coordinates lat: ${lat}, lng: ${lng}
    
    Nearby data points: ${nearbyData?.length || 0}
    ${
      nearbyData
        ?.slice(0, 3)
        .map(
          (p) =>
            `- ${p.region_name}: ${p.tmax_pred}°C, ${(p.hw_prob * 100).toFixed(0)}% risk`,
        )
        .join("\n") || "No nearby data"
    }
    
    Provide specific risk assessment and safety recommendations for this location.`;

    return this.generateContent(prompt, {});
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const geminiService = new GeminiService();
