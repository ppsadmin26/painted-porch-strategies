/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'

interface CalcResultsProps {
  firstName?: string
  industry?: string
  size?: string
  durationMonths?: number
  plannedTotal?: number
  overrunLow?: number
  overrunHigh?: number
  failureWriteOff?: number
  exposureLow?: number
  exposureHigh?: number
}

const fmt = (n?: number) => {
  if (n === undefined || n === null || isNaN(n)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.round(n))
}

const Email = (p: CalcResultsProps) => {
  const name = p.firstName || 'there'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Cost of Skipping Phase Zero results</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt={SITE_NAME} style={logo} />
          <Heading style={h1}>Your Cost-of-Skipping Estimate</Heading>
          <Text style={text}>
            Hi {name}, here's the breakdown from the calculator. Share it with your
            team or use it to champion the case for doing the work before the work.
          </Text>

          <Section style={metaBox}>
            <Text style={metaLine}>
              <span style={metaLabel}>Industry:</span> {p.industry ?? '—'}
            </Text>
            <Text style={metaLine}>
              <span style={metaLabel}>Initiative size:</span> {p.size ?? '—'}
            </Text>
            <Text style={metaLine}>
              <span style={metaLabel}>Duration:</span> {p.durationMonths ?? '—'} months
            </Text>
          </Section>

          <Section style={resultRow}>
            <Text style={resultLabel}>Planned investment</Text>
            <Text style={resultValueNavy}>{fmt(p.plannedTotal)}</Text>
          </Section>
          <Section style={resultRow}>
            <Text style={resultLabel}>Likely overrun</Text>
            <Text style={resultValueGold}>{fmt(p.overrunLow)}–{fmt(p.overrunHigh)}</Text>
          </Section>
          <Section style={resultRow}>
            <Text style={resultLabel}>Failure write-off scenario</Text>
            <Text style={resultValueRaspberry}>{fmt(p.failureWriteOff)}</Text>
          </Section>

          <Section style={heroBox}>
            <Text style={heroLabel}>The Blue Door impact</Text>
            <Text style={heroValue}>
              A $1,500 Blue Door can de-risk an estimated{' '}
              <strong>{fmt(p.exposureLow)}–{fmt(p.exposureHigh)}</strong> of this exposure.
            </Text>
            <Button href="https://onthepaintedporch.com/blue-door" style={ctaButton}>
              Step Through the Blue Door
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={text}>
            Want to talk this through? Reply to this email or{' '}
            <a href="https://onthepaintedporch.com/contact" style={link}>contact us</a>.
          </Text>
          <Text style={smallText}>
            Estimates use publicly available research (BLS 2024, McKinsey, Gartner, BCG, 2022-2025).
            Refreshed annually.
          </Text>

          <Text style={footer}>
            Do Epic ShIFt,<br />
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Your Cost of Skipping Phase Zero results',
  displayName: 'Cost-of-skipping calculator results',
  previewData: {
    firstName: 'Marcus',
    industry: 'Technology / Software',
    size: 'Mid-Size',
    durationMonths: 12,
    plannedTotal: 850000,
    overrunLow: 297500,
    overrunHigh: 467500,
    failureWriteOff: 595000,
    exposureLow: 89250,
    exposureHigh: 159375,
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }
const logo = { margin: '0 0 24px', display: 'block' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 16px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const smallText = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '8px 0 0', fontStyle: 'italic' as const }

const metaBox = { backgroundColor: '#f8f9fb', padding: '16px', borderRadius: '8px', margin: '0 0 16px' }
const metaLine = { fontSize: '14px', color: '#00006B', margin: '0 0 4px' }
const metaLabel = { fontWeight: '600' as const, color: '#545454', marginRight: '6px' }

const resultRow = { display: 'flex' as const, justifyContent: 'space-between' as const, padding: '10px 14px', borderRadius: '6px', margin: '0 0 8px' }
const resultLabel = { fontSize: '13px', color: '#545454', margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontWeight: '600' as const }
const resultValueNavy = { fontSize: '20px', color: '#00006B', margin: '4px 0 0', fontWeight: 'bold' as const, fontFamily: "'Poppins', Arial, sans-serif" }
const resultValueGold = { fontSize: '20px', color: '#E8A231', margin: '4px 0 0', fontWeight: 'bold' as const, fontFamily: "'Poppins', Arial, sans-serif" }
const resultValueRaspberry = { fontSize: '20px', color: '#DB0043', margin: '4px 0 0', fontWeight: 'bold' as const, fontFamily: "'Poppins', Arial, sans-serif" }

const heroBox = { backgroundColor: 'rgba(0, 64, 153, 0.06)', border: '2px solid rgba(0, 64, 153, 0.3)', padding: '20px', borderRadius: '10px', margin: '20px 0', textAlign: 'center' as const }
const heroLabel = { fontSize: '11px', color: '#004099', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: '700' as const, fontFamily: "'Poppins', Arial, sans-serif" }
const heroValue = { fontSize: '15px', color: '#00006B', lineHeight: '1.5', margin: '0 0 16px' }
const ctaButton = {
  backgroundColor: '#004099',
  color: '#ffffff',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontWeight: '600' as const,
  fontSize: '15px',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const footer = { fontSize: '14px', color: '#888', lineHeight: '1.5', margin: '24px 0 0' }
