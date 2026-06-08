/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const CANVAS_PDF_URL = 'https://onthepaintedporch.com/downloads/Strategic_Change_Canvas_Painted_Porch_Strategies.pdf'
const THANK_YOU_URL = 'https://onthepaintedporch.com/thank-you-strategic-plan'

interface StrategicCanvasProps {
  firstName?: string
}

const StrategicCanvasEmail = ({ firstName }: StrategicCanvasProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Strategic Change Canvas is ready to download</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          <Heading style={h1}>The Strategic Change Canvas</Heading>
          <Text style={subhead}>Your one-page planning tool</Text>

          <Text style={text}>
            Hi {name},
          </Text>
          <Text style={text}>
            Thanks for grabbing the Strategic Change Canvas! This is the one-page tool we use to surface the questions that matter <em>before</em> a change kicks off, so your next shIFt actually sticks.
          </Text>

          <Section style={ctaSection}>
            <Button href={CANVAS_PDF_URL} style={ctaButton}>
              Download the Canvas
            </Button>
          </Section>

          <Text style={text}>
            <strong style={{ color: '#00006B' }}>How to use it:</strong>
          </Text>
          <Text style={text}>
            • Print it (or open it on your tablet) before your next planning meeting.<br />
            • Walk through each section with your team — don't skip the uncomfortable questions.<br />
            • Use it as a living doc. Revisit it as your plan evolves.
          </Text>

          <Section style={ctaSection}>
            <Button href={THANK_YOU_URL} style={secondaryButton}>
              View on the Web
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Bookmark this email so you can come back to your Canvas anytime. The download link will keep working.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StrategicCanvasEmail,
  subject: "[INSTANT ACCESS] Your Strategic Change Canvas",
  displayName: 'Strategic Change Canvas',
  previewData: {
    firstName: 'Marcus',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 4px', fontFamily: "'Poppins', Arial, sans-serif", textAlign: 'center' as const }
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
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '16px 0 0', fontStyle: 'italic' as const }
