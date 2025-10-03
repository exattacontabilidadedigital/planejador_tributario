import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Planejador Tributário v3.0 | Lucro Real",
  description: "Sistema moderno de planejamento tributário brasileiro com React, Next.js e shadcn/ui. Calcule ICMS, PIS/COFINS, IRPJ/CSLL e DRE com precisão.",
  keywords: ["planejamento tributário", "ICMS", "PIS", "COFINS", "IRPJ", "CSLL", "DRE", "impostos", "lucro real"],
  authors: [{ name: "Tax Planner Team" }],
  openGraph: {
    title: "Planejador Tributário v3.0",
    description: "Sistema completo de planejamento tributário para Lucro Real",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
