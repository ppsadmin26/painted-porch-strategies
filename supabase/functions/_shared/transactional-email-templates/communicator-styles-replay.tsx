/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'
const REFERENCE_SHEET_URL = 'https://onthepaintedporch.com/downloads/6-communicator-styles-summary.pdf'

interface CommunicatorStylesReplayProps {
  firstName?: string
  watchUrl?: string
}

const CommunicatorStylesReplayEmail = ({ firstName, watchUrl }: CommunicatorStylesReplayProps) => {
  const name = firstName || 'there'
  const url = watchUrl || 'https://onthepaintedporch.com/6-communicator-styles-watch'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Master your message with the 6 Communicator Styles</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          <Heading style={h1}>🎤 The 6 Communicator Styles</Heading>
          <Text style={subhead}>Replay Instant Access</Text>

          <Text style={text}>
            Hi {name},
          </Text>
          <Text style={text}>
            ▶ Here's your instant access to our training session on the 6 Communicator Styles to Master Your Message. You'll learn how to spot each person's dominant style (including your own!) and craft communication that's actually heard and understood.
          </Text>

          <Section style={ctaSection}>
            <Button href={url} style={ctaButton}>
              Watch Training Replay
            </Button>
          </Section>

          <Text style={text}>
            📄 Don't forget to download the one-page reference sheet to use as you watch and start charting your own (and others') Communicator Styles.
          </Text>

          <Section style={ctaSection}>
            <Button href={REFERENCE_SHEET_URL} style={secondaryButton}>
              Download Reference Sheet
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions as you put these styles into practice, just reply to this email. We'd love to hear from you.
          </Text>
          <Text style={text}>
            Glad to have you "on the Painted Porch"!
          </Text>

          <Text style={signoff}>
            Keep on Thriving,<br />
            <strong style={signoffName}>Amy Yackowski</strong><br />
            <em style={signoffTitle}>Founder & Organizational Shift Strategist</em>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Bookmark this email so you can return to your replay anytime, on any device. The link above will keep working for one year.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CommunicatorStylesReplayEmail,
  subject: '[INSTANT ACCESS] Your access to the 6 Communicator Styles training',
  displayName: '6 Communicator Styles replay access',
  previewData: {
    firstName: 'Jane',
    watchUrl: 'https://onthepaintedporch.com/6-communicator-styles-watch?token=sample-token',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
const subhead = { fontSize: '15px', color: '#DB0043', margin: '0 0 24px', textAlign: 'center' as const, fontWeight: '600' as const, letterSpacing: '0.5px', textTransform: 'uppercase' as const }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const ctaButton = {
  backgroundColor: '#DB0043',
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
const signoff = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '24px 0 0' }
const signoffName = { color: '#00006B' }
const signoffTitle = { color: '#888888', fontSize: '14px' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '16px 0 0', fontStyle: 'italic' as const }
