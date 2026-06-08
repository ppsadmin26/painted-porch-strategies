/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface Props {
  programName?: string
  programType?: string
  programSlug?: string
  firstName?: string
  lastName?: string
  email?: string
  newsletter?: boolean
}

const Email = (props: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New launch list signup for {props.programName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
        <Heading style={h1}>New Launch List Signup</Heading>
        <Text style={text}>
          Someone just joined the launch list for{" "}
          <strong>{props.programName}</strong>
          {props.programType ? ` (${props.programType})` : ''}.
        </Text>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Person</Text>
          <Text style={detailRow}><strong>Name:</strong> {props.firstName || ''} {props.lastName || ''}</Text>
          <Text style={detailRow}><strong>Email:</strong> {props.email}</Text>
          <Text style={detailRow}><strong>Newsletter:</strong> {props.newsletter ? 'Opted in' : 'Not opted in'}</Text>
        </Section>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Program</Text>
          <Text style={detailRow}><strong>Name:</strong> {props.programName}</Text>
          {props.programType && (
            <Text style={detailRow}><strong>Type:</strong> {props.programType}</Text>
          )}
          {props.programSlug && (
            <Text style={detailRow}><strong>Slug:</strong> {props.programSlug}</Text>
          )}
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          This alert was sent because Admin Alerts are enabled for this program on /admin/course-launches. Toggle it off there to stop these notifications for {props.programName}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New launch list signup: ${data.programName || 'Program'}`,
  displayName: 'Launch list signup (internal alert)',
  previewData: {
    programName: 'Leading Change Lab',
    programType: 'lab',
    programSlug: 'lab-leading-change',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    newsletter: true,
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
