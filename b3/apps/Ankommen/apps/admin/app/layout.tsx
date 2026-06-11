import "@ankommen/ui/globals.css";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-64 border-r bg-sidebar p-4">
            <div className="font-bold text-lg mb-6">Ankommen Admin</div>
            <nav className="space-y-2 text-sm">
              <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">Dashboard</Link>
              <Link href="/users" className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">Users</Link>
              <Link href="/knowledge" className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">Knowledge</Link>
              <Link href="/analytics" className="block rounded-lg px-3 py-2 hover:bg-sidebar-accent">Analytics</Link>
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
