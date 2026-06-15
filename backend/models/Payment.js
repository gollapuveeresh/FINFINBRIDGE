import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  clientId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Client',  required: true },
  invoiceId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount:             { type: Number, required: true },
  currency:           { type: String, default: 'INR' },
  gateway:            { type: String, enum: ['razorpay','stripe','manual'], default: 'razorpay' },
  gatewayOrderId:     { type: String, default: null },   // Razorpay order_id
  gatewayPaymentId:   { type: String, default: null },   // Razorpay payment_id
  gatewaySignature:   { type: String, default: null },   // for webhook verification
  status:             { type: String, enum: ['created','pending','paid','failed','refunded'], default: 'created' },
  method:             { type: String, enum: ['upi','card','netbanking','wallet','emi','manual',''], default: '' },
  paidAt:             { type: Date, default: null },
  refundId:           { type: String, default: null },
  refundedAt:         { type: Date, default: null },
  refundAmount:       { type: Number, default: null },
  notes:              { type: String, trim: true },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
