/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const ACTION_GUIDE_URL = 'https://onthepaintedporch.com/downloads/From_Passenger_to_Pilot_Flight_Plan.pdf'

interface PilotTrainingReplayProps {
  firstName?: string
  watchUrl?: string
}

const PilotTrainingReplayEmail = ({ firstName, watchUrl }: PilotTrainingReplayProps) => {
  const name = firstName || 'there'
  const url = watchUrl || 'https://onthepaintedporch.com/pilot-training-watch'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Shift from Auto-Pilot to In Control</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          </Link>
          <Heading style={h1}>✈ From Passenger to Pilot 👩‍✈️</Heading>
          <Text style={subhead}>Replay Instant Access</Text>

          <Text style={text}>
            Hi {name},
          </Text>
          <Text style={text}>
            ▶ Here's your instant access to my training session, chock full of practical tools and mindful techniques to shift from being a Passenger to a present, purposeful Pilot in your life and work.
          </Text>

          <Section style={ctaSection}>
            <Button href={url} style={ctaButton}>
              Watch Training Replay
            </Button>
          </Section>

          <Text style={text}>
            📄 Also, don't forget to download the training Action Guide to help begin to design your new "flight plan" and purposeful path, where you're at the controls.
          </Text>

          <Section style={ctaSection}>
            <Button href={ACTION_GUIDE_URL} style={secondaryButton}>
              Download Action Guide
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Over the next few days, I'll share some of my favorite, go-to ideas for finding small, but powerful moments of mindfulness, gratitude, and joy, so keep an eye out!
          </Text>
          <Text style={text}>
            If you have any questions as you begin your Passenger to Pilot "flight plan", I want to hear them! Just reply to this email and I'll be happy to help.
          </Text>
          <Text style={text}>
            I'm excited to have you "on the Painted Porch"!
          </Text>

          <Text style={signoff}>
            Keep on Thriving,<br />
            <strong style={signoffName}>Sierra Ramm Cantrell</strong><br />
            <em style={signoffTitle}>Your Mindfulness Sherpa</em>
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
  component: PilotTrainingReplayEmail,
  subject: '[INSTANT ACCESS] Your access to the Passenger to Pilot training',
  displayName: 'Pilot Training replay access',
  previewData: {
    firstName: 'Jane',
    watchUrl: 'https://onthepaintedporch.com/pilot-training-watch?token=sample-token',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
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
const signoff = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '24px 0 0' }
const signoffName = { color: '#00006B' }
const signoffTitle = { color: '#888888', fontSize: '14px' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '16px 0 0', fontStyle: 'italic' as const }
