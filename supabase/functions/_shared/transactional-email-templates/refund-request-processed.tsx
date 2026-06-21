/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface Props {
  firstName?: string
  program?: string
  status?: 'approved' | 'rejected'
  adminNotes?: string
  requestId?: string
}

const RefundRequestProcessedEmail = ({ firstName, program, status, adminNotes, requestId }: Props) => {
  const name = firstName || 'there'
  const prog = program || 'your course'
  const approved = status === 'approved'
  const headline = approved
    ? `Your refund has been processed, ${name}.`
    : `An update on your refund request, ${name}.`
  const preview = approved
    ? "Your refund has been processed"
    : "An update on your refund request"

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
          </Link>
          <Heading style={h1}>{headline}</Heading>

          {approved ? (
            <>
              <Text style={text}>
                Good news. We've approved and processed your refund for <strong>{prog}</strong>. The refund has been issued back to your original payment method.
              </Text>
              <Text style={text}>
                Please allow 5 to 10 business days for the funds to appear, depending on your bank or card issuer.
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                Thank you for your patience while we reviewed your refund request for <strong>{prog}</strong>. After looking it over, we are unable to approve this refund at this time.
              </Text>
              <Text style={text}>
                If you have questions or would like to talk this through, just reply to this email or reach out through our <a href={`${SITE_URL}/contact`} style={link}>contact page</a>.
              </Text>
            </>
          )}

          {adminNotes ? (
            <Section style={highlightBox}>
              <Text style={highlightText}><strong>A note from our team</strong></Text>
              <Text style={highlightText}>{adminNotes}</Text>
            </Section>
          ) : null}

          {requestId ? (
            <Text style={meta}>Request ID: {requestId}</Text>
          ) : null}

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
  component: RefundRequestProcessedEmail,
  subject: (data: Record<string, any>) =>
    data?.status === 'rejected'
      ? 'An update on your refund request'
      : 'Your refund has been processed',
  displayName: 'Refund request processed (to customer)',
  previewData: {
    firstName: 'Jane',
    program: 'Master Your Message',
    status: 'approved',
    adminNotes: 'Refund issued to original payment method.',
    requestId: 'abc-123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const meta = { fontSize: '13px', color: '#888888', margin: '8px 0 0' }
const highlightBox = { backgroundColor: '#f8f5ed', borderLeft: '4px solid #E8A231', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#007697', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
