import fs from 'fs';

let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(/toasts\.map\(\(t\) =>/g, 'toasts.map((toast) =>');
c = c.replace(/key=\{t\.id\}/g, 'key={toast.id}');
c = c.replace(/t\.type === 'success'/g, "toast.type === 'success'");
c = c.replace(/t\.type === 'error'/g, "toast.type === 'error'");
c = c.replace(/\{t\.message\}/g, '{toast.message}');

c = c.replace(
  /const headline = lang === 'bn'[\s\S]*?siteContent\?\.heroHeadline \|\| "[^"]*"\);/,
  'const headline = siteContent?.heroHeadlineBn || siteContent?.heroHeadline || "খাঁটি ও প্রাকৃতিক প্রিমিয়াম অর্গানিক ফুড স্টোর";'
);
c = c.replace(
  /const subheadline = lang === 'bn'[\s\S]*?siteContent\?\.heroSubheadline \|\| "[^"]*"\);/,
  'const subheadline = siteContent?.heroSubheadlineBn || siteContent?.heroSubheadline || "সরাসরি প্রকৃতি থেকে সংগৃহীত শতভাগ খাঁটি মধু, ঘি, বাদাম ও অর্গানিক পণ্য।";'
);

const bannerReplacements = [
  [/title: lang === 'bn' \? \(siteContent\.bannerTitle1Bn \|\| siteContent\.bannerTitle1\) : siteContent\.bannerTitle1/g, 'title: siteContent.bannerTitle1Bn || siteContent.bannerTitle1'],
  [/tagline: lang === 'bn' \? \(siteContent\.bannerTagline1Bn \|\| siteContent\.bannerTagline1\) : siteContent\.bannerTagline1/g, 'tagline: siteContent.bannerTagline1Bn || siteContent.bannerTagline1'],
  [/title: lang === 'bn' \? \(siteContent\.bannerTitle2Bn \|\| siteContent\.bannerTitle2\) : siteContent\.bannerTitle2/g, 'title: siteContent.bannerTitle2Bn || siteContent.bannerTitle2'],
  [/tagline: lang === 'bn' \? \(siteContent\.bannerTagline2Bn \|\| siteContent\.bannerTagline2\) : siteContent.bannerTagline2/g, 'tagline: siteContent.bannerTagline2Bn || siteContent.bannerTagline2'],
  [/title: lang === 'bn' \? \(siteContent\.bannerTitle3Bn \|\| siteContent\.bannerTitle3\) : siteContent\.bannerTitle3/g, 'title: siteContent.bannerTitle3Bn || siteContent.bannerTitle3'],
  [/tagline: lang === 'bn' \? \(siteContent\.bannerTagline3Bn \|\| siteContent\.bannerTagline3\) : siteContent\.bannerTagline3/g, 'tagline: siteContent.bannerTagline3Bn || siteContent.bannerTagline3'],
  [/title: lang === 'bn' \? s\.titleBn : s\.titleEn/g, 'title: s.titleBn'],
  [/tagline: lang === 'bn' \? s\.taglineBn : s\.taglineEn/g, 'tagline: s.taglineBn'],
];
for (const [from, to] of bannerReplacements) c = c.replace(from, to);

c = c.replace(/\s*\{\/\* Language Switcher Trigger \*\/\}[\s\S]*?<\/button>\s*(?=\n\s*<Link)/m, '\n');

c = c.replace(/lang === 'bn' \? '([^']*)' : '[^']*'/g, "'$1'");
c = c.replace(/lang === 'bn' \? `([^`]*)` : `[^`]*`/g, '`$1`');
c = c.replace(/lang === 'bn' \? \(([^)]+)\) : [^,\n)]+/g, '($1)');

c = c.replace(
  /\{headline\.includes\("Experience"\)[\s\S]*?\)\s*:\s*\(\s*<span[\s\S]*?<\/span>\s*\)\s*\}/m,
  '{headline}'
);

c = c.replace(/hover:bg-black/g, 'hover:bg-[#B91C1C]');
c = c.replace(/bg-slate-950 hover:bg-\[#DC2626\]/g, 'bg-[#DC2626] hover:bg-[#B91C1C]');
c = c.replace(/bg-slate-950 text-white hover:bg-\[#DC2626\]/g, 'bg-[#DC2626] text-white hover:bg-[#B91C1C]');
c = c.replace(/: 'bg-slate-950 text-white hover:bg-\[#DC2626\]/g, ": 'bg-[#DC2626] text-white hover:bg-[#B91C1C]");
c = c.replace(/hover:bg-stone-900/g, 'hover:bg-[#B91C1C]');

c = c.replace(
  /className="object-cover group-hover:scale-105 transition duration-700 pointer-events-none"/g,
  'className="object-cover img-hover pointer-events-none"'
);

c = c.replace(/whileHover=\{\{ y: -8, scale: 1\.01 \}\}\s*/g, '');
c = c.replace(/whileHover=\{\{ y: -6, scale: 1\.02 \}\}\s*/g, '');

c = c.replace(
  'className="bg-white border border-slate-200 rounded-none p-5 shadow-sm hover:shadow-xl group transition-all relative flex flex-col justify-between card-shine overflow-hidden"',
  'className="bg-white border border-slate-200 rounded-none p-5 shadow-sm group transition-all relative flex flex-col justify-between card-shine card-hover overflow-hidden"'
);

c = c.replace(
  /className=\`\$\{selectedCategory === cat\.name\s*\?\s*'border-\[#DC2626\][^`]+`\}/g,
  (match) => match.replace("'cursor-pointer group'", "'cursor-pointer group card-hover'")
);

fs.writeFileSync('app/page.tsx', c);
console.log('Updated page.tsx');
