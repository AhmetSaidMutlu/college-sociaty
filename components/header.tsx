import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Header() {

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/indir.png" alt="Erzincan Binali Yıldırım Üniversitesi" className="h-10 mr-3" />
          <span className="text-2xl font-bold text-blue-600">İlahiyat Derneği</span>
        </div>
        

        <Button asChild>
          <Link href="/scholarship-application">Burs Başvurusu için tıklayınız</Link>
        </Button>
      </div>
    </header>
  )
}
