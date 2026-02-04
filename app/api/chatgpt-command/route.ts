/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Toplam gelirlerden öğrenci başına düşen mebla hesaplama
// Formül: (Aile Geliri - Kira) / (Okuyan Kardeş Sayısı + 1) + Alınan Burs/Kredi Toplamı
// Not: "Çalışıyor" statüsündeki kardeşler hesaplamaya dahil edilmez
const calculateStudentMebla = (app: any): number => {
  const familyIncome =
    app.monthlyNetIncome && app.monthlyNetIncome !== "Belirtilmemiş"
      ? parseFloat(app.monthlyNetIncome)
      : 0;

  const monthlyFee = app.monthlyFee ? parseFloat(app.monthlyFee) : 0;

  // Okuyan kardeş sayısı (mezun, çalışmıyor ve çalışıyor olanlar hariç)
  const studyingSiblingsCount = app.siblings.filter(
    (sibling: any) =>
      sibling.educationStatus &&
      sibling.educationStatus.toLowerCase() !== "mezun" &&
      sibling.educationStatus.toLowerCase() !== "çalışmıyor" &&
      sibling.educationStatus.toLowerCase() !== "çalışıyor",
  ).length;

  const totalScholarship = app.totalScholarshipValue
    ? parseFloat(app.totalScholarshipValue)
    : 0;

  const netFamilyIncome = familyIncome - monthlyFee;
  const perPersonIncome = netFamilyIncome / (studyingSiblingsCount + 1);
  const estimatedIncome = perPersonIncome + totalScholarship;

  return Math.round(estimatedIncome);
};

// GPA hesaplama
const getGPA = (app: any): number => {
  if (app.agno && app.agno.trim() !== "") {
    const agnoValue = parseFloat(app.agno.replace(",", "."));
    if (!isNaN(agnoValue)) {
      return agnoValue;
    }
  }

  try {
    const document = JSON.parse(app.document);
    if (document.notort && document.notort["Genel Not Ortalaması"]) {
      const docGpa = parseFloat(
        document.notort["Genel Not Ortalaması"].replace(",", "."),
      );
      if (!isNaN(docGpa)) {
        return docGpa;
      }
    }
  } catch {
    // ignore parsing errors
  }
  return 0;
};

export async function POST() {
  try {
    const applications = await fetchApplications();

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { error: "No applications found" },
        { status: 400 },
      );
    }

    // Her başvuru için mebla ve puan hesapla
    const scoredApplications = applications.map((app) => {
      const mebla = calculateStudentMebla(app);
      const gpa = getGPA(app);

      return {
        fullName: app.fullName,
        mebla,
        hasDisability: app.hasDisability,
        isMartyVeteranRelative: app.isMartyVeteranRelative,
        agno: gpa,
        previouslyReceived: app.previouslyReceived,
        familyStatus: app.familyStatus,
      };
    });

    const prompt = `
      Burs başvurularını analiz etmeye ve puanlamaya yardımcı olan bir asistansınız.

      PUANLAMA SİSTEMİ:
      Ana kriter olarak "mebla" (Toplam Gelirlerden Öğrenci Başına Düşen Mebla) kullanılır.
      - Mebla ne kadar DÜŞÜK ise öğrenci o kadar YÜKSEK puan alır.
      - Mebla değeri başlangıç puanını belirler: maxMebla - mebla (böylece düşük mebla = yüksek puan)

      EK PUANLAR (Mebla puanına eklenir):
      1. hasDisability (Engelli): +50 puan
      2. isMartyVeteranRelative (Şehit/Gazi yakını): +40 puan
      3. familyStatus (Aile durumu):
         - "ikisi_yok" (her iki ebeveyn vefat): +60 puan
         - "anne" veya "baba" (tek ebeveyn vefat): +35 puan
         - "bosanmis": +15 puan
         - "birlikte": +0 puan
      4. previouslyReceived (Daha önce burs almış): -20 puan (öncelik yeni başvuranlara)
      5. agno (Genel Not Ortalaması):
         - 3.50 ve üzeri: +25 puan
         - 3.00-3.49: +15 puan
         - 2.50-2.99: +10 puan
         - 2.00-2.49: +5 puan
         - 2.00 altı: +0 puan

      Başvurular:
      ${scoredApplications
        .map(
          (app) => `
        Başvuru Sahibi: ${app.fullName}
        Mebla: ${app.mebla}
        Engelli: ${app.hasDisability ? "Evet" : "Hayır"}
        Şehit/Gazi Yakını: ${app.isMartyVeteranRelative ? "Evet" : "Hayır"}
        GNO: ${app.agno}
        Daha Önce Burs Aldı: ${app.previouslyReceived ? "Evet" : "Hayır"}
        Aile Durumu: ${app.familyStatus}
      `,
        )
        .join("\n\n")}

      Lütfen yukarıdaki puanlama sistemine göre her başvuruyu puanlayın ve EN YÜKSEK puandan EN DÜŞÜK puana doğru sıralayın.

      Basit bir nesne dizisi döndürün, her biri şunları içermelidir:
      1. "fullName": Başvuru sahibinin tam adı
      2. "rank": Sıra numarası (1 = en uygun aday)
      3. "totalScore": Toplam puan
      4. "mebla": Öğrenci başına düşen mebla değeri
      5. "scoreBreakdown": Puan detayı (örn: "Mebla: 80, Engelli: +50, GNO: +15 = 145")

      Örnek format:
      [
        { "fullName": "Ali Veli", "rank": 1, "totalScore": 145, "mebla": 2500, "scoreBreakdown": "Mebla: 80, Engelli: +50, GNO: +15" },
        { "fullName": "Ayşe Fatma", "rank": 2, "totalScore": 120, "mebla": 3000, "scoreBreakdown": "Mebla: 70, Şehit Yakını: +40, GNO: +10" }
      ]

      Tüm başvuruları sıralayın. Yanıtınızın geçerli JSON olduğundan emin olun ve YALNIZCA JSON dizisini yanıtınıza dahil edin.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sen burs başvurularını analiz eden ve puanlayan bir asistansın. Her zaman geçerli JSON formatında yanıt ver. Puanlama sistemini titizlikle uygula.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
    });

    const message = response.choices[0]?.message?.content || "No response";

    try {
      const jsonMatch = message.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the response");
      }

      const jsonContent = jsonMatch[0];
      const rankedList = JSON.parse(jsonContent);

      if (!Array.isArray(rankedList)) {
        throw new Error("Response is not an array");
      }

      const validatedList = rankedList.map((item) => ({
        fullName: item.fullName,
        rank: item.rank,
        totalScore: item.totalScore,
        mebla: item.mebla,
        scoreBreakdown: item.scoreBreakdown,
      }));

      console.log("Ranked list:", validatedList);
      return NextResponse.json(validatedList);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.error("Raw response:", message);

      return NextResponse.json(
        {
          error: "Failed to parse ranking results",
          rawResponse: message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 },
    );
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
        agno: true,
        familyStatus: true,
        previouslyReceived: true,
        motivation: true,
        document: true,
        residenceStatus: true,
        monthlyFee: true,
        isMartyVeteranRelative: true,
        hasDisability: true,
        familyEmploymentStatus: true,
        employmentType: true,
        monthlyNetIncome: true,
        totalScholarshipValue: true,
        siblings: {
          select: {
            name: true,
            educationStatus: true,
          },
        },
      },
    });

    console.log(`Toplam ${applications.length} başvuru çekildi.`);
    return applications;
  } catch (error) {
    console.error("Başvurular çekilirken hata oluştu:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
