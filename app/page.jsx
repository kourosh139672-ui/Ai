"use client";

import { useEffect, useRef, useState } from "react";

const starterPrompts = [
  "یک ایدهٔ جالب برای پروژهٔ برنامه‌نویسی بده",
  "هوش مصنوعی را ساده توضیح بده",
  "برای یادگیری زبان انگلیسی برنامه‌ریزی کن"
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(text = input) {
    const content = text.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setNotice("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "ارسال پیام ناموفق بود.");

      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setNotice(error.message || "خطایی رخ داد.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function startNewChat() {
    if (busy) return;
    setMessages([]);
    setNotice("");
    setMenuOpen(false);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><strong>PixAI</strong><span>فضای گفت‌وگوی هوشمند</span></div>
        </div>
        <button className="new-chat" onClick={startNewChat}>＋ گفت‌وگوی جدید</button>
        <div className="side-label">فضای کار</div>
        <div className="side-item active"><span>▤</span> گفت‌وگو</div>
        <div className="side-item"><span>✧</span> مدل هوشمند <small>Auto</small></div>
        <div className="sidebar-bottom">
          <div className="user-chip"><div className="avatar">P</div><div><b>کاربر PixAI</b><span>نسخهٔ آزمایشی</span></div></div>
        </div>
      </aside>

      {menuOpen && <button className="scrim" aria-label="بستن منو" onClick={() => setMenuOpen(false)} />}

      <section className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="منو">☰</button>
          <div className="top-title"><span className="status-dot" /> PixAI <span className="top-divider">/</span> گفت‌وگوی جدید</div>
          <div className="model-pill"><span>✦</span> Auto <i>آنلاین</i></div>
        </header>

        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">✦</div>
              <div className="eyebrow">به دنیای PixAI خوش اومدی</div>
              <h1>امروز چی توی ذهنته؟</h1>
              <p>سؤالت رو بپرس، ایده‌ات رو بساز یا دربارهٔ چیزی یاد بگیر.</p>
              <div className="prompt-grid">
                {starterPrompts.map((prompt) => (
                  <button key={prompt} className="prompt-card" onClick={() => sendMessage(prompt)}>
                    <span>✧</span>{prompt}<b>←</b>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <article className={`message ${message.role}`} key={index}>
                  <div className="message-avatar">{message.role === "assistant" ? "✦" : "ش"}</div>
                  <div className="message-content">
                    <div className="message-author">{message.role === "assistant" ? "PixAI" : "شما"}</div>
                    <p>{message.content}</p>
                  </div>
                </article>
              ))}
              {busy && <article className="message assistant"><div className="message-avatar">✦</div><div className="message-content"><div className="message-author">PixAI</div><div className="typing"><i/><i/><i/></div></div></article>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="composer-wrap">
          {notice && <div className="error-note">{notice}</div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="پیامت رو برای PixAI بنویس..."
              rows={1}
              disabled={busy}
            />
            <button className="send-button" type="submit" disabled={!input.trim() || busy} aria-label="ارسال پیام">↑</button>
          </form>
          <div className="composer-foot"><span>Enter برای ارسال · Shift + Enter برای خط جدید</span><span>مدل آنلاین Auto</span></div>
          <div className="privacy-note">پیام‌ها برای تولید پاسخ به Vireonix فرستاده می‌شوند؛ طبق سیاست آن ممکن است برای بهبود و آموزش مدل نگهداری و استفاده شوند. اطلاعات شخصی یا محرمانه نفرست.</div>
        </div>
      </section>
    </main>
  );
}
