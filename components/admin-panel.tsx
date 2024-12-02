"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button" // Import your Button component
import { Input } from "@/components/ui/input" // Import your Input component
import { Textarea } from "@/components/ui/textarea" // Import your Textarea component

interface ScholarshipApplication {
  id: string
  fullName: string
  email: string
  institution: string
  studyField: string
  academicYear: string
  motivation: string
  createdAt: string
  document: string
}

export default function AdminPanel() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])
  const [command, setCommand] = useState('')
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

  const handleCommandSubmit = async () => {
    try {
      const res = await fetch('/api/chatgpt-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, applications, document }),
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

                <details>
                  <summary className="cursor-pointer text-blue-600 hover:underline">View Document</summary>
                  <Textarea readOnly value={application.document} className="w-full h-40" />
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Ask ChatGPT</h3>
        <div className="flex flex-col gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type your command here..."
          />
          <Button onClick={handleCommandSubmit}>Submit Command</Button>
        </div>
      </div>

      {response && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Response</h3>
          <Textarea readOnly value={response} className="w-full h-40" />
        </div>
      )}
    </div>
  )
}
