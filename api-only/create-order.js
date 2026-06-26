import Razorpay from "razorpay";
import crypto from "crypto";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();

  if (!keyId || !keySecret) {
    console.error("[create-order] Razorpay keys missing from environment.");
    return res.status(500).json({ error: "Razorpay keys not configured on server." });
  }

  let RazorpayClass = Razorpay;
  if (typeof Razorpay !== "function") {
    RazorpayClass = Razorpay.default || Razorpay.Razorpay || Razorpay;
  }

  const razorpay = new RazorpayClass({ key_id: keyId, key_secret: keySecret });

  const { amount, receipt } = req.body;

  const errors = [];
  if (amount === undefined || amount === null) errors.push("Amount is missing.");
  else if (typeof amount !== "number") errors.push("Amount must be a number.");
  else if (!Number.isInteger(amount)) errors.push("Amount must be an integer (paise).");
  else if (amount < 100) errors.push("Amount must be at least 100 paise.");

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Number(amount),
      currency: "INR",
      receipt: receipt || `receipt_${crypto.randomBytes(6).toString("hex")}`,
    });

    console.log("[create-order] Order created:", order.id);
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[create-order] Razorpay error:", err);
    const msg = err?.error?.description || err?.message || "Failed to create order.";
    return res.status(500).json({ error: msg });
  }
}
