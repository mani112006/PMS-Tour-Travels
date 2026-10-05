export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const booking = req.body;

    const emailText = `
New PMS Tour & Travels Booking

Booking ID: ${booking.booking_code || "-"}
Customer Name: ${booking.customer_name || "-"}
Phone: ${booking.phone || "-"}
Trip Type: ${booking.trip_type || "-"}
Days: ${booking.number_of_days || "-"}
Pickup: ${booking.pickup_location || "-"}
Drop: ${booking.drop_location || "-"}
Date: ${booking.start_date || "-"}
Time: ${booking.start_time || "-"}
Passengers: ${booking.passengers || "-"}
Service: ${booking.service_type || "-"}
Destinations: ${booking.destinations || "-"}
Additional Details: ${booking.additional_details || "-"}
`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "PMS Tour & Travels <onboarding@resend.dev>",
        to: ["selvamani0089@gmail.com"],
        subject: `New Booking - ${booking.booking_code || "PMS"}`,
        text: emailText
      })
    });

    const data = await response.json();

    console.log("RESEND STATUS:", response.status);
    console.log("RESEND RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        resend_status: response.status,
        resend_error: data
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking email sent successfully",
      resend: data
    });

  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
