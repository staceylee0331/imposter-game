import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameData } from "../types";

// Fallback data in case API fails or key is missing
const FALLBACK_SCENARIOS: GameData[] = [
  {
    location: "Space Station",
    roles: ["Commander", "Engineer", "Alien Tourist", "Maintenance Bot", "Pilot", "Scientist", "Spy"]
  },
  {
    location: "Pirate Ship",
    roles: ["Captain", "First Mate", "Cook", "Powder Monkey", "Prisoner", "Parrot Keeper", "Navigator"]
  },
  {
    location: "Supermarket",
    roles: ["Cashier", "Manager", "Shoplifter", "Butcher", "Janitor", "Sample Lady", "Lost Child"]
  }
];

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    location: {
      type: Type.STRING,
      description: "The location where the game takes place (e.g., 'Submarine', 'Jazz Club').",
    },
    roles: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "A list of unique roles for the players at this location.",
    },
  },
  required: ["location", "roles"],
};

export const generateGameScenario = async (theme: string, roleCount: number): Promise<GameData> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API Key not found, using fallback data.");
      return getRandomFallback(roleCount);
    }

    const prompt = `
      Create a unique location and a list of roles for a game of 'Imposter' (Spyfall).
      Theme: ${theme}.
      Number of non-imposter players (roles needed): ${roleCount}.
      The location should be specific and evocative.
      The roles should be distinct and fit the location naturally.
      Provide exactly ${roleCount} roles.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
        systemInstruction: "You are a creative game master for a social deduction party game.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");

    const data = JSON.parse(text) as GameData;
    
    // Validate we got enough roles, if not, fill with generic ones
    if (data.roles.length < roleCount) {
      const diff = roleCount - data.roles.length;
      for (let i = 0; i < diff; i++) {
        data.roles.push("Bystander");
      }
    }
    
    return data;

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return getRandomFallback(roleCount);
  }
};

export const generateQuestionSuggestion = async (location: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "What is your job here?";

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a single, vague, suspicious question a player might ask in the game 'Spyfall' where the location is '${location}'. The question should be subtle enough not to reveal the location immediately but specific enough to trap an imposter. Just the question string.`,
    });
    
    return response.text?.trim() || "Do you come here often?";
  } catch (e) {
    return "How did you get here today?";
  }
};

const getRandomFallback = (count: number): GameData => {
  const scenario = FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];
  // Ensure we have enough roles by duplicating or slicing
  let roles = [...scenario.roles];
  if (roles.length < count) {
     // Pad if not enough
     while(roles.length < count) roles.push("Visitor");
  }
  return {
    location: scenario.location,
    roles: roles.slice(0, count)
  };
};