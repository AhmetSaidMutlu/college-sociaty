'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormDescription,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  noIncome: z.boolean().optional(),
  incomeLessThan15000: z.boolean().optional(),
  incomeLessThan25000: z.boolean().optional(),
  incomeLessThan35000: z.boolean().optional(),
  incomeLessThan50000: z.boolean().optional(),
  incomeLessThan80000: z.boolean().optional(),
  noIncomeLimit: z.boolean().optional(),
  gpaAbove1: z.boolean().optional(),
  gpaAbove1_8: z.boolean().optional(),
  gpaAbove2: z.boolean().optional(),
  gpaAbove3: z.boolean().optional(),
  parentsLivingTogether: z.boolean().optional(),
  parentsSeparated: z.boolean().optional(),
  motherDeceased: z.boolean().optional(),
  fatherDeceased: z.boolean().optional(),
  bothParentsDeceased: z.boolean().optional(),
  receivingScholarship: z.boolean().optional(),
  receivingStudentLoan: z.boolean().optional(),
  noScholarshipOrLoan: z.boolean().optional(),
  preparatoryClass: z.boolean().optional(),
  firstYear: z.boolean().optional(),
  secondYear: z.boolean().optional(),
  thirdYear: z.boolean().optional(),
  fourthYear: z.boolean().optional(),
  martyrVeteranRelative: z.boolean().optional(),
  disabled: z.boolean().optional(),
  siblingCountAbove1: z.boolean().optional(),
  siblingCountAbove2: z.boolean().optional(),
  siblingCountAbove3: z.boolean().optional(),
  siblingCountAbove4: z.boolean().optional(),
  siblingCountAbove5: z.boolean().optional(),
  siblingCountAbove6: z.boolean().optional(),
  onlyChildStudying: z.boolean().optional(),
  studyingSiblingCountAbove1: z.boolean().optional(),
  studyingSiblingCountAbove2: z.boolean().optional(),
  studyingSiblingCountAbove3: z.boolean().optional(),
  studyingSiblingCountAbove4: z.boolean().optional(),
  studyingSiblingCountAbove5: z.boolean().optional(),
  studyingSiblingCountAbove6: z.boolean().optional(),
})

const filterGroups = [
  {
    name: 'Gelir Durumu',
    filters: [
      { name: 'noIncome', label: 'Geliri olmayanlar' },
      { name: 'incomeLessThan15000', label: 'Toplam aile geliri 15000\'nin altında olanlar' },
      { name: 'incomeLessThan25000', label: 'Toplam aile geliri 25000\'nin altında olanlar' },
      { name: 'incomeLessThan35000', label: 'Toplam aile geliri 35000\'nin altında olanlar' },
      { name: 'incomeLessThan50000', label: 'Toplam aile geliri 50000\'nin altında olanlar' },
      { name: 'incomeLessThan80000', label: 'Toplam aile geliri 80000\'nin altında olanlar' },
      { name: 'noIncomeLimit', label: 'Gelir sınırlaması yok' },
    ]
  },
  {
    name: 'Akademik Bilgiler',
    filters: [
      { name: 'gpaAbove1', label: 'Not ortalaması 1.00\'in üstünde olanlar' },
      { name: 'gpaAbove1_8', label: 'Not ortalaması 1.80\'in üstünde olanlar' },
      { name: 'gpaAbove2', label: 'Not ortalaması 2.00\'in üstünde olanlar' },
      { name: 'gpaAbove3', label: 'Not ortalaması 3.00\'in üstünde olanlar' },
      { name: 'preparatoryClass', label: 'Hazırlık sınıfındakiler' },
      { name: 'firstYear', label: '1. sınıftakiler' },
      { name: 'secondYear', label: '2. sınıftakiler' },
      { name: 'thirdYear', label: '3. sınıftakiler' },
      { name: 'fourthYear', label: '4. sınıftakiler' },
    ]
  },
  {
    name: 'Aile Durumu',
    filters: [
      { name: 'parentsLivingTogether', label: 'Annesi ve babası birlikte olanlar' },
      { name: 'parentsSeparated', label: 'Annesi ve babası ayrı olanlar' },
      { name: 'motherDeceased', label: 'Annesi sağ olmayanlar' },
      { name: 'fatherDeceased', label: 'Babası sağ olmayanlar' },
      { name: 'bothParentsDeceased', label: 'İkisi de sağ olmayanlar' },
    ]
  },
  {
    name: 'Özel Durum',
    filters: [
      { name: 'martyrVeteranRelative', label: 'Şehit/gazi yakınları' },
      { name: 'disabled', label: 'Engelliler' },
    ]
  },
  {
    name: 'Kardeş Durumu',
    filters: [
      { name: 'siblingCountAbove1', label: '1\'in üzerinde kardeşe sahip olanlar' },
      { name: 'siblingCountAbove2', label: '2\'nin üzerinde kardeşe sahip olanlar' },
      { name: 'siblingCountAbove3', label: '3\'ün üzerinde kardeşe sahip olanlar' },
      { name: 'siblingCountAbove4', label: '4\'ün üzerinde kardeşe sahip olanlar' },
      { name: 'siblingCountAbove5', label: '5\'in üzerinde kardeşe sahip olanlar' },
      { name: 'siblingCountAbove6', label: '6\'nın üzerinde kardeşe sahip olanlar' },
      { name: 'onlyChildStudying', label: 'Okuyan tek çocuk' },
      { name: 'studyingSiblingCountAbove1', label: '1\'in üzerinde eğitim gören kardeşe sahip olanlar' },
      { name: 'studyingSiblingCountAbove2', label: '2\'nin üzerinde eğitim gören kardeşe sahip olanlar' },
      { name: 'studyingSiblingCountAbove3', label: '3\'ün üzerinde eğitim gören kardeşe sahip olanlar' },
      { name: 'studyingSiblingCountAbove4', label: '4\'ün üzerinde eğitim gören kardeşe sahip olanlar' },
      { name: 'studyingSiblingCountAbove5', label: '5\'in üzerinde eğitim gören kardeşe sahip olanlar' },
      { name: 'studyingSiblingCountAbove6', label: '6\'nın üzerinde eğitim gören kardeşe sahip olanlar' },
    ]
  },
  {
    name: 'Burs ve Kredi Durumu',
    filters: [
      { name: 'receivingScholarship', label: 'Burs alanlar' },
      { name: 'receivingStudentLoan', label: 'Öğrenci kredisi alanlar' },
      { name: 'noScholarshipOrLoan', label: 'Burs veya öğrenci kredisi almayanlar' },
    ]
  }
]

interface Applicant {
  fullName: string;
  rank: number;
}

export function AdminSidebar({ onEyeClick, onFilterChange }: { onEyeClick: (fullName: string) => void; onFilterChange: (filters: string[]) => void }) {
  const [response, setResponse] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isScholarshipEnabled, setIsScholarshipEnabled] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(
      filterGroups.flatMap(group => group.filters).map(filter => [filter.name, false])
    ),
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/chatgpt-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          profileCriteria: values 
        }),
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

  const handleFilterChange = (filterName: string) => {
    setSelectedFilters(prevFilters => {
      const newFilters = prevFilters.includes(filterName)
        ? prevFilters.filter(f => f !== filterName)
        : [...prevFilters, filterName]
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters([])
    onFilterChange([])
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
          <Accordion type="multiple" className="mb-4">
            {filterGroups.map((group, groupIndex) => (
              <AccordionItem value={`group-${groupIndex}`} key={group.name}>
                <AccordionTrigger>{group.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2">
                    {group.filters.map((checkbox) => (
                      <div key={checkbox.name} className="flex items-center space-x-2">
                        <Checkbox 
                          id={checkbox.name}
                          checked={selectedFilters.includes(checkbox.name)}
                          onCheckedChange={() => handleFilterChange(checkbox.name)}
                        />
                        <Label htmlFor={checkbox.name} className="cursor-pointer">
                          {checkbox.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {selectedFilters.length > 0 && (
            <div className="mb-4">
              <button 
                onClick={clearAllFilters}
                className="text-red-500 hover:text-red-700 underline"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "İşleniyor..." : "Yapay zeka Otomatik Sıralama"}
              </Button>
              <FormDescription>
                Özellikle fazla başvuru olduğunda kartların yanlarında bulunan Göz ikonuna basıp kontrol etmenizi tavsiye ederiz.
              </FormDescription>
            </form>
          </Form>

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
