import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Lightbulb, 
  Globe, 
  Database, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Brain,
  LineChart,
  Zap,
  Shield
} from 'lucide-react';

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Database,
      title: 'Local Data Intelligence',
      description: 'Deep insights from Pakistan\'s trade dataset with real-time analysis',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: 'Global Benchmarking',
      description: 'Compare performance against international markets and competitors',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced LLM agents collaborate to provide strategic recommendations',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Actionable insights for future development and growth strategies',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = [
    {
      icon: LineChart,
      title: 'Data-Driven Decisions',
      description: 'Make informed planning decisions based on comprehensive trade analysis',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Target,
      title: 'Strategic Development',
      description: 'Identify growth opportunities and development priorities',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Zap,
      title: 'Real-Time Insights',
      description: 'Get instant analysis and recommendations from dual AI agents',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Shield,
      title: 'Competitive Intelligence',
      description: 'Understand market position and competitive advantages',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const planningOutcomes = [
    'Strategic Roadmap Development',
    'Market Opportunity Identification',
    'Resource Allocation Optimization',
    'Risk Mitigation Strategies',
    'Competitive Positioning Analysis',
    'Long-term Growth Planning'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Trade Intelligence Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Strategic Planning
              </span>
              <br />
              <span className="text-gray-800">Through Intelligent Analysis</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slide-up-delay">
              Collaborate with dual AI agents to transform trade data into actionable development strategies. 
              <span className="font-semibold text-gray-800"> Perfect for planning and development professionals.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-delay">
              <Link
                to="/ai-chat"
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Start AI Conversation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-green-500 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">2</div>
                <div className="text-gray-600 font-medium">AI Agents</div>
                <div className="text-sm text-gray-500">Collaborating in real-time</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Data-Driven</div>
                <div className="text-sm text-gray-500">Local & global insights</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Session Analysis</div>
                <div className="text-sm text-gray-500">Continuous planning support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Your <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">AI Planning Partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Two specialized agents work together in session-based conversations to deliver comprehensive strategic insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Dataset Analyst */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="absolute top-4 right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dataset Analyst</h3>
                <p className="text-blue-600 font-semibold mb-3">Local Data Intelligence Agent</p>
                <p className="text-gray-700">
                  Analyzes Pakistan's trade data with precision. Provides factual insights, trends, and patterns 
                  from your local dataset. Perfect for understanding your current performance and identifying 
                  data-driven opportunities.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Real-time local trade data analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Category and commodity insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Trend identification and forecasting</span>
                </div>
              </div>
            </div>

            {/* Trade Expert */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="absolute top-4 right-4 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                🌍
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Trade Expert</h3>
                <p className="text-purple-600 font-semibold mb-3">Global Benchmarking Agent</p>
                <p className="text-gray-700">
                  Compares your performance with global markets and international benchmarks. Provides 
                  strategic recommendations based on worldwide trade patterns. Essential for competitive 
                  positioning and strategic planning.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>International market comparisons</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Competitive intelligence analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Strategic development recommendations</span>
                </div>
              </div>
            </div>
          </div>

          {/* How They Work Together */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Session-Based Collaboration</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Start a Session</h4>
                <p className="text-sm text-gray-600">Begin a conversation with both AI agents</p>
              </div>
              <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Dual Analysis</h4>
                <p className="text-sm text-gray-600">Local data insights + global comparisons</p>
              </div>
              <ArrowRight className="w-8 h-8 text-gray-400 hidden md:block" />
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Strategic Insights</h4>
                <p className="text-sm text-gray-600">Get actionable planning recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planning & Development Focus */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4" />
              <span>Designed for Planning & Development Professionals</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Transform Insights into <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Development Strategy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every conversation session culminates in actionable recommendations for future planning, 
              resource allocation, and strategic development initiatives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Planning Outcomes */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Planning Outcomes</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Each AI session conversation generates strategic insights that directly support:
              </p>
              <div className="space-y-4">
                {planningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{outcome}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/ai-chat"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Start Planning Session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
          </div>

          <div className="relative h-96 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === currentFeature;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-12 h-full flex flex-col justify-center items-center text-center text-white shadow-2xl`}>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                      <Icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-xl text-white/90 max-w-2xl">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Indicators */}
          <div className="flex justify-center gap-3">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentFeature ? 'w-8 bg-green-600' : 'w-3 bg-gray-300'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Planning Process?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start a conversation with our AI agents and discover strategic insights for your development initiatives.
          </p>
          <Link
            to="/ai-chat"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <MessageSquare className="w-6 h-6" />
            Begin AI Planning Session
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.2s both;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        .animate-slide-up-delay {
          animation: slide-up 1.2s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

