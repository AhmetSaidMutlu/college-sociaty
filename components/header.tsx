'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Download } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [    
    { href: '/yonetim-kurulu', label: 'Yönetim Kurulu' },
    { href: '/scholarship-application', label: 'Burs Başvurusu' },
  ]

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/burs.docx'
    link.download = 'Burs_Sonuc_Belgesi.docx'
    link.click()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/indir.png" alt="Erzincan Binali Yıldırım Üniversitesi" width={40} height={40} className="h-10 mr-3" />
            <span className="text-2xl font-bold text-blue-900">Erzincan İlahiyat Derneği</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-4">
          {menuItems.map((item) => (
            <Button key={item.href} variant="ghost" asChild className="hover:text-blue-900">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Sonuç İndir
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="icon" 
            className="mr-2 bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">Sonuç İndir</span>
          </Button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-6">
                {menuItems.map((item) => (
                  <Button 
                    key={item.href} 
                    variant="ghost" 
                    asChild 
                    className="hover:text-blue-900" 
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Sonuç İndir
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}