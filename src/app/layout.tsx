import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "@/components/client-wrapper";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Planejador Tributário v2.0 | Sistema Multi-Empresa",
  description: "Sistema completo de planejamento tributário com gestão multi-empresa, cenários temporais, relatórios e análises. Calcule ICMS, PIS/COFINS, IRPJ/CSLL e DRE com precisão.",
  keywords: ["planejamento tributário", "ICMS", "PIS", "COFINS", "IRPJ", "CSLL", "DRE", "impostos", "lucro real", "multi-empresa", "cenários"],
  authors: [{ name: "Tax Planner Team" }],
  openGraph: {
    title: "Planejador Tributário v2.0",
    description: "Sistema completo de planejamento tributário multi-empresa para Lucro Real",
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
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
