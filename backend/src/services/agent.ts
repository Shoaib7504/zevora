import { generateText } from './gemini';
import { Product } from '../models';

export type AgentIntent = 'RECOMMENDATION' | 'COMPARISON' | 'ADVISOR';

interface AgentResponse {
  intent: AgentIntent;
  response: string;
  products: any[];
}

/**
 * Detect User Query Intent using Gemini Flash
 */
export async function detectIntent(query: string): Promise<AgentIntent> {
  const intentPrompt = `
    You are an AI router for an e-commerce platform. Your job is to classify the user query into one of three intents.
    
    Intents:
    - RECOMMENDATION: User wants suggestions, ideas, or recommendations of products (e.g. "recommend me a keyboard", "best accessories", "what fitness products do you have?").
    - COMPARISON: User wants to compare two or more products or brands (e.g. "compare keyboard vs headphones", "should I buy the backpack or the headphones?", "is the bottle better than the backpack?").
    - ADVISOR: User is asking about specific features, details, stock, or ratings of a single product (e.g. "what is the price of the keyboard?", "does the bottle have a warranty?", "is the headphones ratings good?").

    Output only the classification word (RECOMMENDATION, COMPARISON, or ADVISOR) in uppercase. Do not output anything else.
    User query: "${query}"
  `;
  
  try {
    const response = await generateText(intentPrompt);
    const cleanedResponse = response.trim().toUpperCase();
    
    if (cleanedResponse.includes('RECOMMENDATION')) return 'RECOMMENDATION';
    if (cleanedResponse.includes('COMPARISON')) return 'COMPARISON';
    return 'ADVISOR';
  } catch (error) {
    console.error('[Agent Layer Error]: Intent detection failed, falling back to ADVISOR. Error:', error);
    return 'ADVISOR'; // fallback
  }
}

/**
 * Retrieve MongoDB Context based on User query and intent
 */
export async function retrieveContext(query: string, intent: AgentIntent): Promise<any[]> {
  try {
    const allProducts = await Product.find().lean().limit(15);
    if (allProducts.length === 0) return [];

    const normalizedQuery = query.toLowerCase();

    // 1. Recommendation Context Retrieval
    if (intent === 'RECOMMENDATION') {
      const categories = ['Electronics', 'Accessories', 'Audio', 'Fitness'];
      let matchedCategory = '';
      for (const cat of categories) {
        if (normalizedQuery.includes(cat.toLowerCase())) {
          matchedCategory = cat;
          break;
        }
      }

      if (matchedCategory) {
        return await Product.find({ category: matchedCategory }).lean().limit(4);
      }

      // Search keyword matches
      const keywords = normalizedQuery.split(/\s+/);
      const textMatches = allProducts.filter(p =>
        keywords.some(word => 
          word.length > 2 && (
            p.name.toLowerCase().includes(word) || 
            p.description.toLowerCase().includes(word) ||
            p.category.toLowerCase().includes(word)
          )
        )
      );

      if (textMatches.length > 0) return textMatches.slice(0, 4);
      // Fallback to top rated products
      return await Product.find().sort({ 'ratings.average': -1 }).lean().limit(4);
    }

    // 2. Comparison Context Retrieval
    if (intent === 'COMPARISON') {
      const matches = allProducts.filter(p => 
        normalizedQuery.includes(p.name.toLowerCase()) || 
        normalizedQuery.includes(p.category.toLowerCase())
      );
      if (matches.length > 0) return matches.slice(0, 3);
      // Fallback: return top 3 products
      return allProducts.slice(0, 3);
    }

    // 3. Advisor Context Retrieval
    const singleMatch = allProducts.filter(p => 
      normalizedQuery.includes(p.name.toLowerCase())
    );
    if (singleMatch.length > 0) return [singleMatch[0]];
    // Fallback: return first product
    return [allProducts[0]];
  } catch (error) {
    console.error('[Agent Layer Error]: Context retrieval failed. Error:', error);
    return [];
  }
}

/**
 * Orchestrate Agent Execution Flow
 */
export async function executeAgentFlow(query: string): Promise<AgentResponse> {
  // Step 1: Detect intent
  const intent = await detectIntent(query);

  // Step 2: Retrieve context products
  const products = await retrieveContext(query, intent);

  // Step 3: Build Prompt
  let systemInstructions = '';
  if (intent === 'RECOMMENDATION') {
    systemInstructions = `
      You are the E-Shop Recommendation Agent.
      Your goal is to suggest products from the provided catalog context based on the user's requirements.
      
      Retrieved Catalog Context:
      ${JSON.stringify(products, null, 2)}
      
      User Request: "${query}"
      
      Instructions:
      - Recommend the most relevant products from the context.
      - Explain why they are a good match for the user's request.
      - Present price and rating stats.
      - Format your response in clean Markdown.
      - Do not invent products outside the provided catalog context.
    `;
  } else if (intent === 'COMPARISON') {
    systemInstructions = `
      You are the E-Shop Comparison Agent.
      Your goal is to compare the products in the retrieved context to help the user choose.
      
      Retrieved Catalog Context:
      ${JSON.stringify(products, null, 2)}
      
      User Request: "${query}"
      
      Instructions:
      - Compare their features, pricing, and ratings.
      - Output a clean Markdown comparison table comparing columns: Product, Price, Category, and Average Rating.
      - Provide a clear summary and suggest which product the user should select based on their query.
      - Do not invent specs outside the provided catalog context.
    `;
  } else {
    systemInstructions = `
      You are the E-Shop Product Advisor Agent.
      Your goal is to answer specific questions about the products in the retrieved context.
      
      Retrieved Catalog Context:
      ${JSON.stringify(products, null, 2)}
      
      User Request: "${query}"
      
      Instructions:
      - Answer the user's specific questions accurately using the provided catalog context details.
      - Include price, rating, and stock status in your answer if relevant.
      - Keep your answer direct, professional, and helpful.
      - Format in clean Markdown.
      - Do not invent details outside the provided catalog context.
    `;
  }

  // Step 4 & 5: Run Gemini and format response
  try {
    const textResponse = await generateText(systemInstructions);
    return {
      intent,
      response: textResponse,
      products
    };
  } catch (error: any) {
    console.error('[Agent Layer Error]: Agent execution failed. Error:', error);
    return {
      intent,
      response: `I'm sorry, I encountered an error while processing your request: ${error.message}. Please try again.`,
      products
    };
  }
}
