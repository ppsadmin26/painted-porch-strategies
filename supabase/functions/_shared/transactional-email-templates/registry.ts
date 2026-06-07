/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as contactNotification } from './contact-notification.tsx'
import { template as burnoutAccess } from './burnout-access.tsx'
import { template as stracticalWaitlist } from './stractical-waitlist.tsx'
import { template as pilotTrainingReplay } from './pilot-training-replay.tsx'
import { template as kickTheHabitReplay } from './kick-the-habit-replay.tsx'
import { template as communicatorStylesReplay } from './communicator-styles-replay.tsx'
import { template as strategicCanvas } from './strategic-canvas.tsx'
import { template as changeReadinessRoadmap } from './change-readiness-roadmap.tsx'
import { template as changeCommsGuide } from './change-comms-guide.tsx'
import { template as blueDoorPurchaseConfirmation } from './blue-door-purchase-confirmation.tsx'
import { template as stoicFieldGuide } from './stoic-field-guide.tsx'
import { template as easterEggNotification } from './easter-egg-notification.tsx'
import { template as easterEggConfirmation } from './easter-egg-confirmation.tsx'
import { template as githubSyncAlert } from './github-sync-alert.tsx'
import { template as policyUpdateNotification } from './policy-update-notification.tsx'
import { template as courseLaunchList } from './course-launch-list.tsx'
import { template as courseLaunchAvailable } from './course-launch-available.tsx'
import { template as refundRequestConfirmation } from './refund-request-confirmation.tsx'
import { template as refundRequestNotification } from './refund-request-notification.tsx'
import { template as refundRequestProcessed } from './refund-request-processed.tsx'
import { template as launchListSignupAdmin } from './launch-list-signup-admin.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-confirmation': contactConfirmation,
  'contact-notification': contactNotification,
  'easter-egg-notification': easterEggNotification,
  'easter-egg-confirmation': easterEggConfirmation,
  'burnout-access': burnoutAccess,
  'stractical-waitlist': stracticalWaitlist,
  'pilot-training-replay': pilotTrainingReplay,
  'kick-the-habit-replay': kickTheHabitReplay,
  'communicator-styles-replay': communicatorStylesReplay,
  'strategic-canvas': strategicCanvas,
  'change-readiness-roadmap': changeReadinessRoadmap,
  'change-comms-guide': changeCommsGuide,
  'blue-door-purchase-confirmation': blueDoorPurchaseConfirmation,
  'stoic-field-guide': stoicFieldGuide,
  'github-sync-alert': githubSyncAlert,
  'policy-update-notification': policyUpdateNotification,
  'course-launch-list': courseLaunchList,
  'course-launch-available': courseLaunchAvailable,
  'refund-request-confirmation': refundRequestConfirmation,
  'refund-request-notification': refundRequestNotification,
  'refund-request-processed': refundRequestProcessed,
}
