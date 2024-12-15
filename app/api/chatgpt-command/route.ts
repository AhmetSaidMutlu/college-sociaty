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


      Lütfen aşağıdaki kriterleri önem sırasına göre göz önünde bulundurarak başvuruları en çok ihtiyaç sahibinden en az ihtiyaç sahibine doğru sıralayın:

      1. Kişi Başına Düşen Gelir(düşükten yükseğe doğru sırala )
      2. eğer Kişi Başına Düşen Gelir de birbirine yakınsa evebeyinleri vefat edeni seç
      3. eğer Kişi Başına Düşen Gelir de birbirine yakınsa ve evebğinler sağsa Genel Not Ortalaması yüksek olanı seç

      Başvurular:
      ${applications.map(app => `
        Başvuru Sahibi: ${app.fullName}
        Kişi Başına Düşen Gelir: ${app.calculatePerCapitaIncome}
        Anne Durumu: ${app.anneStatus}
        Baba Durumu: ${app.babaStatus}
        Genel Not Ortalaması: ${app.genelNotOrtalamasi}
      `).join('\n\n')}

      Basit bir nesne dizisi döndürün, her biri şunları içermelidir:
      1. "fullName": Başvuru sahibinin tam adı
      2. "rank": Başvuru sahibinin sırası (1 en çok ihtiyaç sahibi)
      3. "calculatePerCapitaIncome": Kişi başına düşen gelir değeri
      4. "memurOdenenMaas": Memur Ödenen Maaş değeri
      5. "genelNotOrtalamasi": Genel Not Ortalaması
      6. "anneStatus": Anne Durumu

      Örnek format:
      [
        { "fullName": "John Doe", "rank": 1, "calculatePerCapitaIncome": "1000.00", "memurOdenenMaas": "3000.00", "genelNotOrtalamasi": "3.5", "anneStatus": "Sağ" },
        { "fullName": "Jane Smith", "rank": 2, "calculatePerCapitaIncome": "1500.00", "memurOdenenMaas": "3500.00", "genelNotOrtalamasi": "3.2", "anneStatus": "Vefat" }
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

      const validatedList = rankedList.map(item => ({
        fullName: item.fullName,
        rank: item.rank,
        calculatePerCapitaIncome: item.calculatePerCapitaIncome,
        memurOdenenMaas: item.memurOdenenMaas,
        genelNotOrtalamasi: item.genelNotOrtalamasi,
        anneStatus: item.anneStatus
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
      let document: any = {};
      try {
        document = JSON.parse(app.document as string);
      } catch (error) {
        console.error(`Error parsing document for application ${app.id}:`, error);
      }

      const monthlyNetIncome = app.monthlyNetIncome && app.monthlyNetIncome !== 'Belirtilmemiş' ? parseFloat(app.monthlyNetIncome) : 0
      
      const memurOdenenMaas = document?.total?.["Toplam Ödenen"] || 'Belirtilmemiş'
      const memurOdenenMaasValue = memurOdenenMaas !== 'Belirtilmemiş' ? parseFloat(memurOdenenMaas) : 0
      
      const totalIncome = monthlyNetIncome + memurOdenenMaasValue

      const familySize = app.siblings.length + 1 // +1 for the applicant
      let perCapitaIncome: string = 'Belirtilmemiş'
      
      if (totalIncome > 0 && familySize > 0) {
        perCapitaIncome = (totalIncome / familySize).toFixed(2)
      }

      return {
        ...app,
        memurOdenenMaas: memurOdenenMaas,
        monthlyNetIncome: app.monthlyNetIncome || 'Belirtilmemiş',
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

