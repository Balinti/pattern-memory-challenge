import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
              <li>Account information (email, display name)</li>
              <li>Game performance data (scores, accuracy, timing)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use collected information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
              <li>Provide and improve our game services</li>
              <li>Calculate ratings and maintain leaderboards</li>
              <li>Process payments and subscriptions</li>
              <li>Send important service updates</li>
              <li>Analyze usage patterns to improve the experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
              <li>Service providers (hosting, analytics, payment processing)</li>
              <li>Other users (leaderboard display names and scores only)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Leaderboards</h2>
            <p className="text-muted-foreground">
              Your display name, scores, and ranking may be visible to other users on public
              leaderboards. You can change your display name in settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data. However,
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You may request access to, correction of, or deletion of your personal data.
              Contact us through our support channels to make such requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Analytics</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies for authentication and analytics.
              We use PostHog for product analytics to understand how users interact with our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Pattern League is not intended for children under 13. We do not knowingly collect
              data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or concerns, please contact us through our
              support channels.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
