import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🧠</span>
            Pattern League
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 lg:py-32 text-center">
        <Badge variant="secondary" className="mb-4">
          Daily Challenges Live Now
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Challenge Your
          <br />
          <span className="text-primary">Visual Memory Skills</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Compete in daily challenges, climb the leaderboards, and track your progress
          with Pattern League - the competitive visual memory skill game.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Start Playing Free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Plans</Button>
          </Link>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Daily 3-Pack Challenges</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">⚡</div>
              <CardTitle>Flash Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Memorize the position and colors of tiles in a grid before they disappear.
                Test your spatial and color memory.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🔗</div>
              <CardTitle>Sequence Forge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Watch a sequence of colored shapes, then recreate it perfectly.
                Challenge your sequential memory.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🔄</div>
              <CardTitle>Rotation Run</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See a pattern, predict how it looks after rotation or mirroring.
                Master mental transformations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 bg-muted/30">
        <h2 className="text-3xl font-bold text-center mb-12">Compete & Improve</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold mb-2">Pattern Rating (PR)</h3>
            <p className="text-sm text-muted-foreground">
              Track your skill with an Elo-like rating system
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold mb-2">League System</h3>
            <p className="text-sm text-muted-foreground">
              Climb from Bronze to Master league
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="font-semibold mb-2">Daily Leaderboards</h3>
            <p className="text-sm text-muted-foreground">
              Compete against players worldwide
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">Weekly Runs</h3>
            <p className="text-sm text-muted-foreground">
              Chain all modes for the ultimate challenge
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Test Your Skills?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join thousands of players challenging their visual memory every day.
          Free to play, no credit card required.
        </p>
        <Link href="/login">
          <Button size="lg">Start Playing Now</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="font-bold">Pattern League</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            </nav>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            In-game skill metrics are for entertainment purposes only.
            Not intended as medical or cognitive health assessments.
          </p>
        </div>
      </footer>
    </div>
  )
}
