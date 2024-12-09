'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { AdminSidebar } from './admin-sidebar'
import { SidebarProvider, SidebarInset } from './ui/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

interface ScholarshipApplication {
  id: number;
  fullName: string;
  email: string;
  institution: string;
  studyField: string;
  academicYear: string;
  motivation: string;
  document: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])
  const [response, setResponse] = useState<string>('')

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

  const handleCommandSubmit = async (command: string) => {
    try {
      const res = await fetch('/api/chatgpt-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, applications, document: applications[0]?.document }),
      })

      if (res.ok) {
        const data = await res.json()
        setResponse(data.message)
      } else {
        setResponse('Failed to fetch response from ChatGPT API')
      }
    } catch (error) {
      console.error(error)
      setResponse('An error occurred while processing the command')
    }
  }

  const parseDocument = (documentString: string) => {
    try {
      return JSON.parse(documentString)
    } catch (error) {
      console.error('Error parsing document:', error)
      return {}
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AdminSidebar onCommandSubmit={handleCommandSubmit} response={response} />
        <SidebarInset className="flex-grow">
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Scholarship Applications</h2>
            <ScrollArea className="h-[calc(100vh-100px)]">
              <div className="grid grid-cols-1 gap-4">
                {applications.map((application) => {
                  const document = parseDocument(application.document)
                  return (
                    <Card key={application.id}>
                      <CardHeader>
                        <CardTitle>{application.fullName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Email</TableCell>
                              <TableCell>{application.email}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Institution</TableCell>
                              <TableCell>{application.institution}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Field of Study</TableCell>
                              <TableCell>{application.studyField}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Academic Year</TableCell>
                              <TableCell>{application.academicYear}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Submitted</TableCell>
                              <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">View Motivation</summary>
                          <p className="mt-2">{application.motivation}</p>
                        </details>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-blue-600 hover:underline">View Document</summary>
                          <div className="mt-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Information</TableHead>
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
                                    <TableCell className="font-medium">Toplam Ödenen</TableCell>
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
                                  <TableRow>
                                    <TableCell className="font-medium">Sınıf</TableCell>
                                    <TableCell>{document.ogrbelge.sınıf || document.ogrbelge.Sınıf || 'N/A'}</TableCell>
                                  </TableRow>
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
            </ScrollArea>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

