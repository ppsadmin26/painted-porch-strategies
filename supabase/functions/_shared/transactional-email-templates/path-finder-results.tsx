/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE = "Painted Porch Strategies"
const SITE_URL = "https://onthepaintedporch.com"
const LOGO_URL = 'https://dkpxjivoupqpmvzwxpef.supabase.co/storage/v1/object/public/email-assets/pps-logo-white.png'

interface RecItem { name: string; url: string; blurb: string; tier: string }
interface RecGroup { heading: string; items: RecItem[] }
interface ContentItem { kind: "blog" | "media"; title: string; url: string; excerpt?: string; source?: string }
interface Props {
  firstName?: string
  headline?: string
  subhead?: string
  resultType?: string
  track?: string
  strongestNextStep?: { name: string; url: string; label: string } | null
  recommendations?: RecGroup[]
  relatedContent?: ContentItem[]
}

const absUrl = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`)

const Email = (p: Props) => {
  const name = p.firstName || 'there'
  const recs = p.recommendations ?? []
  const isBlueDoor = p.strongestNextStep && /blue.?door/i.test(p.strongestNextStep.name)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your P.A.T.H. Finder results</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href="https://onthepaintedporch.com" style={{ display: "block", textDecoration: "none" }}>
            <Img src={LOGO_URL} width="180" height="auto" alt={SITE} style={logo} />
          </Link>
          <Text style={kicker}>Your P.A.T.H. Finder Results</Text>
          <Heading style={h1}>{p.headline ?? "Your starting point"}</Heading>
          {p.subhead ? <Text style={subhead}>{p.subhead}</Text> : null}
          <Text style={text}>
            Hi {name}, here are the recommendations the quiz surfaced for you. Each link below opens that program or workshop on our site.
          </Text>

          {p.strongestNextStep && (
            <Section style={isBlueDoor ? heroBoxBlue : heroBox}>
              <Text style={isBlueDoor ? heroLabelBlue : heroLabel}>
                {p.strongestNextStep.label}
              </Text>
              <Text style={heroValue}>{p.strongestNextStep.name}</Text>
              <Button href={absUrl(p.strongestNextStep.url)} style={isBlueDoor ? ctaBlue : ctaPrimary}>
                Learn More
              </Button>
            </Section>
          )}

          {recs.map((g, i) => (
            <Section key={i} style={groupBox}>
              <Text style={groupHeading}>{g.heading}</Text>
              {g.items.map((it, j) => (
                <Section key={j} style={recRow}>
                  <Text style={recName}>
                    <Link href={absUrl(it.url)} style={linkBold}>{it.name}</Link>
                    {" "}<span style={tierBadge}>{it.tier}</span>
                  </Text>
                  <Text style={recBlurb}>{it.blurb}</Text>
                </Section>
              ))}
            </Section>
          ))}

          <Hr style={hr} />
          <Text style={text}>
            Want to talk through any of this? <Link href={`${SITE_URL}/contact`} style={link}>Contact us</Link> and we'll help you scope the right starting point.
          </Text>
          <Text style={footer}>
            Do Epic ShIFt,<br />
            The {SITE} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Your P.A.T.H. Finder results',
  displayName: 'P.A.T.H. Finder quiz results',
  previewData: {
    firstName: 'Marcus',
    headline: 'Elevate Team Leadership',
    subhead: 'AMPLIFY — Leadership Lab',
    resultType: 'RT3',
    track: 'b2c',
    strongestNextStep: { name: 'From Conflict to Connection Lab', url: '/partner/amplify', label: 'Strongest Next Step — Workshop' },
    recommendations: [
      { heading: 'Your Starting Point — AMPLIFY Lab', items: [
        { name: 'From Conflict to Connection Lab', url: '/partner/amplify', blurb: 'Peer cohort tackling team friction at the root.', tier: 'AMPLIFY' },
      ]},
      { heading: 'Also Worth Exploring', items: [
        { name: 'Elements of a Team', url: '/partner/ignite', blurb: 'Core components of team health.', tier: 'IGNITE' },
      ]},
    ],
  },
} satisfies TemplateEntry

// styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '620px', margin: '0 auto' }
const logo = { margin: '0 0 16px', display: 'block' as const }
const kicker = { fontSize: '11px', color: '#007697', letterSpacing: '1.5px', textTransform: 'uppercase' as const, fontWeight: '700' as const, margin: '0 0 6px', fontFamily: "'Poppins', Arial, sans-serif" }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#00006B', margin: '0 0 6px', fontFamily: "'Poppins', Arial, sans-serif", lineHeight: 1.2 }
const subhead = { fontSize: '13px', color: '#007697', margin: '0 0 16px', fontWeight: '600' as const }
const text = { fontSize: '15px', color: '#545454', lineHeight: '1.6', margin: '0 0 16px' }

const heroBox = { backgroundColor: 'rgba(0, 118, 151, 0.06)', border: '2px solid rgba(0, 118, 151, 0.3)', padding: '20px', borderRadius: '10px', margin: '12px 0 24px', textAlign: 'left' as const }
const heroBoxBlue = { backgroundColor: 'rgba(0, 64, 153, 0.06)', border: '2px solid rgba(0, 64, 153, 0.3)', padding: '20px', borderRadius: '10px', margin: '12px 0 24px', textAlign: 'left' as const }
const heroLabel = { fontSize: '11px', color: '#007697', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: '700' as const, fontFamily: "'Poppins', Arial, sans-serif" }
const heroLabelBlue = { ...heroLabel, color: '#004099' }
const heroValue = { fontSize: '18px', color: '#00006B', margin: '0 0 12px', fontWeight: '700' as const, fontFamily: "'Poppins', Arial, sans-serif" }

const ctaPrimary = { backgroundColor: '#007697', color: '#ffffff', fontFamily: "'Poppins', Arial, sans-serif", fontWeight: '600' as const, fontSize: '14px', padding: '10px 22px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' as const }
const ctaBlue = { ...ctaPrimary, backgroundColor: '#004099' }

const groupBox = { margin: '16px 0' }
const groupHeading = { fontSize: '14px', color: '#00006B', margin: '0 0 8px', fontWeight: '700' as const, fontFamily: "'Poppins', Arial, sans-serif", textTransform: 'none' as const }
const recRow = { padding: '10px 12px', borderLeft: '3px solid #007697', backgroundColor: '#fafbfc', margin: '0 0 6px', borderRadius: '0 6px 6px 0' }
const recName = { fontSize: '14px', color: '#00006B', margin: 0, fontWeight: '600' as const }
const recBlurb = { fontSize: '13px', color: '#545454', margin: '4px 0 0', lineHeight: 1.5 }
const tierBadge = { fontSize: '10px', color: '#007697', letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontWeight: '700' as const }

const link = { color: '#007697', textDecoration: 'underline' }
const linkBold = { color: '#007697', textDecoration: 'none', fontWeight: '700' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '14px', color: '#888', lineHeight: '1.5', margin: '16px 0 0' }
