import { useState, useEffect, useRef } from 'react';
import { Send, User, TrendingUp, BarChart2, Target, Lightbulb, Clock, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getMonthlyAggregates, initTradeData, isDataInitialized } from '../data/tradeData';

const AI_AGENTS = [
  {
    id: 'dataset',
    name: 'Dataset Analyst',
    role: 'Analyzes trade data',
    avatar: '📊',
    description: 'Provides factual insights from the dataset',
    color: 'bg-blue-600',
    textColor: 'text-blue-600'
  },
  {
    id: 'expert',
    name: 'Trade Expert',
    role: 'Global trade analyst',
    avatar: '🌍',
    description: 'Compares with international benchmarks',
    color: 'bg-purple-600',
    textColor: 'text-purple-600'
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
      text: 'Hello! I\'m the Dataset Analyst. I can help you analyze Pakistan\'s trade data with factual insights from the dataset.',
      timestamp: new Date()
    },
    {
      id: 2,
      sender: 'expert',
      text: 'And I\'m the Trade Expert! I can provide international comparisons and strategic recommendations. We\'re both here to help!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    datasetAnalystKey: null,
    tradeExpertKey: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const messagesEndRef = useRef(null);

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

  // Initialize trade data and fetch API keys when component mounts
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize trade data if not already initialized
        if (!isDataInitialized()) {
          await initTradeData();
        }
        
        // Get monthly data for charts
        const monthly = getMonthlyAggregates();
        if (monthly && monthly.length > 0) {
          const formattedData = monthly.map(item => ({
            month: item.month,
            Exports: Math.round(item.totalExportsPKR / 1000000),
            Imports: Math.round(item.totalImportsPKR / 1000000),
          }));
          setChartData(formattedData);
          setDataInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing trade data:', error);
        // Set empty data to prevent errors
        setChartData([]);
        setDataInitialized(false);
      }
    };

    initializeData();

    // TODO: Replace with actual backend API call
    // fetch('/api/agents/keys')
    //   .then(res => res.json())
    //   .then(data => setApiKeys({
    //     datasetAnalystKey: data.datasetAnalystKey,
    //     tradeExpertKey: data.tradeExpertKey
    //   }));

    // For now, simulate API keys (will be replaced when backend is connected)
    setApiKeys({
      datasetAnalystKey: 'temp_dataset_key',
      tradeExpertKey: 'temp_expert_key'
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message
    setMessages(prev => {
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: input,
        timestamp: new Date()
      };
      return [...prev, userMessage];
    });
    
    const query = input;
    setInput('');

    // Get responses from both agents
    await handleAgentResponses(query);
  };

  const handleAgentResponses = async (query) => {
    // In production, these would be API calls to backend with their respective API keys
    // Example API call structure:
    // 
    // const datasetResponse = await fetch('/api/agents/dataset-analyst', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKeys.datasetAnalystKey}`
    //   },
    //   body: JSON.stringify({ query, context: messages })
    // }).then(res => res.json());
    //
    // const expertResponse = await fetch('/api/agents/trade-expert', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKeys.tradeExpertKey}`
    //   },
    //   body: JSON.stringify({ query, context: messages })
    // }).then(res => res.json());
    
    // For now, simulate both agents responding
    // Dataset Analyst responds first
    setTimeout(() => {
      setMessages(prev => {
        const datasetResponse = generateAIResponse(query, 'dataset', prev);
        const datasetMessage = {
          id: Date.now() + 1,
          sender: 'dataset',
          text: datasetResponse.text,
          timestamp: new Date(),
          showVisualization: datasetResponse.showVisualization
        };
        
        if (datasetResponse.showVisualization) {
          setShowChart(true);
        }
        
        return [...prev, datasetMessage];
      });

      // Trade Expert responds after a delay
      setTimeout(() => {
        setMessages(prev => {
          const expertResponse = generateAIResponse(query, 'expert', prev);
          const expertMessage = {
            id: Date.now() + 2,
            sender: 'expert',
            text: expertResponse.text,
            timestamp: new Date(),
            showVisualization: expertResponse.showVisualization
          };
          
          const newMessages = [...prev, expertMessage];
          
          // Agents can also communicate with each other
          // If the expert wants to add something based on dataset's response
          if (shouldAgentsCommunicate(query, expertResponse)) {
            setTimeout(() => {
              setMessages(currentMessages => {
                const datasetMsg = currentMessages.find(m => m.sender === 'dataset' && m.text.includes(query));
                if (datasetMsg) {
                  const agentCommunication = generateInterAgentCommunication(
                    'expert', 
                    'dataset', 
                    datasetMsg.text,
                    currentMessages
                  );
                  if (agentCommunication) {
                    const commMessage = {
                      id: Date.now() + 3,
                      sender: 'expert',
                      text: agentCommunication,
                      timestamp: new Date(),
                      showVisualization: false
                    };
                    return [...currentMessages, commMessage];
                  }
                }
                return currentMessages;
              });
              setIsLoading(false);
            }, 800);
          } else {
            setIsLoading(false);
          }
          
          return newMessages;
        });
      }, 1200);
    }, 1000);
  };

  const generateAIResponse = (query, agent, messageHistory) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('growth')) {
      return {
        text: agent === 'dataset' 
          ? "Based on the data, Pakistan's exports have shown a 4.5% growth over the past month. The textile sector is leading with 12% growth, followed by manufacturing at 8%. I've generated a visualization below showing the monthly trends."
          : "Comparing with regional benchmarks, Pakistan's export growth of 4.5% is competitive. Bangladesh shows 6% growth while India shows 5.2%. Pakistan's textile sector performance is particularly strong compared to regional averages.",
        showVisualization: true
      };
    }
    
    if (lowerQuery.includes('import') || lowerQuery.includes('deficit')) {
      return {
        text: agent === 'dataset'
          ? "Import analysis shows petroleum and machinery as the largest import categories. Total imports have decreased by 2.3% month-over-month, contributing to a narrowing trade deficit."
          : "Pakistan's import pattern aligns with developing economies in the region. The focus on petroleum and machinery imports is common. However, reducing dependency on petroleum imports could significantly improve trade balance.",
        showVisualization: false
      };
    }
    
    if (lowerQuery.includes('textile') || lowerQuery.includes('category')) {
      return {
        text: agent === 'dataset'
          ? "The textile category represents the largest export segment, showing consistent growth. Recent data indicates strong demand from European and North American markets."
          : "Pakistan's textile exports are competitive globally. Compared to Bangladesh and Vietnam, Pakistan maintains quality advantages but faces price competition. Diversification into value-added products is recommended.",
        showVisualization: true
      };
    }

    return {
      text: agent === 'dataset'
        ? "I can help you analyze various aspects of Pakistan's trade data including exports, imports, trade balance, category performance, and trends. What specific insight would you like?"
        : "As a trade expert, I can provide international comparisons and strategic recommendations. Would you like to know how Pakistan performs against regional competitors or get insights on specific trade strategies?",
      showVisualization: false
    };
  };

  const shouldAgentsCommunicate = (query, datasetResponse) => {
    // Determine if agents should communicate based on the query and response
    const lowerQuery = query.toLowerCase();
    return lowerQuery.includes('trend') || 
           lowerQuery.includes('growth') || 
           lowerQuery.includes('comparison') ||
           lowerQuery.includes('compare');
  };

  const generateInterAgentCommunication = (fromAgent, toAgent, context, messageHistory) => {
    // Generate inter-agent communication
    // In production, this would call the backend API with the agent's API key
    if (fromAgent === 'expert' && toAgent === 'dataset') {
      if (context.includes('growth') || context.includes('4.5%')) {
        return "That's interesting! Based on my analysis, Pakistan's 4.5% growth rate positions it well in the South Asian region. The textile sector's 12% growth you mentioned is indeed a competitive advantage we should leverage.";
      }
    }
    return null;
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
            <h2 className="text-3xl font-bold text-gray-900">AI Trade Experts Chat</h2>
            <p className="text-gray-600 mt-1">Session-based conversation with dual AI agents for strategic planning</p>
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

      {/* Active Agents Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_AGENTS.map(agent => (
          <div
            key={agent.id}
            className="card transition-all hover:shadow-lg ring-2 ring-green-600 bg-green-50"
          >
            <div className="flex items-start">
              <div className="text-4xl mr-4">{agent.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Active</span>
                </div>
                <p className="text-sm text-gray-600">{agent.role}</p>
                <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                {apiKeys[agent.id === 'dataset' ? 'datasetAnalystKey' : 'tradeExpertKey'] && (
                  <p className="text-xs text-gray-400 mt-2">API Key: Connected ✓</p>
                )}
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
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map(message => {
              const isUser = message.sender === 'user';
              const agentInfo = !isUser ? getAgentInfo(message.sender) : null;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-[80%] ${
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
                    <div className={`rounded-lg px-4 py-2 ${
                      isUser
                        ? 'bg-green-600 text-white'
                        : agentInfo?.id === 'dataset' 
                          ? 'bg-blue-50 text-gray-900 border border-blue-200'
                          : 'bg-purple-50 text-gray-900 border border-purple-200'
                    }`}>
                      {!isUser && (
                        <div className={`text-xs font-semibold mb-1 ${
                          agentInfo?.id === 'dataset' ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          {agentInfo?.name}
                        </div>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${isUser ? 'opacity-70' : 'opacity-60'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              placeholder={isLoading ? "Agents are responding..." : "Ask both agents about trade insights..."}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Planning Insights & Visualizations */}
        <div className="space-y-6">
          {/* Planning & Development Insights Panel */}
          <div className="card h-[350px] flex flex-col">
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

          {/* Visualization Panel */}
          <div className="card h-[250px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Visualizations</h3>
            </div>
            
            {showChart && dataInitialized && chartData.length > 0 ? (
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Exports" fill="#22c55e" />
                    <Bar dataKey="Imports" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {dataInitialized ? 'Ask for data visualizations' : 'Loading trade data...'}
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
            onClick={() => setInput('What are the export trends?')}
            className="btn-secondary text-left"
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            What are the export trends?
          </button>
          <button
            onClick={() => setInput('Analyze textile category performance')}
            className="btn-secondary text-left"
          >
            <BarChart2 className="w-4 h-4 inline mr-2" />
            Analyze textile performance
          </button>
          <button
            onClick={() => setInput('What is the trade deficit situation?')}
            className="btn-secondary text-left"
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trade deficit situation?
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChat;