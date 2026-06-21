/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const ACTION_GUIDE_URL = 'https://onthepaintedporch.com/downloads/kick-the-habit-action-guide.pdf'

interface KickHabitReplayProps {
  firstName?: string
  watchUrl?: string
}

const KickHabitReplayEmail = ({ firstName, watchUrl }: KickHabitReplayProps) => {
  const name = firstName || 'there'
  const url = watchUrl || 'https://onthepaintedporch.com/kick-the-habit-watch'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Shift from Repeating to Reimagining</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          <Heading style={h1}>Kick the Habit</Heading>
          <Text style={subhead}>Training Replay</Text>

          <Text style={text}>
            Hi {name},
          </Text>
          <Text style={text}>
            Our Kick the Habit training session was filled with a lot of 🐜 A.N.T. squashing, 🐾 P.E.T. adopting, and even a little ham 😄.
          </Text>
          <Text style={text}>
            Here's your access to the session's video and Action Guide.
          </Text>

          <Section style={ctaSection}>
            <Button href={url} style={ctaButton}>
              Watch Training Replay
            </Button>
          </Section>

          <Text style={text}>
            Also, don't forget to download the session's Action Guide to help you plot out your new Habit strategies and begin to flip the script on those old thinking and doing patterns to become a Change-Ready Champion!
          </Text>

          <Section style={ctaSection}>
            <Button href={ACTION_GUIDE_URL} style={secondaryButton}>
              Download the Action Guide
            </Button>
          </Section>

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
  component: KickHabitReplayEmail,
  subject: "[INSTANT ACCESS] Your access to the 'Kick the Habit' training session",
  displayName: 'Kick the Habit replay access',
  previewData: {
    firstName: 'Marcus',
    watchUrl: 'https://onthepaintedporch.com/kick-the-habit-watch?token=sample-token',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 4px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
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
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '16px 0 0', fontStyle: 'italic' as const }
