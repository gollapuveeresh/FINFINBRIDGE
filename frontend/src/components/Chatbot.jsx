import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const SUGGESTIONS = [
  { text: "What services do you offer?", reply: "FinBridge provides end-to-end financial advisory across four core departments: Tax Management (TIN, VAT), Investment Management (Mutual Funds, SIPs), Loan Management (Business, Home loans), and Wealth Planning." },
  { text: "How do I register my business?", reply: "Click 'Login / Sign Up' in the top right, click 'Sign Up' in the dropdown, complete the company details, and submit. Our compliance team will review and approve your account within 24 hours." },
  { text: "How can I contact support?", reply: "You can reach us at contact@finbridge.com or call our Helpline at +880 1719 765432. You can also view our map location at the bottom of the page." },
  { text: "Do you have dedicated consultants?", reply: "Yes! Once your company registration is approved on our B2B Portal, a dedicated consultant will be assigned to your account to guide you through customized workflows." }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am your FinBridge assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let replyText = "";
      const lowerText = text.toLowerCase();

      if (lowerText.includes('loan') || lowerText.includes('borrow') || lowerText.includes('interest')) {
        replyText = "We offer Home, Personal, Business, and Vehicle Loans. Register on our Business Portal to start a loan application and track its progress.";
      } else if (lowerText.includes('tax') || lowerText.includes('tin') || lowerText.includes('vat') || lowerText.includes('audit')) {
        replyText = "Our Tax Management department handles tax returns, VAT filing, audits, and customized tax saving strategies.";
      } else if (lowerText.includes('invest') || lowerText.includes('mutual') || lowerText.includes('stock') || lowerText.includes('sip')) {
        replyText = "Our Investment department helps build custom portfolios (Mutual Funds, SIPs, Equities) based on your growth targets and risk tolerance.";
      } else if (lowerText.includes('register') || lowerText.includes('signup') || lowerText.includes('account')) {
        replyText = "Click 'Login / Sign Up' on the navigation bar, click 'Sign Up', fill out your company info (VAT, TIN etc.), and submit. Access is unlocked upon verification.";
      } else if (lowerText.includes('contact') || lowerText.includes('support') || lowerText.includes('phone') || lowerText.includes('email') || lowerText.includes('address')) {
        replyText = "Contact us at contact@finbridge.com, call +880 1719 765432, or visit FinBridge Tower in Agrabad, Chittagong, Bangladesh.";
      } else {
        replyText = "Thanks for asking! I'm here to help with general questions. For detailed advisory assistance, please log in to the B2B Portal and submit a service request, or contact our support team directly.";
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      sender: 'user',
      text: suggestion.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: suggestion.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-[#0A192F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 hover:scale-105 hover:rotate-6 transition-all duration-300 cursor-pointer"
          aria-label="Open support chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <MessageSquare className="w-6 h-6 stroke-[2.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-24 right-6 md:right-8 w-[360px] sm:w-[400px] h-[450px] max-h-[calc(100vh-120px)] bg-[#0A192F]/98 border border-[#D4AF37]/20 shadow-2xl rounded-2xl flex flex-col z-[9999] overflow-hidden backdrop-blur-md"
          >
            {/* Top gold border accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

            {/* Header */}
            <div className="p-4 bg-[#112540] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">FinBridge Assistant</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-light font-mono text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 mega-menu-scrollbar bg-black/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 self-end mb-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#D4AF37] text-[#0A192F] rounded-br-none font-medium' 
                      : 'bg-[#112540] text-gray-200 rounded-bl-none border border-white/5'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[8px] block mt-1 text-right ${msg.sender === 'user' ? 'text-[#0A192F]/60' : 'text-gray-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 self-end mb-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#112540] text-gray-300 rounded-2xl rounded-bl-none px-4 py-3 border border-white/5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-white/5 bg-black/5 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-full px-3 py-1.5 text-left transition-colors cursor-pointer"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-white/10 bg-[#112540] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-black/20 border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0A192F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
