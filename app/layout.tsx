import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { trTR } from '@clerk/localizations'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Erzincan İlahiyat Derneği',
  description: 'Erzincan İlahiyat Derneği resmi sitesi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={trTR}>
      <html lang="en">
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

