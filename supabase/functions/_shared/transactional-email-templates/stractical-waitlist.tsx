/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface StracticalWaitlistProps {
  firstName?: string
}

const StracticalWaitlistEmail = ({ firstName }: StracticalWaitlistProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're on the Stractical Leader Lab waitlist</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>You're on the list, {name}!</Heading>

          <Text style={text}>
            Thank you for joining the waitlist for the <strong>Stractical Leader Lab</strong>. We run the lab a few times per year, and waitlist members are always the first to know when new dates are announced.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              <strong>What happens next:</strong>
            </Text>
            <Text style={highlightText}>
              When we schedule the next cohort, you will receive priority enrollment access and early-bird pricing details before we open spots to the public.
            </Text>
          </Section>

          <Text style={text}>
            In the meantime, here are a few ways to keep the momentum going:
          </Text>

          <Section style={linksSection}>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/stractical-mini`} style={link}>Download the free Stractical Leader Mini Guide</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/blog`} style={link}>Read the latest from Thoughts from the Porch</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/youtube`} style={link}>Watch leadership development videos</a>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Have questions before the next round opens? We would love to hear from you.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={`${SITE_URL}/contact?scope=Yourself&interest=leadership-lab`} style={ctaButton}>
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
  component: StracticalWaitlistEmail,
  subject: "You're on the Stractical Leader Lab Waitlist",
  displayName: 'Stractical Leader waitlist confirmation',
  previewData: { firstName: 'Jane' },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#f8f5ed', borderLeft: '4px solid #E8A231', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 8px' }
const linksSection = { margin: '0 0 16px' }
const linkItem = { fontSize: '14px', color: '#545454', lineHeight: '1.6', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#00006B', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
