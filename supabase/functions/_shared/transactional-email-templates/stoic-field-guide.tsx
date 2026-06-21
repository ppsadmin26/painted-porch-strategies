/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const DOWNLOAD_URL = 'https://onthepaintedporch.com/downloads/Stoic_Leader_Field_Guide_Painted_Porch_Strategies.pdf'

interface StoicFieldGuideProps {
  firstName?: string
}

const StoicFieldGuideEmail = ({ firstName }: StoicFieldGuideProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Stoic Leader Field Guide is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          </Link>
          <Heading style={h1}>The Stoic Leader Field Guide</Heading>
          <Text style={subhead}>Free Download</Text>

          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thanks for grabbing The Stoic Leader Field Guide. It's a simple, practical companion for leading with clarity, courage, and calm, even when things feel anything but.
          </Text>
          <Text style={text}>
            Click the button below to download your field guide.
          </Text>

          <Section style={ctaSection}>
            <Button href={DOWNLOAD_URL} style={ctaButton}>
              Download the Field Guide
            </Button>
          </Section>

          <Text style={text}>
            A small ask: read it once through, then pick one practice to try this week. Small, steady shIFts are how Stoic leadership gets built.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Bookmark this email so you can return to your field guide any time, on any device.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StoicFieldGuideEmail,
  subject: "[INSTANT ACCESS] Your Stoic Leader Field Guide",
  displayName: 'Stoic Leader Field Guide access',
  previewData: {
    firstName: 'Marcus',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 4px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
const subhead = { fontSize: '15px', color: '#E8A231', margin: '0 0 24px', textAlign: 'center' as const, fontWeight: '600' as const, letterSpacing: '0.5px', textTransform: 'uppercase' as const }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const ctaButton = {
  backgroundColor: '#E8A231',
  color: '#00006B',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontWeight: '700' as const,
  fontSize: '16px',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '16px 0 0', fontStyle: 'italic' as const }
