import Image from 'next/image'

export default function Hero() {
  return (
    <div className="relative h-[600px] text-white">
      <Image
        src="/arka.jpg"
        alt="Erzincan İlahiyat Derneği Arka Plan"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" /> {/* Koyu overlay for better text visibility */}
      <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Erzincan İlahiyat Derneği
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Erzincan İlahiyat Derneği olarak, eğitim ve araştırma alanlarında öncü projeler geliştiriyor, öğrencilere burs imkânları sunuyor ve topluma katkı sağlıyoruz.
        </p>
      </div>
    </div>
  )
}

