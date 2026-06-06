import fs from 'fs';

let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/show\{t\.checkout\}/g, 'showCheckout');
c = c.replace(/setShow\{t\.checkout\}/g, 'setShowCheckout');
c = c.replace(/set\{t\.checkout\}Form/g, 'setCheckoutForm');
c = c.replace(/placeholder="\{t\./g, 'placeholder={t.');
c = c.replace("Customer {t.namePlaceholder}", '{t.nameLabel}');
c = c.replace('// Open Drawer on {t.addToCartFull}', '// Open cart drawer');
c = c.replace('// {t.free} over 1500 BDT', '// Free delivery over 1500');
c = c.replace('{/* {t.subtotal}s & Actions */}', '{/* Cart totals */}');
c = c.replace(": '{t.restocking}'", ': t.restocking');
c = c.replace("'FREE'", 't.free');
c = c.replace('<span className="font-bold text-emerald-600">FREE</span>', '<span className="font-bold text-emerald-600">{t.free}</span>');

fs.writeFileSync('app/page.tsx', c);
console.log('Fixed broken identifiers');
