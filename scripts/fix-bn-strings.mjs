import fs from 'fs';

let c = fs.readFileSync('app/page.tsx', 'utf8');

const replacements = [
  ['Customer Stories', '{t.customerStories}'],
  ['Loved by Health-Conscious Bangladeshi Homes', '{t.reviewsTitle}'],
  ['Verified Buyer', '{t.verifiedBuyer}'],
  ['No reviews registered', '{t.noReviews}'],
  ['Submit Verified Feedback', '{t.addReviewTitle}'],
  ['Had a glass of raw Sundarban honey or ghee? Share your pure diet health wellness journey directly in our live board.', '{t.addReviewSub}'],
  ['Your Full Name', '{t.nameLabel}'],
  ['E.g., Tonmoy Ahmed', '{t.namePlaceholder}'],
  ['Rating Grade', '{t.ratingLabel}'],
  ['Your Real Experience', '{t.reviewTextLabel}'],
  ['Taste, aroma, delivery timing, purity tests...', '{t.reviewTextPlaceholder}'],
  ['Share My Experience', '{t.submitReview}'],
  ['Connect With Us', '{t.contactConnect}'],
  ['Always In Service Pure Organic Solutions', '{t.contactHeading}'],
  ['Have questions about custom family dietary orders or premium corporate gifting? Reach back to our central desk directly.', '{t.contactDesc}'],
  ['Drop us a line', '{t.dropLine}'],
  ['We generally read and resolve letters from health wellness seekers inside 1-2 hours.', '{t.contactFormHint}'],
  ['Your Name', '{t.nameLabel}'],
  ['Full Name', '{t.namePlaceholder}'],
  ['Email Address', '{t.emailLabel}'],
  ['E.g., name@gmail.com', 'example@gmail.com'],
  ['Your Message', '{t.messageLabel}'],
  ['Detail here your corporate requirements or query...', '{t.messagePlaceholder}'],
  ['Send Letter', '{t.sendButton}'],
  ['Standard-setting pure raw organic dietary health solutions direct from pristine fields of Bangladesh to Banani desks.', '{t.footerDesc}'],
  ['Quick Links', '{t.footerQuickLinks}'],
  ['Product Categories', '{t.footerProducts}'],
  ['Pristine Showcase', '{t.footerShowcase}'],
  ['Wellness Stories', '{t.footerStories}'],
  ['Bespoke Support', '{t.footerSupport}'],
  ['Secret Admin Area', '{t.secretAdmin}'],
  ['Hot Categories', '{t.footerCategories}'],
  ['Bespoke Desk', '{t.footerDesk}'],
  ['Hot Desk:', 'হটলাইন:'],
  ['Terms of Service', '{t.terms}'],
  ['Privacy Regulation', '{t.privacy}'],
  ['Verified Stock Check Successful', 'স্টক যাচাই সম্পন্ন'],
  ['Purity Status:', '{t.purityStatus}:'],
  ['100% Sourced Direct', '{t.purityValue}'],
  ['Lab Analysis:', '{t.labAnalysis}:'],
  ['Approved Quality Pure Certification', '{t.labValue}'],
  ['Availability:', '{t.availability}:'],
  [' items left', ' পিস বাকি'],
  ['Restocking soon', '{t.restocking}'],
  ['Add to Cart', '{t.addToCartFull}'],
  ['Your Basket', '{t.basketTitle}'],
  ['Basket is empty', '{t.basketEmpty}'],
  ['Enjoy delicious gourmet items with family nutrition wellness.', '{t.basketEmptySub}'],
  ['Explore Products', '{t.exploreProducts}'],
  ['BDT 1,500 reached! You have unlocked **FREE Delivery**!', '{t.freeDeliveryUnlocked}'],
  ['Add only ', '{t.freeDeliveryProgress} '],
  [' more to claim ', ' '],
  ['FREE Delivery', '{t.free}'],
  ['Subtotal', '{t.subtotal}'],
  ['Delivery Fee', '{t.deliveryFee}'],
  ['Total Bill', '{t.totalBill}'],
  ['Keep Shopping', '{t.keepShopping}'],
  ['Checkout', '{t.checkout}'],
  ['Secure checkout', '{t.secureCheckout}'],
  ['Cash on Delivery inside Dhaka & Bangladesh', '{t.codNote}'],
  ['Customer Full Name', '{t.nameLabel}'],
  ['E.g. Tanvir Rahman Khan', '{t.namePlaceholder}'],
  ['Phone Number', '{t.phoneLabel}'],
  ['E.g., 01712xxxxxx', '{t.phonePlaceholder}'],
  ['Delivery Address', '{t.addressLabel}'],
  ['E.g. House 4, Road 11, Banani, Dhaka', '{t.addressPlaceholder}'],
  ['Concierge Notes (Optional)', '{t.notesLabel}'],
  ['Deliver after 5pm, raw honey taste check request, etc.', '{t.notesPlaceholder}'],
  ['Order Summary', '{t.orderSummary}'],
  ['Securing Order...', '{t.securingOrder}'],
  ['Place Cash On Delivery Order', '{t.confirmOrder}'],
  ['title="Remove item"', 'title={t.removeItem}'],
  ['title="Admin Login"', 'title={t.loginAdmin}'],
  ["className=\"px-8 py-4 border border-slate-200 font-bold text-xs tracking-widest uppercase hover:bg-slate-50 transition-colors rounded-none\"", 
   "className=\"px-8 py-4 bg-[#DC2626] text-white font-bold text-xs tracking-widest uppercase hover:bg-[#B91C1C] transition-colors rounded-none shadow-lg shadow-red-200/40\""],
];

for (const [from, to] of replacements) {
  c = c.split(from).join(to);
}

// Category footer use nameBn
c = c.replace(
  /(\{categories\.map\(\(c\) =>[\s\S]*?<button[\s\S]*?>\s*)\{c\.name\}/g,
  '$1{c.nameBn || c.name}'
);

// Banner slider image hover
c = c.replace(
  'className="object-cover"\n                        referrerPolicy="no-referrer"\n                        sizes="(max-width:768px) 100vw, 500px"',
  'className="object-cover img-hover"\n                        referrerPolicy="no-referrer"\n                        sizes="(max-width:768px) 100vw, 500px"'
);

// About image hover
c = c.replace(
  'alt="About Khan Foods"\n                  fill\n                  className="object-cover"',
  'alt="About Khan Foods"\n                  fill\n                  className="object-cover img-hover"'
);

// Quick view image
c = c.replace(
  'alt={quickViewProduct.name}\n                  fill\n                  className="object-cover"\n                  referrerPolicy="no-referrer"\n                  sizes="(max-w-sm) 100vw, 400px"',
  'alt={quickViewProduct.name}\n                  fill\n                  className="object-cover img-hover"\n                  referrerPolicy="no-referrer"\n                  sizes="(max-w-sm) 100vw, 400px"'
);

// Cart item image hover group
c = c.replace(
  'className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-100">\n                              <Image',
  'className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-100 group">\n                              <Image'
);
c = c.replace(
  /src=\{item\.product\.image\}[\s\S]*?className="object-cover"/,
  (m) => m.replace('className="object-cover"', 'className="object-cover img-hover"')
);

// Secondary explore button was changed to red - the categories link in hero should stay outline or also red - user wanted all red

// Category cards - add card-hover if missing
c = c.replace(
  "'cursor-pointer group card-hover'",
  "'cursor-pointer group card-hover'"
);

fs.writeFileSync('app/page.tsx', c);
console.log('Bengali strings applied');
