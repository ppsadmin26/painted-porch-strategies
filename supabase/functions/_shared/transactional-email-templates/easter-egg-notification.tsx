/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface EasterEggNotificationProps {
  name?: string
  email?: string
  explanation?: string
  charity?: string
  comments?: string
}

const EasterEggNotificationEmail = (props: EasterEggNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🐣 Easter egg found by {props.name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
        <Heading style={h1}>🐣 Easter Egg Found</Heading>
        <Text style={text}>
          Someone made it to the bottom of the Terms of The Porch and submitted an Easter egg.
        </Text>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Submitter</Text>
          <Text style={detailRow}><strong>Name:</strong> {props.name}</Text>
          <Text style={detailRow}><strong>Email:</strong> {props.email}</Text>
        </Section>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>What they found</Text>
          <Text style={detailRow}>{props.explanation}</Text>
        </Section>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Charity to donate $50 to</Text>
          <Text style={detailRow}>{props.charity}</Text>
        </Section>

        {props.comments && (
          <Section style={detailsSection}>
            <Text style={sectionLabel}>Additional comments</Text>
            <Text style={detailRow}>{props.comments}</Text>
          </Section>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Sent from the Easter Egg Hunt form at /found-it on the {SITE_NAME} website.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EasterEggNotificationEmail,
  subject: (data: Record<string, any>) =>
    `🐣 Easter egg found by ${data.name || 'a visitor'}`,
  displayName: 'Easter egg hunt notification (internal)',
  to: 'explore@onthepaintedporch.com',
  previewData: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    explanation: 'I found the hidden phrase in section 3 about the painted porch metaphor.',
    charity: 'Doctors Without Borders',
    comments: 'Loved the surprise — keep going!',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const detailsSection = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px 20px', margin: '0 0 16px' }
const sectionLabel = { fontSize: '14px', fontWeight: '600' as const, color: '#00006B', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif" }
const detailRow = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
