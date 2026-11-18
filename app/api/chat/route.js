import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = "https://vireonix.ai/v1/chat/completions";

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "پیامی برای ارسال وجود ندارد." }, { status: 400 });
    }

    const safeMessages = messages
      .filter((item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string"
      )
      .slice(-24)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 12000)
      }));

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "آخرین پیام باید از طرف کاربر باشد." }, { status: 400 });
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "auto",
        messages: safeMessages,
        stream: false
      }),
      signal: AbortSignal.timeout(60000),
      cache: "no-store"
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const message = upstream.status === 429
        ? "سهمیهٔ ساعتی سرویس فعلاً پر شده. کمی بعد دوباره امتحان کن."
        : (data?.error?.message || "سرویس هوش مصنوعی فعلاً پاسخ نمی‌دهد.");
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "پاسخ معتبری از سرویس دریافت نشد." }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error?.name === "TimeoutError"
      ? "زمان پاسخ‌گویی تمام شد. دوباره تلاش کن."
      : "ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کن.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
