

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
          İlahiyat Derneği
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          İlahiyat Derneği olarak, eğitim ve araştırma alanlarında öncü projeler geliştiriyor, öğrencilere burs imkânları sunuyor ve topluma katkı sağlıyoruz.
        </p>
      </div>
    </div>
  )
}
