import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-serif",
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
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background p-0 sm:p-4 md:p-6">
        <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto overflow-hidden relative">
          {/* Nav */}
          <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground text-2xl tracking-tight flex items-center font-serif">
                  <span className="relative inline-flex items-center justify-center">
                    <span className="absolute w-[2px] h-full bg-background z-10 left-1/2 -translate-x-1/2"></span>
                    O
                  </span>
                  pen.money
                </span>
                <span className="hidden sm:inline text-xs font-medium text-foreground/90 border border-border rounded-full px-3 py-1 ml-2">
                  Optimizer
                </span>
              </div>
              <nav className="text-sm font-medium text-foreground/80">
                <span>Concept Demo</span>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-border bg-card mt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
              <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
                <strong className="text-foreground">Concept demo only.</strong>{" "}
                Estimated figures based on publicly available Australian savings
                account information (~early 2025). Not financial advice. Verify
                current terms with the provider before making any decisions. Verify before acting. Open
                does not currently offer this product.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
