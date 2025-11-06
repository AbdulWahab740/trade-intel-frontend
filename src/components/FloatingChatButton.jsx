import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';

function FloatingChatButton() {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate('/ai-chat');
  }, [navigate]);

  return (
    <button
      aria-label="Open AI Chat"
      title="Open AI Chat"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      <Bot className="h-7 w-7" />
    </button>
  );
}

export default FloatingChatButton;