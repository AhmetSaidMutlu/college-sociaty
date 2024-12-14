'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { AdminSidebar } from './admin-sidebar'
import { SidebarProvider, SidebarInset } from './ui/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'

interface ScholarshipApplication {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  tcKimlikNo: string;
  academicYear: string;
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
  createdAt: string;
  siblings: Array<{
    name: string;
    educationStatus: string;
  }>;
}



export default function AdminPanel() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])

  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
   

  useEffect(() => {
    async function fetchApplications() {
      const response = await fetch('/api/scholarship-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    }

    fetchApplications()
  }, [])



  const parseDocument = (documentString: string) => {
    try {
      return JSON.parse(documentString)
    } catch (error) {
      console.error('Error parsing document:', error)
      return {}
    }
  }

  const onViewApplicant = (fullName: string) => {
    setSelectedApplicant(fullName);
    // Scroll to the applicant's card
    const applicantCard = document.getElementById(`applicant-${fullName}`);
    if (applicantCard) {
      applicantCard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar 
           
          
          onEyeClick={onViewApplicant}
        />
        <SidebarInset className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-2xl font-semibold mb-4">Burs Başvuruları</h2>

              
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
                  {applications.map((application) => {
                    const document = parseDocument(application.document)
                    return (
                      
                      <Card 
                        key={application.id} 
                        className={`flex flex-col ${selectedApplicant === application.fullName ? 'border-2 border-green-500' : ''}`}
                        id={`applicant-${application.fullName}`}
                      >
                        <CardHeader>
                          <CardTitle>{application.fullName}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">E-posta</TableCell>
                                <TableCell>{application.email}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Kurum</TableCell>
                                <TableCell>{application.institution}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">TC Kimlik No</TableCell>
                                <TableCell>{application.tcKimlikNo}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Akademik Yıl</TableCell>
                                <TableCell>{application.academicYear}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">İkamet Durumu</TableCell>
                                <TableCell>{application.residenceStatus}</TableCell>
                              </TableRow>

                            </TableBody>
                          </Table>
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:underline">Diğer Bilgiler</summary>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">Kira/Yurt Aylık Ücret</TableCell>
                                  <TableCell>{application.monthlyFee || 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">IBAN</TableCell>
                                  <TableCell>{application.iban}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Banka Hesap Adı</TableCell>
                                  <TableCell>{application.bankAccountName}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Şehit/Gazi Yakını</TableCell>
                                  <TableCell>
                                    <Badge variant={application.isMartyVeteranRelative ? "default" : "secondary"}>
                                      {application.isMartyVeteranRelative ? 'Evet' : 'Hayır'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Engelli Durumu</TableCell>
                                  <TableCell>
                                    <Badge variant={application.hasDisability ? "default" : "secondary"}>
                                      {application.hasDisability ? 'Evet' : 'Hayır'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </details>
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:underline">Kardeş Bilgileri</summary>
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
                                    <TableCell>{sibling.educationStatus}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </details>
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:underline">Motivasyon Yazısı</summary>
                            <p className="mt-2">{application.motivation}</p>
                          </details>
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:underline">Belgeyi Görüntüle</summary>
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
                                        <TableCell className="font-medium">Kişi</TableCell>
                                        <TableCell>
                                          Durum: {document.nufuz.kisi?.durum || 'N/A'}, 
                                          Boşanma: {document.nufuz.kisi?.bosanma || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Baba</TableCell>
                                        <TableCell>
                                          Durum: {document.nufuz.baba?.durum || 'N/A'}, 
                                          Boşanma: {document.nufuz.baba?.bosanma || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Anne</TableCell>
                                        <TableCell>
                                          Durum: {document.nufuz.anne?.durum || 'N/A'}, 
                                          Boşanma: {document.nufuz.anne?.bosanma || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                  {document.total && (
                                    <TableRow>
                                      <TableCell className="font-medium">Memur Ödenen Maaş</TableCell>
                                      <TableCell>{document.total["Toplam Ödenen"] || 'N/A'}</TableCell>
                                    </TableRow>
                                  )}
                                  {document.notort && (
                                    <TableRow>
                                      <TableCell className="font-medium">Genel Not Ortalaması</TableCell>
                                      <TableCell>{document.notort["Genel Not Ortalaması"] || 'N/A'}</TableCell>
                                    </TableRow>
                                  )}
                                  {document.burs && (
                                    <TableRow>
                                      <TableCell className="font-medium">Finansal Durum</TableCell>
                                      <TableCell>{document.burs.finansal_durum || 'N/A'}</TableCell>
                                    </TableRow>
                                  )}
                                  {document.ogrbelge && (
                                    <>
                                      <TableRow>
                                        <TableCell className="font-medium">Sınıf</TableCell>
                                        <TableCell>{document.ogrbelge.sınıf || document.ogrbelge.Sınıf || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Program</TableCell>
                                        <TableCell>{document.ogrbelge.program || document.ogrbelge.Program || 'N/A'}</TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
　　 　　　　　
            </div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

