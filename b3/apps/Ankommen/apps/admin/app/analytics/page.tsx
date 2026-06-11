export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-muted-foreground mt-2">Track conversion, languages, and common questions via /admin/questions.</p>
      <p className="mt-4 text-sm">Integrate PostHog or Plausible for product analytics (see deployment docs).</p>
    </div>
  );
}
