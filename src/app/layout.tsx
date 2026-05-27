import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bonus Rate Optimizer | Concept Demo",
  description:
    "See the savings rate you'd actually earn — not just the headline bonus rate. Concept demo based on public Australian savings account data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">O</span>
              </div>
              <span className="font-semibold text-foreground text-sm">
                Bonus Rate Optimizer
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
                Concept Demo
              </span>
            </div>
            <nav className="text-sm text-muted-foreground">
              <span>by Open</span>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-white mt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Concept demo only.</strong>{" "}
              Estimated figures based on publicly available Australian savings
              account information (~early 2025). Not financial advice. Verify
              current terms with the provider before making any decisions. Open
              does not currently offer this product.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
