import { Resend } from "resend";

export default async function handler(req, res) {
  // 1) Разрешаем только POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    // 2) Забираем поля безопасно
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // 3) Env vars (те, что ты добавил в Vercel)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL;
    const TO_EMAIL = process.env.TO_EMAIL;

    if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL) {
      return res
        .status(500)
        .json({ ok: false, error: "Server env vars not set" });
    }

    // 4) Отправка письма
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `New project request — ${name}`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Failed to send email" });
  }
}
