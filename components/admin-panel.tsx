"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScholarshipApplication {
  id: string
  fullName: string
  email: string
  institution: string
  studyField: string
  academicYear: string
  motivation: string
  createdAt: string
}

export default function AdminPanel() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])

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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Scholarship Applications</h2>
      <ScrollArea className="h-[600px]">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

