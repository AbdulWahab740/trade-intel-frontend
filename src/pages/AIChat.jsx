import { useState, useEffect, useRef } from 'react';
import { Send, User, TrendingUp, BarChart2, Target, Lightbulb, Clock, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import Plot from 'react-plotly.js';
import { agentService } from '../services/api';

const AI_AGENTS = [
  {
    id: 'dataset',
    name: 'Dataset Analyst',
    role: 'CSV Data Expert',
    avatar: '📊',
    description: 'Analyzes Pakistan import/export data from CSV',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'expert',
    name: 'Economics Expert',
    role: 'Trade Economist',
    avatar: '🌍',
    description: 'Provides economic insights and recommendations',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

function AIChat() {
  // Session management
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(new Date());
  const [planningInsights, setPlanningInsights] = useState([]);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'dataset',
      text: 'Hello! I\'m the Dataset Analyst. I can analyze Pakistan\'s import/export data from the CSV file. Ask me about specific commodities, groups, months, or values!',
      timestamp: new Date()
    },
    {
      id: 2,
      sender: 'expert',
      text: 'And I\'m the Economics Expert! I provide strategic insights, economic analysis, and recommendations based on the data. Together, we\'ll give you comprehensive trade intelligence!',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [plotlyChart, setPlotlyChart] = useState(null);
  const messagesEndRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await agentService.healthCheck();
      setBackendStatus(isHealthy ? 'connected' : 'disconnected');
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('Backend health check failed:', error);
    }
  };

  // Extract planning and development insights from conversation
  const extractPlanningInsights = (messages) => {
    const insights = [];
    const expertMessages = messages.filter(m => m.sender === 'expert');
    
    expertMessages.forEach(msg => {
      const text = msg.text.toLowerCase();
      if (text.includes('recommend') || text.includes('strategy') || text.includes('plan') || text.includes('development')) {
        insights.push({
          id: msg.id,
          text: msg.text,
          timestamp: msg.timestamp,
          type: 'recommendation'
        });
      }
      if (text.includes('comparison') || text.includes('benchmark') || text.includes('competitive')) {
        insights.push({
          id: msg.id + '_comparison',
          text: msg.text,
          timestamp: msg.timestamp,
          type: 'comparison'
        });
      }
    });

    // Also check for growth/trend insights
    const growthMessages = messages.filter(m => 
      m.text.toLowerCase().includes('growth') || 
      m.text.toLowerCase().includes('trend') ||
      m.text.toLowerCase().includes('opportunity')
    );
    
    growthMessages.forEach(msg => {
      if (!insights.find(i => i.id === msg.id)) {
        insights.push({
          id: msg.id + '_growth',
          text: msg.text,
          timestamp: msg.timestamp,
          type: 'opportunity'
        });
      }
    });

    return insights.slice(-5); // Keep last 5 insights
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract planning insights from messages
  useEffect(() => {
    const insights = extractPlanningInsights(messages);
    setPlanningInsights(insights);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (backendStatus !== 'connected') {
      setError('Backend is not connected. Please ensure the FastAPI server is running.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const query = input;
    setInput('');

    // Build conversation history
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      agent: msg.sender !== 'user' ? msg.sender : undefined
    }));

    try {
      console.log('🚀 Calling unified analysis endpoint...');
      
      // Call the single unified endpoint
      const response = await agentService.Analysis_response(query, conversationHistory);
      
      console.log('✅ Analysis response received:', response);

      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      // Extract responses from the data object
      const csvResponse = response.data?.csv_response || response.response;
      const economicsResponse = response.data?.economics_response;
      const graphResponse = response.data?.graph_response;

      // Add Dataset Analyst message
      if (csvResponse) {
        const datasetMessage = {
          id: Date.now() + 1,
          sender: 'dataset',
          text: csvResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, datasetMessage]);
      }

      // Wait a bit for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Add Economics Expert message
      if (economicsResponse) {
        const expertMessage = {
          id: Date.now() + 2,
          sender: 'expert',
          text: economicsResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, expertMessage]);
      }

      // Handle graph visualization if available
      if (graphResponse && graphResponse.chart_json) {
        console.log('📊 Chart data received:', graphResponse);
        setPlotlyChart(graphResponse.chart_json);
      }

      setIsLoading(false);
      console.log('✅ Analysis completed successfully!');

    } catch (error) {
      console.error('❌ Analysis error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 3,
        sender: 'dataset',
        text: `I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      }]);
      setIsLoading(false);
      setError(error.message);
    }
  };

  const getAgentInfo = (senderId) => {
    return AI_AGENTS.find(agent => agent.id === senderId) || AI_AGENTS[0];
  };

  const getSessionDuration = () => {
    const diff = new Date() - sessionStartTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleNewSession = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header with Session Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">AI Trade Analytics Chat</h2>
            <p className="text-gray-600 mt-1">Dual-agent analysis with interactive visualizations</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Session ID</div>
              <div className="text-sm font-mono text-gray-700 font-semibold">{sessionId.substring(0, 20)}...</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-700">{getSessionDuration()}</div>
              </div>
            </div>
            <button
              onClick={handleNewSession}
              className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">New Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Status Alert */}
      {backendStatus !== 'connected' && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Backend Connection Issue</h4>
              <p className="text-sm text-yellow-800 mt-1">
                {backendStatus === 'checking' 
                  ? 'Checking backend connection...'
                  : 'Cannot connect to FastAPI backend. Make sure the server is running on http://localhost:8000'
                }
              </p>
              <button 
                onClick={checkBackendHealth}
                className="text-sm text-yellow-700 underline mt-2 hover:text-yellow-900"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-800 mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-sm text-red-700 underline mt-2 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Agents Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_AGENTS.map(agent => (
          <div
            key={agent.id}
            className={`card transition-all hover:shadow-lg ${
              backendStatus === 'connected' 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'ring-2 ring-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div className="text-4xl mr-4">{agent.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    backendStatus === 'connected'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {backendStatus === 'connected' ? 'Active' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{agent.role}</p>
                <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 card h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {messages.filter(m => m.sender === 'user').length} questions asked
            </span>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map(message => {
              const isUser = message.sender === 'user';
              const agentInfo = !isUser ? getAgentInfo(message.sender) : null;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-[85%] ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isUser 
                        ? 'bg-green-600 ml-2' 
                        : agentInfo?.color + ' mr-2'
                    }`}>
                      {isUser ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-lg">{agentInfo?.avatar}</span>
                      )}
                    </div>
                    <div className={`rounded-lg px-4 py-3 ${
                      isUser
                        ? 'bg-green-600 text-white'
                        : message.isError
                          ? 'bg-red-50 text-gray-900 border border-red-200'
                          : `${agentInfo?.bgLight} text-gray-900 border ${agentInfo?.borderColor}`
                    }`}>
                      {!isUser && (
                        <div className={`text-xs font-semibold mb-1 ${agentInfo?.textColor}`}>
                          {agentInfo?.name}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${isUser ? 'opacity-70' : 'opacity-60'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Agents are analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={
                backendStatus !== 'connected'
                  ? "Backend offline..."
                  : isLoading 
                    ? "Agents are responding..." 
                    : "Ask about imports, exports, trends..."
              }
              disabled={isLoading || backendStatus !== 'connected'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || backendStatus !== 'connected'}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Planning Insights & Visualizations */}
        <div className="space-y-6">
          {/* Planning & Development Insights Panel */}
          <div className="card h-[280px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Planning Insights</h3>
            </div>
            
            {planningInsights.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3">
                {planningInsights.map((insight, idx) => (
                  <div
                    key={insight.id || idx}
                    className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {insight.type === 'recommendation' && <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                      {insight.type === 'comparison' && <BarChart2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                      {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        {insight.type === 'recommendation' ? 'Strategy' : insight.type === 'comparison' ? 'Comparison' : 'Opportunity'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{insight.text}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {insight.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Planning insights will appear here</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ask strategic questions to generate recommendations
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Plotly Visualization Panel */}
          <div className="card h-[310px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Visualization</h3>
            </div>
            
            {plotlyChart ? (
              <div className="flex-1 overflow-hidden">
                <Plot
                  data={plotlyChart.data}
                  layout={{
                    ...plotlyChart.layout,
                    autosize: true,
                    margin: { t: 40, r: 20, b: 40, l: 50 }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Ask questions to generate visualizations</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try: "Show June imports" or "Compare groups"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setInput('What is the most valued import in June 2025?')}
            disabled={backendStatus !== 'connected'}
            className="btn-secondary text-left disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Most valued June import?
          </button>
          <button
            onClick={() => setInput('Show me Food Group imports by quantity')}
            disabled={backendStatus !== 'connected'}
            className="btn-secondary text-left disabled:opacity-50"
          >
            <BarChart2 className="w-4 h-4 inline mr-2" />
            Food Group analysis
          </button>
          <button
            onClick={() => setInput('Compare all groups and visualize')}
            disabled={backendStatus !== 'connected'}
            className="btn-secondary text-left disabled:opacity-50"
          >
            <BarChart2 className="w-4 h-4 inline mr-2" />
            Compare & visualize
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChat;