/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Painted Porch Strategies"
const LOGO_URL = 'https://kzbcudiorvnsqqgyzusl.supabase.co/storage/v1/object/public/email-assets/pps-logo.png'
const SITE_URL = 'https://onthepaintedporch.com'

interface Props {
  firstName?: string
  courseName?: string
}

const CourseLaunchListEmail = ({ firstName, courseName }: Props) => {
  const name = firstName || 'there'
  const course = courseName || 'our course'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're on the launch list for {course}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} width="180" height="auto" alt="Painted Porch Strategies" style={logo} />

          <Heading style={h1}>You're on the list, {name}!</Heading>

          <Text style={text}>
            Thanks for your interest in <strong>{course}</strong>. We're in the middle of moving our courses and community to a new platform (Go High Level) so we can give you a better learning experience.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              <strong>What happens next:</strong>
            </Text>
            <Text style={highlightText}>
              As soon as {course} is ready on the new platform, you'll get an email from us with a direct link to enroll, ahead of any public announcement.
            </Text>
          </Section>

          <Text style={text}>
            In the meantime, here are a few ways to stay connected:
          </Text>

          <Section style={linksSection}>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/blog`} style={link}>Read the latest from Thoughts from the Porch</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources/youtube`} style={link}>Watch leadership and change videos</a>
            </Text>
            <Text style={linkItem}>
              &#8226; <a href={`${SITE_URL}/resources`} style={link}>Browse our free resources</a>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Questions in the meantime? We'd love to hear from you.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={`${SITE_URL}/contact`} style={ctaButton}>
              Contact Us
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
  component: CourseLaunchListEmail,
  subject: (data: Record<string, any>) =>
    `You're on the launch list for ${data?.courseName || 'our course'}`,
  displayName: 'Course launch list confirmation',
  previewData: { firstName: 'Jane', courseName: 'Master Your Message' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '580px', margin: '0 auto' }
const logo = { margin: '0 0 24px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '8px', display: 'block' as const, border: '1px solid #ffffff' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 24px', fontFamily: "'Poppins', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }
const highlightBox = { backgroundColor: '#f8f5ed', borderLeft: '4px solid #E8A231', borderRadius: '4px', padding: '16px 20px', margin: '0 0 20px' }
const highlightText = { fontSize: '14px', color: '#545454', lineHeight: '1.5', margin: '0 0 8px' }
const linksSection = { margin: '0 0 16px' }
const linkItem = { fontSize: '14px', color: '#545454', lineHeight: '1.6', margin: '0 0 6px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const link = { color: '#007697', textDecoration: 'underline' }
const ctaButton = { backgroundColor: '#00006B', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', fontFamily: "'Poppins', Arial, sans-serif" }
const footer = { fontSize: '14px', color: '#888888', lineHeight: '1.5', margin: '24px 0 0' }
