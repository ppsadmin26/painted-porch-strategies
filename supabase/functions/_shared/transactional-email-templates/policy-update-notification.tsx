/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Painted Porch Strategies'
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface PolicyUpdateProps {
  sections?: string[]
  summary?: string
  updatedAt?: string
}

const SECTION_TO_TAB: Record<string, string> = {
  Terms: 'terms',
  Privacy: 'privacy',
  Cookies: 'cookies',
}

const PolicyUpdateEmail = ({ sections = [], summary = '', updatedAt = '' }: PolicyUpdateProps) => {
  const sectionList = sections.length ? sections.join(', ') : 'Terms, Privacy &amp; Cookies'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>We updated our policies. Quick note on what changed.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>A small note about our policies</Heading>

          <Text style={text}>
            Hi there — quick housekeeping. We updated our <strong>{sectionList}</strong> on {updatedAt || 'today'}.
          </Text>

          <Text style={text}>
            We promised we'd tell you when this happens (and we keep our promises), so here we are.
          </Text>

          {summary && (
            <Section style={highlightBox}>
              <Text style={highlightHeading}>What changed</Text>
              <Text style={highlightText}>{summary}</Text>
            </Section>
          )}

          <Heading style={h2}>Read the updates</Heading>
          <Section style={linksSection}>
            {sections.map((s) => {
              const tab = SECTION_TO_TAB[s] || 'terms'
              return (
                <Text key={s} style={linkItem}>
                  &#8226; <a href={`${SITE_URL}/terms?tab=${tab}`} style={link}>{s} Policy</a>
                </Text>
              )
            })}
            {!sections.length && (
              <Text style={linkItem}>
                &#8226; <a href={`${SITE_URL}/terms`} style={link}>Open the full Terms, Privacy &amp; Cookies page</a>
              </Text>
            )}
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If something in the update doesn't sit right, write us at <a href="mailto:policies@onthepaintedporch.com" style={link}>policies@onthepaintedporch.com</a>. We read every one.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={`${SITE_URL}/terms`} style={ctaButton}>
              View the Policies
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
  component: PolicyUpdateEmail,
  subject: (data: Record<string, any>) => {
    const sections = Array.isArray(data?.sections) && data.sections.length
      ? data.sections.join(', ')
      : 'Terms, Privacy & Cookies'
    return `We updated our ${sections} — quick heads up`
  },
  displayName: 'Policy update notification',
  previewData: {
    sections: ['Terms', 'Privacy', 'Cookies'],
    summary: 'We merged Terms, Privacy, and Cookies onto one page, added GDPR/CCPA detail, and unified policy contact to policies@onthepaintedporch.com.',
    updatedAt: 'June 3, 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const h2 = { fontSize: '18px', fontWeight: 'bold' as const, color: '#00006B', margin: '24px 0 12px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#eef4f9', borderLeft: '4px solid #007697', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightHeading = { fontSize: '15px', color: '#00006B', fontWeight: 'bold' as const, lineHeight: '1.5', margin: '0 0 8px', fontFamily: "'Poppins', Arial, sans-serif" }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0', whiteSpace: 'pre-wrap' as const }
const linksSection = { margin: '0 0 16px' }
const linkItem = { fontSize: '14px', color: '#545454', lineHeight: '1.6', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#007697', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
