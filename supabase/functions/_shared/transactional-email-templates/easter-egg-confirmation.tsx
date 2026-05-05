/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'

interface EasterEggConfirmationProps {
  name?: string
  charity?: string
}

const EasterEggConfirmationEmail = (props: EasterEggConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You found something — and we're donating $50 because of it.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
        <Heading style={h1}>🎉 You're in good company.</Heading>

        <Text style={text}>
          {props.name ? `Hi ${props.name},` : 'Hi there,'}
        </Text>

        <Text style={text}>
          You actually read the fine print — and found one of our hidden Easter eggs.
          That's a more radical act than it sounds.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightLabel}>Charity you chose</Text>
          <Text style={highlightValue}>{props.charity || 'A charity of your choice'}</Text>
        </Section>

        <Text style={text}>
          Someone from the Porch will confirm the $50 donation within 3–5 business
          days and send you a note when it's done. If we need to redirect the donation
          for any reason, we'll reach out and ask you for an alternative.
        </Text>

        <Text style={text}>
          Thanks for being curious. The world needs more of that.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          — The {SITE_NAME} team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EasterEggConfirmationEmail,
  subject: 'You found something — thank you',
  displayName: 'Easter egg hunt confirmation (submitter)',
  previewData: {
    name: 'Jane',
    charity: 'Doctors Without Borders',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 20px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.65', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#f8f9fa', borderLeft: '4px solid #007697', borderRadius: '6px', padding: '16px 20px', margin: '20px 0' }
const highlightLabel = { fontSize: '12px', fontWeight: '600' as const, color: '#007697', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 4px', fontFamily: "'Poppins', Arial, sans-serif" }
const highlightValue = { fontSize: '16px', color: '#00006B', fontWeight: '600' as const, margin: '0', fontFamily: "'Poppins', Arial, sans-serif" }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#999999', margin: '0', fontStyle: 'italic' as const }
