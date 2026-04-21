
import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title = "Back2Life.Studio - AI-Powered Media Studio",
  description = "Create stunning AI images, videos, audio, and more with Back2Life.Studio",
  image = "/og-image.png",
  url = "https://back2life.studio",
}: SEOProps) {
  return (
    &lt;Head&gt;
      &lt;title&gt;{title}&lt;/title&gt;
      &lt;meta name="description" content={description} /&gt;
      &lt;meta property="og:title" content={title} /&gt;
      &lt;meta property="og:description" content={description} /&gt;
      &lt;meta property="og:image" content={image} /&gt;
      &lt;meta property="og:url" content={url} /&gt;
      &lt;meta property="og:type" content="website" /&gt;
      &lt;meta name="twitter:card" content="summary_large_image" /&gt;
      &lt;meta name="twitter:title" content={title} /&gt;
      &lt;meta name="twitter:description" content={description} /&gt;
      &lt;meta name="twitter:image" content={image} /&gt;
      &lt;link rel="icon" href="/favicon.ico" /&gt;
    &lt;/Head&gt;
  );
}

export function SEOElements({
  title = "Back2Life.Studio - AI-Powered Media Studio",
  description = "Create stunning AI images, videos, audio, and more with Back2Life.Studio",
  image = "/og-image.png",
  url = "https://back2life.studio",
}: SEOProps) {
  return (
    &lt;&gt;
      &lt;meta name="description" content={description} /&gt;
      &lt;meta property="og:title" content={title} /&gt;
      &lt;meta property="og:description" content={description} /&gt;
      &lt;meta property="og:image" content={image} /&gt;
      &lt;meta property="og:url" content={url} /&gt;
      &lt;meta property="og:type" content="website" /&gt;
      &lt;meta name="twitter:card" content="summary_large_image" /&gt;
      &lt;meta name="twitter:title" content={title} /&gt;
      &lt;meta name="twitter:description" content={description} /&gt;
      &lt;meta name="twitter:image" content={image} /&gt;
      &lt;title&gt;{title}&lt;/title&gt;
    &lt;/&gt;
  );
}
