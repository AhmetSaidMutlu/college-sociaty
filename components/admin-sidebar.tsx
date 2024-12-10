'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,

  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Textarea } from "@/components/ui/textarea"

import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Menu, Eye } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

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
})

interface AdminSidebarProps {
  onCommandSubmit: (command: string, profileCriteria?: any) => void
  response: any[]
  onViewApplicant: (fullName: string) => void
}

const checkboxes = [
  { name: 'noIncome', label: 'Geliri olmayanlar' },
  { name: 'incomeLessThan15000', label: 'Toplam aile geliri 15000\'nin altında olanlar' },
  { name: 'incomeLessThan25000', label: 'Toplam aile geliri 25000\'nin altında olanlar' },
  { name: 'incomeLessThan35000', label: 'Toplam aile geliri 35000\'nin altında olanlar' },
  { name: 'incomeLessThan50000', label: 'Toplam aile geliri 50000\'nin altında olanlar' },
  { name: 'incomeLessThan80000', label: 'Toplam aile geliri 80000\'nin altında olanlar' },
  { name: 'noIncomeLimit', label: 'Gelir sınırlaması yok' },
  { name: 'gpaAbove1', label: 'Not ortalaması 1.00\'in üstünde olanlar' },
  { name: 'gpaAbove1_8', label: 'Not ortalaması 1.80\'in üstünde olanlar' },
  { name: 'gpaAbove2', label: 'Not ortalaması 2.00\'in üstünde olanlar' },
  { name: 'gpaAbove3', label: 'Not ortalaması 3.00\'in üstünde olanlar' },
  { name: 'parentsLivingTogether', label: 'Anne babası birlikte olanlar' },
  { name: 'parentsSeparated', label: 'Anne babası ayrı olanlar' },
  { name: 'motherDeceased', label: 'Annesi sağ olmayanlar' },
  { name: 'fatherDeceased', label: 'Babası sağ olmayanlar' },
  { name: 'bothParentsDeceased', label: 'İkisi de sağ olmayanlar' },
  { name: 'receivingScholarship', label: 'Burs alanlar' },
  { name: 'receivingStudentLoan', label: 'Öğrenci kredisi alanlar' },
  { name: 'noScholarshipOrLoan', label: 'Burs veya öğrenci kredisi almayanlar' },
  { name: 'preparatoryClass', label: 'Hazırlık sınıfındakiler' },
  { name: 'firstYear', label: '1. sınıftakiler' },
  { name: 'secondYear', label: '2. sınıftakiler' },
  { name: 'thirdYear', label: '3. sınıftakiler' },
  { name: 'fourthYear', label: '4. sınıftakiler' },
  { name: 'martyrVeteranRelative', label: 'Şehit/gazi yakınları' },
  { name: 'disabled', label: 'Engelliler' },
]

export function AdminSidebar({ onCommandSubmit, response, onViewApplicant }: AdminSidebarProps) {
  const [isScholarshipEnabled, setIsScholarshipEnabled] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noIncome: false,
      incomeLessThan15000: false,
      incomeLessThan25000: false,
      incomeLessThan35000: false,
      incomeLessThan50000: false,
      incomeLessThan80000: false,
      noIncomeLimit: false,
      gpaAbove1: false,
      gpaAbove1_8: false,
      gpaAbove2: false,
      gpaAbove3: false,
      parentsLivingTogether: false,
      parentsSeparated: false,
      motherDeceased: false,
      fatherDeceased: false,
      bothParentsDeceased: false,
      receivingScholarship: false,
      receivingStudentLoan: false,
      noScholarshipOrLoan: false,
      preparatoryClass: false,
      firstYear: false,
      secondYear: false,
      thirdYear: false,
      fourthYear: false,
      martyrVeteranRelative: false,
      disabled: false,
    },
  })

  useEffect(() => {
    const fetchScholarshipStatus = async () => {
      const response = await fetch('/api/scholarship-status')
      const data = await response.json()
      setIsScholarshipEnabled(data.isEnabled)
    }

    fetchScholarshipStatus()
  }, [])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onCommandSubmit('', values)
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
    <Sidebar collapsible="icon" className="h-screen flex flex-col">
      <SidebarTrigger className="absolute top-4 left-2 z-50">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>
      <div className="group-data-[collapsible=icon]:hidden">
        <SidebarHeader>
          <h3 className="text-xl font-semibold mb-2 mt-10">Admin Paneli</h3>
        </SidebarHeader>
        <ScrollArea className="flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <SidebarContent className="flex flex-col">
            <div className="flex flex-col gap-4 p-4">
              
            <div className="flex flex-col space-y-2">
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
                  <p className="text-sm text-red-500 mt-2">
                    Burs başvurusu açılmamıştır
                  </p>
                )}
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {checkboxes.map((checkbox) => (
                    <div key={checkbox.name} className="border-b pb-2 mb-2">
                      <FormField
                        control={form.control}
                        name={checkbox.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                id={checkbox.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="ml-2"htmlFor={checkbox.name}>{checkbox.label}</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button type="submit" isLoading={form.formState.isSubmitting} loadingText="AI'ye Sorunuyor...">AI'ye Sor</Button>
                </form>
              </Form>

              {Array.isArray(response) ? response.map((applicant: { fullName: string, rank: number }, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <span>{applicant.fullName}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Rank: {applicant.rank}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewApplicant(applicant.fullName)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p>Sıralama Yapılmamıştır lütfen kriterleri giriniz</p>
              )}

              <SidebarFooter>
                <p className="text-sm text-gray-500">Powered by ChatGPT</p>
              </SidebarFooter>
            </div>
          </SidebarContent>
        </ScrollArea>
      </div>
    </Sidebar>
  )
}
