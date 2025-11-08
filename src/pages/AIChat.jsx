import { useState, useEffect, useRef } from 'react';
import { Send, User,  Expand, X, TrendingUp, BarChart2, Target, Lightbulb, Clock, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import Plot from 'react-plotly.js';
import ReactMarkdown from 'react-markdown';
import { agentService } from '../services/api';
import { streamTextInChunks, streamTextBySentences } from '../utils/streamText';
import { motion, AnimatePresence } from "framer-motion";
import { isString, isObject, isNil } from 'lodash'; // Assuming you have lodash or similar utilities

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
  const [expanded, setExpanded] = useState(false);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [plotlyChart, setPlotlyChart] = useState(null);
  const messagesEndRef = useRef(null);
  const [economicsResponse, setEconomicsResponse] = useState(null); // Stores the parsed JSON object

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


// Helper to safely parse JSON strings
const safeJsonParse = (text) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
};

/**
 * Extracts structured planning and development insights from the conversation messages,
 * prioritizing the JSON output from the Economics Agent.
//  * * @param {string} economicsResponse - The JSON string of conversation messages.
 * @returns {Array<Object>} - The last 5 formatted insight objects.
 */
// Function to process a single, parsed EconomicsResponse object
const extractPlanningInsights = (parsedEconomicsResponse, msgId, timestamp) => {
    // Check if the input object is valid and has the required fields
    if (!parsedEconomicsResponse || !parsedEconomicsResponse.insights_type || !parsedEconomicsResponse.insights) {
        return []; // Return an empty array if data is missing
    }

    const insightType = parsedEconomicsResponse.insights_type;
    
    // Map the agent's insights_type to the panel's display types
    let displayType;
    if (['recommendation', 'plan'].includes(insightType)) {
        displayType = 'recommendation'; // Maps to Lightbulb/Strategy
    } else if (['growth', 'opportunity', 'trend'].includes(insightType)) {
        displayType = 'opportunity'; // Maps to TrendingUp/Opportunity
    } else {
        // Fallback for types like 'comparison' if you introduce them later
        displayType = 'recommendation'; 
    }

    // Return the single, structured insight
    return [{
        // Use unique identifiers for React
        id: msgId, 
        // Use the short, punchy 'insights' field for the panel display
        text: parsedEconomicsResponse.insights, 
        timestamp: timestamp,
        type: displayType 
    }];
};
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const [streamingAgent, setStreamingAgent] = useState(null); // 'dataset' or 'expert'
  const cancelStreamRef = useRef(null);
// Function to stream economics response
      const streamEconomicsResponse = (analysisText) => {
    // We can use the already-calculated ID/Timestamp from the immediate block, 
    // but for simplicity, we'll re-calculate here and ensure we stream the text.
    const expertMessageId = Date.now() + 2; 
    
    setMessages(prev => [...prev, {
      id: expertMessageId,
      sender: 'expert',
      text: '', // Start with empty text
      timestamp: new Date(),
      isStreaming: true
    }]);

    setStreamingAgent('expert');
    
    let accumulatedText = '';
    
    cancelStreamRef.current = streamTextInChunks(
      analysisText, // <-- **NOW RECEIVES THE CORRECT STRING**
      (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === expertMessageId 
            ? { ...msg, text: accumulatedText }
            : msg
        ));
      },
      () => {
        setMessages(prev => prev.map(msg => 
          msg.id === expertMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setStreamingAgent(null);
        setIsLoading(false);
        console.log('✅ Economics Expert streaming complete');
      },
      80,
      40
    );
};
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (backendStatus !== 'connected') {
      setError('Backend is not connected.');
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

    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      agent: msg.sender !== 'user' ? msg.sender : undefined
    }));

    try {
      console.log('🚀 Calling analysis endpoint...');
      
      // Get complete response from backend
      const response = await agentService.Analysis_response(query, conversationHistory);
      
      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }
const csvResponse = response.data?.csv_response || response.response;
        // NOTE: Your backend seems to return the JSON string here, not under .output
        const economicsJsonString = response.data?.economics_response; 
        const graphResponse = response.chart_data;
        console.log("Economics:", economicsJsonString)
        let parsedEconomicsResult = null; // Renamed for clarity
        
        if (economicsJsonString.output) {
            try {
                // 2. PARSE THE JSON STRING into an object
                parsedEconomicsResult = economicsJsonString
                setEconomicsResponse(parsedEconomicsResult); // Store the parsed object in state
                console.log("Parsed:", parsedEconomicsResult)
                
                // 3. Extract and set insights immediately (using a unique ID)
                const insights = extractPlanningInsights(
                    economicsJsonString, 
                    Date.now() + 2,
                    new Date()
                );
                console.log("Insights: ", insights)
                setPlanningInsights(prev => [...prev, ...insights].slice(-5)); // Add new insight
                
                // 4. REMOVE: The immediate expertMessage is removed.
                // We rely on the streaming function below to add the expert message.

            } catch (jsonError) {
                console.error("Error parsing Economics JSON. Agent may not have returned valid JSON:", jsonError);
                // If parsing fails, we set the result to the raw string to display the error.
                parsedEconomicsResult = economicsJsonString; 
            }
        }
      
      // === STREAM CSV ANALYST RESPONSE ===
      const datasetMessageId = Date.now() + 1;
      
      // Add empty message placeholder
      setMessages(prev => [...prev, {
        id: datasetMessageId,
        sender: 'dataset',
        text: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      setStreamingAgent('dataset');
      
      // Stream the CSV response
      let accumulatedText = '';
      
      cancelStreamRef.current = streamTextInChunks(
        csvResponse,
        (chunk) => {
          // Append chunk to accumulated text
          accumulatedText += chunk;
          
          // Update message with accumulated text
          setMessages(prev => prev.map(msg => 
            msg.id === datasetMessageId 
              ? { ...msg, text: accumulatedText }
              : msg
          ));
        },
        () => {
            // Complete CSV streaming
            setMessages(prev => prev.map(msg => 
                msg.id === datasetMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
            ));
            setStreamingAgent(null);
            console.log('✅ CSV Agent streaming complete');
            
            // Now stream Economics Expert after a delay
            setTimeout(() => {
                // Pass the string output, or the raw string if parsing failed
                const analysisTextToStream = (typeof parsedEconomicsResult === 'object' && parsedEconomicsResult !== null) 
                    ? parsedEconomicsResult.output 
                    : parsedEconomicsResult;
                    
                if (analysisTextToStream) {
                    streamEconomicsResponse(analysisTextToStream); // <-- 🌟 CRITICAL FIX: PASSING THE STRING!
                } else {
                    setIsLoading(false);
                }
            }, 500);
        },
        80, // chunk size (characters)
        40  // delay between chunks (ms)
      );

      

      // Handle graph visualization
      if (graphResponse ) {
        console.log('📊 Chart data received');
        setPlotlyChart(graphResponse);
      }

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

  // Cancel streaming if component unmounts or user sends new message
  useEffect(() => {
    return () => {
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
      }
    };
  }, []);

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
      {/* Header with Session Info
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
      </div> */}

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
                  ) : message.isStreaming ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
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
                    <div className={`text-xs font-semibold mb-1 flex items-center gap-2 ${agentInfo?.textColor}`}>
                      <span>{agentInfo?.name}</span>
                      {message.isStreaming && (
                        <span className="text-xs text-gray-500 animate-pulse">typing...</span>
                      )}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                    <ReactMarkdown >{message.text}</ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-1 h-4 bg-current ml-1 animate-pulse">|</span>
                    )}
                  </div>
                  {!message.isStreaming && (
                    <p className={`text-xs mt-1 ${isUser ? 'opacity-70' : 'opacity-60'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isLoading && !streamingAgent && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Analyzing data...</span>
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
          {/* Main Visualization Card */}
      <div className="card h-[310px] flex flex-col relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Data Visualization
            </h3>
          </div>

          {/* Expand Button */}
          {plotlyChart && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
              title="Expand chart"
            >
              <Expand className="w-4 h-4" />
              Expand
            </button>
          )}
        </div>

        {plotlyChart ? (
          <div className="flex-1 overflow-hidden">
            <Plot
              data={plotlyChart.data}
              layout={{
                ...plotlyChart.layout,
                autosize: true,
                margin: { t: 40, r: 20, b: 40, l: 50 },
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Ask questions to generate visualizations
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try: "Show June imports" or "Compare groups"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] p-6 flex flex-col relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Expanded Visualization
                </h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Large Chart */}
              <div className="flex-1 overflow-hidden rounded-lg border border-gray-200">
                <Plot
                  data={plotlyChart?.data || []}
                  layout={{
                    ...plotlyChart?.layout,
                    autosize: true,
                    margin: { t: 60, r: 40, b: 60, l: 70 },
                  }}
                  config={{ responsive: true }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
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