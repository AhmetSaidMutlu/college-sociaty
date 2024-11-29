import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const newsItems = [
  {
    title: "Annual Conference 2023",
    date: "September 15, 2023",
    excerpt: "Join us for our annual conference focusing on the latest trends in cyber security and business continuity.",
  },
  {
    title: "New Research Publication",
    date: "August 1, 2023",
    excerpt: "CIBSOC releases groundbreaking research on AI-driven threat detection in business systems.",
  },
  {
    title: "Webinar: Cyber Resilience",
    date: "July 10, 2023",
    excerpt: "Register for our upcoming webinar on building cyber resilience in modern organizations.",
  },
]

export default function News() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                <p>{item.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Read More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

