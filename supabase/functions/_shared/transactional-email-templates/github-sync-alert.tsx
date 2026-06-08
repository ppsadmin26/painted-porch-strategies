/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Painted Porch Strategies'
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'

interface Props {
  source?: string
  eventType?: string
  errorMessage?: string
  detectedAt?: string
  repo?: string
  adminUrl?: string
}

const GithubSyncAlertEmail = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>GitHub sync issue detected on {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
        <Heading style={h1}>GitHub sync issue detected</Heading>
        <Text style={text}>
          We detected a problem keeping the {SITE_NAME} website in sync with GitHub. Recent edits may not have pushed or pulled correctly.
        </Text>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>What we know</Text>
          {p.repo && <Text style={detailRow}><strong>Repository:</strong> {p.repo}</Text>}
          {p.source && <Text style={detailRow}><strong>Detected by:</strong> {p.source}</Text>}
          {p.eventType && <Text style={detailRow}><strong>Event:</strong> {p.eventType}</Text>}
          {p.detectedAt && <Text style={detailRow}><strong>When:</strong> {p.detectedAt}</Text>}
          {p.errorMessage && <Text style={detailRow}><strong>Details:</strong> {p.errorMessage}</Text>}
        </Section>

        <Text style={text}>
          Open the admin email queue page to see full event history and trigger a fresh check.
        </Text>

        {p.adminUrl && (
          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={p.adminUrl} style={btn}>View sync status</Button>
          </Section>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Automated alert from the {SITE_NAME} admin system.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: GithubSyncAlertEmail,
  subject: 'GitHub sync issue detected on Painted Porch Strategies',
  displayName: 'GitHub sync alert (internal)',
  previewData: {
    source: 'webhook',
    eventType: 'workflow_run failure',
    errorMessage: 'Workflow "deploy" concluded with status: failure',
    detectedAt: new Date().toISOString(),
    repo: 'paintedporch/website',
    adminUrl: 'https://example.com/admin/emails/queue',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#DB0043', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const detailsSection = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px 20px', margin: '0 0 16px' }
const sectionLabel = { fontSize: '14px', fontWeight: '600' as const, color: '#00006B', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif" }
const detailRow = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
const btn = { backgroundColor: '#007697', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif", fontWeight: '600' as const }
