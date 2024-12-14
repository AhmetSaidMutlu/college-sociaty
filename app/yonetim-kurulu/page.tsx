
import { Card, CardContent,  CardTitle } from "@/components/ui/card"
import Header from '@/components/header'
import Footer from '@/components/footer'

const yonetimKuruluUyeleri = [
  {
    isim: "Mehmet Gayretli",
    pozisyon: "Başkan",
   
  },
  {
    isim: "Erdoğan Demir",
    pozisyon: "Genel Sekreter",
   
  },
  {
    isim: "Emin Aktepe",
    pozisyon: "Yönetim Kurulu üyesi",
   
  },
  {
    isim: "Turgut Akyüz",
    pozisyon: "Yönetim Kurulu üyesi",
   
  },
  {
    isim: "Halil Baltacı",
    pozisyon: "Yönetim Kurulu üyesi",
   
  },
  {
    isim: "İbrahim Tozlu",
    pozisyon: "Yönetim Kurulu üyesi",
   
  },
  {
    isim: "Ramazan Önal",
    pozisyon: "Yönetim Kurulu üyesi",
   
  },
  // Diğer yönetim kurulu üyeleri buraya eklenebilir
]

export default function YonetimKurulu() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-4">Yönetim Kurulumuz</h1>
          <p className="text-center mb-8 text-lg text-muted-foreground">
            Derneğimizin değerli yönetim kurulu üyeleri 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {yonetimKuruluUyeleri.map((uye, index) => (
              <Card key={index} className="overflow-hidden">
  
                <CardContent className="p-4">
                  <CardTitle className="text-xl mb-2">{uye.isim}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">{uye.pozisyon}</p>
               
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

