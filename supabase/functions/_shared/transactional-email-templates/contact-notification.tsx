/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface ContactNotificationProps {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  inquiryFor?: string[]
  interests?: string[]
  message?: string
  budgetAuthority?: string
  budgetRange?: string
  timeline?: string
  specificDate?: string
  newsletter?: boolean
}

const ContactNotificationEmail = (props: ContactNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact form submission from {props.firstName} {props.lastName}</Preview>
    <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
          <Heading style={h1}>New Contact Form Submission</Heading>
        <Text style={text}>
          A new inquiry has been submitted through the {SITE_NAME} website.
        </Text>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Contact Information</Text>
          <Text style={detailRow}><strong>Name:</strong> {props.firstName} {props.lastName}</Text>
          <Text style={detailRow}><strong>Email:</strong> {props.email}</Text>
          {props.phone && <Text style={detailRow}><strong>Phone:</strong> {props.phone}</Text>}
          {props.company && <Text style={detailRow}><strong>Organization:</strong> {props.company}</Text>}
          {props.newsletter ? (
            <Text style={detailRow}><strong>Newsletter:</strong> Opted in</Text>
          ) : (
            <Text style={detailRow}><strong>Newsletter:</strong> Not opted in</Text>
          )}
        </Section>

        <Section style={detailsSection}>
          <Text style={sectionLabel}>Inquiry Details</Text>
          {props.inquiryFor?.length ? (
            <Text style={detailRow}><strong>Who is this for:</strong> {props.inquiryFor.join(', ')}</Text>
          ) : null}
          {props.interests?.length ? (
            <Text style={detailRow}><strong>Interests:</strong> {props.interests.join(', ')}</Text>
          ) : null}
          {props.budgetAuthority && (
            <Text style={detailRow}><strong>Budget Authority:</strong> {props.budgetAuthority}</Text>
          )}
          {props.budgetRange && (
            <Text style={detailRow}><strong>Budget Range:</strong> {props.budgetRange}</Text>
          )}
          {props.timeline && (
            <Text style={detailRow}><strong>Timeframe:</strong> {props.timeline}</Text>
          )}
          {props.specificDate && (
            <Text style={detailRow}><strong>Specific Date:</strong> {props.specificDate}</Text>
          )}
        </Section>

        {props.message && (
          <Section style={detailsSection}>
            <Text style={sectionLabel}>Message</Text>
            <Text style={detailRow}>{props.message}</Text>
          </Section>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          This notification was sent from the {SITE_NAME} website contact form.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New Website Inquiry: ${data.firstName || ''} ${data.lastName || ''}`.trim(),
  displayName: 'Contact form notification (internal)',
  to: 'explore@onthepaintedporch.com',
  previewData: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '555-123-4567',
    company: 'Acme Corp',
    inquiryFor: ['Team / Department', 'Company'],
    interests: ['Organizational Advisory', 'Team Workshops'],
    message: 'We are looking to partner on an organizational transformation initiative.',
    budgetAuthority: 'Yes',
    budgetRange: '$8,000 – $14,999',
    timeline: 'Within 31–90 Days',
    newsletter: true,
  },
} satisfies TemplateEntry

// Styles
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
