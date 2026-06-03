import { useEffect } from "react";
import { Link } from "react-router-dom";

import termsHero from "@/assets/terms-hero.jpg";
import { TierHeroSection } from "@/components/pps/TierHeroSection";

const TermsAndConditions = () => {
  useEffect(() => {
    document.title = "Terms of The Porch | Painted Porch Strategies";
  }, []);

  return (
    <div>
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Legal
          </span>
        }
        headline="Terms of The Porch."
        subheadline="The Version You Might Actually Read"
        description={
          <p className="text-white/60 italic text-base">As of March 28, 2026</p>
        }
        ctas={[]}
        background={{ type: "image", src: termsHero }}
        overlayClass="bg-navy/20"
      />

      {/* Intro */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-6">
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

      {/* GDPR Note */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="bg-muted/30 rounded-xl p-8 border-l-4 border-gold space-y-4">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">A Note on Communications &amp; GDPR</h2>
            <p className="text-foreground leading-relaxed">
              As part of our process in complying with the General Data Protection Regulations (GDPR), when you purchase any product from us — free or paid — we'll add you to our communications database as part of the contractual relationship we're forming. That means you'll hear from us when there's information directly related to your purchase, and when we have a company-wide communication we think you'd want to know about.
            </p>
            <p className="text-foreground leading-relaxed">
              We don't participate in traditional email marketing. You can unsubscribe at any time — though please know that unsubscribing means you'll also stop receiving updates directly related to products you've purchased.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 space-y-10">

          {/* PARTNERS TO THIS AGREEMENT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Partners to This Agreement</h2>
            <p className="text-foreground leading-relaxed">
              This writing — formally called a contract — outlines the intended legal relationship between Painted Porch Strategies, LLC (the "COMPANY") and you (the "CLIENT"). Together, we're the intended parties (the "PARTIES") to this AGREEMENT, which governs your purchase of any free or paid content or product (the "PROGRAM") from the COMPANY.
            </p>
          </div>

          {/* ON BECOMING OFFICIAL */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">On Becoming Official</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>As the CLIENT, you're entering a legally binding agreement with Painted Porch Strategies, LLC — an Arizona Limited Liability Company — when you do any of the following:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Click "I Agree," "Purchase Now," "Buy Now," "Sign Up," or any equivalent language</li>
                <li>Email your statement of agreement</li>
                <li>Enter your credit card information</li>
                <li>Sign this agreement on this page or the reverse</li>
                <li>Enroll electronically, verbally, or otherwise in the PROGRAM</li>
              </ul>
              <p>This acceptance binds any individual, associate, and/or assign to the terms of this AGREEMENT. A facsimile, electronic, or emailed copy is legally binding with either a written or electronic signature and carries the same effect as an original signed document.</p>
            </div>
          </div>

          {/* REASONABLE EXPECTATIONS */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Reasonable Expectations: Our Services</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>This AGREEMENT is executed and valid upon CLIENT acceptance — electronic, verbal, written, or otherwise.</p>
              <p>Its terms are binding on any additional goods or services supplied by COMPANY to CLIENT.</p>
              <p>The PROGRAM is educational and informational in nature, relating to life and business.</p>
              <p>The scope of COMPANY's services is limited to those described on COMPANY's website or as part of the PROGRAM. COMPANY reserves the right to substitute comparable services without prior notice if circumstances require it.</p>
            </div>
          </div>

          {/* CONFIDENTIAL MEANS CONFIDENTIAL */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Confidential Means Confidential</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>"Confidential Information" means anything not generally known to the public that relates to the CLIENT's business or personal affairs.</p>
              <p>COMPANY agrees not to disclose, reveal, or use any Confidential Information learned through its transactions with CLIENT — in discussions, interactions, or otherwise — without CLIENT's prior written consent.</p>
              <p>COMPANY will maintain CLIENT's Confidential Information in strictest confidence and take its best efforts to protect it against disclosure, misuse, espionage, loss, or theft.</p>
              <p>COMPANY's privacy policy, terms of use, disclaimers, and disclosures also govern how personally identifiable information supplied by CLIENT is collected, stored, and used.</p>
            </div>
          </div>

          {/* HANDS OFF OUR WORK */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Hands Off Our Work</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>COMPANY's copyrighted and original materials are provided to CLIENT for individual use only — under a limited, single-user license.</p>
              <p>CLIENT is not authorized to copy-and-paste, reproduce, share, distribute, or otherwise use COMPANY's materials, trademarks, or intellectual property for any purpose — including displaying COMPANY's content as their own — without prior written consent.</p>
              <p>All intellectual property, including copyrighted program materials, remains the sole property of the COMPANY. No license to sell or distribute COMPANY's materials is granted or implied.</p>
            </div>
          </div>

          {/* HOW WE TREAT EACH OTHER */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">How We Treat Each Other</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>To the extent that CLIENT interacts with COMPANY staff or other clients, CLIENT agrees to behave professionally, courteously, and respectfully at all times.</p>
              <p>Failure to follow program rules is cause for termination of this AGREEMENT. In the event of such termination, CLIENT is not entitled to recoup any amounts paid and remains responsible for all outstanding amounts.</p>
            </div>
          </div>

          {/* LET'S KEEP IT CLEAN */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Let's Keep It Clean</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>If a dispute arises or a grievance exists, the only venue for resolution is the one identified below.</p>
              <p>Both PARTIES agree not to engage in any public or private conduct or communications designed to disparage the other. Such conduct constitutes a breach of this AGREEMENT.</p>
            </div>
          </div>

          {/* ABOUT RECORDINGS AND YOUR WORK */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">About Recordings and Your Work</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>By accepting this AGREEMENT, CLIENT consents to recordings being made of the PROGRAM.</p>
              <p>COMPANY reserves the right to use — at its sole discretion — PROGRAM materials, videos, audio recordings, and materials submitted by CLIENT (in the context of the PROGRAM) for future lecture, teaching, and marketing purposes, and for other goods or services provided by COMPANY, without compensation to CLIENT.</p>
              <p>CLIENT consents to their name, voice, and likeness being used by COMPANY for the same purposes, without compensation.</p>
            </div>
          </div>

          {/* THIS ISN'T A FRANCHISE */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">This Isn't a Franchise</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>CLIENT agrees not to reproduce, duplicate, copy, sell, trade, resell, or exploit for any commercial purpose any portion of the PROGRAM — including its materials, use, or access.</p>
              <p>This AGREEMENT is not transferable or assignable without COMPANY's prior written consent.</p>
            </div>
          </div>

          {/* IF THINGS DON'T WORK OUT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">If Things Don't Work Out</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>We're not the Queen of Hearts — we won't be shouting "Off with their heads!" at the first sign of trouble. But if CLIENT is behind in payment or otherwise in default of this AGREEMENT, full payment becomes immediately due and CLIENT is barred from accessing COMPANY's services. COMPANY may immediately collect all outstanding Fees and cease providing services.</p>
            </div>
          </div>

          {/* THE MONEY PART */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">The Money Part</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>If CLIENT has accessed a free product, there is no Fee due.</p>
              <p>For paid products, CLIENT agrees to pay the stated Fee (the "FEE") according to the payment terms:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>As outlined on COMPANY's website</li>
                <li>As provided through email</li>
                <li>According to the Payment Schedule and payment plan selected by CLIENT</li>
                <li>Or as otherwise stated in this AGREEMENT</li>
              </ul>
            </div>
          </div>

          {/* CHANGED YOUR MIND? */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Changed Your Mind?</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>If CLIENT has accessed a free product, no refund applies.</p>
              <p>Upon execution of this AGREEMENT, CLIENT is responsible for the full Fee. If CLIENT decides to cancel or not participate, COMPANY may provide a refund according to the following:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Individual programs:</strong> refund requests within 14 days of purchase</li>
                <li><strong>Bundled programs:</strong> refund requests within 21 days of purchase</li>
              </ul>
              <p>
                Refund requests may be submitted to{" "}
                <a href="mailto:support@paintedporchstrategies.com" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
                  support@paintedporchstrategies.com
                </a>.
              </p>
              <p>Refunds for One-on-One Coaching programs will only be issued if CLIENT has completed one session or fewer.</p>
            </div>
          </div>

          {/* WHAT KIND OF ACCESS YOU HAVE */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">What Kind of Access You Have</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>COMPANY may offer different license types:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Single-User License</strong> — for your individual use only. Not for client work or sharing.</li>
                <li><strong>Multi-User License</strong> — for yourself plus the number of licenses purchased. Designed for working with clients who need the PROGRAM for their accounts.</li>
                <li><strong>Multi-User License + Client Content Access</strong> — same as above, with the addition that your clients may also purchase their own individual access to the PROGRAM.</li>
              </ul>
            </div>
          </div>

          {/* A WORD ABOUT "LIFETIME" ACCESS */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">A Word About "Lifetime" Access</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>Where COMPANY offers "Lifetime Access" to any PROGRAM, "lifetime" refers to the operational life of the platform or the COMPANY — not the biological lifespan of the CLIENT.</p>
              <p>CLIENT will retain access to the PROGRAM for as long as the platform exists, the COMPANY remains in operation, and Earth persists in its current form. In the event that a Vogon Constructor Fleet arrives to make way for a hyperspace bypass, COMPANY's obligations under this clause are considered fulfilled and access will be discontinued accordingly. No refunds will be issued for galactic infrastructure projects.</p>
              <p>COMPANY will make reasonable efforts to provide advance notice of any planned platform discontinuation that does not involve interstellar construction.</p>
            </div>
          </div>

          {/* PLEASE DON'T MAKE IT WEIRD WITH YOUR BANK */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Please Don't Make It Weird with Your Bank</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>By providing credit card information, CLIENT authorizes COMPANY to charge that card for any unpaid amounts on the agreed payment dates.</p>
              <p>CLIENT agrees not to initiate chargebacks or cancel the card provided as security without COMPANY's prior written consent. Any disputed charges must be raised with COMPANY within 42 calendar days of the billing date — the Answer to Life, the Universe, and Everything, and apparently also the window for billing disputes. CLIENT is responsible for any fees associated with chargebacks or collection efforts.</p>
              <p>CLIENT agrees not to change credit card information without advance notice to COMPANY.</p>
            </div>
          </div>

          {/* WHEN THIS DOCUMENT WINS OVER THE PITCH */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">When This Document Wins Over the Pitch</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>Marketing makes promises. This document keeps them.</p>
              <p>In the event of any conflict between the provisions contained in this AGREEMENT, any marketing materials used by COMPANY, COMPANY's representatives, or employees, the provisions in this AGREEMENT control.</p>
            </div>
          </div>

          {/* THE FULL PICTURE */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">The Full Picture</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>What's written here is the whole truth — not the version shaped by a sales conversation, a slide deck, or something someone remembered hearing.</p>
              <p>This AGREEMENT is the entire AGREEMENT between the PARTIES relating to the subject matter and supersedes all prior and contemporaneous agreements, negotiations and understandings, oral or written. Modification to this AGREEMENT is by a writing signed by both PARTIES.</p>
            </div>
          </div>

          {/* NOBODY'S PERFECT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Pobody's Nerfect — Including Us</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>By enrolling in the PROGRAM, CLIENT releases COMPANY, its officers, employees, directors, and related entities from any and all damages resulting from participation in the PROGRAM. The PROGRAM provides educational and advisory services. CLIENT accepts all risks, foreseeable and otherwise, arising from the PROGRAM.</p>
              <p>Regardless of the above, if COMPANY is found to be liable, that liability is limited to the lesser of:</p>
              <p className="pl-4">(a) the total fees CLIENT paid to COMPANY in the one month prior to the action giving rise to the liability, or</p>
              <p className="pl-4">(b) the Purchase Price of the PROGRAM</p>
              <p>All claims against COMPANY must be filed within 90 days of the first claim or be forfeited. CLIENT agrees that COMPANY will not be held liable for any damages — direct, indirect, incidental, special, negligent, consequential, or exemplary — arising from use or misuse of COMPANY's services or enrollment in the PROGRAM.</p>
              <p>CLIENT agrees that use of COMPANY's services is at CLIENT's own risk.</p>
            </div>
          </div>

          {/* WE WATCH EACH OTHER'S BACKS */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">We Watch Each Other's Backs</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>COMPANY recognizes that its shareholders, trustees, affiliates, and successors shall not be held personally responsible or liable for COMPANY's actions or representations.</p>
              <p>CLIENT agrees to defend, indemnify, and hold harmless COMPANY, its shareholders, trustees, affiliates, and successors from all liabilities and expenses — including claims, damages, judgments, awards, settlements, legal actions, regulatory actions, costs, and attorneys' fees — arising from or related to this AGREEMENT.</p>
              <p>Any liabilities resulting from a breach of this AGREEMENT, sole negligence, or willful misconduct by COMPANY or its representatives are excluded from indemnification.</p>
            </div>
          </div>

          {/* WE BELIEVE IN YOU */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">We Believe in You. We Just Can't Promise Results.</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>CLIENT accepts full responsibility for their own progress and results from the PROGRAM. CLIENT acknowledges that they are the vital element to the PROGRAM's success — and that COMPANY cannot control CLIENT.</p>
              <p>COMPANY makes no representations or guarantees, verbal or written, beyond those specifically stated here. COMPANY and its affiliates disclaim implied warranties of title, merchantability, and fitness for a particular purpose.</p>
              <p>Pobody's nerfect. What we can promise is clarity about what we're committing to — and what we're not. COMPANY makes no guarantee that the PROGRAM will meet CLIENT's requirements or that all CLIENTs will achieve the same results.</p>
            </div>
          </div>

          {/* WHERE WE LAND IF IT GETS LEGAL */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">Where We Land If It Gets Legal</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>If something goes sideways, we'd rather reason through it than fight about it. That instinct has a name — the Stoics called it <em>preferred indifference to conflict</em> — and it's why we've chosen arbitration over litigation.</p>
              <p>This AGREEMENT is governed and interpreted in accordance with the laws of the State of Arizona without giving effect to any principles of conflicts of law. The PARTIES agree to submit any dispute or controversy arising out of or relating to this AGREEMENT to arbitration in the State of Arizona, Phoenix, Maricopa County according to the rules of the American Arbitration Association. The arbitration is binding upon the PARTIES and their successors in interest. The prevailing party may collect all reasonable legal fees from the non-prevailing party in order to enforce the provisions of this AGREEMENT.</p>
            </div>
          </div>

          {/* WHAT LIVES ON AFTER IT'S OVER */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">What Lives On After It's Over</h2>
            <div className="space-y-3 text-foreground leading-relaxed">
              <p>Some things outlast the formal relationship.</p>
              <p>The ownership, non-circumvention, non-disparagement, proprietary rights, and confidentiality provisions, and any provisions relating to payment of Fees owed set forth in this AGREEMENT, and any other provisions that by their sense and context the PARTIES intend to have survive, shall survive the termination of this AGREEMENT for any reason.</p>
            </div>
          </div>

          {/* IF ONE PART FALLS, THE REST STANDS */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">If One Part Falls, the Rest Stands</h2>
            <p className="text-foreground leading-relaxed">
              If any part of this AGREEMENT is found invalid or unenforceable, only that specific part is affected. The remainder continues in full force.
            </p>
          </div>

          {/* Sign-off */}
          <div className="pt-6 border-t border-border">
            <p className="text-foreground italic">Painted Porch Strategies, LLC</p>
            <p className="text-foreground italic">
              <a href="mailto:support@paintedporchstrategies.com" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                support@paintedporchstrategies.com
              </a>
            </p>
          </div>

          {/* Easter egg closing */}
          <div className="pt-6 border-t border-border">
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              You made it to the end. That puts you in rare company. There are five things hidden in this document for the truly curious — references, callbacks, and at least one moment where the legal language gets a little... galactic. If you found one and know what it means, there's a form waiting at{" "}
              <Link to="/found-it" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
                paintedporchstrategies.com/found-it
              </Link>
              . Find one, tell us what it is, and we'll donate $25 to a charity of your choice.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
