export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://khanfoods.com.bd';

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Khan Foodies',
    url: siteUrl,
    logo: `${siteUrl}/khan-foodies-logo.png`,
    description: 'Premium organic mango, honey and gourmet foods delivered across Bangladesh.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1712-345678',
      contactType: 'customer service',
      availableLanguage: ['Bengali', 'English'],
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Khan Foodies',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
