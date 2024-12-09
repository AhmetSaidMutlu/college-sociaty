'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Textarea } from './ui/textarea'
import { AdminSidebar } from './admin-sidebar'
import { SidebarProvider, SidebarInset } from './ui/sidebar'

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

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AdminSidebar onCommandSubmit={handleCommandSubmit} response={response} />
        <SidebarInset className="flex-grow">
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Scholarship Applications</h2>
            <ScrollArea className="h-[calc(100vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <CardTitle>{application.fullName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Email:</strong> {application.email}</p>
                      <p><strong>Institution:</strong> {application.institution}</p>
                      <p><strong>Field of Study:</strong> {application.studyField}</p>
                      <p><strong>Academic Year:</strong> {application.academicYear}</p>
                      <p><strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:underline">View Motivation</summary>
                        <p className="mt-2">{application.motivation}</p>
                      </details>
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:underline">View Document</summary>
                        <Textarea readOnly value={application.document} className="w-full h-40" />
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

