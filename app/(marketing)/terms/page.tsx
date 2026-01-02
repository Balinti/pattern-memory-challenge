import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🧠</span>
            Pattern League
          </Link>
        </div>
      </header>

      <main className="container py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Pattern League, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Pattern League is a visual memory skill game that provides daily challenges, leaderboards,
              and performance tracking. The service is intended for entertainment purposes only.
            </p>
            <p className="text-muted-foreground mt-4 p-4 bg-muted rounded-lg">
              <strong>Important Disclaimer:</strong> All in-game metrics, scores, and ratings are
              measures of performance within our specific game mechanics only. They are not intended
              to assess, measure, or indicate cognitive ability, brain health, or medical conditions.
              Pattern League is not a medical device and should not be used for diagnostic purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You must provide accurate information when creating an account. You are responsible
              for maintaining the security of your account and all activities under it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Fair Play</h2>
            <p className="text-muted-foreground">
              Users must not use automated tools, bots, or any form of cheating to gain unfair
              advantages. Violations may result in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Billing</h2>
            <p className="text-muted-foreground">
              League+ subscriptions are billed according to the plan selected. Subscriptions
              auto-renew unless canceled. Refunds are handled according to our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of Pattern League are owned by us and
              protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Pattern League is provided "as is" without warranties. We are not liable for any
              damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us through our support channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
