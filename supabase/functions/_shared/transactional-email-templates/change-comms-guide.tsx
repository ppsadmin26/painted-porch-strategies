/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const PDF_URL = 'https://onthepaintedporch.com/downloads/Critical_Steps_for_Effective_Change_Communication_Painted_Porch_Strategies.pdf'
const CONTACT_URL = 'https://onthepaintedporch.com/contact'

interface ChangeCommsProps {
  firstName?: string
}

const ChangeCommsEmail = ({ firstName }: ChangeCommsProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Here's Your "4 Critical Steps for Effective Change Communication" Guide</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          </Link>
          <Heading style={h1}>📑 Your Change Communication Guide</Heading>
          <Text style={subhead}>4 Critical Steps for Effective Change Communication</Text>

          <Text style={text}>
            {name},
          </Text>
          <Text style={text}>
            Thank you for choosing to download our "4 Critical Steps for Effective Change Communication" planning and action guide. You have taken the first steps to create messaging and communication that can drive greater change awareness, understanding, and adoption for your organization.
          </Text>

          <Section style={ctaSection}>
            <Button href={PDF_URL} style={ctaButton}>
              Download the Guide
            </Button>
          </Section>

          <Text style={text}>
            As you begin to dive into the guide and start planning your Change Communication strategy and action items, remember that the SOONER you begin your communications around change, the better opportunities you create to address change questions, resistance, misdirection, and confusion. Don't wait until your change is already underway &ndash; begin BEFORE your project kicks off. If you're already in the midst of your project, the sooner you can get your prepared, concise, and consistent message out there, the better.
          </Text>

          <Text style={text}>
            And, if you have questions or would like further guidance on how to craft the "right" change communications, reach out and we'll work with you to draft a plan to "Master Your Message".
          </Text>

          <Section style={ctaSection}>
            <Button href={CONTACT_URL} style={secondaryButton}>
              Contact Us
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={signoff}>In Gratitude,</Text>
          <Text style={signoff}>The Painted Porch Strategies Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ChangeCommsEmail,
  subject: "📑 Here's Your \"4 Critical Steps for Effective Change Communication\" Guide",
  displayName: 'Change Communication Guide',
  previewData: {
    firstName: 'Marcus',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 4px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
const subhead = { fontSize: '15px', color: '#007697', margin: '0 0 24px', textAlign: 'center' as const, fontWeight: '600' as const, letterSpacing: '0.5px', textTransform: 'uppercase' as const }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const ctaButton = {
  backgroundColor: '#007697',
  color: '#ffffff',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontWeight: '600' as const,
  fontSize: '16px',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}
const secondaryButton = {
  backgroundColor: '#E8A231',
  color: '#00006B',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontWeight: '600' as const,
  fontSize: '15px',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const signoff = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 8px' }
