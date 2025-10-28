import { GoogleGenerativeAI, Chat, Part } from "@google/genai";
import { FileData } from "../types";

let chat: Chat | null = null;

function getChatInstance(): Chat {
  if (!chat) {
    // This is a placeholder for the API key. In a real environment, 
    // it's crucial to secure this key and not expose it in client-side code.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }

    const ai = new GoogleGenerativeAI({ apiKey });
    
    // Use a model that supports vision capabilities
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and friendly chatbot named MGAI. Provide clear, concise, and accurate answers. When analyzing images, describe them in detail.',
      }
    });
  }
  return chat;
}

export async function sendMessageToAI(message: string, file?: FileData | null): Promise<string> {
  try {
    const chatInstance = getChatInstance();
    
    const parts: (string | Part)[] = [];

    if (file) {
      parts.push({
        inlineData: {
          data: file.base64,
          mimeType: file.mimeType,
        }
      });
    }

    if (message) {
       parts.push({ text: message });
    } else if (file) {
      // Add a default prompt if only an image is sent
      parts.push({ text: "What do you see in this image?" });
    }

    const response = await chatInstance.sendMessage(parts);
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini API:", error);
    // In case of an error, we might want to reset the chat session
    // chat = null; 
    throw new Error("Failed to get a response from the AI. Please check your API key and connection.");
  }
}