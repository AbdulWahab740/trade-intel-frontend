// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trade-edge-pk.onrender.com';

export const agentService = {
  // Single unified analysis endpoint
  async Analysis_response(query, conversationHistory = []) {
    
    try {
      const requestBody = {
        query,
        conversation_history: conversationHistory
      };
      
      
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        throw new Error(`Analysis Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
    
      return data;
      
    } catch (error) {
    
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
     
      return response.ok;
    } catch (error) {
      
      return false;
    }
  }
};