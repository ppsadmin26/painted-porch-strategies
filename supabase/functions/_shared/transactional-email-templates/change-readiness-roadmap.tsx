/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'
const PDF_URL = 'https://onthepaintedporch.com/downloads/Change_Readiness_Roadmap_Painted_Porch_Strategies.pdf'
const THANK_YOU_URL = 'https://onthepaintedporch.com/thank-you-change-roadmap'

interface ChangeRoadmapProps {
  firstName?: string
}

const ChangeRoadmapEmail = ({ firstName }: ChangeRoadmapProps) => {
  const name = firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Here's Your Change Readiness Roadmap Worksheet</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          <Heading style={h1}>📜 Your Change Readiness Roadmap</Heading>
          <Text style={subhead}>Your planning worksheet</Text>

          <Text style={text}>
            {name},
          </Text>
          <Text style={text}>
            Thank you for choosing to download our "Change Readiness Roadmap" planning worksheet. You have taken the first steps to prepare, assemble, take off, and create a habit for successful change in your staffing firm.
          </Text>

          <Section style={ctaSection}>
            <Button href={PDF_URL} style={ctaButton}>
              Download Worksheet
            </Button>
          </Section>

          <Text style={text}>
            As you begin to dive into the worksheet and start planning your Change Readiness roadmap strategy and action items, remember that the SOONER you begin your preparation around change, the better opportunities you create to address change questions, resistance, misdirection, and confusion. Don't wait until your change is already underway &mdash; begin BEFORE your project kicks off. If you're already in the midst of your project, the sooner you can get these core elements addressed, the greater your chance of change understanding, engagement, adoption, and resilience.
          </Text>

          <Text style={text}>
            Over the next few days, we'll share some additional insights and ideas about how you can prepare your organization for ANY change.
          </Text>

          <Section style={ctaSection}>
            <Button href={THANK_YOU_URL} style={secondaryButton}>
              View on the Web
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={signoff}>
            In Gratitude and Change On!
          </Text>
          <Text style={signoff}>
            The Painted Porch Strategies Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ChangeRoadmapEmail,
  subject: "📜 Here's Your Change Readiness Roadmap Worksheet!",
  displayName: 'Change Readiness Roadmap',
  previewData: {
    firstName: 'Marcus',
  },
} satisfies TemplateEntry

// Styles
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
