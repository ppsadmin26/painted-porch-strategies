/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Painted Porch Strategies'
const LOGO_URL =
  'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface Props {
  triggeredBy?: string
  triggeredAt?: string
  note?: string
}

const AdminTestEmail = ({ triggeredBy, triggeredAt, note }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Admin notification test from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
        <Heading style={h1}>Admin notification test</Heading>
        <Text style={text}>
          If you're reading this, the admin notification address is working and
          your transactional email pipeline can reach it.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailRow}><strong>Triggered by:</strong> {triggeredBy ?? 'unknown'}</Text>
          <Text style={detailRow}><strong>Triggered at:</strong> {triggeredAt ?? new Date().toISOString()}</Text>
          {note && <Text style={detailRow}><strong>Note:</strong> {note}</Text>}
        </Section>
        <Text style={footer}>
          This is a test message sent from the admin dashboard. No action is needed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminTestEmail,
  subject: 'Admin notification test — Painted Porch Strategies',
  displayName: 'Admin notification test',
  previewData: { triggeredBy: 'admin@paintedporchstrategies.com', triggeredAt: new Date().toISOString() },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', padding: '32px 24px', backgroundColor: '#ffffff' }
const logo = { display: 'block', margin: '0 auto 24px', backgroundColor: '#00006B', padding: '16px', borderRadius: '8px' }
const h1 = { color: '#00006B', fontFamily: 'Poppins, Arial, sans-serif', fontSize: '24px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#1f2937', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const detailsSection = { backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', margin: '16px 0' }
const detailRow = { color: '#1f2937', fontSize: '14px', lineHeight: '22px', margin: '4px 0' }
const footer = { color: '#6b7280', fontSize: '12px', marginTop: '24px' }
