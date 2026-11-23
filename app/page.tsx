"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(true);
  const [error, setError] = useState("");

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setValue("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "پاسخی دریافت نشد.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارتباط برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>Ai</span></div>
        <button className="new-chat" onClick={() => { setMessages([]); setError(""); }}>＋ گفت‌وگوی جدید</button>
        <div className="side-label">فضای کاری</div>
        <div className="side-link active">▣　 چت هوش مصنوعی</div>
        <div className="side-link">◷　 تاریخچه</div>
        <div className="side-link">⚙　 تنظیمات</div>
        <div className="sidebar-bottom"><span className="status-dot" /> اتصال به ویرا</div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><div className="mobile-brand">✦ Ai</div><div className="model-pill"><span className="status-dot" /> مدل ویرا <b>Vira</b></div><div className="avatar">P</div></header>
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">✦</div>
              <p className="eyebrow">به دنیای ایده‌ها خوش اومدی</p>
              <h1>امروز چی تو ذهنته؟</h1>
              <p className="subheading">سؤالت رو بپرس، ایده‌ات رو بساز یا برای حل یک مسئله کمک بگیر.</p>
              <div className="suggestions">
                {["یک سایت جذاب طراحی کن","هوش مصنوعی رو ساده توضیح بده","برای پروژه‌ام ایده بده"].map((s) => <button key={s} onClick={() => setValue(s)}>{s}<span>↗</span></button>)}
              </div>
            </div>
          ) : (
            <div className="messages">{messages.map((m, i) => <div className={m.role === "user" ? "message user-message" : "message assistant-message"} key={i}><div className="message-avatar">{m.role === "user" ? "ش" : "✦"}</div><div className="message-content"><div className="message-role">{m.role === "user" ? "شما" : "Ai"}</div><p>{m.content}</p></div></div>)}{busy && <div className="typing"><span/> <span/> <span/> <small>Ai در حال فکر کردنه…</small></div>}</div>
          )}
        </div>
        <div className="composer-wrap">
          {error && <div className="error-box">{error}</div>}
          {notice && <div className="privacy-note"><span>ⓘ</span><div><b>نکته درباره حریم خصوصی</b><p>پیام‌ها برای دریافت پاسخ به سرویس ویرا فرستاده می‌شوند. پیش از استفاده از اطلاعات شخصی یا محرمانه، سیاست حریم خصوصی سرویس را بررسی کن.</p></div><button aria-label="بستن" onClick={() => setNotice(false)}>×</button></div>}
          <form className="composer" onSubmit={send}>
            <textarea value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement)?.requestSubmit(); } }} placeholder="پیامت رو برای Ai بنویس..." rows={1} />
            <button className="send-button" disabled={busy || !value.trim()} aria-label="ارسال پیام">{busy ? "…" : "↑"}</button>
          </form>
          <div className="composer-caption">Ai ممکن است اشتباه کند؛ پاسخ‌های مهم را بررسی کن.</div>
        </div>
      </section>
    </main>
  );
}
