import type { FAQCategory } from "@/components/pps/FAQSection";
import { WORKSHOP_PRICE_DISPLAY } from "./stracticalConfig";

export const stracticalFaqCategories: FAQCategory[] = [
  {
    name: "Program Details",
    faqs: [
      {
        question: "What's the format of the Stractical Leader workshop?",
        answer: "The program consists of 5 weekly live sessions via Zoom (Wednesdays, 11:00 AM–12:00 PM MST/PT / 2:00–3:00 PM ET), followed by a one-month follow-up session to review wins, troubleshoot challenges, and ensure your transformation sticks.",
      },
      {
        question: "What if I miss a session?",
        answer: "All sessions are recorded and you'll have 60-day access to the recordings after the program ends, so you can catch up on your own schedule. That said, live participation is strongly encouraged for the interactive exercises and peer feedback.",
      },
      {
        question: "What materials do I receive?",
        answer: "You'll receive a comprehensive Stractical Action Guide with frameworks, strategic questions, and language patterns you can apply immediately. You'll also develop your own Personal Stractical Blueprint™ during the program.",
      },
      {
        question: "Is there a community or peer support?",
        answer: "Yes! Participants get access to a private community where you can connect with fellow leaders, share wins, ask questions, and continue the conversation between sessions.",
      },
    ],
  },
  {
    name: "Investment & Guarantee",
    faqs: [
      {
        question: `What does the ${WORKSHOP_PRICE_DISPLAY} investment include?`,
        answer: "Your investment covers all 6 live sessions (including the one-month follow-up), 60-day access to session recordings, the Stractical Toolkit and Action Guide, your Personal Blueprint development, and access to the private community.",
      },
      {
        question: "Is there a money-back guarantee?",
        answer: "Yes. If after Session 1 you don't feel this workshop will transform your strategic impact, simply let us know and we'll refund your full investment. We're confident because we've seen this framework work.",
      },
      {
        question: "Can my organization pay for this?",
        answer: "Absolutely. Many participants have their organizations cover the investment as professional development. We can provide a detailed program overview and expected outcomes document for your manager or L&D team upon request.",
      },
    ],
  },
  {
    name: "Fit & Prerequisites",
    faqs: [
      {
        question: "Who is this workshop designed for?",
        answer: "The Stractical Leader workshop is designed for mid-level leaders - managers, directors, team leads - who feel stuck executing directives and want to develop the skills to influence strategic decisions. If you've ever thought 'I'm just a manager,' this is for you.",
      },
      {
        question: "Do I need the Blue Door assessment before joining?",
        answer: "No. The Blue Door is not required. This workshop focuses on individual leadership capacity and doesn't require an organizational assessment.",
      },
      {
        question: "How is this different from other leadership programs?",
        answer: "Most programs teach you to be a better manager OR a better strategist. The Stractical Leader workshop teaches you to operate in the integration zone - bridging both simultaneously. You'll learn specific language patterns, strategic questions, and positioning techniques that change how you're perceived in your organization.",
      },
      {
        question: "How many people are in each cohort?",
        answer: "Each cohort is capped at 25 participants to ensure an intimate, interactive experience with personalized feedback and real-time application to your actual challenges.",
      },
      {
        question: "What if I'm not in an official leadership capacity?",
        answer: "We believe leadership isn't based on your title or role. It's based on your ambition, attitude, and desire. We welcome all - official \"capital L\" Leaders, as well as those aspiring to lead themselves and others with courage, curiosity, clarity, and the capacity to make shIFt happen.",
      },
    ],
  },
  {
    name: "Waitlist & Upcoming Cohorts",
    faqs: [
      {
        question: "When is the next cohort?",
        answer: "We run the Stractical Leader Lab a few times per year. Join the waitlist and you'll be the first to know when new dates are announced.",
      },
      {
        question: "What happens after I join the waitlist?",
        answer: "You'll receive a confirmation that you're on the list. When we schedule the next cohort, waitlist members get first access and priority enrollment before we open spots to the public.",
      },
      {
        question: "Is there any cost to join the waitlist?",
        answer: "No. Joining the waitlist is completely free and there's no obligation. It simply ensures you're notified first when enrollment opens.",
      },
      {
        question: "I missed the last cohort. Will the content be the same?",
        answer: "The core frameworks and exercises stay consistent, but each cohort benefits from fresh examples, updated case studies, and the unique dynamics of a new group of leaders. No two cohorts are exactly alike.",
      },
    ],
  },
];
