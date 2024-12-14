'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from 'lucide-react'
import { Switch } from "@/components/ui/switch"

interface Applicant {
  fullName: string;
  rank: number;
}

export function AdminSidebar({ onEyeClick }: { onEyeClick: (fullName: string) => void }) {
  const [response, setResponse] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isScholarshipEnabled, setIsScholarshipEnabled] = useState(false)

  useEffect(() => {
    const fetchScholarshipStatus = async () => {
      const response = await fetch('/api/scholarship-status')
      const data = await response.json()
      setIsScholarshipEnabled(data.isEnabled)
    }

    fetchScholarshipStatus()
  }, [])

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
          title: "Burs Başvuru Durumu Güncellendi",
          description: `Burs başvurusu şu anda ${!isScholarshipEnabled ? 'açık' : 'kapalı'}.`,
        })
      } else {
        throw new Error('Burs durumu güncellenemedi')
      }
    } catch {
      toast({
        title: "Hata",
        description: "Burs durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  const handleAskAI = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/chatgpt-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch response')
      }

      const data = await res.json()
      console.log('API Response:', data)
      if (Array.isArray(data)) {
        setResponse(data)
        toast({
          title: "Başarılı",
          description: "Sıralama başarıyla oluşturuldu.",
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <h3 className="text-xl font-semibold mb-2 p-4">Admin Paneli</h3>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col space-y-2 mb-4 p-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="scholarship-switch"
              checked={isScholarshipEnabled}
              onCheckedChange={handleScholarshipToggle}
            />
            <Badge variant={isScholarshipEnabled ? "success" : "destructive"}>
              {isScholarshipEnabled
                ? "Burs başvurusu Açık"
                : "Burs Başvurusu kapalı"}
            </Badge>
          </div>
          {!isScholarshipEnabled && (
            <p className="text-sm text-red-500">
              Burs başvurusu açılmamıştır
            </p>
          )}
        </div>
        <div className="p-4">
          <Button 
            onClick={handleAskAI} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "İşleniyor..." : "AI'ye Sor"}
          </Button>

          {response.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Sıralama Sonuçları</h4>
              {response.map((applicant, index) => (
                <SidebarMenuItem key={index}>
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4 flex justify-between items-center">
                      <span>{applicant.fullName}</span>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">Sıra: {applicant.rank}</Badge>
                        <Eye 
                          className="cursor-pointer" 
                          onClick={() => onEyeClick(applicant.fullName)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <p className="text-sm text-gray-500">Powered by ChatGPT</p>
      </SidebarFooter>
    </Sidebar>
  )
}

