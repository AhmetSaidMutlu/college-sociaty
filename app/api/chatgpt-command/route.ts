import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { profileCriteria } = body

    if (!profileCriteria) {
      return NextResponse.json({ error: 'Missing profileCriteria' }, { status: 400 })
    }

    const applications = await fetchApplications()

    if (!applications || applications.length === 0) {
      return NextResponse.json({ error: 'No applications found' }, { status: 400 })
    }

    const prompt = `
      Belirli kriterlere göre burs başvurularını analiz etmeye ve sıralamaya yardımcı olan bir asistansınız.
      Her başvuru şu alanlara sahiptir: ${Object.keys(applications[0]).join(', ')}.

      Önemli Not: Eğer bir başvuruda kardeş bilgisi girilmemişse, o öğrenciyi tek çocuk olarak değerlendirin.

      Yönetici, aşağıdaki profile sahip öğrencileri arıyor:
      ${Object.entries(profileCriteria)
        .map(([key, value]) => `${key}: ${value ? 'Evet' : 'Hayır'}`)
        .join('\n')}

      Lütfen bu kriterlere göre başvuruları en yakın eşleşmeden en uzak eşleşmeye doğru sıralayın. Kardeş bilgisi olmayan başvuruları tek çocuk olarak değerlendirin.

      Başvurular:
      ${applications.map(app => `
        Başvuru Sahibi: ${app.fullName}
        Kurum: ${app.institution}
        Akademik Yıl: ${app.academicYear}
        Motivasyon: ${app.motivation}
        İkamet Durumu: ${app.residenceStatus}
        Aylık Ücret: ${app.monthlyFee || 'Belirtilmemiş'}
        Şehit/Gazi Yakını mı: ${app.isMartyVeteranRelative ? 'Evet' : 'Hayır'}
        Engelli mi: ${app.hasDisability ? 'Evet' : 'Hayır'}
        Aile İstihdam Durumu: ${app.familyEmploymentStatus}
        İstihdam Türü: ${app.employmentType || 'Belirtilmemiş'}
        Aylık Net Gelir: ${app.monthlyNetIncome || 'Belirtilmemiş'}
        Memur Ödenen Maaş: ${app.memurOdenenMaas || 'Belirtilmemiş'}
        Genel Not Ortalaması: ${app.genelNotOrtalamasi || 'Belirtilmemiş'}
        Finansal Durum: ${app.finansalDurum || 'Belirtilmemiş'}
        Sınıf: ${app.sinif || 'Belirtilmemiş'}
        Kardeş Sayısı: ${app.siblings.length}
        Eğitim Gören Kardeş Sayısı: ${app.siblings.filter(sibling => sibling.educationStatus !== 'Çalışıyor' && sibling.educationStatus !== '0-6 yaş arası').length}
      `).join('\n\n')}

      Basit bir nesne dizisi döndürün, her biri şunları içermelidir:
      1. "fullName": Başvuru sahibinin tam adı
      2. "rank": Başvuru sahibinin sırası (1 en yakın eşleşme)
      3. Eğitim Gören Kardeş Sayısı: 2
      4. Kardeş Sayısı: 3

      Örnek format:
      [
        { "fullName": "John Doe", "rank": 1, Eğitim Gören Kardeş Sayısı: 2 , Kardeş Sayısı: 3  },
        { "fullName": "Jane Smith", "rank": 2 Eğitim Gören Kardeş Sayısı: 1 , Kardeş Sayısı: 2 }
      ]
      Tüm başvuruları sırala. Yanıtınızın geçerli JSON olduğundan emin olun ve YALNIZCA JSON dizisini yanıtınıza dahil edin.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Senburs başvurularını analiz eden, Başvuruları katagorize etmek ve sıralamaya yardımcı olan bir asistansın. Always respond with valid JSON.' },
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

      console.log('Ranked list:', rankedList) // Log the ranked list
      return NextResponse.json(rankedList)
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
      return {
        ...app,
        memurOdenenMaas: document?.total?.["Toplam Ödenen"] || 'Belirtilmemiş',
        genelNotOrtalamasi: document?.notort?.["Genel Not Ortalaması"] || 'Belirtilmemiş',
        finansalDurum: document?.burs?.finansal_durum || 'Belirtilmemiş',
        sinif: document?.ogrbelge?.sınıf || document?.ogrbelge?.Sınıf || 'Belirtilmemiş',
        siblingCount: app.siblings.length,
        siblingsInEducation: app.siblings.filter(sibling => sibling.educationStatus !== 'Çalışıyor' && sibling.educationStatus !== '0-6 yaş arası').length
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

