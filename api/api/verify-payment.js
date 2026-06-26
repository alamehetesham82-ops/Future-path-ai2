import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ error: "Missing: razorpay_order_id, razorpay_payment_id, razorpay_signature" });

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();
  if (!keySecret)
    return res.status(500).json({ error: "Razorpay secret not configured on server." });

  try {
    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated === razorpay_signature) {
      console.log("[verify-payment] OK:", razorpay_payment_id);
      return res.status(200).json({ success: true, payment_id: razorpay_payment_id });
    } else {
      console.error("[verify-payment] Signature mismatch");
      return res.status(400).json({ success: false, error: "Signature verification failed." });
    }
  } catch (err) {
    console.error("[verify-payment] Exception:", err);
    return res.status(500).json({ success: false, error: "Verification error." });
  }
}
