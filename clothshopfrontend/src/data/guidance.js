// Original store guidance informed by H&M customer service, UNIQLO care/fit
// guides, and the National Consumer Helpline. Retailer-specific policies are
// intentionally not presented as HIFASHOPNHUB delivery or refund promises.
export const guidancePages = [
  {
    path: "/help", title: "Help Centre", summary: "A little guidance, from finding your fit to looking after your next favourite.", type: "hub",
    sections: [{ title: "Start here", paragraphs: ["New to HIFASHOPNHUB? Follow our shopping guide to browse collections, choose your options and review your bag. For an existing purchase, keep its reference number handy and open My Account to view any saved payment records.", "Choose a topic below for practical answers. Product-specific information and the details supplied with a confirmed purchase take priority over general shopping advice."] }],
  },
  {
    path: "/how-to-shop", title: "How to shop", summary: "Find something you love, choose the right options and review every detail.",
    sections: [
      { title: "1. Explore your style", paragraphs: ["Start with Shop All, New Arrivals, Women, Men or Accessories. Use the search field, category filter and sorting options to narrow down the collection. Open a product for its description, available colours, sizes, price and stock information."] },
      { title: "2. Choose your fit", paragraphs: ["Select the colour and size you want before choosing a quantity. The size guide explains how to take measurements; the options shown on each product determine what you can select. If your preferred option is unavailable, choose another listed option rather than ordering a different size by mistake."] },
      { title: "3. Build your bag", paragraphs: ["Add to Bag keeps your selection together. Buy Now opens a separate review of the selected product. In your bag you can change quantities, remove an item or return to shopping. Adding something to the bag does not reserve stock."] },
      { title: "4. Check before you confirm", paragraphs: ["Review product options, quantities and the latest displayed prices. A shopping bag or checkout review is not an order confirmation. Only treat a purchase as submitted when an explicit confirmation and reference are provided. Never make a separate payment just because an item appears in your bag."] },
      { title: "5. Manage your account", paragraphs: ["Use My Account to update your name, phone number and location. Order History displays saved purchase/payment records, including their payment status. If you forget your password, use Password Help to request an email verification code."] },
    ],
  },
  {
    path: "/payments", title: "Payments", summary: "Understand your total, payment status and the difference between a purchase and a payment.",
    sections: [
      { title: "Check the amount", paragraphs: ["Prices are displayed in Indian rupees (INR). Review the selected items, quantity and total before confirming a purchase. Delivery charges or other charges must be disclosed with the final order details; do not assume that a product price includes a delivery service."] },
      { title: "Use only the methods actually offered", paragraphs: ["A payment option is available only when it appears in a working checkout. A review screen alone does not collect money or confirm an order. Do not transfer money to a personal number, bank account or QR code supplied by an unsolicited caller."] },
      { title: "Cash on Delivery", paragraphs: ["If Cash on Delivery is offered for your purchase, payment is collected when the parcel is delivered. Selecting COD is not an online payment. A pending payment record should not be read as paid; keep the receipt or payment acknowledgement when money is collected."] },
      { title: "Read your history", bullets: ["Pending: payment has not been recorded as completed.", "Paid: the record shows a completed payment.", "Failed: the payment attempt did not complete successfully.", "Refunded: the record indicates a refund. Bank posting times may differ from the record date."], paragraphs: ["For a disputed amount, keep the purchase reference, transaction reference, date and amount. Do not send a full card number, CVV, password or OTP when seeking help."] },
    ],
  },
  {
    path: "/shipping", title: "Shipping & delivery", summary: "Prepare your address, understand delivery updates and know what to check when a parcel arrives.",
    sections: [
      { title: "Before a purchase", paragraphs: ["Delivery coverage, charges and arrival estimates depend on the destination and the delivery service offered for a specific purchase. Check the information attached to a confirmed order. Browsing a product or adding it to your bag is not proof that your PIN code is serviceable."] },
      { title: "Give a complete address", bullets: ["Recipient name and a reachable mobile number.", "House, flat or building number; street/address lines; area or locality.", "City, state, country and the correct PIN code.", "A useful landmark or building entry detail where necessary."], paragraphs: ["Check spelling and the PIN code carefully. If an address is wrong, use the contact details supplied with the purchase as soon as possible. An address change may no longer be possible after dispatch."] },
      { title: "Follow parcel updates", paragraphs: ["When a carrier and tracking reference have been supplied, use the carrier's official tracking page. A newly issued reference may take time to show a scan. If a delivery attempt fails, follow the carrier's verified instructions; do not share account or banking OTPs with a caller."] },
      { title: "Inspect your delivery", paragraphs: ["Keep the packaging and label until you have checked the contents. If an item is missing, incorrect or damaged, photograph the parcel, shipping label and affected item, then refer to Cancellation & Returns. A delivery estimate should not be treated as a guarantee unless it is explicitly described that way for your order."] },
    ],
  },
  {
    path: "/cancellation-returns", title: "Cancellation & returns", summary: "Know what to prepare if you need to cancel, exchange or report a problem.",
    sections: [
      { title: "Check the terms of your purchase", paragraphs: ["Return eligibility, request windows, pickup availability, fees and exchange options are purchase-specific. Read the product information and your order confirmation before relying on a return. This guide does not set a store-wide return window or promise a free pickup."] },
      { title: "Need to cancel?", paragraphs: ["Request cancellation as early as possible using the contact details provided with your purchase. Keep the reference number and the items you want to cancel ready. A packed or dispatched parcel may require a return process instead; do not assume a request has been accepted without confirmation."] },
      { title: "Keep an item ready for a return", bullets: ["For a change-of-mind request, keep the garment unworn, unwashed and unaltered, with its tags and accessories.", "Retain the packaging, invoice or receipt, and any supplied return paperwork.", "Check item-specific hygiene restrictions before opening seals or removing protective liners.", "Wait for verified return instructions before sending a parcel; retain proof of posting or collection." ] },
      { title: "Wrong, damaged or faulty items", paragraphs: ["Record the issue before wearing or washing the item. Keep clear photographs, the shipping label and proof of purchase. Explain whether the problem concerns the item, a missing component or damage in transit. A fault complaint is different from simply changing your mind about a size or style."] },
      { title: "Refunds and exchanges", paragraphs: ["Confirm the approved refund method and amount, or the availability of a replacement, with the party handling the purchase. An exchange depends on stock. Do not pay a fee or share a banking OTP merely to receive a refund. Applicable consumer rights continue to apply."] },
    ],
  },
  {
    path: "/size-guide", title: "Size & fit guide", summary: "Use measurements, not guesswork. The same size label can fit differently across styles.", type: "size",
    sections: [
      { title: "Measure before you choose", paragraphs: ["Use a flexible tape over light clothing and keep it level without pulling it tight. Record the unit with each measurement. Ask someone to help with shoulder width and sleeve length if you cannot hold the tape in position."] },
      { title: "Body size and garment size are different", paragraphs: ["A body measurement describes you; a garment measurement describes the finished item. Garments usually allow room for movement, and an oversized cut deliberately adds more. Compare like with like. For a familiar fit, lay a well-fitting garment flat and compare its measurements with the product information where provided."] },
      { title: "Make a fit decision", bullets: ["Check the specific product's listed sizes and any fit description.", "Prioritise the measurement most relevant to the garment: chest for shirts, waist and hips for bottoms.", "Allow for layering when choosing jackets and outerwear.", "Do not rely on a universal S/M/L conversion: cuts and brands vary."], paragraphs: ["There is no single HIFASHOPNHUB measurement chart covering every listed item. This guide explains measuring technique rather than assigning an unverified size to your body."] },
    ],
  },
  {
    path: "/clothing-care", title: "Clothing care", summary: "Small habits can help your clothes keep their colour, shape and feel.",
    sections: [
      { title: "Start with the label", paragraphs: ["The sewn-in care label takes priority over general advice. Check whether the item can be machine washed, hand washed or professionally cleaned, and follow its washing, drying and ironing symbols. Do not use a general cotton setting for a delicate blend."] },
      { title: "Before washing", bullets: ["Separate light and dark colours, and treat a new strongly coloured item cautiously.", "Empty pockets, close zips and turn printed or dark garments inside out where appropriate.", "Use a laundry bag for delicate items when the label permits machine washing.", "Avoid overcrowding the machine; use the detergent amount recommended for the load." ] },
      { title: "Dry with care", paragraphs: ["Use tumble drying only when the label allows it. Reshape damp knitwear and dry it flat when instructed, rather than stretching it on a hanger. Shade drying can help protect colour. Avoid placing garments directly on a heater."] },
      { title: "A few fabric reminders", paragraphs: ["Denim: wash with compatible colours and follow its label to limit unwanted dye transfer. Wool and delicate knits: use the specified gentle method and avoid wringing. Synthetics and activewear: follow instructions on heat and fabric softener. Prints and embellishments: avoid direct hot ironing unless the label expressly permits it."] },
      { title: "Between wears", paragraphs: ["Air garments when suitable, fold heavier knitwear and store clean, dry pieces away from damp conditions. Check seams and fastenings early so a small repair does not become a bigger tear."] },
    ],
  },
  {
    path: "/faq", title: "Frequently asked questions", summary: "Quick answers about shopping, your account and payment records.", type: "faq",
    questions: [
      ["How do I find a product?", "Open Shop All or a collection, then use search, category filters and sorting. Product details show the listed options, description and current price."],
      ["Why can I not increase the quantity?", "The requested quantity may exceed current stock. Quantities of the same product across different options can also count towards the stock limit."],
      ["Does Add to Bag reserve an item?", "No. Stock and prices can change before a purchase is confirmed. Review the current selection before continuing."],
      ["What is the difference between Buy Now and Add to Bag?", "Buy Now opens a review of the selected product. Add to Bag keeps products together for later review. Neither action by itself places an order or takes payment."],
      ["Where is my order history?", "Open My Account and select Order History. It shows saved payment records. An empty history means no records were returned for your signed-in account; it is not proof that a payment succeeded or failed."],
      ["What does pending payment mean?", "Payment has not been recorded as completed. In a COD purchase, you pay on delivery; selecting COD does not make a record paid."],
      ["How do I reset my password?", "Use Password Help, enter your registered email and follow the verification-code and new-password steps. Keep the code private and request a fresh one if it expires."],
      ["Can I return something that does not fit?", "Check the eligibility and request window given for your purchase. Keep the item unworn with its tags while you check the instructions. The size guide can help with your next selection."],
      ["Why might a colour look different on my screen?", "Lighting, photography and display settings affect appearance. Read the listed colour and product description alongside the photographs."],
      ["How do I delete my account?", "Open My Account, go to Account management and follow the password and confirmation steps. Deletion is permanent for the user account; it does not automatically remove separate payment records."],
    ],
  },
  {
    path: "/contact", title: "Contact & account help", summary: "Get to the right information, and prepare the details that make a purchase query easier to resolve.", type: "contact",
    sections: [
      { title: "For an existing purchase", paragraphs: ["Use the seller or support contact supplied with your order confirmation or receipt. Include your purchase reference, the email used for the purchase, the item name and a short explanation of the issue. Add clear photos for an incorrect or damaged item.", "Avoid sending passwords, email verification codes, full card numbers or card security codes. Use only verified contact details, rather than phone numbers posted in comments or sent by an unsolicited account."] },
      { title: "For account access", paragraphs: ["Password Help can send a verification code to your registered email. If a code does not arrive, check the email spelling and spam folder before requesting another. My Account lets you update your profile details after you sign in."] },
      { title: "Before raising a query", bullets: ["Check Order History for the reference, date, amount and recorded payment status.", "Check Shipping & Delivery for address and parcel guidance.", "Read Cancellation & Returns before sending an item back.", "Use the FAQ for common product and account questions." ] },
    ],
  },
  {
    path: "/privacy", title: "Privacy & browser storage", summary: "A plain-language explanation of account information and the settings you control.",
    sections: [
      { title: "Account information", paragraphs: ["Creating an account uses your name, email and password. Profile details can also include a phone number, city, country and profile image. Passwords are stored as hashes. Password recovery uses an email verification code and expiry information.", "If you choose an available social sign-in option, the provider supplies verified account information such as your email, name and profile photo. Your use of the provider is also covered by its own privacy settings."] },
      { title: "Cookies and local storage", paragraphs: ["A session cookie keeps you signed in. Browser storage remembers account identifiers, your colour-theme preference and the shopping bag on this device. These are different from a payment receipt or an order confirmation.", "Signing out clears the app's account state. Clearing site data in your browser can also sign you out and remove the locally saved shopping bag and display preference. On a shared device, sign out before leaving."] },
      { title: "Other services involved", paragraphs: ["Email delivery, optional sign-in providers and externally hosted product or editorial images involve other services. Loading those resources can send network information, such as an IP address, to the service providing them. Review the provider's privacy information when choosing its services."] },
      { title: "Your account controls", paragraphs: ["You can update supported profile fields in My Account and request account deletion there using your password. Removing the account does not automatically erase separately stored payment records. For a purchase-related information request, use the contact details supplied with that purchase."] },
    ],
  },
  {
    path: "/terms", title: "Website terms", summary: "Important points to read while using HIFASHOPNHUB and reviewing a possible purchase.",
    sections: [
      { title: "Using the website", paragraphs: ["Use accurate information when creating an account or entering purchase details. Keep your login private and use the account only for lawful activity. Do not attempt to access another person's account, disrupt the service or misuse verification and sign-in features."] },
      { title: "Products and prices", paragraphs: ["Product descriptions, listed colours, sizes and availability should be checked for the specific item. Images are an aid to selection; screen settings and photography can affect appearance. Review the current price and all disclosed charges before confirming a purchase."] },
      { title: "Bag, checkout and confirmation", paragraphs: ["A saved shopping bag is a selection, not a stock reservation or an accepted order. A checkout review is not evidence of payment. Rely on an explicit purchase confirmation and its reference to understand whether a transaction was submitted. Do not treat a payment-history status as a delivery-tracking status."] },
      { title: "Delivery, cancellation and returns", paragraphs: ["Purchase-specific terms must identify delivery arrangements and any cancellation, return, exchange and refund conditions. The general guidance pages do not create an unannounced delivery promise or return window. Check the information given with your confirmed purchase and keep a copy."] },
      { title: "Consumer rights", paragraphs: ["Nothing in these website guides is intended to remove mandatory rights that apply to a purchase. If a concern cannot be resolved with the seller, consult the relevant consumer-protection resources for your location. For India, the National Consumer Helpline publishes guidance on consumer rights and redressal."] },
    ],
  },
  {
    path: "/security", title: "Safe shopping", summary: "Protect your account and recognise common payment and delivery scams.",
    sections: [
      { title: "Keep your login private", bullets: ["Use a unique password and avoid sharing an account.", "Never disclose a password-reset OTP, even to someone claiming to be support.", "Sign out on shared devices and avoid saving credentials on a public computer.", "Open Password Help yourself if you need to reset a password; avoid unexpected reset links." ] },
      { title: "Check where you are signing in", paragraphs: ["Use the website address you intended to visit and check the spelling of the domain. For social login, enter provider credentials only in the provider's own sign-in interface. A copied logo or a padlock icon on its own does not prove that an unexpected message is genuine."] },
      { title: "Protect your money", paragraphs: ["Do not share card security codes, banking OTPs or a UPI PIN in a chat or phone call. Do not install remote-access software or approve an unexpected payment request to receive a refund. Treat urgent requests for a delivery fee from unknown senders cautiously and verify them through the carrier's official channel."] },
      { title: "If something seems wrong", paragraphs: ["Stop the interaction, keep screenshots and transaction references, and contact your bank or payment provider through its official service if money may be at risk. Change an exposed account password and review your saved payment history. Never post private payment information in a public review."] },
    ],
  },
  { path: "/sitemap", title: "Sitemap", summary: "Every collection, account shortcut and help guide in one place.", type: "sitemap", sections: [] },
];

export const footerGroups = [
  { title: "ABOUT US", links: [{ label: "Our story", to: "/about" }, { label: "Contact & help", to: "/contact" }, { label: "Sitemap", to: "/sitemap" }] },
  { title: "CUSTOMER HELP", links: [{ label: "Help Centre", to: "/help" }, { label: "Payments", to: "/payments" }, { label: "Shipping & delivery", to: "/shipping" }, { label: "Cancellation & returns", to: "/cancellation-returns" }, { label: "FAQ", to: "/faq" }] },
  { title: "SHOPPING GUIDES", links: [{ label: "How to shop", to: "/how-to-shop" }, { label: "Size & fit guide", to: "/size-guide" }, { label: "Clothing care", to: "/clothing-care" }, { label: "Order History", to: "/profile?section=orders" }] },
  { title: "YOUR INFORMATION", links: [{ label: "Privacy & storage", to: "/privacy" }, { label: "Website terms", to: "/terms" }, { label: "Safe shopping", to: "/security" }, { label: "Password help", to: "/forgot-password" }] },
];
