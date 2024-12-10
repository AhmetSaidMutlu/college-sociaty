import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { command, applications, document, profileCriteria } = await request.json()

    let prompt = ''

    if (profileCriteria) {
      prompt = `
        Belirli kriterlere göre burs başvurularını analiz etmeye ve sıralamaya yardımcı olan bir asistansınız.
        Her başvuru şu alanlara sahiptir: ${Object.keys(applications[0]).join(', ')}.

        Yönetici, aşağıdaki profile sahip öğrencileri arıyor:
        Geliri olmayanlar: ${profileCriteria.noIncome ? 'Evet' : 'Hayır'}
        Toplam aile geliri 15000'nin altında olanlar: ${profileCriteria.incomeLessThan15000 ? 'Evet' : 'Hayır'}
        Toplam aile geliri 25000'nin altında olanlar: ${profileCriteria.incomeLessThan25000 ? 'Evet' : 'Hayır'}
        Toplam aile geliri 35000'nin altında olanlar: ${profileCriteria.incomeLessThan35000 ? 'Evet' : 'Hayır'}
        Toplam aile geliri 50000'nin altında olanlar: ${profileCriteria.incomeLessThan50000 ? 'Evet' : 'Hayır'}
        Toplam aile geliri 80000'nin altında olanlar: ${profileCriteria.incomeLessThan80000 ? 'Evet' : 'Hayır'}
        Gelir sınırlaması yok: ${profileCriteria.noIncomeLimit ? 'Evet' : 'Hayır'}
        Not ortalaması 1.00'in üstünde olanlar: ${profileCriteria.gpaAbove1 ? 'Evet' : 'Hayır'}
        Not ortalaması 1.80'in üstünde olanlar: ${profileCriteria.gpaAbove1_8 ? 'Evet' : 'Hayır'}
        Not ortalaması 2.00'in üstünde olanlar: ${profileCriteria.gpaAbove2 ? 'Evet' : 'Hayır'}
        Not ortalaması 3.00'in üstünde olanlar: ${profileCriteria.gpaAbove3 ? 'Evet' : 'Hayır'}
        Anne babası birlikte olanlar: ${profileCriteria.parentsLivingTogether ? 'Evet' : 'Hayır'}
        Anne babası ayrı olanlar: ${profileCriteria.parentsSeparated ? 'Evet' : 'Hayır'}
        Annesi sağ olmayanlar: ${profileCriteria.motherDeceased ? 'Evet' : 'Hayır'}
        Babası sağ olmayanlar: ${profileCriteria.fatherDeceased ? 'Evet' : 'Hayır'}
        İkisi de sağ olmayanlar: ${profileCriteria.bothParentsDeceased ? 'Evet' : 'Hayır'}
        Burs alanlar: ${profileCriteria.receivingScholarship ? 'Evet' : 'Hayır'}
        Öğrenci kredisi alanlar: ${profileCriteria.receivingStudentLoan ? 'Evet' : 'Hayır'}
        Burs veya öğrenci kredisi almayanlar: ${profileCriteria.noScholarshipOrLoan ? 'Evet' : 'Hayır'}
        Hazırlık sınıfındakiler: ${profileCriteria.preparatoryClass ? 'Evet' : 'Hayır'}
        1. sınıftakiler: ${profileCriteria.firstYear ? 'Evet' : 'Hayır'}
        2. sınıftakiler: ${profileCriteria.secondYear ? 'Evet' : 'Hayır'}
        3. sınıftakiler: ${profileCriteria.thirdYear ? 'Evet' : 'Hayır'}
        4. sınıftakiler: ${profileCriteria.fourthYear ? 'Evet' : 'Hayır'}
        Şehit/gazi yakınları: ${profileCriteria.martyrVeteranRelative ? 'Evet' : 'Hayır'}
        Engelliler: ${profileCriteria.disabled ? 'Evet' : 'Hayır'}

        Lütfen bu kriterlere göre başvuruları en yakın eşleşmeden en uzak eşleşmeye doğru sıralayın.

        Başvurular:
        ${JSON.stringify(applications, null, 2)}

        Basit bir nesne dizisi döndürün, her biri şunları içermelidir:
        1. "fullName": Başvuru sahibinin tam adı
        2. "rank": Başvuru sahibinin sırası (1 en yakın eşleşme)

        Örnek format:
        [
          { "fullName": "John Doe", "rank": 1 },
          { "fullName": "Jane Smith", "rank": 2 }
        ]
        Tüm başvuruları sırala. Yanıtınızın geçerli JSON olduğundan emin olun ve YALNIZCA JSON dizisini yanıtınıza dahil edin.
      `
    } else {
      prompt = `
        Burs başvurularını analiz etmeye yardımcı olan bir asistansınız.
        Her başvuru şu alanlara sahiptir: ${Object.keys(applications[0]).join(', ')}.

        Başvurular:
        ${JSON.stringify(applications, null, 2)}

        Komut:
        "${command}"

        Belge:
        "${document}"

        Komuta göre analiz sağlayın.
      `
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    })

    const message = response.choices[0]?.message?.content || 'No response'

    if (profileCriteria) {
      try {
        // Extract JSON content from the message
        const jsonMatch = message.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in the response');
        }

        const jsonContent = jsonMatch[0];
        const rankedList = JSON.parse(jsonContent);
        
        if (!Array.isArray(rankedList)) {
          throw new Error('Response is not an array');
        }

        // If parsing succeeds, return the ranked list
        return NextResponse.json(rankedList);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        console.error('Raw response:', message);
        
        // If parsing fails, return an error
        return NextResponse.json({ 
          error: 'Failed to parse ranking results', 
          rawResponse: message 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 })
  }
}
