import React from 'react'
import Head from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function Root({ children }: { children: React.ReactNode }) {
  const { siteConfig } = useDocusaurusContext()
  const { agentName, agentDescription, agentEndpoint } = siteConfig.customFields as Record<string, string>

  return (
    <>
      <Head>
        <meta name="agent:name" content={agentName} />
        <meta name="agent:description" content={agentDescription} />
        <meta name="agent:endpoint" content={agentEndpoint} />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link rel="service-doc" content="https://docs.bayar.digital" />

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Bayar Digital Documentation",
          "description": "Payment Gateway API Documentation for Developers",
          "url": "https://docs.bayar.digital",
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebAPI",
          "name": "Bayar Digital Payment Gateway API",
          "description": "Payment gateway API documentation for creating invoices, real-time webhook notifications, and payment management",
          "url": "https://api.bayar.digital",
          "documentation": "https://docs.bayar.digital",
          "provider": {
            "@type": "Organization",
            "name": "Bayar Digital",
            "url": "https://bayar.digital",
          },
        })}</script>
      </Head>
      {children}
    </>
  )
}
