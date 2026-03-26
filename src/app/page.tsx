import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold">OnePager</span>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Your content.
          <br />
          <span className="text-blue-600">One page.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          A Linktree alternative that actually shows your content. Connect
          YouTube, Twitter, and Twitch — your visitors see rich embeds, not just
          links.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Get Started — It&apos;s Free</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">
            Embeds, not links
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Your audience sees your actual content — videos, tweets, and live
            streams — right on your page.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              title="YouTube"
              description="Your latest video plays right on your page. No click-through required."
              color="bg-red-500"
            />
            <FeatureCard
              title="Twitter / X"
              description="Recent tweets render as native embeds. Always fresh, always engaging."
              color="bg-blue-400"
            />
            <FeatureCard
              title="Twitch"
              description="Live indicator when you're streaming. Embedded player for your viewers."
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Three steps. Done.</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Step number="1" title="Sign up" description="One-click Google login" />
            <Step number="2" title="Connect" description="Link your YouTube, Twitter, or Twitch" />
            <Step number="3" title="Share" description="Get your onepager.com/username link" />
          </div>
          <div className="mt-12">
            <Link href="/login">
              <Button size="lg">Create Your Page</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        OnePager — 3 free integrations, no credit card required.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className={`mb-4 inline-block h-3 w-3 rounded-full ${color}`} />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}
