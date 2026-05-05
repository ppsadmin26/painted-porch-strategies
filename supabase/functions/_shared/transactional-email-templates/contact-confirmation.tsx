/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'

interface ContactConfirmationProps {
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
}

const ContactConfirmationEmail = (props: ContactConfirmationProps) => {
  const name = props.firstName || 'there'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thank you for reaching out to {SITE_NAME}</Preview>
      <Body style={main}>
          <Container style={container}>
            <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />
            <Heading style={h1}>Thank you, {name}!</Heading>
          <Text style={text}>
            We appreciate you reaching out to {SITE_NAME}. Your message has been received and our team will review it promptly. You should expect a response within <strong>24 business hours</strong>.
          </Text>

          <Hr style={hr} />
          <Heading as="h2" style={h2}>Your Submission Details</Heading>

          <Section style={detailsSection}>
            <Text style={detailRow}><strong>Name:</strong> {props.firstName} {props.lastName}</Text>
            <Text style={detailRow}><strong>Email:</strong> {props.email}</Text>
            {props.phone && <Text style={detailRow}><strong>Phone:</strong> {props.phone}</Text>}
            {props.company && <Text style={detailRow}><strong>Organization:</strong> {props.company}</Text>}
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
            {props.message && (
              <Text style={detailRow}><strong>Message:</strong> {props.message}</Text>
            )}
          </Section>

          <Hr style={hr} />
          <Text style={text}>
            In the meantime, feel free to explore our resources at <a href="https://onthepaintedporch.com" style={link}>onthepaintedporch.com</a>.
          </Text>

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
  component: ContactConfirmationEmail,
  subject: 'Thank you for reaching out to Painted Porch Strategies',
  displayName: 'Contact form confirmation',
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
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const h2 = { fontSize: '18px', fontWeight: '600' as const, color: '#007697', margin: '0 0 12px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const detailsSection = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px' }
const detailRow = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
