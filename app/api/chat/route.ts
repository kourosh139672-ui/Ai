import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return NextResponse.json({ error: "تعداد پیام‌ها معتبر نیست." }, { status: 400 });
    }
    const safeMessages = messages.map((m) => {
      if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || !m.content.trim()) {
        throw new Error("ساختار پیام معتبر نیست.");
      }
      return { role: m.role, content: m.content.slice(0, 12000) };
    });

    const upstream = await fetch("https://vireonix.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "auto", messages: safeMessages }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = upstream.status === 429
        ? "سهمیهٔ ساعتی سرویس فعلاً پر شده؛ کمی بعد دوباره امتحان کن."
        : "سرویس هوش مصنوعی موقتاً پاسخ‌گو نیست.";
      return NextResponse.json({ error: message }, { status: upstream.status === 429 ? 429 : 502 });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "پاسخ سرویس خالی بود." }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error && error.message === "ساختار پیام معتبر نیست."
      ? error.message : "در پردازش درخواست مشکلی پیش آمد.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
