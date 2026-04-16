import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card } from '../../components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { text: 'How to recycle PET plastic?', icon: '♻️' },
  { text: "What's my environmental impact?", icon: '🌍' },
  { text: 'Tips for reducing plastic waste', icon: '💡' },
  { text: 'How does carbon credit work?', icon: '🏷️' },
];

const SYSTEM_PROMPT = `You are VASU, the friendly AI recycling assistant for the Vasudha app. 
You help users with:
- Identifying materials and how to recycle them
- Understanding their environmental impact
- Tips for reducing waste
- Information about carbon credits and eco-rewards
- General sustainability advice

Keep responses concise (2-3 sentences max), friendly, and encouraging. 
Use emojis occasionally. Always relate back to practical recycling actions.
If asked something unrelated to sustainability/recycling, politely redirect.`;

export default function ChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey ${profile?.name?.split(' ')[0] || 'there'}! 🌱 I'm VASU, your recycling companion. Ask me anything about recycling, sustainability, or how to earn more eco-credits!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.content }],
        }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: { maxOutputTokens: 300 },
      });

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser: ${text.trim()}`);
      const response = await result.response;
      const aiText = response.text();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Gemini Chat Error:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Fresh start! 🌿 Ask me anything about recycling, sustainability, or your eco-impact.`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <section className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-lg bioluminescent-glow">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-primary)]">VASU AI</h2>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online · Powered by Gemini
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="h-10 w-10 rounded-2xl bg-[rgb(var(--surface-container-rgb)/0.6)] text-[var(--on-surface-variant)] hover:bg-red-50 hover:text-red-400 transition-all duration-300 flex items-center justify-center"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </section>

      {/* Chat Area */}
      <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.3)] rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]'
                      }`}
                  >
                    {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-5 py-4 rounded-3xl text-sm leading-relaxed font-medium ${msg.role === 'user'
                      ? 'bg-[var(--brand-primary)] text-white rounded-br-lg'
                      : 'bg-white/80 text-[var(--brand-primary)] border border-[rgb(var(--outline-rgb)/0.08)] rounded-bl-lg shadow-sm'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3"
            >
              <div className="h-8 w-8 rounded-xl bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)] flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <div className="bg-white/80 px-5 py-4 rounded-3xl rounded-bl-lg border border-[rgb(var(--outline-rgb)/0.08)] shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--brand-secondary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-[var(--brand-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-[var(--brand-secondary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => sendMessage(prompt.text)}
                  className="px-4 py-2.5 rounded-full bg-white/70 border border-[rgb(var(--outline-rgb)/0.1)] text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]/10 hover:border-[var(--brand-secondary)]/20 transition-all duration-300 flex items-center gap-2"
                >
                  <span>{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-5 pt-3 border-t border-[rgb(var(--outline-rgb)/0.05)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask VASU anything about recycling..."
              className="flex-1 px-6 py-4 rounded-2xl bg-white/60 border border-[rgb(var(--outline-rgb)/0.1)] text-[var(--brand-primary)] font-semibold placeholder:text-[var(--on-surface-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30 focus:border-[var(--brand-secondary)] transition-all duration-300"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-14 w-14 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center hover:bg-[var(--brand-secondary)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-[rgb(var(--brand-primary-rgb)/0.2)]"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
