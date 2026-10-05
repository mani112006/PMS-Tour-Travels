export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { booking } = req.body || {};

    if (!booking) {
      return res.status(400).json({ error: "Booking data missing" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: "Telegram configuration missing" });
    }

    function formatTime(time) {
      if (!time) return "-";

      const [h, m = "00"] = String(time).split(":");
      const hour = Number(h);

      if (!Number.isFinite(hour)) return String(time);

      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;

      return `${hour12}:${m} ${suffix}`;
    }

    const message = `
🚕 NEW PMS TOUR & TRAVELS BOOKING

🆔 Booking ID: ${booking.booking_code || "-"}
👤 Customer: ${booking.customer_name || "-"}
📞 Phone: ${booking.phone || "-"}
🚗 Trip Type: ${booking.trip_type || "-"}
📅 Date: ${booking.start_date || "-"}
⏰ Time: ${formatTime(booking.start_time)}
👥 Passengers: ${booking.passengers || "-"}
📍 Pickup: ${booking.pickup_location || "-"}
📍 Drop: ${booking.drop_location || "-"}
🛣️ Service: ${booking.service_type || "-"}
🌍 Destinations: ${booking.destinations || "-"}
📝 Details: ${booking.additional_details || "-"}

🔐 Open Owner Login:
https://pms-tour-travels.vercel.app/login.html
`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: data.description || "Telegram message failed"
      });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Telegram notification error:", error);

    return res.status(500).json({
      error: "Telegram notification failed"
    });
  }
}
