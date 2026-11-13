const { createHash } = require("node:crypto");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const { BadRequestError, ConflictError } = require("../utils/errors");

function requiredText(value, label, maximumLength) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maximumLength) {
    throw new BadRequestError(`Enter a valid ${label}.`);
  }
  return value.trim();
}

function normalizeCheckout(body = {}) {
  if (body.paymentMethod !== "cod") {
    throw new BadRequestError("Only cash on delivery is currently available.");
  }
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) {
    throw new BadRequestError("Choose between 1 and 50 items.");
  }
  const items = body.items.map((item) => {
    if (!item || !mongoose.isObjectIdOrHexString(item.productId) ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      throw new BadRequestError("One or more cart items are invalid.");
    }
    const color = item.color ?? "";
    const size = item.size ?? "";
    if (typeof color !== "string" || typeof size !== "string" || color.length > 100 || size.length > 100) {
      throw new BadRequestError("Choose valid colours and sizes.");
    }
    return { productId: String(item.productId).toLowerCase(), quantity: item.quantity, color: color.trim(), size: size.trim() };
  });
  items.sort((first, second) => JSON.stringify(first).localeCompare(JSON.stringify(second)));

  const address = body.shippingAddress || {};
  const shippingAddress = {
    fullName: requiredText(address.fullName, "recipient name", 100),
    phone: requiredText(address.phone, "phone number", 20),
    addressLine: requiredText(address.addressLine, "street address", 300),
    city: requiredText(address.city, "city", 100),
    state: requiredText(address.state, "state", 100),
    postalCode: requiredText(address.postalCode, "PIN code", 6),
    country: "India",
  };
  if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
    throw new BadRequestError("Enter a valid 10-digit Indian mobile number.");
  }
  if (!/^[1-9]\d{5}$/.test(shippingAddress.postalCode)) {
    throw new BadRequestError("Enter a valid 6-digit PIN code.");
  }
  return { items, shippingAddress, paymentMethod: "cod" };
}

function calculateItems(requestedItems, products) {
  const quantities = new Map();
  let subtotalPaise = 0;
  const items = requestedItems.map((item) => {
    const product = products.find((entry) => String(entry._id) === item.productId);
    if (!product) throw new ConflictError("A product is no longer available. Update your bag.");
    for (const option of ["color", "size"]) {
      const choices = (product[option] || []).map((value) => value.trim()).filter(Boolean);
      if (choices.length ? !choices.includes(item[option]) : Boolean(item[option])) {
        throw new ConflictError(`Choose an available ${option} for ${product.name}.`);
      }
    }
    const unitPricePaise = Math.round(product.price * 100);
    if (typeof product.price !== "number" || !Number.isSafeInteger(unitPricePaise) || unitPricePaise < 0) {
      throw new ConflictError(`A current price is unavailable for ${product.name}.`);
    }
    const quantity = (quantities.get(item.productId) || 0) + item.quantity;
    quantities.set(item.productId, quantity);
    if (!Number.isInteger(product.stock) || product.stock < quantity) {
      throw new ConflictError(`Not enough stock for ${product.name}. Update your bag.`);
    }
    const lineTotalPaise = unitPricePaise * item.quantity;
    subtotalPaise += lineTotalPaise;
    if (!Number.isSafeInteger(subtotalPaise)) throw new BadRequestError("The order total is too large.");
    return {
      ...item, name: product.name, image: Product.imageForColor(product, item.color),
      unitPrice: unitPricePaise / 100, lineTotal: lineTotalPaise / 100,
    };
  });
  return { items, quantities, subtotalPaise };
}

async function buildQuote(userId, checkout, session = null) {
  const products = await Product.find({ _id: { $in: checkout.items.map((item) => item.productId) } }).session(session).lean();
  const { items, quantities, subtotalPaise } = calculateItems(checkout.items, products);

  return {
    quantities,
    data: {
      items,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: "cod",
      subtotal: subtotalPaise / 100,
      discountAmount: 0,
      deliveryCharge: 0,
      totalAmount: subtotalPaise / 100,
      totalPaise: subtotalPaise,
      currency: "INR",
    },
  };
}

function checkoutFingerprint(checkout, expectedTotalPaise) {
  return createHash("sha256").update(JSON.stringify({ checkout, expectedTotalPaise })).digest("hex");
}

async function placeCodOrder(userId, body) {
  const checkout = normalizeCheckout(body);
  if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) {
    throw new BadRequestError("A valid checkout request ID is required.");
  }
  if (!Number.isSafeInteger(body.expectedTotalPaise) || body.expectedTotalPaise < 0) {
    throw new BadRequestError("Review your order total before placing it.");
  }
  const requestFingerprint = checkoutFingerprint(checkout, body.expectedTotalPaise);

  function verifyRetry(payment) {
    if (payment.requestFingerprint !== requestFingerprint) {
      throw new ConflictError("This checkout request was already used. Start a new checkout.");
    }
    return payment;
  }

  try {
    return await mongoose.connection.transaction(async (session) => {
      const previous = await Payment.findOne({ userId, requestId: body.requestId }).session(session).lean();
      if (previous) return verifyRetry(previous);
      const { data: quote, quantities } = await buildQuote(userId, checkout, session);
      if (quote.totalPaise !== body.expectedTotalPaise) {
        throw new ConflictError("Prices have changed. Review your order again.");
      }
      for (const [productId, quantity] of quantities) {
        const stockUpdate = await Product.updateOne(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } }, { session },
        );
        if (stockUpdate.modifiedCount !== 1) throw new ConflictError("Stock has changed. Update your bag.");
      }
      const [payment] = await Payment.create([{
        userId,
        productId: [...quantities.keys()],
        items: quote.items,
        shippingAddress: quote.shippingAddress,
        paymentMethod: "cod",
        status: "pending",
        orderStatus: "confirmed",
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        totalAmount: quote.totalAmount,
        requestId: body.requestId,
        requestFingerprint,
      }], { session });
      return payment.toObject();
    });
  } catch (error) {
    if (error.code === 11000) {
      const previous = await Payment.findOne({ userId, requestId: body.requestId }).lean();
      if (previous) return verifyRetry(previous);
      throw new ConflictError("This order request was already used. Please review your order.");
    }
    throw error;
  }
}

module.exports = { normalizeCheckout, calculateItems, buildQuote, placeCodOrder, checkoutFingerprint };
