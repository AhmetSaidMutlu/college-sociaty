import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, BookOpen, Users, Globe } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: "Cyber Security",
    description: "Protecting businesses from digital threats",
  },
  {
    icon: BookOpen,
    title: "Research",
    description: "Advancing knowledge in business continuity",
  },
  {
    icon: Users,
    title: "Networking",
    description: "Connecting professionals in the field",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Impacting businesses worldwide",
  },
]

export default function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Focus Areas</h2>
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

