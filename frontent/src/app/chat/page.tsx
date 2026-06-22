'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import apiClient from '@/lib/axios';
import { useCartStore } from '@/store/use-cart-store';
import {
  Send, Bot, User, Sparkles, ShoppingBag, TrendingUp,
  HelpCircle, Copy, Check, Star, Zap, X, RotateCcw,
  ExternalLink, ShoppingCart
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  ratings: { average: number; count: number };
  images: string[];
  description?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
  intent?: 'RECOMMENDATION' | 'COMPARISON' | 'ADVISOR';
  products?: Product[];
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  { label: 'Recommend the best headphones for music', icon: <ShoppingBag className="h-4 w-4" />, color: 'text-[#4F46E5]', bg: 'bg-[#4F46E5]/10' },
  { label: 'Compare wireless keyboard vs gaming mouse', icon: <TrendingUp className="h-4 w-4" />, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10' },
  { label: 'What fitness gear helps with weight loss?', icon: <Zap className="h-4 w-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Show me top-rated electronics under $100', icon: <HelpCircle className="h-4 w-4" />, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  { label: 'What accessories pair with a laptop?', icon: <Sparkles className="h-4 w-4" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Best audio equipment for home studio', icon: <ShoppingBag className="h-4 w-4" />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

const INTENT_CONFIG = {
  RECOMMENDATION: { label: 'Recommendation Agent', icon: <Sparkles className="h-3 w-3" />, color: 'text-[#4F46E5] bg-[#4F46E5]/10 border-[#4F46E5]/20' },
  COMPARISON:     { label: 'Comparison Agent',     icon: <TrendingUp className="h-3 w-3" />, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  ADVISOR:        { label: 'Product Advisor',       icon: <HelpCircle className="h-3 w-3" />, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' },
};

const generateId = () => Math.random().toString(36).substring(7);

const WELCOME: Message = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hello! I'm **Zevora AI** — your personal shopping assistant powered by Gemini. I can help you:\n\n- 🛍️ **Recommend** products based on your needs\n- ⚖️ **Compare** items side-by-side\n- 📋 **Answer** detailed product questions\n\nWhat are you looking for today?",
  timestamp: new Date(),
};

// ── Markdown renderer ────────────────────────────────────────────────────────
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-extrabold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>
      : part
  );
}

function parseMarkdown(content: string, msgId: string, copiedId: string | null, onCopy: (text: string, id: string) => void) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n');
      const hasLang = lines.length > 0 && /^[a-zA-Z0-9]+$/.test(lines[0]);
      const lang = hasLang ? lines[0] : 'text';
      const codeText = (hasLang ? lines.slice(1) : lines).join('\n');
      const blockId = `${msgId}-${index}`;
      return (
        <div key={index} className="my-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/80 px-4 py-2 text-[10px] font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <span className="uppercase tracking-wider">{lang}</span>
            <button onClick={() => onCopy(codeText, blockId)} className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              {copiedId === blockId ? <><Check className="h-3 w-3 text-emerald-500" /><span className="text-emerald-500">Copied!</span></> : <><Copy className="h-3 w-3" /><span>Copy</span></>}
            </button>
          </div>
          <pre className="overflow-x-auto bg-zinc-950 p-4 text-xs font-mono text-zinc-100 leading-relaxed"><code>{codeText}</code></pre>
        </div>
      );
    }

    const lines = part.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${listKey++}`} className="list-none my-2 space-y-1.5 pl-1">{listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, i) => {
      const t = line.trim();
      if (!t) { flushList(); return; }
      if (t.startsWith('### ')) { flushList(); elements.push(<h4 key={i} className="text-sm font-extrabold mt-4 mb-1.5 text-zinc-900 dark:text-zinc-100">{t.slice(4)}</h4>); return; }
      if (t.startsWith('## ')) { flushList(); elements.push(<h3 key={i} className="text-base font-extrabold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{t.slice(3)}</h3>); return; }
      if (t.startsWith('# ')) { flushList(); elements.push(<h2 key={i} className="text-lg font-black mt-4 mb-2 text-zinc-900 dark:text-zinc-100">{t.slice(2)}</h2>); return; }
      if (t.startsWith('- ') || t.startsWith('* ')) {
        listItems.push(<li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"><span className="text-[#4F46E5] mt-1 shrink-0">•</span><span>{renderInlineBold(t.slice(2))}</span></li>);
        return;
      }
      if (t.startsWith('|') && t.endsWith('|')) {
        if (t.includes('---')) return;
        flushList();
        const cells = t.split('|').map(c => c.trim()).filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);
        elements.push(
          <div key={i} className="overflow-x-auto my-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  {cells.map((c, ci) => <td key={ci} className="px-3 py-2 border-r border-zinc-200 dark:border-zinc-700 last:border-0">{renderInlineBold(c)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        );
        return;
      }
      flushList();
      elements.push(<p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-1.5">{renderInlineBold(t)}</p>);
    });
    flushList();
    return <React.Fragment key={index}>{elements}</React.Fragment>;
  });
}

// ── Product mini card ────────────────────────────────────────────────────────
function ProductMiniCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ _id: product._id, name: product.name, price: product.price, image: product.images?.[0] || '', category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex-shrink-0 w-44 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className="relative h-28 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <Image
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'}
          alt={product.name}
          fill
          sizes="176px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 right-2 rounded-lg bg-white/95 dark:bg-zinc-900/95 px-1.5 py-0.5 text-[10px] font-black text-zinc-900 dark:text-zinc-100 shadow-sm">
          ${product.price.toFixed(2)}
        </span>
      </div>
      <div className="p-2.5 space-y-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">{product.category}</span>
        <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">{product.name}</h4>
        <div className="flex items-center gap-1">
          <Star className="h-2.5 w-2.5 text-amber-400 fill-current" />
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{(product.ratings?.average || 0).toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${added ? 'bg-emerald-500 text-white' : 'bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white'}`}
          >
            <ShoppingCart className="h-2.5 w-2.5" />
            {added ? '✓' : 'Add'}
          </button>
          <Link href={`/products/${product._id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#4F46E5] hover:border-[#4F46E5] transition-colors">
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
  };

  const executeChat = async (userText: string) => {
    if (!userText.trim() || loading) return;
    const uid = generateId();
    const aid = generateId();

    setMessages(prev => [...prev, { id: uid, sender: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', { message: userText });
      if (res.data.success && res.data.data) {
        const { intent, response: fullText, products } = res.data.data;
        setMessages(prev => [...prev, { id: aid, sender: 'assistant', text: '', isStreaming: true, intent, products, timestamp: new Date() }]);

        const words = fullText.split(' ');
        let current = '';
        let wi = 0;
        const interval = setInterval(() => {
          if (wi < words.length) {
            current += (wi === 0 ? '' : ' ') + words[wi];
            setMessages(prev => prev.map(m => m.id === aid ? { ...m, text: current } : m));
            wi++;
          } else {
            clearInterval(interval);
            setMessages(prev => prev.map(m => m.id === aid ? { ...m, isStreaming: false } : m));
            setLoading(false);
          }
        }, 35);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err: any) {
      const errMsg: string = err?.message || '';
      let friendlyText = '';

      if (errMsg.includes('No response from the server') || errMsg.includes('timeout') || errMsg.includes('ECONNREFUSED')) {
        friendlyText = `⚠️ **Backend server is not running.**\n\nTo start it:\n- Open a terminal in the \`backend\` folder\n- Run: \`npm run dev\`\n- Then try again!`;
      } else if (errMsg.includes('GEMINI_API_KEY') || errMsg.includes('API key') || errMsg.includes('not configured')) {
        friendlyText = `⚠️ **AI service is not configured.**\n\nThe backend needs a valid Gemini API key:\n1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)\n2. Create a free API key (starts with "AIza...")\n3. Add it to \`backend/.env\` as \`GEMINI_API_KEY=AIza...\`\n4. Restart the backend server`;
      } else if (errMsg.includes('Rate limit') || errMsg.includes('429')) {
        friendlyText = `⚠️ **Rate limit reached.** Please wait 30 seconds before trying again.`;
      } else if (errMsg.includes('quota') || errMsg.includes('QUOTA')) {
        friendlyText = `⚠️ **Daily AI quota exceeded.** Please try again tomorrow, or upgrade your Gemini API plan.`;
      } else {
        friendlyText = `⚠️ **Something went wrong:** ${errMsg || 'Unknown error'}\n\nPlease check that the backend is running and try again.`;
      }

      setMessages(prev => [...prev, {
        id: aid, sender: 'assistant', timestamp: new Date(), text: friendlyText
      }]);
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => { e.preventDefault(); executeChat(input); };
  const isEmpty = messages.length === 1;

  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-4 sm:px-6 py-4 min-h-0">

        {/* ── Chat Shell ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-md min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-[#4F46E5]/5 to-[#06B6D4]/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-sm">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Zevora AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-semibold text-emerald-500">Online · Gemini 2.5 Flash</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth min-h-0">

            {/* Empty state / suggested prompts */}
            {isEmpty && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-8 space-y-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">How can I help you today?</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Ask me anything about our products, or try a suggestion below.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => executeChat(p.label)}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#4F46E5] hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <span className={`h-8 w-8 rounded-lg ${p.bg} flex items-center justify-center shrink-0 ${p.color}`}>{p.icon}</span>
                      <span className="text-xs leading-snug">{p.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message feed */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const intent = msg.intent ? INTENT_CONFIG[msg.intent] : null;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI avatar */}
                  {!isUser && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Intent badge */}
                    {!isUser && intent && (
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${intent.color}`}>
                        {intent.icon}{intent.label}
                      </span>
                    )}

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-br from-[#4F46E5] to-[#4F46E5]/90 text-white rounded-tr-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
                    }`}>
                      {isUser
                        ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        : parseMarkdown(msg.text, msg.id, copiedId, handleCopy)
                      }
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-[#4F46E5] dark:bg-zinc-300 rounded-sm animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>

                    {/* Product carousel */}
                    {!isUser && msg.products && msg.products.length > 0 && !msg.isStreaming && (
                      <div className="w-full overflow-x-auto flex gap-3 pb-2 pt-1">
                        {msg.products.map((p) => <ProductMiniCard key={p._id} product={p} />)}
                      </div>
                    )}

                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1">{fmt(msg.timestamp)}</span>
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 border border-[#4F46E5]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-[#4F46E5]" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 mr-1">Thinking</span>
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2 w-2 rounded-full bg-[#4F46E5]/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, compare, get recommendations..."
                  disabled={loading}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#4F46E5] focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-[#4F46E5]/20 transition-all disabled:opacity-50 pr-10"
                />
                {input && (
                  <button type="button" onClick={() => setInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
            <p className="text-[10px] text-zinc-400 text-center mt-2">
              Zevora AI can make mistakes. Always verify important product details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
