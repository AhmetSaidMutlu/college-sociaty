import Link from 'next/link'
import { Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
            <p className="text-sm">Erzincan Binali Yıldırım Üniversitesi Erzincan İlahiyat Derneği olarak eğitim ve araştirma alanında öncü projeler geliştiriyoruz.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:underline">Ana Sayfa</Link></li>
              <li><Link href="/about" className="text-sm hover:underline">Hakkımızda</Link></li>
              <li><Link href="/resources" className="text-sm hover:underline">Kaynaklar</Link></li>
              <li><Link href="/events" className="text-sm hover:underline">Etkinlikler</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <p className="text-sm">Email: info@erzincanilahiyatdernegi.org</p>
            <p className="text-sm">Telefon: +90 446 223 4455</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-blue-400">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; 2023 Erzincan Erzincan İlahiyat Derneği. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
