import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import termsHero from "@/assets/terms-hero.jpg";
import { TierHeroSection } from "@/components/pps/TierHeroSection";

const VALID_TABS = new Set(["terms", "privacy", "cookies"]);
const POLICY_EMAIL = "policies@onthepaintedporch.com";

const TermsAndConditions = () => {
  const [params, setParams] = useSearchParams();
  const tab = VALID_TABS.has(params.get("tab") ?? "") ? (params.get("tab") as string) : "terms";

  useEffect(() => {
    const titles: Record<string, string> = {
      terms: "Terms of The Porch | Painted Porch Strategies",
      privacy: "Privacy Policy | Painted Porch Strategies",
      cookies: "Cookie Policy | Painted Porch Strategies",
    };
    document.title = titles[tab];
  }, [tab]);

  const onTabChange = (value: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const headlines: Record<string, { headline: string; sub: string }> = {
    terms: { headline: "Terms of The Porch.", sub: "The Version You Might Actually Read" },
    privacy: { headline: "Privacy on The Porch.", sub: "What we collect, why, and how to make us forget" },
    cookies: { headline: "Cookies on The Porch.", sub: "Crumbs, not cookies (and we'll explain the difference)" },
  };

  return (
    <div>
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Legal
          </span>
        }
        headline={headlines[tab].headline}
        subheadline={headlines[tab].sub}
        description={
          <p className="text-white/60 italic text-base">Last Updated: June 3, 2026</p>
        }
        ctas={[]}
        background={{ type: "image", src: termsHero }}
        overlayClass="bg-navy/20"
      />

      <section className="py-8 md:py-10 bg-white border-b border-border">
        <div className="container max-w-4xl mx-auto px-6">
          <Tabs value={tab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="terms" className="py-3 font-poppins font-semibold">Terms</TabsTrigger>
              <TabsTrigger value="privacy" className="py-3 font-poppins font-semibold">Privacy</TabsTrigger>
              <TabsTrigger value="cookies" className="py-3 font-poppins font-semibold">Cookies</TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="mt-0">
              <TermsTabBody />
            </TabsContent>
            <TabsContent value="privacy" className="mt-0">
              <PrivacyTabBody />
            </TabsContent>
            <TabsContent value="cookies" className="mt-0">
              <CookiesTabBody />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

/* ============================ TERMS TAB ============================ */
function TermsTabBody() {
  return (
    <>
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-0">
          <div className="bg-white rounded-xl p-8 border-l-4 border-primary shadow-sm space-y-4">
            <p className="text-foreground leading-relaxed">
              Most people open Terms &amp; Conditions, register that it's long, and step back from the rabbit hole entirely. We understand. We've made this one worth the trip down.
            </p>
            <p className="text-foreground leading-relaxed">
              The name "Painted Porch" didn't come from marketing. It came from a place — a colonnade in ancient Athens where serious thinkers gathered to reason carefully about how to live and work. That discipline applies here too. This document is the actual agreement between us: what we owe each other, stated plainly.
            </p>
            <p className="text-foreground font-semibold">Read it like you mean it.</p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-white">
        <div className="container max-w-4xl mx-auto px-0">
          <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-gold space-y-4">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">A Note on Communications</h2>
            <p className="text-foreground leading-relaxed">
              When you purchase any product from us — free or paid — we'll add you to our communications database as part of the relationship we're forming. That means you'll hear from us when there's information directly related to your purchase, and when we have a company-wide note we think you'd want to know about (including updates to this very document — see <Link to="/terms?tab=privacy" className="text-primary font-semibold underline">Privacy</Link>).
            </p>
            <p className="text-foreground leading-relaxed">
              We don't do traditional email marketing. You can unsubscribe at any time — though please know that unsubscribing means you'll also stop receiving updates directly related to products you've purchased.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-0 space-y-10">

          <Block title="Partners to This Agreement">
            <p>This writing — formally called a contract — outlines the intended legal relationship between Painted Porch Strategies, LLC (the "COMPANY") and you (the "CLIENT"). Together, we're the intended parties (the "PARTIES") to this AGREEMENT, which governs your purchase of any free or paid content or product (the "PROGRAM") from the COMPANY.</p>
          </Block>

          <Block title="On Becoming Official">
            <p>As the CLIENT, you're entering a legally binding agreement with Painted Porch Strategies, LLC — an Arizona Limited Liability Company — when you do any of the following:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click "I Agree," "Purchase Now," "Buy Now," "Sign Up," or any equivalent language</li>
              <li>Email your statement of agreement</li>
              <li>Enter your credit card information</li>
              <li>Sign this agreement on this page or the reverse</li>
              <li>Enroll electronically, verbally, or otherwise in the PROGRAM</li>
            </ul>
            <p>This acceptance binds any individual, associate, and/or assign to the terms of this AGREEMENT. A facsimile, electronic, or emailed copy is legally binding with either a written or electronic signature and carries the same effect as an original signed document.</p>
          </Block>

          <Block title="Reasonable Expectations: Our Services">
            <p>This AGREEMENT is executed and valid upon CLIENT acceptance — electronic, verbal, written, or otherwise.</p>
            <p>Its terms are binding on any additional goods or services supplied by COMPANY to CLIENT.</p>
            <p>The PROGRAM is educational and informational in nature, relating to life and business.</p>
            <p>The scope of COMPANY's services is limited to those described on COMPANY's website or as part of the PROGRAM. COMPANY reserves the right to substitute comparable services without prior notice if circumstances require it.</p>
          </Block>

          <Block title="Acceptable Use (or, The Dude Would Not Abide)">
            <p>By using our site, your account, or any PROGRAM, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reverse-engineer, scrape, or harvest content beyond what your license allows.</li>
              <li>Impersonate another person, mis-state your affiliation, or share login credentials.</li>
              <li>Upload anything unlawful, harassing, defamatory, infringing, or malware-flavored.</li>
              <li>Interfere with the site's operation — no probing, no flooding, no funny business.</li>
              <li>Use our AI-assisted tools (assessments, etc.) to generate content for resale or to train another model.</li>
            </ul>
            <p className="italic text-muted-foreground">Inconceivable that we'd have to say it, but here we are.</p>
          </Block>

          <Block title="Accounts & Admin Access">
            <p>If you're issued an account — including admin access to a client workspace or project board — you're responsible for keeping your credentials confidential and for any activity under your account. Notify us at <PolicyLink /> if you suspect unauthorized access. We may suspend accounts that pose a security or contractual risk.</p>
          </Block>

          <Block title="User-Submitted Content">
            <p>If you submit content to us (form responses, assessment answers, files, comments, ideas), you grant COMPANY a worldwide, non-exclusive, royalty-free license to use, store, reproduce, and adapt that content for the purpose of providing the PROGRAM and improving our services. You retain ownership of your content.</p>
            <p>You represent that you have the right to submit it and that it doesn't violate anyone else's rights.</p>
          </Block>

          <Block title="Copyright & DMCA">
            <p>We respect intellectual property. If you believe content on our site infringes your copyright, send a DMCA notice to <PolicyLink /> with: (a) your contact info, (b) identification of the copyrighted work, (c) the URL of the alleged infringement, (d) a statement of good-faith belief, (e) a statement under penalty of perjury that the information is accurate and you're the owner or authorized agent, and (f) your physical or electronic signature. Repeat infringers will have accounts terminated.</p>
          </Block>

          <Block title="Confidential Means Confidential">
            <p>"Confidential Information" means anything not generally known to the public that relates to the CLIENT's business or personal affairs.</p>
            <p>COMPANY agrees not to disclose, reveal, or use any Confidential Information learned through its transactions with CLIENT — in discussions, interactions, or otherwise — without CLIENT's prior written consent.</p>
            <p>COMPANY will maintain CLIENT's Confidential Information in strictest confidence and take its best efforts to protect it against disclosure, misuse, espionage, loss, or theft.</p>
            <p>COMPANY's <Link to="/terms?tab=privacy" className="text-primary font-semibold underline">Privacy Policy</Link> and <Link to="/terms?tab=cookies" className="text-primary font-semibold underline">Cookie Policy</Link> also govern how personally identifiable information supplied by CLIENT is collected, stored, and used.</p>
          </Block>

          <Block title="Hands Off Our Work">
            <p>COMPANY's copyrighted and original materials are provided to CLIENT for individual use only — under a limited, single-user license.</p>
            <p>CLIENT is not authorized to copy-and-paste, reproduce, share, distribute, or otherwise use COMPANY's materials, trademarks, or intellectual property for any purpose — including displaying COMPANY's content as their own — without prior written consent.</p>
            <p>All intellectual property, including copyrighted program materials, remains the sole property of the COMPANY. No license to sell or distribute COMPANY's materials is granted or implied.</p>
          </Block>

          <Block title="How We Treat Each Other">
            <p>To the extent that CLIENT interacts with COMPANY staff or other clients, CLIENT agrees to behave professionally, courteously, and respectfully at all times.</p>
            <p>Failure to follow program rules is cause for termination of this AGREEMENT. In the event of such termination, CLIENT is not entitled to recoup any amounts paid and remains responsible for all outstanding amounts.</p>
          </Block>

          <Block title="Let's Keep It Clean">
            <p>If a dispute arises or a grievance exists, the only venue for resolution is the one identified below.</p>
            <p>Both PARTIES agree not to engage in any public or private conduct or communications designed to disparage the other. Such conduct constitutes a breach of this AGREEMENT.</p>
          </Block>

          <Block title="About Recordings and Your Work">
            <p>By accepting this AGREEMENT, CLIENT consents to recordings being made of the PROGRAM.</p>
            <p>COMPANY reserves the right to use — at its sole discretion — PROGRAM materials, videos, audio recordings, and materials submitted by CLIENT (in the context of the PROGRAM) for future lecture, teaching, and marketing purposes, and for other goods or services provided by COMPANY, without compensation to CLIENT.</p>
            <p>CLIENT consents to their name, voice, and likeness being used by COMPANY for the same purposes, without compensation.</p>
          </Block>

          <Block title="This Isn't a Franchise">
            <p>CLIENT agrees not to reproduce, duplicate, copy, sell, trade, resell, or exploit for any commercial purpose any portion of the PROGRAM — including its materials, use, or access.</p>
            <p>This AGREEMENT is not transferable or assignable without COMPANY's prior written consent.</p>
          </Block>

          <Block title="If Things Don't Work Out">
            <p>We're not the Queen of Hearts — we won't be shouting "Off with their heads!" at the first sign of trouble. But if CLIENT is behind in payment or otherwise in default of this AGREEMENT, full payment becomes immediately due and CLIENT is barred from accessing COMPANY's services. COMPANY may immediately collect all outstanding Fees and cease providing services.</p>
          </Block>

          <Block title="The Money Part">
            <p>If CLIENT has accessed a free product, there is no Fee due.</p>
            <p>For paid products, CLIENT agrees to pay the stated Fee (the "FEE") according to the payment terms:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>As outlined on COMPANY's website</li>
              <li>As provided through email</li>
              <li>According to the Payment Schedule and payment plan selected by CLIENT</li>
              <li>Or as otherwise stated in this AGREEMENT</li>
            </ul>
          </Block>

          <Block title="Changed Your Mind?">
            <p>If CLIENT has accessed a free product, no refund applies.</p>
            <p>Upon execution of this AGREEMENT, CLIENT is responsible for the full Fee. If CLIENT decides to cancel or not participate, COMPANY may provide a refund according to the following:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Individual programs:</strong> refund requests within 14 days of purchase</li>
              <li><strong>Bundled programs:</strong> refund requests within 21 days of purchase</li>
            </ul>
            <p>Refund requests may be submitted to <PolicyLink />.</p>
            <p>Refunds for One-on-One Coaching programs will only be issued if CLIENT has completed one session or fewer.</p>
          </Block>

          <Block title="What Kind of Access You Have">
            <p>COMPANY may offer different license types:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Single-User License</strong> — for your individual use only. Not for client work or sharing.</li>
              <li><strong>Multi-User License</strong> — for yourself plus the number of licenses purchased. Designed for working with clients who need the PROGRAM for their accounts.</li>
              <li><strong>Multi-User License + Client Content Access</strong> — same as above, with the addition that your clients may also purchase their own individual access to the PROGRAM.</li>
            </ul>
          </Block>

          <Block title='A Word About "Lifetime" Access'>
            <p>Where COMPANY offers "Lifetime Access" to any PROGRAM, "lifetime" refers to the operational life of the platform or the COMPANY — not the biological lifespan of the CLIENT.</p>
            <p>CLIENT will retain access to the PROGRAM for as long as the platform exists, the COMPANY remains in operation, and Earth persists in its current form. In the event that a Vogon Constructor Fleet arrives to make way for a hyperspace bypass, COMPANY's obligations under this clause are considered fulfilled and access will be discontinued accordingly. No refunds will be issued for galactic infrastructure projects.</p>
            <p>COMPANY will make reasonable efforts to provide advance notice of any planned platform discontinuation that does not involve interstellar construction.</p>
          </Block>

          <Block title="Please Don't Make It Weird with Your Bank">
            <p>By providing credit card information, CLIENT authorizes COMPANY to charge that card for any unpaid amounts on the agreed payment dates.</p>
            <p>CLIENT agrees not to initiate chargebacks or cancel the card provided as security without COMPANY's prior written consent. Any disputed charges must be raised with COMPANY within 42 calendar days of the billing date — the Answer to Life, the Universe, and Everything, and apparently also the window for billing disputes. CLIENT is responsible for any fees associated with chargebacks or collection efforts.</p>
            <p>CLIENT agrees not to change credit card information without advance notice to COMPANY.</p>
          </Block>

          <Block title="When This Document Wins Over the Pitch">
            <p>Marketing makes promises. This document keeps them.</p>
            <p>In the event of any conflict between the provisions contained in this AGREEMENT, any marketing materials used by COMPANY, COMPANY's representatives, or employees, the provisions in this AGREEMENT control.</p>
          </Block>

          <Block title="The Full Picture">
            <p>What's written here is the whole truth — not the version shaped by a sales conversation, a slide deck, or something someone remembered hearing.</p>
            <p>This AGREEMENT is the entire AGREEMENT between the PARTIES relating to the subject matter and supersedes all prior and contemporaneous agreements, negotiations and understandings, oral or written. Modification to this AGREEMENT is by a writing signed by both PARTIES.</p>
          </Block>

          <Block title="Pobody's Nerfect — Including Us">
            <p>By enrolling in the PROGRAM, CLIENT releases COMPANY, its officers, employees, directors, and related entities from any and all damages resulting from participation in the PROGRAM. The PROGRAM provides educational and advisory services. CLIENT accepts all risks, foreseeable and otherwise, arising from the PROGRAM.</p>
            <p>Regardless of the above, if COMPANY is found to be liable, that liability is limited to the lesser of:</p>
            <p className="pl-4">(a) the total fees CLIENT paid to COMPANY in the one month prior to the action giving rise to the liability, or</p>
            <p className="pl-4">(b) the Purchase Price of the PROGRAM</p>
            <p>All claims against COMPANY must be filed within 90 days of the first claim or be forfeited. CLIENT agrees that COMPANY will not be held liable for any damages — direct, indirect, incidental, special, negligent, consequential, or exemplary — arising from use or misuse of COMPANY's services or enrollment in the PROGRAM.</p>
            <p>CLIENT agrees that use of COMPANY's services is at CLIENT's own risk.</p>
          </Block>

          <Block title="We Watch Each Other's Backs">
            <p>COMPANY recognizes that its shareholders, trustees, affiliates, and successors shall not be held personally responsible or liable for COMPANY's actions or representations.</p>
            <p>CLIENT agrees to defend, indemnify, and hold harmless COMPANY, its shareholders, trustees, affiliates, and successors from all liabilities and expenses — including claims, damages, judgments, awards, settlements, legal actions, regulatory actions, costs, and attorneys' fees — arising from or related to this AGREEMENT.</p>
            <p>Any liabilities resulting from a breach of this AGREEMENT, sole negligence, or willful misconduct by COMPANY or its representatives are excluded from indemnification.</p>
          </Block>

          <Block title="We Believe in You. We Just Can't Promise Results.">
            <p>CLIENT accepts full responsibility for their own progress and results from the PROGRAM. CLIENT acknowledges that they are the vital element to the PROGRAM's success — and that COMPANY cannot control CLIENT.</p>
            <p>COMPANY makes no representations or guarantees, verbal or written, beyond those specifically stated here. COMPANY and its affiliates disclaim implied warranties of title, merchantability, and fitness for a particular purpose.</p>
            <p>Pobody's nerfect. What we can promise is clarity about what we're committing to — and what we're not. COMPANY makes no guarantee that the PROGRAM will meet CLIENT's requirements or that all CLIENTs will achieve the same results.</p>
          </Block>

          <Block title="Where We Land If It Gets Legal">
            <p>If something goes sideways, we'd rather reason through it than fight about it. That instinct has a name — the Stoics called it <em>preferred indifference to conflict</em>, the practice of meeting disputes <em>sine ira et studio</em> (without anger, without favor) — and it's why we've chosen arbitration over interpretive dance, megaphone-wielding, or full-blown litigation.</p>
            <p>This AGREEMENT is governed by the laws of the State of Arizona without giving effect to any principles of conflicts of law. Any dispute or controversy arising out of or relating to this AGREEMENT will be resolved by binding arbitration in Phoenix, Maricopa County, Arizona, under the rules of the American Arbitration Association. The arbitration is binding upon the PARTIES and their successors in interest. The prevailing party may collect all reasonable legal fees from the non-prevailing party.</p>
            <p><strong>Class-action waiver.</strong> To the maximum extent permitted by law, each party waives any right to bring or participate in a class, collective, or representative action against the other. Disputes proceed only on an individual basis.</p>
            <p><strong>Jury trial waiver.</strong> Each party waives the right to a jury trial for any dispute not subject to arbitration.</p>
            <p><strong>Carve-outs.</strong> Either party may bring an individual claim in small-claims court if eligible, and either party may seek injunctive or equitable relief in a court of competent jurisdiction to protect intellectual property or confidential information.</p>
            <p><strong>30-day opt-out.</strong> You may opt out of the arbitration and class-action waiver provisions by emailing <PolicyLink /> within 30 days of first accepting these terms, with the subject "Arbitration opt-out" and your full name and the email associated with your account. Opting out does not affect any other part of this AGREEMENT.</p>
          </Block>

          <Block title="What Lives On After It's Over">
            <p>Some things outlast the formal relationship.</p>
            <p>The ownership, non-circumvention, non-disparagement, proprietary rights, and confidentiality provisions, and any provisions relating to payment of Fees owed set forth in this AGREEMENT, and any other provisions that by their sense and context the PARTIES intend to have survive, shall survive the termination of this AGREEMENT for any reason.</p>
          </Block>

          <Block title="If One Part Falls, the Rest Stands">
            <p>If any part of this AGREEMENT is found invalid or unenforceable, only that specific part is affected. The remainder continues in full force.</p>
          </Block>

          <div className="pt-6 border-t border-border">
            <p className="text-foreground italic">Painted Porch Strategies, LLC</p>
            <p className="text-foreground italic"><PolicyLink /></p>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              You made it to the end. That puts you in rare company. There are five things hidden across these three policies for the truly curious — references, callbacks, a Stoic phrase or two, and at least one moment where the legal language gets a little… galactic. If you found one and know what it means, there's a form waiting at{" "}
              <Link to="/found-it" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
                paintedporchstrategies.com/found-it
              </Link>
              . Find one, tell us what it is, and we'll donate $25 to a charity of your choice. So long, and thanks for all the fish.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================ PRIVACY TAB ============================ */
function PrivacyTabBody() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-0 space-y-10">

        <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-primary space-y-4">
          <p className="text-foreground leading-relaxed">
            This is the part where we tell you, plainly, what data we collect, what we do with it, and how to make us forget you ever existed. We're aiming to satisfy <strong>GDPR</strong> (EU/EEA), <strong>UK GDPR</strong>, <strong>CCPA/CPRA</strong> (California), <strong>PIPEDA</strong> (Canada), and <strong>Québec Law 25</strong> — and to give everyone else the same level of care, because that's the right way to do it.
          </p>
          <p className="text-foreground leading-relaxed">
            One email for everything privacy-related: <PolicyLink />.
          </p>
        </div>

        <Block title="Who We Are (the Data Controller)">
          <p>Painted Porch Strategies, LLC, an Arizona limited liability company. For GDPR/UK GDPR purposes, we act as the data controller for personal data we collect through this site and our services.</p>
        </Block>

        <Block title="What We Collect">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>You give us:</strong> name, email, phone, organization, role, message content, form responses, assessment answers, payment details (handled by Stripe — we never see your card number), files you upload, and anything you submit via our contact, opt-in, or assessment forms.</li>
            <li><strong>Automatically:</strong> IP address (anonymized for analytics), device/browser type, referrer, pages visited, approximate location (city/region), and session timestamps.</li>
            <li><strong>Cookies & similar:</strong> see the <Link to="/terms?tab=cookies" className="text-primary font-semibold underline">Cookie Policy</Link>.</li>
            <li><strong>From third parties:</strong> if you sign in via a social provider or interact with us through our CRM (GoHighLevel), we receive identifiers and engagement metadata.</li>
          </ul>
        </Block>

        <Block title="Why We Use It (Purposes & Legal Bases)">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Deliver what you bought / signed up for</strong> — legal basis: contract (GDPR Art. 6(1)(b)).</li>
            <li><strong>Send transactional emails</strong> (receipts, account notices, course delivery, policy updates like this one) — contract / legitimate interests.</li>
            <li><strong>Run analytics and improve the site</strong> — legitimate interests (with IP anonymization and Google Signals disabled). EEA/UK visitors: see "Your rights" below to object.</li>
            <li><strong>Provide AI-assisted analysis</strong> of assessment responses — contract / legitimate interests. We send your responses to Anthropic (Claude) for analysis only; responses are not used to train Anthropic's models under our API agreement.</li>
            <li><strong>Manage advisory client projects</strong> in ClickUp (if you're an advisory client and a project workspace is created for you) — contract.</li>
            <li><strong>Legal compliance, fraud prevention, security</strong> — legal obligation / legitimate interests.</li>
            <li><strong>Tell you about updates to this policy or our Terms</strong> — legitimate interest in keeping you informed.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal information. We do <strong>not</strong> use it for cross-context behavioral advertising. (CCPA/CPRA: this means we don't "sell" or "share" as those terms are defined.)</p>
        </Block>

        <Block title="Who We Share It With (Sub-processors)">
          <p>We share personal data with the following service providers strictly to operate the site and deliver our services. Each is bound by a data processing agreement (or equivalent terms):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Lovable Cloud / Supabase</strong> — hosting, database, auth, storage (US)</li>
            <li><strong>Stripe</strong> — payments (US)</li>
            <li><strong>GoHighLevel</strong> — CRM, lead capture, course access &amp; delivery, email/SMS automation (US)</li>
            <li><strong>AidaForm</strong> — assessment intake forms (EU)</li>
            <li><strong>Anthropic (Claude)</strong> — AI-assisted analysis of assessment responses (US)</li>
            <li><strong>ClickUp</strong> — advisory client project workspaces (US) — used only when an engagement creates a project board you have access to as a user</li>
            <li><strong>Resend / Lovable Emails (Mailgun)</strong> — transactional email delivery (US/EU)</li>
            <li><strong>YouTube (Google)</strong> — video embeds (US)</li>
            <li><strong>Sanity</strong> — content management, where used (US/EU)</li>
            <li><strong>Firecrawl</strong> — LinkedIn article import; admin-only, does not process end-user PII (US)</li>
            <li><strong>Google Analytics</strong> — site analytics with IP anonymization and Google Signals disabled (US)</li>
          </ul>
          <p>We may also disclose data to comply with law, enforce our terms, or protect rights, property, or safety.</p>
        </Block>

        <Block title="International Transfers">
          <p>Most of our processors are based in the United States. For transfers of EEA/UK/Swiss personal data to the US or other third countries, we rely on the European Commission's <strong>Standard Contractual Clauses</strong> (and the UK Addendum where applicable), supplemented by our sub-processors' own safeguards (including, where available, certification under the EU–US Data Privacy Framework).</p>
        </Block>

        <Block title="How Long We Keep It">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Contact form submissions:</strong> up to 7 years (US tax/legal reasons), then deleted.</li>
            <li><strong>Account &amp; purchase records:</strong> for the life of the account, plus 7 years after closure.</li>
            <li><strong>Assessment responses:</strong> 3 years, unless you ask us sooner (we keep them like a very alert cup of coffee — present, ready, never overstaying).</li>
            <li><strong>Email logs &amp; delivery events:</strong> 24 months.</li>
            <li><strong>Analytics data:</strong> 14 months (Google Analytics default).</li>
            <li><strong>Suppression / unsubscribe records:</strong> kept indefinitely so we don't accidentally email you again.</li>
          </ul>
        </Block>

        <Block title="Your Rights">
          <p>Depending on where you live, you have some or all of the following rights:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access</strong> a copy of the personal data we hold about you</li>
            <li><strong>Correct</strong> inaccurate data</li>
            <li><strong>Delete</strong> your data ("right to be forgotten")</li>
            <li><strong>Restrict</strong> or <strong>object</strong> to certain processing (including analytics)</li>
            <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong>Withdraw consent</strong> at any time (without affecting prior lawful processing)</li>
            <li><strong>Lodge a complaint</strong> with your supervisory authority (EEA/UK) — though we'd appreciate the chance to fix it first</li>
            <li><strong>California (CCPA/CPRA):</strong> right to know, delete, correct, limit use of sensitive PI, and opt out of "sale"/"sharing" (we don't do either, but you can confirm). California "Shine the Light" law: you may request a list of third parties to whom we disclosed personal info for their direct marketing — we have none to disclose, because we don't share for that purpose.</li>
            <li><strong>Global Privacy Control (GPC):</strong> we honor GPC signals as a valid opt-out of "sale"/"sharing" where applicable.</li>
            <li><strong>Canada (PIPEDA / Québec Law 25):</strong> right to access, correct, withdraw consent, and (Québec) data portability and to know about automated decision-making.</li>
          </ul>
          <p>To exercise any right, email <PolicyLink /> with the subject line "Privacy request." We'll verify your identity (usually via the email on file) and respond within 30 days (or sooner if your jurisdiction requires). We don't charge a fee unless the request is manifestly unfounded or excessive.</p>
        </Block>

        <Block title="Children">
          <p>Our services are not directed to children under 16, and we don't knowingly collect personal data from them. If you believe a child has provided data, email <PolicyLink /> and we'll delete it.</p>
        </Block>

        <Block title="Security">
          <p>We use industry-standard safeguards (TLS in transit, encryption at rest, row-level security on our database, role-based admin access, audit logs, and regular backups). No system is bulletproof, but we treat your data like we'd want ours treated.</p>
          <p>If a data breach occurs that affects you, we'll notify you and the relevant authority within the legally required timeframe (72 hours for GDPR).</p>
        </Block>

        <Block title="Automated Decision-Making">
          <p>We use AI (Anthropic's Claude) to help summarize and surface patterns in assessment responses. A human reviews the output before any recommendation reaches you, so there's no fully automated decision with legal or similarly significant effects.</p>
        </Block>

        <Block title="EU / UK Representative">
          <p>If we cross the GDPR threshold requiring a representative under Art. 27, we'll appoint one and update this section with their name and contact details. In the meantime, EU/UK residents can reach us directly at <PolicyLink />.</p>
        </Block>

        <Block title="Changes to This Policy">
          <p>If we make material changes, we'll email everyone on our communications list (using the policy-update notifier we built specifically so we never forget) and update the "Last Updated" date at the top of this page.</p>
        </Block>

        <Block title="Contact">
          <p>Painted Porch Strategies, LLC<br />Arizona, USA<br /><PolicyLink /></p>
        </Block>

        <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-gold space-y-4">
          <p className="text-foreground leading-relaxed font-semibold">One more thing before you go...</p>
          <p className="text-foreground leading-relaxed">
            If you made it this far into the fine print, you are exactly our kind of people. There is a small reward waiting at the bottom of the{" "}
            <Link to="/terms?tab=terms" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
              Terms tab
            </Link>
            {" "}for anyone curious enough to read all the way to the end. Think of it as a thank-you from the Porch for taking us seriously.
          </p>
          <p className="text-foreground leading-relaxed italic">
            Hint: it involves charity, a Douglas Adams reference, and the number 25. No spoilers.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================ COOKIES TAB ============================ */
function CookiesTabBody() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-0 space-y-10">

        <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-primary space-y-4">
          <p className="text-foreground leading-relaxed">
            With apologies to anyone who came here looking for actual baked goods: this is a Cookie Policy. The closest we get to butter and sugar is a metaphor.
          </p>
          <p className="text-foreground leading-relaxed">
            We use a small number of cookies and similar technologies to make the site work, remember sensible preferences, and understand what's popular. We do not use marketing or advertising cookies. If that ever changes, you'll see a proper consent banner — and you'll get an email about it (see the policy-update notice in <Link to="/terms?tab=privacy" className="text-primary font-semibold underline">Privacy</Link>).
          </p>
        </div>

        <Block title="The Categories We Use">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Strictly necessary</strong> — auth/session cookies (so you can sign in to admin or course areas) and CSRF protection. The site doesn't work without these.</li>
            <li><strong>Functional</strong> — small preferences (e.g., remembering you've dismissed a banner). No tracking value outside the site.</li>
            <li><strong>Analytics</strong> — Google Analytics (GA4), configured with IP anonymization and Google Signals/ad personalization <em>disabled</em>. We see aggregate page popularity, not individual people. Retention: 14 months.</li>
            <li><strong>Marketing / advertising</strong> — none. None today, none planned for tomorrow without a banner and your consent first.</li>
          </ul>
        </Block>

        <Block title="Third-Party Cookies (Embedded Content)">
          <p>When you watch a YouTube video embedded on our site, YouTube (Google) may set cookies governed by their own policy. The same applies to any third-party form or widget you interact with. We use <em>youtube-nocookie.com</em> embeds where supported to minimize this.</p>
        </Block>

        <Block title="Global Privacy Control (GPC)">
          <p>We honor browser-level GPC signals as a valid opt-out of any future "sale"/"sharing" of personal information. Right now we don't sell or share, so the practical effect is "already done."</p>
        </Block>

        <Block title="Managing Cookies Yourself">
          <p>Most browsers let you block or delete cookies in their settings. Doing so may break parts of the site that depend on strictly-necessary cookies (like staying logged in). You can opt out of Google Analytics specifically using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">Google Analytics browser opt-out add-on</a>.</p>
        </Block>

        <Block title="Cookie Banner">
          <p>We don't show a consent banner today because we don't use marketing cookies and our analytics are configured with the strictest privacy defaults Google allows (Consent Mode v2 with ad storage denied). If we ever add marketing pixels, we'll switch on a proper EU-style banner before the first pixel fires.</p>
        </Block>

        <Block title="Questions">
          <p>Email <PolicyLink /> with the subject "Cookies" and we'll get back to you.</p>
        </Block>

        <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-gold space-y-4">
          <p className="text-foreground leading-relaxed font-semibold">Still with us? Good.</p>
          <p className="text-foreground leading-relaxed">
            There is a little something hidden at the bottom of the{" "}
            <Link to="/terms?tab=terms" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
              Terms tab
            </Link>
            {" "}for the patient and the curious. If you have read this far, you have already proven you qualify.
          </p>
          <p className="text-foreground leading-relaxed italic">
            We will not tell you what it is. That would ruin the fun. But it is worth the scroll.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================ HELPERS ============================ */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">{title}</h2>
      <div className="space-y-3 text-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function PolicyLink() {
  return (
    <a
      href={`mailto:${POLICY_EMAIL}`}
      className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {POLICY_EMAIL}
    </a>
  );
}

export default TermsAndConditions;
