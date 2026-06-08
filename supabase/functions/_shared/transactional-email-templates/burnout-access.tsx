/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface BurnoutAccessProps {
  firstName?: string
  accessUrl?: string
}

const BurnoutAccessEmail = ({ firstName, accessUrl }: BurnoutAccessProps) => {
  const name = firstName || 'there'
  const url = accessUrl || 'https://onthepaintedporch.com/burnout-access'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Burnout-Busting Resources are ready — {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
          <Heading style={h1}>🔥 Your Burnout-Busting Resources</Heading>
          <Text style={text}>
            Hi {name}! You just took a bold first step, and we're glad you're here.
          </Text>
          <Text style={text}>
            Burnout doesn't fix itself, and surface-level tips won't cut it. That's why we put together a collection of real, actionable strategies you can use right now. Think of these as your toolkit for building resilience that actually sticks, for yourself and the people you lead.
          </Text>

          <Section style={ctaSection}>
            <Button href={url} style={ctaButton}>
              ACCESS YOUR RESOURCES
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={text}>
            Bookmark this email so you can return to your resources anytime. If you have questions or need technical support, reach out to us at{' '}<a href="mailto:support@onthepaintedporch.com" style={link}>support@onthepaintedporch.com</a>.
          </Text>

          <Text style={footer}>
            Keep it cool, calm, and in control,<br />
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BurnoutAccessEmail,
  subject: '🔥 Your Burnout-Busting Resources Are Ready',
  displayName: 'Burnout opt-in access',
  previewData: {
    firstName: 'Marcus',
    accessUrl: 'https://onthepaintedporch.com/burnout-access?access=sample-token',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
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
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
