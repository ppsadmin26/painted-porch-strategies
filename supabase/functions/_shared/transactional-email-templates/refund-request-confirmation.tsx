/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface Props {
  firstName?: string
  program?: string
  purchaseDate?: string
  requestId?: string
}

const RefundRequestConfirmationEmail = ({ firstName, program, purchaseDate, requestId }: Props) => {
  const name = firstName || 'there'
  const prog = program || 'your course'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>We received your refund request</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>We got your refund request, {name}.</Heading>

          <Text style={text}>
            Thanks for reaching out. We've received your refund request for <strong>{prog}</strong> and our team is on it.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}><strong>Request details</strong></Text>
            <Text style={highlightText}>Program: {prog}</Text>
            {purchaseDate ? <Text style={highlightText}>Purchase date: {purchaseDate}</Text> : null}
            {requestId ? <Text style={highlightText}>Request ID: {requestId}</Text> : null}
          </Section>

          <Text style={text}>
            We'll begin processing your refund promptly. You'll receive a follow-up email from us as soon as the refund has been issued.
          </Text>

          <Text style={text}>
            If you have any questions in the meantime, just reply to this email or reach out through our <a href={`${SITE_URL}/contact`} style={link}>contact page</a>.
          </Text>

          <Hr style={hr} />

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={`${SITE_URL}`} style={ctaButton}>
              Visit Painted Porch
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
  component: RefundRequestConfirmationEmail,
  subject: "We received your refund request",
  displayName: 'Refund request confirmation (to customer)',
  previewData: { firstName: 'Jane', program: 'Master Your Message', purchaseDate: '2026-05-20', requestId: 'abc-123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#f8f5ed', borderLeft: '4px solid #E8A231', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#007697', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
