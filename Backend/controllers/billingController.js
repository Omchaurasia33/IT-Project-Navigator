const Tenant = require('../models/Tenant');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get Razorpay Key ID
// @route   GET /billing/key
// @access  Protected
exports.getRazorpayKey = (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create a Razorpay order
// @route   POST /billing/create-order
// @access  Protected
exports.createOrder = async (req, res) => {
  try {
    const { duration } = req.body;
    let amount;
    if (duration === 30) amount = 30000; // ₹300 in paise
    else if (duration === 60) amount = 50000; // ₹500 in paise
    else return res.status(400).json({ message: 'Invalid plan duration.' });

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_tenant_${req.tenantId}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify payment and update subscription
// @route   POST /billing/verify-payment
// @access  Protected
exports.verifyPayment = async (req, res) => {
  const crypto = require('crypto');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, duration } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment is authentic
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + duration);

    tenant.plan = duration === 30 ? 'monthly' : 'pro';
    tenant.subscriptionStatus = 'active';
    tenant.subscriptionEndsAt = subscriptionEndsAt;
    
    await tenant.save();

    res.json({ message: 'Payment successful', tenant });
  } else {
    res.status(400).json({ message: 'Invalid signature' });
  }
};