import Razorpay from "razorpay";
import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const keyId     = (process.env.RAZORPAY_KEY_ID     || "").replace(/['"]/g, "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();

  if (!keyId || !keySecret)
    return res.status(500).json({ error: "Razorpay keys not configured on server." });

  let RazorpayClass = Razorpay;
  if (typeof Razorpay !== "function")
    RazorpayClass = Razorpay.default || Razorpay.Razorpay || Razorpay;

  const razorpay = new RazorpayClass({ key_id: keyId, key_secret: keySecret });
  const { amount, receipt } = req.body;

  if (!amount || typeof amount !== "number" || !Number.isInteger(amount) || amount < 100)
    return res.status(400).json({ error: "amount must be an integer >= 100 paise." });

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receipt || `rcpt_${crypto.randomBytes(5).toString("hex")}`,
    });
    console.log("[create-order] OK:", order.id);
    return res.status(200).json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("[create-order] Error:", err);
    const msg = err?.error?.description || err?.message || "Failed to create order.";
    return res.status(500).json({ error: msg });
  }
}
