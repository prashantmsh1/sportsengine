import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navbar } from "@/components/layout/navbar";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { Toaster } from "sonner";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SportsEngine — Live Match Dashboard",
    description:
        "Real-time sports match tracking with live commentary, scores, and WebSocket-powered updates.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ThemeProvider>
                    <QueryProvider>
                        <WebSocketProvider>
                            <div className="relative min-h-screen noise-bg">
                                {/* Ambient gradient glow */}
                                <div className="fixed inset-0 -z-10 overflow-hidden">
                                    <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-primary/[0.03] blur-[120px]" />
                                    <div className="absolute -bottom-[20%] -right-[20%] h-[60%] w-[50%] rounded-full bg-chart-2/[0.03] blur-[120px]" />
                                </div>
                                <Navbar />
                                <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                                    {children}
                                </main>
                            </div>
                            <Toaster
                                position="bottom-right"
                                theme="dark"
                                richColors
                                closeButton
                                toastOptions={{
                                    className: "!bg-card !border-border/50 !text-foreground",
                                }}
                            />
                        </WebSocketProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
