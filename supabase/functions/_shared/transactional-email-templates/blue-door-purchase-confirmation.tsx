/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Painted Porch Strategies'
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface BlueDoorPurchaseConfirmationProps {
  firstName?: string
  company?: string
  amountFormatted?: string
  orderId?: string
}

const BlueDoorPurchaseConfirmation = ({
  firstName,
  company,
  amountFormatted,
  orderId,
}: BlueDoorPurchaseConfirmationProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Blue Door is reserved. Access opens July 6th, 2026.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
          </Link>
          <Heading style={h1}>Welcome through the Blue Door, {name}!</Heading>

          <Text style={text}>
            Thank you for reserving your <strong>Blue Door Strategic Organizational Appraisal</strong>. Your spot is locked in.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightHeading}>
              📅 Your assessment opens Monday, July 6th, 2026
            </Text>
            <Text style={highlightText}>
              On launch day, we will email you a secure access link from this same address. Open the link, complete the appraisal (less than 30 minutes), and your detailed executive brief will be delivered within 72 business hours.
            </Text>
          </Section>

          <Heading style={h2}>Your purchase details</Heading>
          <Section style={detailsBox}>
            {amountFormatted && (
              <Text style={detailRow}><strong>Amount:</strong> {amountFormatted}</Text>
            )}
            {company && (
              <Text style={detailRow}><strong>Company:</strong> {company}</Text>
            )}
            {orderId && (
              <Text style={detailRow}><strong>Order reference:</strong> {orderId}</Text>
            )}
            <Text style={detailRow}>
              A separate invoice and receipt will arrive from Stripe shortly for your records.
            </Text>
          </Section>

          <Heading style={h2}>What happens next</Heading>
          <Section style={linksSection}>
            <Text style={linkItem}>
              <strong>1. Now → June 21st:</strong> No action needed. Watch for our launch-day email.
            </Text>
            <Text style={linkItem}>
              <strong>2. July 6th:</strong> Your access link arrives in this inbox.
            </Text>
            <Text style={linkItem}>
              <strong>3. Within 72 business hours of completion:</strong> Your custom executive brief, with 3 to 4 viable change paths and structural recommendations, lands in your inbox.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            While you wait, here are a few resources you might enjoy:
          </Text>

          <Section style={linksSection}>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/blog`} style={link}>Read the latest from Thoughts from the Porch</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/approach`} style={link}>Explore Our Approach</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/free-downloads`} style={link}>Browse our Free Resources</a>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Questions before launch day? We would love to hear from you.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={`${SITE_URL}/contact?topic=blue-door`} style={ctaButton}>
              Contact Us
            </Button>
          </Section>

          <Text style={footer}>
            Warm regards,<br />
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BlueDoorPurchaseConfirmation,
  subject: 'Your Blue Door is reserved — access opens July 6th',
  displayName: 'Blue Door purchase confirmation',
  previewData: {
    firstName: 'Jane',
    company: 'Acme Corp',
    amountFormatted: '$1,500.00 USD',
    orderId: 'cs_test_a1b2c3',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const h2 = { fontSize: '18px', fontWeight: 'bold' as const, color: '#00006B', margin: '24px 0 12px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#eef4f9', borderLeft: '4px solid #1E5BBA', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightHeading = { fontSize: '15px', color: '#00006B', fontWeight: 'bold' as const, lineHeight: '1.5', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif" }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0' }
const detailsBox = { backgroundColor: '#f8f5ed', borderRadius: '4px', padding: '14px 18px', margin: '0 0 16px' }
const detailRow = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 6px' }
const linksSection = { margin: '0 0 16px' }
const linkItem = { fontSize: '14px', color: '#545454', lineHeight: '1.6', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#1E5BBA', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
