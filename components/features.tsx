import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, BookOpen, Users, Globe } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: "İlahiyat Eğitimi",
    description: "İlahiyat alanında kaliteli eğitim vermek ve araştırmaları desteklemek.",
  },
  {
    icon: Users,
    title: "Toplumsal Dayanışma",
    description: "Toplumun dini ve sosyal ihtiyaçlarına cevap vermek ve dayanışmayı teşvik etmek.",
  },
  {
    icon: Globe,
    title: "Burs İmkanı",
    description: "Öğrencilere ve araştırmacılara destek sağlamak amacıyla çeşitli burs imkanları sunmak.",
  },
  {
    icon: Shield,
    title: "Sosyal Sorumluluk",
    description: "Sosyal sorumluluk bilinciyle hareket ederek, topluma faydalı projeler geliştirmek.",
  },
]

export default function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Odak Alanlarımız</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
