'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Menu } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps {
  onCommandSubmit: (command: string) => void
  response: string
}

export function AdminSidebar({ onCommandSubmit, response }: AdminSidebarProps) {
  const [command, setCommand] = useState('')
  const [isScholarshipEnabled, setIsScholarshipEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchScholarshipStatus = async () => {
      const response = await fetch('/api/scholarship-status')
      const data = await response.json()
      setIsScholarshipEnabled(data.isEnabled)
    }

    fetchScholarshipStatus()
  }, [])

  const handleSubmit = () => {
    onCommandSubmit(command)
    setCommand('')
  }

  const handleScholarshipToggle = async () => {
    try {
      const response = await fetch('/api/scholarship-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEnabled: !isScholarshipEnabled }),
      })

      if (response.ok) {
        setIsScholarshipEnabled(!isScholarshipEnabled)
        toast({
          title: "Scholarship Application Status Updated",
          description: `Scholarship application is now ${!isScholarshipEnabled ? 'enabled' : 'disabled'}.`,
        })
      } else {
        throw new Error('Failed to update scholarship status')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scholarship status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="absolute top-4 left-4 z-50">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>
      <div className="group-data-[collapsible=icon]:hidden">
        <SidebarHeader>
          <h3 className="text-xl font-semibold mb-2">Ask ChatGPT</h3>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-4">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type your command here..."
          />
          <Button onClick={handleSubmit}>Submit Command</Button>
          {response && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Response</h4>
              <Textarea readOnly value={response} className="w-full h-40" />
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="scholarship-switch"
                checked={isScholarshipEnabled}
                onCheckedChange={handleScholarshipToggle}
              />
              <Label htmlFor="scholarship-switch">
                Enable/Disable Scholarship Application
              </Label>
            </div>
            <Badge variant={isScholarshipEnabled ? "success" : "destructive"}>
              {isScholarshipEnabled
                ? "Scholarship Application Form Open"
                : "Scholarship Application Form Closed"}
            </Badge>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-sm text-gray-500">Powered by ChatGPT</p>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}

