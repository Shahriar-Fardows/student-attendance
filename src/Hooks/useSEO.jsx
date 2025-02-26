import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * SEO hook for managing SEO tags in a React application
 * @param {Object} seoProps - The SEO properties
 * @returns {JSX.Element} - The Helmet component with SEO tags
 */
const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage,
  twitterHandle,
  additionalMetaTags = {},
  additionalLinkTags = {},
}) => {
  const defaultOgImage = "https://example.com/default-og-image.jpg"; // Fallback for Open Graph Image

  useEffect(() => {
    // Example of dynamic effect if required in future
  }, []);

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage || defaultOgImage} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {/* Additional meta tags */}
      {Object.entries(additionalMetaTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}

      {/* Additional link tags */}
      {Object.entries(additionalLinkTags).map(([rel, href]) => (
        <link key={rel} rel={rel} href={href} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {`
          {
            "@context": "http://schema.org",
            "@type": "WebPage",
            "name": "${title}",
            "description": "${description}",
            "url": "${canonicalUrl}"
          }
        `}
      </script>

      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  );
};

export default useSEO;
