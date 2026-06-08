/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface Props {
  name?: string
  email?: string
  program?: string
  purchaseDate?: string
  reason?: string
  requestId?: string
  submittedAt?: string
}

const RefundRequestNotificationEmail = ({ name, email, program, purchaseDate, reason, requestId, submittedAt }: Props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New refund request: {program || 'course'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>New refund request</Heading>

          <Text style={text}>
            A new refund request has been submitted through the website. Please review and initiate the refund.
          </Text>

          <Section style={detailsBox}>
            <Text style={row}><strong>Name:</strong> {name || '—'}</Text>
            <Text style={row}><strong>Email:</strong> {email || '—'}</Text>
            <Text style={row}><strong>Program:</strong> {program || '—'}</Text>
            <Text style={row}><strong>Purchase date:</strong> {purchaseDate || '—'}</Text>
            <Text style={row}><strong>Request ID:</strong> {requestId || '—'}</Text>
            {submittedAt ? <Text style={row}><strong>Submitted:</strong> {submittedAt}</Text> : null}
          </Section>

          {reason ? (
            <>
              <Text style={text}><strong>Reason provided:</strong></Text>
              <Section style={reasonBox}>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            </>
          ) : (
            <Text style={text}><em>No reason provided.</em></Text>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Next steps: process the refund through the appropriate payment provider, then send the customer the refund-processed notification and update the request status in the admin portal.
          </Text>

          <Text style={footer}>
            — {SITE_NAME} website
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: RefundRequestNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New refund request: ${data?.program || 'course'} (${data?.email || 'unknown'})`,
  displayName: 'Refund request notification (to support)',
  previewData: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    program: 'Master Your Message',
    purchaseDate: '2026-05-20',
    reason: 'Course content was not what I expected.',
    requestId: 'abc-123',
    submittedAt: '2026-06-05T20:00:00Z',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 20px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 12px' }
const detailsBox = { backgroundColor: '#f5f7fa', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px' }
const row = { fontSize: '14px', color: '#1f2937', lineHeight: '1.6', margin: '0 0 6px' }
const reasonBox = { backgroundColor: '#fff8f1', borderLeft: '4px solid #E8A231', padding: '12px 16px', borderRadius: '4px', margin: '0 0 20px' }
const reasonText = { fontSize: '14px', color: '#545454', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '12px 0 0' }
