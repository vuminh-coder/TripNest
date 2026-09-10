import React, { useState, useEffect, useRef } from 'react';
import { 
  TbSparkles, 
  TbX, 
  TbSend, 
  TbRefresh, 
  TbChevronDown, 
  TbStar, 
  TbMapPin, 
  TbTicket, 
  TbCompass, 
  TbHome,
  TbArrowUpRight,
  TbShieldCheck,
  TbMessageDots
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import './AiChatBubble.css';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  sender: 'ai',
  text: 'Xin chào! Mình là Trợ lý Du Lịch AI của TripNest. 🌿 Bạn đang lên kế hoạch cho chuyến đi sắp tới ở đâu? Hãy chia sẻ địa điểm, số người hoặc phong cách yêu thích (view biển, săn mây, có bể bơi, tour SUP, mã giảm giá...) để mình gợi ý nhé! ✨',
  cards: [],
  quickReplies: [
    'Tìm villa Đà Lạt săn mây',
    'Homestay Phú Quốc gần biển',
    'Có voucher khuyến mãi nào không?',
    'Tour chèo SUP ngắm bình minh'
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Helper phân giải Markdown đơn giản, biến **in đậm** thành thẻ <strong> thanh lịch, xóa dấu ** thừa
const renderFormattedMessage = (rawText) => {
  if (!rawText) return null;

  const lines = rawText.split('\n');

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lIdx} className="adm-ai-text-space" />;
    }

    // Xử lý các đoạn in đậm **text**, code `text`, nghiêng *text*
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    const formattedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} className="adm-ai-bold-text">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={pIdx} className="adm-ai-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={pIdx} className="adm-ai-italic-text">
            {part.slice(1, -1)}
          </em>
        );
      }
      // Dọn dẹp bất kỳ dấu ** nào còn sót lại lẻ loi
      const cleanPart = part.replace(/\*\*/g, '');
      return <React.Fragment key={pIdx}>{cleanPart}</React.Fragment>;
    });

    // Nếu là dòng gạch đầu dòng (- hoặc •)
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <div key={lIdx} className="adm-ai-bullet-line">
          <span className="adm-ai-bullet-dot">•</span>
          <span className="adm-ai-bullet-content">{formattedParts}</span>
        </div>
      );
    }

    return (
      <p key={lIdx} className="adm-ai-text-paragraph">
        {formattedParts}
      </p>
    );
  });
};

export const AiChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBadge, setShowWelcomeBadge] = useState(false);
  const [showButtonText, setShowButtonText] = useState(true);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tripnest_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_WELCOME_MESSAGE];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // Chu kỳ: Hiện chữ "Trợ Lý AI" trong 15s rồi ẩn trong 1 phút (60s), lặp đi lặp lại liên tục
  useEffect(() => {
    let timer;
    if (showButtonText) {
      // Đang hiển thị chữ -> sau 15 giây thì ẩn đi
      timer = setTimeout(() => {
        setShowButtonText(false);
      }, 15000);
    } else {
      // Đang ẩn chữ -> sau 60 giây (1 phút) thì hiển thị lại
      timer = setTimeout(() => {
        setShowButtonText(true);
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [showButtonText]);

  // Không hiển thị bong bóng chat khi đang ở trang Admin hoặc Host để tránh che khuất bảng điều khiển
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/host');

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Lưu lịch sử chat vào sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('tripnest_ai_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Hiển thị badge mời gọi sau 2.5s, và TỰ ĐỘNG BIẾN MẤT SAU 10 GIÂY
  useEffect(() => {
    if (isDashboardRoute || isOpen) {
      setShowWelcomeBadge(false);
      return;
    }

    const hasDismissed = sessionStorage.getItem('tripnest_ai_welcome_dismissed');
    if (hasDismissed) return;

    // 1. Mở badge chào mừng sau 2.5 giây
    const showTimer = setTimeout(() => {
      setShowWelcomeBadge(true);

      // 2. Tự động ẩn badge đi sau 10 giây (10000ms) đúng theo yêu cầu
      dismissTimerRef.current = setTimeout(() => {
        setShowWelcomeBadge(false);
        sessionStorage.setItem('tripnest_ai_welcome_dismissed', '1');
      }, 10000);
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [isDashboardRoute, isOpen]);

  const handleCloseWelcomeBadge = (e) => {
    e?.stopPropagation();
    setShowWelcomeBadge(false);
    sessionStorage.setItem('tripnest_ai_welcome_dismissed', '1');
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleToggleOpen = () => {
    setIsOpen(prev => !prev);
    setShowWelcomeBadge(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleResetChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    try {
      sessionStorage.removeItem('tripnest_ai_chat_history');
    } catch {}
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // 1. Thêm tin nhắn của User
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chuẩn bị history cho backend (chuyển đổi role user/model)
      const historyPayload = newMessages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text || ''
      }));

      const responseData = await apiService.sendAiChatMessage(query, historyPayload);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseData.reply || 'Dạ, mình đã tìm thấy một số gợi ý phù hợp cho bạn!',
        cards: responseData.suggested_cards || [],
        quickReplies: responseData.quick_replies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.warn('AI Chat error:', error);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Xin lỗi bạn, kết nối tạm thời bị gián đoạn. Bạn thử hỏi lại hoặc bấm vào các gợi ý bên dưới nhé! 🌿',
        cards: [],
        quickReplies: ['Tìm villa Đà Lạt săn mây', 'Homestay Phú Quốc gần biển', 'Có voucher giảm giá nào không?'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCardClick = (link) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      window.location.href = link;
    }
  };

  if (isDashboardRoute) {
    return null;
  }

  return (
    <div className="adm-ai-bubble-root">
      {/* 1. Welcome Callout Badge (Auto closes in 10s) */}
      {!isOpen && showWelcomeBadge && (
        <div className="adm-ai-welcome-badge" onClick={handleToggleOpen}>
          <div className="adm-ai-welcome-avatar">
            <TbSparkles />
          </div>
          <div className="adm-ai-welcome-text">
            <div className="adm-ai-welcome-title-row">
              <strong>Trợ lý AI TripNest</strong>
              <span className="adm-ai-welcome-tag">Gợi ý 24/7</span>
            </div>
            <span>Bạn cần gợi ý phòng nghỉ hay tour du lịch ở đâu? 👋</span>
          </div>
          <button 
            type="button" 
            className="adm-ai-badge-close" 
            onClick={handleCloseWelcomeBadge}
            title="Đóng thông báo (Tự ẩn sau 10s)"
          >
            <TbX size={14} />
          </button>
          {/* Thanh tiến trình đếm ngược 10 giây */}
          <div className="adm-ai-badge-timer-progress" />
        </div>
      )}

      {/* 2. Luxury Floating Action Button Trigger (Tự động chuyển đổi dạng Pill / Tròn theo chu kỳ) */}
      {!isOpen && (
        <button
          type="button"
          className={`adm-ai-trigger-btn ${showButtonText ? 'expanded' : 'collapsed'}`}
          onClick={handleToggleOpen}
          aria-label="Mở Trợ lý Du lịch AI TripNest"
          title="Trò chuyện với Trợ lý AI TripNest (Nhận gợi ý phòng & tour)"
        >
          <div className="adm-ai-trigger-glow" />
          <div className="adm-ai-trigger-icon-wrap">
            <TbSparkles className="adm-ai-spark-icon" />
          </div>
          <span className="adm-ai-trigger-pill">
            <span className="adm-ai-btn-text">Trợ Lý AI</span>
          </span>
        </button>
      )}

      {/* 3. Luxury Chat Window Modal */}
      {isOpen && (
        <div className="adm-ai-chat-window animate-slide-up">
          {/* Header */}
          <div className="adm-ai-chat-header">
            <div className="adm-ai-header-brand">
              <div className="adm-ai-avatar-icon">
                <TbSparkles />
              </div>
              <div className="adm-ai-brand-details">
                <div className="adm-ai-title-row">
                  <h4 className="adm-ai-title">TripNest AI Assistant</h4>
                  <span className="adm-ai-online-badge">Trực tuyến</span>
                </div>
                <p className="adm-ai-subtitle">Tư vấn phòng nghỉ & trải nghiệm nghỉ dưỡng</p>
              </div>
            </div>

            <div className="adm-ai-header-actions">
              <button 
                type="button" 
                className="adm-ai-hdr-btn" 
                onClick={handleResetChat} 
                title="Bắt đầu đoạn chat mới"
              >
                <TbRefresh size={16} />
              </button>
              <button 
                type="button" 
                className="adm-ai-hdr-btn" 
                onClick={handleToggleOpen} 
                title="Thu nhỏ cửa sổ"
              >
                <TbChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="adm-ai-chat-body">
            <div className="adm-ai-chat-body-inner">
              {messages.map((msg) => (
                <div key={msg.id} className={`adm-ai-msg-group ${msg.sender}`}>
                  {msg.sender === 'ai' && (
                    <div className="adm-ai-msg-avatar">
                      <TbSparkles size={14} />
                    </div>
                  )}

                  <div className="adm-ai-msg-content">
                    <div className={`adm-ai-bubble ${msg.sender}`}>
                      <div className="adm-ai-text-render">
                        {renderFormattedMessage(msg.text)}
                      </div>
                      <span className="adm-ai-msg-time">{msg.timestamp}</span>
                    </div>

                    {/* Rich Product Cards Carousel */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="adm-ai-cards-container">
                        <div className="adm-ai-cards-carousel">
                          {msg.cards.map((card, cIdx) => (
                            <div 
                              key={cIdx} 
                              className="adm-ai-product-card"
                              onClick={() => handleCardClick(card.link)}
                              title="Bấm để xem chi tiết chỗ nghỉ"
                            >
                              <div className="adm-ai-card-media">
                                <img src={card.image_url} alt={card.title} className="adm-ai-card-img" />
                                {card.type === 'voucher' ? (
                                  <span className="adm-ai-card-badge voucher"><TbTicket size={11} /> Mã Giảm Giá</span>
                                ) : card.type === 'experience' ? (
                                  <span className="adm-ai-card-badge tour"><TbCompass size={11} /> Tour Du Lịch</span>
                                ) : (
                                  <span className="adm-ai-card-badge hotel"><TbHome size={11} /> Chỗ Nghỉ</span>
                                )}
                              </div>
                              <div className="adm-ai-card-info">
                                <h5 className="adm-ai-card-title">{card.title}</h5>
                                <p className="adm-ai-card-sub">{card.subtitle}</p>
                                <div className="adm-ai-card-footer">
                                  <span className="adm-ai-card-price">{card.price_label}</span>
                                  <div className="adm-ai-card-rating">
                                    <TbStar className="star-icon" />
                                    <span>{card.rating}</span>
                                  </div>
                                </div>
                                <button type="button" className="adm-ai-card-action-btn">
                                  <span>Xem Chi Tiết</span>
                                  <TbArrowUpRight size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Replies Buttons */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="adm-ai-quick-pills-wrap">
                        <div className="adm-ai-quick-pills">
                          {msg.quickReplies.map((qr, qrIdx) => (
                            <button
                              key={qrIdx}
                              type="button"
                              className="adm-ai-pill-btn"
                              onClick={() => handleSendMessage(qr)}
                            >
                              <TbMessageDots size={12} className="adm-ai-pill-icon" />
                              <span>{qr}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="adm-ai-msg-group ai">
                  <div className="adm-ai-msg-avatar">
                    <TbSparkles size={14} />
                  </div>
                  <div className="adm-ai-bubble ai typing">
                    <span className="adm-ai-typing-dot" />
                    <span className="adm-ai-typing-dot" />
                    <span className="adm-ai-typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer Input */}
          <div className="adm-ai-chat-footer">
            <div className="adm-ai-input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về villa Đà Lạt, homestay, tour, ưu đãi..."
                className="adm-ai-input"
                disabled={isLoading}
              />
              <button
                type="button"
                className={`adm-ai-send-btn ${inputMessage.trim() ? 'active' : ''}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                title="Gửi tin nhắn"
              >
                <TbSend size={15} />
              </button>
            </div>
            <div className="adm-ai-footer-note">
              <TbShieldCheck size={13} className="adm-ai-shield-icon" />
              <span>Cam kết bảo mật tuyệt đối • Chỉ khai thác dữ liệu du lịch công khai</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatBubble;
