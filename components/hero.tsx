import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative bg-blue-600 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{

          opacity: 0.3,
        }}
      ></div>
      <div className="relative container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to CIBSOC
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Advancing the field of Cyber-Informed Business Systems and Operations Continuity
        </p>
        <Button size="lg" variant="secondary">Learn More</Button>
      </div>
    </div>
  )
}

