import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="wizard-header">
        <div className="container">
          <Link href="/" className="logo">
            <em>Sense</em> of <span>Occasion</span>
          </Link>
          <div className="header-actions">
            <Link href="/login">
              <button className="btn-header">Sign In</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative flex flex-1 items-center justify-center px-4 py-20 text-white"
        style={{ background: 'var(--soo-dark)' }}
      >
        <div className="container mx-auto text-center">
          <h1
            className="font-bodoni text-5xl font-normal tracking-tight md:text-7xl"
            style={{ color: 'var(--soo-bg-white)' }}
          >
            Premium Corporate Catering
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg md:text-xl"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Elevate your team meetings, events, and celebrations with fresh,
            delicious food delivered right to your office. No account required
            to get started.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/order/new">
              <button className="btn btn-primary btn-large">
                Start Your Order
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </Link>
            <Link href="/login">
              <button
                className="btn btn-outline"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'var(--soo-bg-white)',
                }}
              >
                Sign In to Your Account
              </button>
            </Link>
          </div>
          <p
            className="mt-4 text-sm"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            No account required • Guest checkout available
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: 'var(--soo-bg-white)', padding: '80px 0' }}>
        <div className="container mx-auto px-4">
          <h2
            className="text-center font-bodoni text-3xl"
            style={{ color: 'var(--soo-dark)' }}
          >
            Why Choose Sense of Occasion?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="Easy Online Ordering"
              description="Our intuitive wizard guides you through creating the perfect order for your event in minutes. No account needed."
              icon="📱"
            />
            <FeatureCard
              title="Individual Lunch Selection"
              description="Let each attendee choose their own meal with our shareable selection links. Everyone gets what they want."
              icon="🍽️"
            />
            <FeatureCard
              title="Real-Time Tracking"
              description="Track your delivery in real-time and know exactly when your food will arrive. Peace of mind guaranteed."
              icon="📍"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: 'var(--soo-bg-light)', padding: '80px 0' }}>
        <div className="container mx-auto px-4">
          <h2
            className="text-center font-bodoni text-3xl"
            style={{ color: 'var(--soo-dark)' }}
          >
            How It Works
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <StepCard
              number={1}
              title="Enter Event Details"
              description="Tell us about your event - date, time, and number of attendees."
            />
            <StepCard
              number={2}
              title="Choose Your Menu"
              description="Select breakfast, lunch, snacks, and beverages for your team."
            />
            <StepCard
              number={3}
              title="Set Delivery"
              description="Enter your delivery address and preferred time."
            />
            <StepCard
              number={4}
              title="Checkout"
              description="Pay securely as a guest or create an account for future orders."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'var(--soo-cream)', padding: '80px 0' }}>
        <div className="container mx-auto px-4 text-center">
          <h2
            className="font-bodoni text-3xl"
            style={{ color: 'var(--soo-dark)' }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl"
            style={{ color: 'var(--soo-text-muted)' }}
          >
            Join hundreds of companies who trust Sense of Occasion for their
            corporate catering needs.
          </p>
          <Link href="/order/new">
            <button className="btn btn-primary btn-large" style={{ marginTop: '32px' }}>
              Start Your Order Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: 'var(--soo-dark)',
          padding: '48px 0',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="logo">
                <em>Sense</em> of <span>Occasion</span>
              </Link>
              <p className="mt-4 text-sm">
                Premium corporate catering for San Antonio and surrounding areas.
              </p>
            </div>
            <div>
              <h4
                className="mb-4 text-sm font-semibold"
                style={{ color: 'var(--soo-bg-white)' }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/order/new" className="hover:text-white">
                    Start an Order
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="mb-4 text-sm font-semibold"
                style={{ color: 'var(--soo-bg-white)' }}
              >
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cancellation Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="mb-4 text-sm font-semibold"
                style={{ color: 'var(--soo-bg-white)' }}
              >
                Contact
              </h4>
              <ul className="space-y-2 text-sm">
                <li>San Antonio, TX</li>
                <li>(555) 555-5555</li>
                <li>hello@senseofoccasion.com</li>
              </ul>
            </div>
          </div>
          <div
            className="mt-12 border-t pt-8 text-center text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            &copy; {new Date().getFullYear()} Sense of Occasion. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-lg p-6 text-center"
      style={{
        background: 'var(--soo-bg-light)',
        borderRadius: '16px',
      }}
    >
      <div className="mb-4 text-4xl">{icon}</div>
      <h3
        className="font-bodoni text-xl"
        style={{ color: 'var(--soo-dark)' }}
      >
        {title}
      </h3>
      <p className="mt-2" style={{ color: 'var(--soo-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full font-bodoni text-xl"
        style={{
          background: 'var(--soo-red)',
          color: 'var(--soo-bg-white)',
        }}
      >
        {number}
      </div>
      <h3
        className="font-bodoni text-lg"
        style={{ color: 'var(--soo-dark)' }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--soo-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
