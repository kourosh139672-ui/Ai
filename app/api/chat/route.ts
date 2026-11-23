import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  let safeMessages: ChatMessage[];

  try {
    const body = await request.json();
    const messages = body?.messages as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return NextResponse.json({ error: "تعداد پیام‌ها معتبر نیست." }, { status: 400 });
    }

    safeMessages = messages.map((message) => {
      if (
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim()
      ) {
        throw new Error("ساختار پیام معتبر نیست.");
      }
      return { role: message.role, content: message.content.slice(0, 12000) };
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "ساختار پیام معتبر نیست."
        ? error.message
        : "درخواست ارسال‌شده معتبر نیست.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Provider details are configured on the server, never in browser code or Git.
  const apiUrl = process.env.IVIRA_API_URL;
  const apiKey = process.env.IVIRA_API_KEY;
  const model = process.env.IVIRA_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return NextResponse.json(
      { error: "اتصال ویرا هنوز پیکربندی نشده است. تنظیمات سرور کامل نیست." },
      { status: 503 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiUrl);
    if (parsedUrl.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    return NextResponse.json(
      { error: "نشانی API ویرا معتبر نیست؛ باید یک نشانی HTTPS باشد." },
      { status: 500 }
    );
  }

  try {
    const upstream = await fetch(parsedUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages: safeMessages }),
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const message =
        upstream.status === 429
          ? "سهمیه سرویس فعلاً تمام شده؛ بعداً دوباره امتحان کن."
          : upstream.status === 401 || upstream.status === 403
            ? "احراز هویت سرویس ناموفق بود؛ تنظیمات دسترسی را بررسی کن."
            : "سرویس ویرا فعلاً پاسخ‌گو نیست.";
      return NextResponse.json(
        { error: message },
        { status: upstream.status === 429 ? 429 : 502 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        { error: "پاسخ API با قالب مورد انتظار سازگار نیست." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "ارتباط با API برقرار نشد؛ نشانی و وضعیت سرویس را بررسی کن." },
      { status: 502 }
    );
  }
}
