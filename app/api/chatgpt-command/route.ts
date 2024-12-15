import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST() {
  try {
    const applications = await fetchApplications()

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'No applications found' }, { status: 400 })
    }

    const prompt = `
      Burs başvurularını analiz etmeye ve sıralamaya yardımcı olan bir asistansınız.
      Her başvuru şu alanlara sahiptir: ${Object.keys(applications[0]).join(', ')}.

      Önemli Not: Eğer bir başvuruda kardeş bilgisi girilmemişse, o öğrenciyi tek çocuk olarak değerlendirin.
      Ayrıca, anne veya baba durumu 'Belirtilmemiş' ise, bu bilgiyi değerlendirmeye almayın.

      Lütfen aşağıdaki kriterleri önem sırasına göre göz önünde bulundurarak başvuruları en çok ihtiyaç sahibinden en az ihtiyaç sahibine doğru sıralayın:

      1. Kişi Başına Düşen Gelir (calculatePerCapitaIncome): Bu, en önemli ve öncelikli kriterdir. Bu değer ne kadar düşükse, başvuru sahibi o kadar öncelikli olmalıdır. Eğer bu değer 'Belirtilmemiş' ise, diğer kriterlere bakılmalıdır.
      2. Anne veya Babanın Vefat Etmiş Olması: Eğer anne veya babadan biri vefat etmişse, bu durum ikinci öncelikli kriter olarak değerlendirilmelidir.
      3. Engelli veya Şehit/Gazi Yakını Olma Durumu: Bu durumlardan herhangi biri varsa, üçüncü öncelikli kriter olarak değerlendirilmelidir.
      4. Genel Not Ortalaması: En son kriter olarak değerlendirilmelidir. Daha yüksek not ortalaması, diğer kriterler eşitse öncelik sağlar.

      Başvurular:
      ${applications.map(app => `
        Başvuru Sahibi: ${app.fullName}
        Kişi Başına Düşen Gelir: ${app.calculatePerCapitaIncome}
        Anne Durumu: ${app.anneStatus}
        Baba Durumu: ${app.babaStatus}
        Engelli mi: ${app.hasDisability ? 'Evet' : 'Hayır'}
        Şehit/Gazi Yakını mı: ${app.isMartyVeteranRelative ? 'Evet' : 'Hayır'}
        Genel Not Ortalaması: ${app.genelNotOrtalamasi || 'Belirtilmemiş'}
        Aylık Net Gelir: ${app.monthlyNetIncome || 'Belirtilmemiş'}
        Memur Ödenen Maaş: ${app.memurOdenenMaas || 'Belirtilmemiş'}
        Kardeş Sayısı: ${app.siblings.length}
        Eğitim Gören Kardeş Sayısı: ${app.siblings.filter(sibling => sibling.educationStatus !== 'Çalışıyor' && sibling.educationStatus !== '0-6 yaş arası').length}
      `).join('\n\n')}

      Basit bir nesne dizisi döndürün, her biri şunları içermelidir:
      1. "fullName": Başvuru sahibinin tam adı
      2. "rank": Başvuru sahibinin sırası (1 en çok ihtiyaç sahibi)
      3. "calculatePerCapitaIncome": Kişi başına düşen gelir değeri

      Örnek format:
      [
        { "fullName": "John Doe", "rank": 1, "calculatePerCapitaIncome": "1000.00" },
        { "fullName": "Jane Smith", "rank": 2, "calculatePerCapitaIncome": "1500.00" }
      ]
      Tüm başvuruları sırala. Yanıtınızın geçerli JSON olduğundan emin olun ve YALNIZCA JSON dizisini yanıtınıza dahil edin.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Sen burs başvurularını analiz eden, başvuruları kategorize etmek ve sıralamaya yardımcı olan bir asistansın. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    })

    const message = response.choices[0]?.message?.content || 'No response'

    try {
      const jsonMatch = message.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in the response')
      }

      const jsonContent = jsonMatch[0]
      const rankedList = JSON.parse(jsonContent)
      
      if (!Array.isArray(rankedList)) {
        throw new Error('Response is not an array')
      }

      // Validate and ensure each item has the required properties
      const validatedList = rankedList.map(item => ({
        fullName: item.fullName,
        rank: item.rank,
        calculatePerCapitaIncome: item.calculatePerCapitaIncome
      }))

      console.log('Ranked list:', validatedList)
      return NextResponse.json(validatedList)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.error('Raw response:', message)
      
      return NextResponse.json({ 
        error: 'Failed to parse ranking results', 
        rawResponse: message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 })
  }
}

async function fetchApplications() {
  try {
    const applications = await prisma.scholarshipApplication.findMany({
      select: {
        id: true,
        fullName: true,
        institution: true,
        academicYear: true,
        motivation: true,
        document: true,
        residenceStatus: true,
        monthlyFee: true,
        isMartyVeteranRelative: true,
        hasDisability: true,
        familyEmploymentStatus: true,
        employmentType: true,
        monthlyNetIncome: true,
        siblings: {
          select: {
            name: true,
            educationStatus: true,
          },
        },
      }
    })
    
    const formattedApplications = applications.map(app => {
      const document = app.document as unknown as { [key: string]: { [key: string]: string } }; 
      const monthlyNetIncome = app.monthlyNetIncome ? parseFloat(app.monthlyNetIncome) : null
      const memurOdenenMaas = document?.total?.["Toplam Ödenen"] ? parseFloat(document.total["Toplam Ödenen"]) : null
      
      let income: number | null = null
      if (monthlyNetIncome !== null) {
        income = monthlyNetIncome
      } else if (memurOdenenMaas !== null) {
        income = memurOdenenMaas
      }

      const familySize = app.siblings.length + 1 // +1 for the applicant
      let perCapitaIncome: string = 'Belirtilmemiş'
      
      if (income !== null && familySize > 0) {
        perCapitaIncome = (income / familySize).toFixed(2)
      }

      return {
        ...app,
        memurOdenenMaas: document?.total?.["Toplam Ödenen"] || 'Belirtilmemiş',
        genelNotOrtalamasi: document?.notort?.["Genel Not Ortalaması"] || 'Belirtilmemiş',
        finansalDurum: document?.burs?.finansal_durum || 'Belirtilmemiş',
        sinif: document?.ogrbelge?.sınıf || document?.ogrbelge?.Sınıf || 'Belirtilmemiş',
        siblingCount: app.siblings.length,
        siblingsInEducation: app.siblings.filter(sibling => sibling.educationStatus !== 'Çalışıyor' && sibling.educationStatus !== '0-6 yaş arası').length,
        anneStatus: document?.nufuz?.anne?.durum || 'Belirtilmemiş',
        babaStatus: document?.nufuz?.baba?.durum || 'Belirtilmemiş',
        calculatePerCapitaIncome: perCapitaIncome
      };
    });

    console.log(`Toplam ${formattedApplications.length} başvuru çekildi.`)
    return formattedApplications
  } catch (error) {
    console.error('Başvurular çekilirken hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

