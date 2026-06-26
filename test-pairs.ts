import Razorpay from "razorpay";

const pair1 = {
  key_id: "rzp_live_T5ovSvf1uYzivo",
  key_secret: "J7v5I53Mv4ffndlqt61uIKK"
};

const pair2 = {
  key_id: "rzp_test_T5Du2fM5vf01v5",
  key_secret: "uhatq31gpn0GOCKDgikRK8Kq"
};

async function testPair(name: string, p: any) {
  console.log(`Testing ${name}... Key ID: ${p.key_id}`);
  try {
    const rzp = new Razorpay({
      key_id: p.key_id,
      key_secret: p.key_secret
    });
    const order = await rzp.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "test_" + Date.now()
    });
    console.log(`✅ ${name} SUCCESS! Order ID: ${order.id}`);
  } catch (err: any) {
    console.log(`❌ ${name} FAILED! Error:`, err.description || err.message || err);
  }
}

async function run() {
  await testPair("Pair 1 (.env file)", pair1);
  await testPair("Pair 2 (system environment)", pair2);
}

run();
