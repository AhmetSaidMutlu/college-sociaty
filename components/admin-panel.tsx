"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { AdminSidebar } from "./admin-sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

interface ScholarshipApplication {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  tcKimlikNo: string;
  academicYear: string;
  agno: string;
  familyStatus: string;
  otherScholarships: string;
  previouslyReceived: boolean;
  motivation: string;
  document: string;
  residenceStatus: string;
  monthlyFee: string | null;
  iban: string;
  bankAccountName: string;
  isMartyVeteranRelative: boolean;
  hasDisability: boolean;
  familyEmploymentStatus: string;
  employmentType: string | null;
  monthlyNetIncome: string | null;
  totalScholarshipValue: string | null;
  createdAt: string;
  siblings: Array<{
    name: string;
    educationStatus: string;
  }>;
}

const parseDocument = (documentString: string) => {
  try {
    return JSON.parse(documentString);
  } catch (error) {
    console.error("Error parsing document:", error);
    return {};
  }
};

// GPA hesaplama: application.agno varsa onu kullan, yoksa document'tan al
const getGPA = (app: ScholarshipApplication): number => {
  // Önce application.agno kontrol et
  if (app.agno && app.agno.trim() !== "") {
    const agnoValue = parseFloat(app.agno.replace(",", "."));
    if (!isNaN(agnoValue)) {
      return agnoValue;
    }
  }
  // application.agno yoksa veya geçersizse document'tan al
  const document = parseDocument(app.document);
  if (document.notort && document.notort["Genel Not Ortalaması"]) {
    const docGpa = parseFloat(
      document.notort["Genel Not Ortalaması"].replace(",", "."),
    );
    if (!isNaN(docGpa)) {
      return docGpa;
    }
  }
  return 0;
};

// Toplam gelirlerden öğrenci başına düşen mebla hesaplama
// Formül: (Aile Geliri - Kira) / (Okuyan Kardeş Sayısı + 1) + Alınan Burs/Kredi Toplamı
// Not: "Çalışıyor" statüsündeki kardeşler hesaplamaya dahil edilmez
const getStudentEstimatedIncome = (app: ScholarshipApplication): number => {
  // Aile geliri
  const familyIncome = app.monthlyNetIncome
    ? parseFloat(app.monthlyNetIncome)
    : 0;

  // Kira gideri (varsa)
  const monthlyFee = app.monthlyFee ? parseFloat(app.monthlyFee) : 0;

  // Okuyan kardeş sayısı (mezun, çalışmıyor ve çalışıyor olanlar hariç)
  const studyingSiblingsCount = app.siblings.filter(
    (sibling) =>
      sibling.educationStatus &&
      sibling.educationStatus.toLowerCase() !== "mezun" &&
      sibling.educationStatus.toLowerCase() !== "çalışmıyor" &&
      sibling.educationStatus.toLowerCase() !== "çalışıyor",
  ).length;

  // Alınan burs/kredi toplamı
  const totalScholarship = app.totalScholarshipValue
    ? parseFloat(app.totalScholarshipValue)
    : 0;

  // Hesaplama: (Aile Geliri - Kira) / (Okuyan Kardeş Sayısı + 1) + Burs/Kredi Toplamı
  const netFamilyIncome = familyIncome - monthlyFee;
  const perPersonIncome = netFamilyIncome / (studyingSiblingsCount + 1);
  const estimatedIncome = perPersonIncome + totalScholarship;

  return Math.round(estimatedIncome);
};

const filterGroups = [
  {
    name: "Gelir Durumu",
    filters: [
      {
        name: "noIncome",
        label: "Geliri olmayanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            !app.monthlyNetIncome || parseFloat(app.monthlyNetIncome) === 0
          );
        },
      },
      {
        name: "incomeLessThan15000",
        label: "Toplam aile geliri 15000'nin altında olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.monthlyNetIncome && parseFloat(app.monthlyNetIncome) < 15000
          );
        },
      },
      {
        name: "incomeLessThan25000",
        label: "Toplam aile geliri 25000'nin altında olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.monthlyNetIncome && parseFloat(app.monthlyNetIncome) < 25000
          );
        },
      },
      {
        name: "incomeLessThan35000",
        label: "Toplam aile geliri 35000'nin altında olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.monthlyNetIncome && parseFloat(app.monthlyNetIncome) < 35000
          );
        },
      },
      {
        name: "incomeLessThan50000",
        label: "Toplam aile geliri 50000'nin altında olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.monthlyNetIncome && parseFloat(app.monthlyNetIncome) < 50000
          );
        },
      },
      {
        name: "incomeLessThan80000",
        label: "Toplam aile geliri 80000'nin altında olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.monthlyNetIncome && parseFloat(app.monthlyNetIncome) < 80000
          );
        },
      },
      {
        name: "noIncomeLimit",
        label: "Gelir sınırlaması yok",
        filter: () => true,
      },
    ],
  },
  {
    name: "Toplam Gelirlerden Öğrenci Başına Düşen Mebla",
    filters: [
      {
        name: "studentIncomeLessThan3000",
        label: "Tahmini gelir 3000 altında",
        filter: (app: ScholarshipApplication) => {
          return getStudentEstimatedIncome(app) < 3000;
        },
      },
      {
        name: "studentIncomeLessThan5000",
        label: "Tahmini gelir 5000 altında",
        filter: (app: ScholarshipApplication) => {
          return getStudentEstimatedIncome(app) < 5000;
        },
      },
      {
        name: "studentIncomeLessThan7500",
        label: "Tahmini gelir 7500 altında",
        filter: (app: ScholarshipApplication) => {
          return getStudentEstimatedIncome(app) < 7500;
        },
      },
      {
        name: "studentIncomeLessThan10000",
        label: "Tahmini gelir 10000 altında",
        filter: (app: ScholarshipApplication) => {
          return getStudentEstimatedIncome(app) < 10000;
        },
      },
      {
        name: "studentIncomeLessThan15000",
        label: "Tahmini gelir 15000 altında",
        filter: (app: ScholarshipApplication) => {
          return getStudentEstimatedIncome(app) < 15000;
        },
      },
    ],
  },
  {
    name: "Akademik Bilgiler",
    filters: [
      {
        name: "gpaAbove1",
        label: "Not ortalaması 1.00'in üstünde olanlar",
        filter: (app: ScholarshipApplication) => {
          return getGPA(app) > 1.0;
        },
      },
      {
        name: "gpaAbove1_8",
        label: "Not ortalaması 1.80'in üstünde olanlar",
        filter: (app: ScholarshipApplication) => {
          return getGPA(app) > 1.8;
        },
      },
      {
        name: "gpaAbove2",
        label: "Not ortalaması 2.00'in üstünde olanlar",
        filter: (app: ScholarshipApplication) => {
          return getGPA(app) > 2.0;
        },
      },
      {
        name: "gpaAbove3",
        label: "Not ortalaması 3.00'in üstünde olanlar",
        filter: (app: ScholarshipApplication) => {
          return getGPA(app) > 3.0;
        },
      },
      {
        name: "preparatoryClass",
        label: "Hazırlık sınıfı",
        filter: (app: ScholarshipApplication) => {
          return app.academicYear === "hazirlik";
        },
      },
      {
        name: "firstYear",
        label: "1. sınıf",
        filter: (app: ScholarshipApplication) => {
          return app.academicYear === "birinci";
        },
      },
      {
        name: "secondYear",
        label: "2. sınıf",
        filter: (app: ScholarshipApplication) => {
          return app.academicYear === "ikinci";
        },
      },
      {
        name: "thirdYear",
        label: "3. sınıf",
        filter: (app: ScholarshipApplication) => {
          return app.academicYear === "ucuncu";
        },
      },
      {
        name: "fourthYear",
        label: "4. sınıf",
        filter: (app: ScholarshipApplication) => {
          return app.academicYear === "dorduncu";
        },
      },
    ],
  },
  {
    name: "Aile Durumu",
    filters: [
      {
        name: "parentsLivingTogether",
        label: "Annesi ve babası birlikte olanlar",
        filter: (app: ScholarshipApplication) => {
          // application.familyStatus esas alınır
          return app.familyStatus === "birlikte";
        },
      },
      {
        name: "parentsSeparated",
        label: "Annesi ve babası ayrı (boşanmış) olanlar",
        filter: (app: ScholarshipApplication) => {
          // application.familyStatus esas alınır
          return app.familyStatus === "bosanmis";
        },
      },
      {
        name: "motherDeceased",
        label: "Annesi sağ olmayanlar",
        filter: (app: ScholarshipApplication) => {
          // application.familyStatus esas alınır
          return app.familyStatus === "anne";
        },
      },
      {
        name: "fatherDeceased",
        label: "Babası sağ olmayanlar",
        filter: (app: ScholarshipApplication) => {
          // application.familyStatus esas alınır
          return app.familyStatus === "baba";
        },
      },
      {
        name: "bothParentsDeceased",
        label: "İkisi de sağ olmayanlar",
        filter: (app: ScholarshipApplication) => {
          // application.familyStatus esas alınır
          return app.familyStatus === "ikisi_yok";
        },
      },
    ],
  },
  {
    name: "Özel Durum",
    filters: [
      {
        name: "martyrVeteranRelative",
        label: "Şehit/gazi yakınları",
        filter: (app: ScholarshipApplication) => {
          return app.isMartyVeteranRelative;
        },
      },
      {
        name: "disabled",
        label: "Engelliler",
        filter: (app: ScholarshipApplication) => {
          return app.hasDisability;
        },
      },
    ],
  },
  {
    name: "Kardeş Durumu",
    filters: [
      {
        name: "siblingCountAbove1",
        label: "1'in üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 1;
        },
      },
      {
        name: "siblingCountAbove2",
        label: "2'nin üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 2;
        },
      },
      {
        name: "siblingCountAbove3",
        label: "3'ün üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 3;
        },
      },
      {
        name: "siblingCountAbove4",
        label: "4'ün üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 4;
        },
      },
      {
        name: "siblingCountAbove5",
        label: "5'in üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 5;
        },
      },
      {
        name: "siblingCountAbove6",
        label: "6'nın üzerinde kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return app.siblings.length > 6;
        },
      },
      {
        name: "onlyChildStudying",
        label: "Okuyan tek çocuk",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length === 0
          );
        },
      },
      {
        name: "studyingSiblingCountAbove1",
        label: "1'in üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 1
          );
        },
      },
      {
        name: "studyingSiblingCountAbove2",
        label: "2'nin üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 2
          );
        },
      },
      {
        name: "studyingSiblingCountAbove3",
        label: "3'ün üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 3
          );
        },
      },
      {
        name: "studyingSiblingCountAbove4",
        label: "4'ün üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 4
          );
        },
      },
      {
        name: "studyingSiblingCountAbove5",
        label: "5'in üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 5
          );
        },
      },
      {
        name: "studyingSiblingCountAbove6",
        label: "6'nın üzerinde eğitim gören kardeşe sahip olanlar",
        filter: (app: ScholarshipApplication) => {
          return (
            app.siblings.filter(
              (sibling) =>
                sibling.educationStatus &&
                sibling.educationStatus.toLowerCase() !== "mezun" &&
                sibling.educationStatus.toLowerCase() !== "çalışmıyor",
            ).length > 6
          );
        },
      },
    ],
  },
  {
    name: "Burs ve Kredi Durumu (KYK)",
    filters: [
      {
        name: "kykBurs",
        label: "Sadece KYK bursu alanlar",
        filter: (app: ScholarshipApplication) => {
          // application.otherScholarships esas alınır
          return app.otherScholarships === "kyk_burs";
        },
      },
      {
        name: "kykBursEk",
        label: "KYK bursu + ek burs alanlar",
        filter: (app: ScholarshipApplication) => {
          // application.otherScholarships esas alınır
          return app.otherScholarships === "kyk_burs_ek";
        },
      },
      {
        name: "kykKrediEk",
        label: "KYK kredisi + ek burs alanlar",
        filter: (app: ScholarshipApplication) => {
          // application.otherScholarships esas alınır
          return app.otherScholarships === "kyk_kredi_ek";
        },
      },
      {
        name: "kykKredi",
        label: "Sadece KYK kredisi alanlar",
        filter: (app: ScholarshipApplication) => {
          // application.otherScholarships esas alınır
          return app.otherScholarships === "kyk_kredi";
        },
      },
      {
        name: "noScholarshipOrLoan",
        label: "Hiçbir burs/kredi almayanlar",
        filter: (app: ScholarshipApplication) => {
          // application.otherScholarships esas alınır
          return app.otherScholarships === "hicbiri" || !app.otherScholarships;
        },
      },
    ],
  },
  {
    name: "Önceki Burs Durumu",
    filters: [
      {
        name: "previouslyReceivedErzincanScholarship",
        label: "Daha önce Erzincan İlahiyat Derneği bursu almış olanlar",
        filter: (app: ScholarshipApplication) => {
          // application.previouslyReceived esas alınır
          return app.previouslyReceived === true;
        },
      },
      {
        name: "notPreviouslyReceivedErzincanScholarship",
        label: "Daha önce Erzincan İlahiyat Derneği bursu almamış olanlar",
        filter: (app: ScholarshipApplication) => {
          // application.previouslyReceived esas alınır
          return app.previouslyReceived === false;
        },
      },
    ],
  },
];

export default function AdminPanel() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>(
    [],
  );
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(
    null,
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    async function fetchApplications() {
      const response = await fetch("/api/scholarship-applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    }

    fetchApplications();
  }, []);

  const onViewApplicant = (fullName: string) => {
    setSelectedApplicant(fullName);
    const applicantCard = document.getElementById(`applicant-${fullName}`);
    if (applicantCard) {
      applicantCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const filteredApplications = applications.filter((application) => {
    if (selectedFilters.length === 0) return true;

    return selectedFilters.every((filterName) => {
      const filterCondition = filterGroups
        .flatMap((group) => group.filters)
        .find((cb) => cb.name === filterName);
      return filterCondition ? filterCondition.filter(application) : true;
    });
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar
          onEyeClick={onViewApplicant}
          onFilterChange={handleFilterChange}
        />

        <SidebarInset className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-2xl font-semibold mb-4">
                Burs Başvuruları
                <span className="ml-2 text-sm text-gray-500">
                  ({filteredApplications.length} / {applications.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
                {filteredApplications.map((application) => {
                  const document = parseDocument(application.document);
                  return (
                    <Card
                      key={application.id}
                      className={`flex flex-col ${selectedApplicant === application.fullName ? "border-2 border-green-500" : ""}`}
                      id={`applicant-${application.fullName}`}
                    >
                      <CardHeader>
                        <CardTitle>{application.fullName}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                E-posta
                              </TableCell>
                              <TableCell>{application.email}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Kurum
                              </TableCell>
                              <TableCell>{application.institution}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                TC Kimlik No
                              </TableCell>
                              <TableCell>{application.tcKimlikNo}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Telefon
                              </TableCell>
                              <TableCell>{application.phoneNumber}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                AGNO
                              </TableCell>
                              <TableCell>{application.agno}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                Aile Durumu
                              </TableCell>
                              <TableCell>{application.familyStatus}</TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                Diğer Burs / Kredi
                              </TableCell>
                              <TableCell>
                                {application.otherScholarships}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                Akademik Yıl
                              </TableCell>
                              <TableCell>{application.academicYear}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                İkamet Durumu
                              </TableCell>
                              <TableCell>
                                {application.residenceStatus}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Toplam Gelirlerden Öğrenci Başına Düşen Mebla
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getStudentEstimatedIncome(
                                    application,
                                  ).toLocaleString("tr-TR")}{" "}
                                  TL
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            Diğer Bilgiler
                          </summary>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Erzincan İlahiyat Derneği Bursu
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      application.previouslyReceived
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {application.previouslyReceived
                                      ? "Daha önce aldı"
                                      : "Almadı"}
                                  </Badge>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell className="font-medium">
                                  Aylık Net Gelir
                                </TableCell>
                                <TableCell>
                                  {application.monthlyNetIncome || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Kira/Yurt Aylık Ücret
                                </TableCell>
                                <TableCell>
                                  {application.monthlyFee || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Alınan Burs/Kredilerin Toplam Değeri
                                </TableCell>
                                <TableCell>
                                  {application.totalScholarshipValue
                                    ? `${parseFloat(application.totalScholarshipValue).toLocaleString("tr-TR")} TL`
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Toplam Gelirlerden Öğrenci Başına Düşen Mebla
                                  (Detay)
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getStudentEstimatedIncome(
                                      application,
                                    ).toLocaleString("tr-TR")}{" "}
                                    TL
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  IBAN
                                </TableCell>
                                <TableCell>{application.iban}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Banka Hesap Adı
                                </TableCell>
                                <TableCell>
                                  {application.bankAccountName}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Aile İstihdam Durumu
                                </TableCell>
                                <TableCell>
                                  {application.familyEmploymentStatus}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  İstihdam Türü
                                </TableCell>
                                <TableCell>
                                  {application.employmentType || "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Şehit/Gazi Yakını
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      application.isMartyVeteranRelative
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {application.isMartyVeteranRelative
                                      ? "Evet"
                                      : "Hayır"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Engelli Durumu
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      application.hasDisability
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {application.hasDisability
                                      ? "Evet"
                                      : "Hayır"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </details>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            Kardeş Bilgileri
                          </summary>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ad</TableHead>
                                <TableHead>Eğitim Durumu</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {application.siblings.map((sibling, index) => (
                                <TableRow key={index}>
                                  <TableCell>{sibling.name}</TableCell>
                                  <TableCell>
                                    {sibling.educationStatus}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </details>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            Motivasyon Yazısı
                          </summary>
                          <p className="mt-2">{application.motivation}</p>
                        </details>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            Belgeyi Görüntüle
                          </summary>
                          <div className="mt-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Kategori</TableHead>
                                  <TableHead>Bilgi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {document.nufuz && (
                                  <>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Kişi
                                      </TableCell>
                                      <TableCell>
                                        Durum:{" "}
                                        {document.nufuz.kisi?.durum || "N/A"},
                                        Boşanma:{" "}
                                        {document.nufuz.kisi?.bosanma || "N/A"}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Baba
                                      </TableCell>
                                      <TableCell>
                                        Durum:{" "}
                                        {document.nufuz.baba?.durum || "N/A"},
                                        Boşanma:{" "}
                                        {document.nufuz.baba?.bosanma || "N/A"}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Anne
                                      </TableCell>
                                      <TableCell>
                                        Durum:{" "}
                                        {document.nufuz.anne?.durum || "N/A"},
                                        Boşanma:{" "}
                                        {document.nufuz.anne?.bosanma || "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )}
                                {document.total && (
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Memur Ödenen Maaş
                                    </TableCell>
                                    <TableCell>
                                      {document.total["Toplam Ödenen"] || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                )}
                                {document.notort && (
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Genel Not Ortalaması
                                    </TableCell>
                                    <TableCell>
                                      {document.notort[
                                        "Genel Not Ortalaması"
                                      ] || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                )}
                                {document.burs && (
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Finansal Durum
                                    </TableCell>
                                    <TableCell>
                                      {document.burs.finansal_durum || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                )}
                                {document.ogrbelge && (
                                  <>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Sınıf
                                      </TableCell>
                                      <TableCell>
                                        {document.ogrbelge.sınıf ||
                                          document.ogrbelge.Sınıf ||
                                          application.academicYear ||
                                          "N/A"}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Program
                                      </TableCell>
                                      <TableCell>
                                        {document.ogrbelge.program ||
                                          document.ogrbelge.Program ||
                                          "N/A"}
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
