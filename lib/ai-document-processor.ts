import { Question } from "@/types/generic";

// Define __DEV__ for non-React Native environments
declare global {
  const __DEV__: boolean;
}

// Provide fallback for environments where __DEV__ is not defined
if (typeof (globalThis as any).__DEV__ === 'undefined') {
  try {
    (globalThis as any).__DEV__ = process?.env?.NODE_ENV !== 'production';
  } catch {
    (globalThis as any).__DEV__ = true;
  }
}

export interface AIPromptTemplate {
  context: string;
  count: number;
  additionalInstructions?: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  hint?: string;
  confidence?: number;
}

export interface DocumentAnalysisResult {
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  suggestedCardCount: number;
  keyConcepts: string[];
}

// AI-powered flashcard generation engine
export class AIDocumentProcessor {
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly provider: "ollama" | "groq" | "openai";
  private static instance: AIDocumentProcessor;

  constructor(
    apiKey?: string,
    baseUrl: string = (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_AI_BASE_URL : undefined) || "",
    model: string = (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_AI_MODEL : undefined) || "gemma2:2b",
  ) {
    this.model = model;
    this.baseUrl = baseUrl;
    this.apiKey =
      apiKey ||
      (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_GROQ_API_KEY : undefined) ||
      (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : undefined);

    // Detect provider based on URL
    if (baseUrl.includes("groq.com")) {
      this.provider = "groq";
    } else if (baseUrl.includes("openai.com")) {
      this.provider = "openai";
    } else {
      this.provider = "ollama";
    }

    if (__DEV__) {
      console.log("🤖 AI Document Processor Initialized", {
        provider: this.provider,
        hasBaseUrl: !!this.baseUrl,
        hasApiKey: !!this.apiKey,
        model: this.model,
      });
    }

    // Try HTTPS fallback for React Native security
    if (
      this.baseUrl.startsWith("http://") &&
      typeof globalThis.window !== "undefined" &&
      globalThis.window.location?.protocol === "https:"
    ) {
      if (__DEV__) {
        console.log("🤖 Switching to HTTPS for React Native compatibility");
      }
      this.baseUrl = this.baseUrl.replace("http://", "https://");
    }
  }

  static getInstance(): AIDocumentProcessor {
    if (!AIDocumentProcessor.instance) {
      AIDocumentProcessor.instance = new AIDocumentProcessor();
    }
    return AIDocumentProcessor.instance;
  }

  // Analyze document content to determine optimal flashcard parameters
  public async analyzeDocument(documentText: string): Promise<DocumentAnalysisResult> {
    try {
      const prompt = this.buildDocumentAnalysisPrompt(documentText);
      const response = await this.callAI(prompt);
      return this.parseDocumentAnalysis(response);
    } catch (error) {
      if (__DEV__) {
        console.error("Document analysis failed:", error);
      }
      return this.getFallbackDocumentAnalysis();
    }
  }

  // Generate flashcards from document text
  public async generateFlashcards(
    documentText: string,
    count: number,
    difficulty?: "beginner" | "intermediate" | "advanced",
    topics?: string[]
  ): Promise<GeneratedFlashcard[]> {
    try {
      const prompt = this.buildFlashcardGenerationPrompt(documentText, count, difficulty, topics);
      const response = await this.callAI(prompt);
      return this.parseFlashcards(response, count);
    } catch (error) {
      if (__DEV__) {
        console.error("Flashcard generation failed:", error);
      }
      return this.getFallbackFlashcards(count);
    }
  }

  // Improve and validate existing flashcards
  public async improveFlashcards(flashcards: Question[]): Promise<Question[]> {
    try {
      const prompt = this.buildFlashcardImprovementPrompt(flashcards);
      const response = await this.callAI(prompt);
      return this.parseImprovedFlashcards(response, flashcards);
    } catch (error) {
      if (__DEV__) {
        console.error("Flashcard improvement failed:", error);
      }
      return flashcards; // Return original if improvement fails
    }
  }

  private buildDocumentAnalysisPrompt(documentText: string): string {
    const promptTemplate: AIPromptTemplate = {
      context: `Analyze this document text and provide insights for flashcard creation:

Document Text:
${documentText.substring(0, 2000)}${documentText.length > 2000 ? "..." : ""}

Please analyze and respond with a JSON object containing:
1. topics: Array of main topics covered
2. difficulty: "beginner", "intermediate", or "advanced" 
3. suggestedCardCount: Recommended number of flashcards (5-50)
4. keyConcepts: Array of key concepts that would make good flashcards

Focus on identifying the most important concepts that would benefit from memorization.`,
      count: 1,
      additionalInstructions: "Respond only with valid JSON, no additional text."
    };

    return this.generateAIPrompt(promptTemplate);
  }

  private buildFlashcardGenerationPrompt(
    documentText: string,
    count: number,
    difficulty?: "beginner" | "intermediate" | "advanced",
    topics?: string[]
  ): string {
    const difficultyInstruction = difficulty 
      ? `Create ${difficulty} level flashcards.`
      : "Create appropriately challenging flashcards.";
    
    const topicsInstruction = topics && topics.length > 0
      ? `Focus on these topics: ${topics.join(", ")}.`
      : "";

    const promptTemplate: AIPromptTemplate = {
      context: `Generate ${count} flashcards from this document text:

Document Text:
${documentText.substring(0, 3000)}${documentText.length > 3000 ? "..." : ""}

${difficultyInstruction}
${topicsInstruction}

Create flashcards that test understanding of the most important concepts.`,
      count,
      additionalInstructions: `Respond with a JSON array of objects. Each object must have:
- question: Clear, concise question
- answer: Accurate, complete answer 
- hint: Optional hint for difficult questions
- confidence: Number from 0.1 to 1.0 indicating confidence in quality

Make questions varied and test different aspects of the material.`
    };

    return this.generateAIPrompt(promptTemplate);
  }

  private buildFlashcardImprovementPrompt(flashcards: Question[]): string {
    const flashcardsText = flashcards.map((fc, index) => 
      `${index + 1}. Q: ${fc.question}\n   A: ${fc.answer}${fc.hint ? `\n   Hint: ${fc.hint}` : ''}`
    ).join('\n\n');

    const promptTemplate: AIPromptTemplate = {
      context: `Improve these flashcards to make them more effective for learning:

${flashcardsText}

Please improve them by:
1. Making questions clearer and more specific
2. Ensuring answers are accurate and complete
3. Adding helpful hints where needed
4. Improving the overall learning effectiveness`,
      count: flashcards.length,
      additionalInstructions: `Respond with a JSON array of improved flashcards with the same structure:
- question: Improved question text
- answer: Improved answer text
- hint: Optional hint

Maintain the original intent but improve clarity and effectiveness.`
    };

    return this.generateAIPrompt(promptTemplate);
  }

  private generateAIPrompt(template: AIPromptTemplate): string {
    let prompt = template.context;
    
    if (template.additionalInstructions) {
      prompt += `\n\nAdditional instructions: ${template.additionalInstructions}`;
    }

    return prompt;
  }

  private async callAI(prompt: string): Promise<string> {
    try {
      if (__DEV__) {
        console.log("🤖 AI Document Request:", {
          provider: this.provider,
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 100) + "...",
        });
      }

      const { requestBody, endpoint } = this.buildRequestBody(prompt);
      const headers = this.buildHeaders();

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = this.extractResponseText(data);

      if (!responseText) {
        throw new Error("Invalid AI response format");
      }

      if (__DEV__) {
        console.log("🤖 AI Document Response:", responseText.substring(0, 200) + "...");
      }

      return responseText;
    } catch (error) {
      if (__DEV__) {
        console.error("🤖 AI Document Call Failed:", error);
      }
      throw error;
    }
  }

  private buildRequestBody(prompt: string): { requestBody: any; endpoint: string } {
    if (this.provider === "groq" || this.provider === "openai") {
      return {
        requestBody: {
          model: this.provider === "groq" ? "llama-3.1-8b-instant" : this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        },
        endpoint: this.baseUrl,
      };
    } else {
      return {
        requestBody: {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 2000,
          },
        },
        endpoint: `${this.baseUrl}/api/generate`,
      };
    }
  }

  private buildHeaders(): Record<string, string> {
    const baseHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.provider === "groq" || this.provider === "openai") {
      return {
        ...baseHeaders,
        Authorization: `Bearer ${this.apiKey}`,
      };
    }

    return baseHeaders;
  }

  private extractResponseText(data: any): string {
    if (this.provider === "groq" || this.provider === "openai") {
      return data.choices?.[0]?.message?.content || "";
    }
    return data.response || "";
  }

  private parseDocumentAnalysis(response: string): DocumentAnalysisResult {
    try {
      const jsonMatch = new RegExp(/\{[\s\S]*\}/).exec(response);
      if (!jsonMatch) {
        throw new Error("No JSON object found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        topics: Array.isArray(parsed.topics) ? parsed.topics : ["General"],
        difficulty: parsed.difficulty || "intermediate",
        suggestedCardCount: Math.min(Math.max(parsed.suggestedCardCount || 10, 5), 50),
        keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      };
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to parse document analysis:", error);
      }
      return this.getFallbackDocumentAnalysis();
    }
  }

  private parseFlashcards(response: string, maxCount: number): GeneratedFlashcard[] {
    try {
      const jsonMatch = new RegExp(/\[[\s\S]*\]/).exec(response);
      if (!jsonMatch) {
        throw new Error("No JSON array found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const limitedFlashcards = parsed.slice(0, maxCount);

      return limitedFlashcards.map((item: any, index: number) => ({
        question: item.question || `Question ${index + 1}`,
        answer: item.answer || `Answer ${index + 1}`,
        hint: item.hint,
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.8,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to parse flashcards:", error);
      }
      return this.getFallbackFlashcards(maxCount);
    }
  }

  private parseImprovedFlashcards(response: string, originalFlashcards: Question[]): Question[] {
    try {
      const jsonMatch = new RegExp(/\[[\s\S]*\]/).exec(response);
      if (!jsonMatch) {
        throw new Error("No JSON array found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const limitedFlashcards = parsed.slice(0, originalFlashcards.length);

      return limitedFlashcards.map((item: any, index: number) => ({
        id: originalFlashcards[index]?.id || `improved-${index}`,
        question: item.question || originalFlashcards[index]?.question || `Question ${index + 1}`,
        answer: item.answer || originalFlashcards[index]?.answer || `Answer ${index + 1}`,
        hint: item.hint,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to parse improved flashcards:", error);
      }
      return originalFlashcards;
    }
  }

  private getFallbackDocumentAnalysis(): DocumentAnalysisResult {
    return {
      topics: ["General"],
      difficulty: "intermediate",
      suggestedCardCount: 10,
      keyConcepts: [],
    };
  }

  private getFallbackFlashcards(count: number): GeneratedFlashcard[] {
    return Array.from({ length: Math.min(count, 5) }, (_, index) => ({
      question: `Sample question ${index + 1}`,
      answer: `Sample answer ${index + 1}`,
      hint: "Consider the key concepts",
      confidence: 0.6,
    }));
  }
}

// Export singleton instance
export const aiDocumentProcessor = AIDocumentProcessor.getInstance();
