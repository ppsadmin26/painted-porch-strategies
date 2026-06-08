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
  courseName?: string
  courseUrl?: string
}

const CourseLaunchAvailableEmail = ({ firstName, courseName, courseUrl }: Props) => {
  const name = firstName || 'there'
  const course = courseName || 'Your course'
  const url = courseUrl || SITE_URL

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{course} is now available!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>{course} is live, {name}!</Heading>

          <Text style={text}>
            Great news. <strong>{course}</strong> is now ready on our new course platform. You were on the launch list, so you're getting this email before we announce it publicly.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              You can head straight to the course page to learn more, see what's included, and enroll.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={url} style={ctaButton}>
              View {course}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Questions before you jump in? Just reply to this email or reach out through our <a href={`${SITE_URL}/contact`} style={link}>contact page</a>.
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
  component: CourseLaunchAvailableEmail,
  subject: (data: Record<string, any>) =>
    `${data?.courseName || 'Your course'} is now available!`,
  displayName: 'Course launch available notification',
  previewData: {
    firstName: 'Jane',
    courseName: 'Master Your Message',
    courseUrl: 'https://onthepaintedporch.com/communication',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#f8f5ed', borderLeft: '4px solid #E8A231', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#007697', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
