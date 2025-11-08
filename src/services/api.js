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

      console.log('   Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('   Response error text:', errorText);
        throw new Error(`Analysis Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Analysis Response:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Analysis API Error:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      console.log('🔍 Checking backend health...');
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('   Health status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
};