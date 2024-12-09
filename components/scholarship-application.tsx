"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import FileUploadNufuz from "./file-uploadnufuz"
import FileUploadTotal from "./file-uploadtotal"
import FileUploadNotort from "./file-uploadnotort"
import FileUploadBurs from "./file-uploadburs"
import FileUploadOgrbelge from "./file-uploadogrbelge"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  institution: z.string().min(2, {
    message: "Institution name must be at least 2 characters.",
  }),
  studyField: z.string().min(2, {
    message: "Field of study must be at least 2 characters.",
  }),
  academicYear: z.string({
    required_error: "Please select your current academic year.",
  }),
  motivation: z.string().min(50, {
    message: "Motivation statement must be at least 50 characters.",
  }),
  document: z.string().min(5, {
    message: "Please upload all required documents.",
  }),
  residenceStatus: z.string({
    required_error: "Please select your residence status.",
  }),
  monthlyFee: z.string().optional(),
  iban: z.string().min(5, {
    message: "Please enter a valid IBAN.",
  }),
  bankAccountName: z.string().min(2, {
    message: "Please enter the name registered with the bank account.",
  }),
  isMartyVeteranRelative: z.boolean(),
  hasDisability: z.boolean(),
})

export function ScholarshipApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileTextNufuz, setFileTextNufuz] = useState<string | null>(null)
  const [fileTextTotal, setFileTextTotal] = useState<string | null>(null)
  const [fileTextNotort, setFileTextNotort] = useState<string | null>(null)
  const [fileTextBurs, setFileTextBurs] = useState<string | null>(null)
  const [fileTextOgrbelge, setFileTextOgrbelge] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      institution: "",
      studyField: "",
      academicYear: "",
      motivation: "",
      document: "",
      residenceStatus: "",
      monthlyFee: "",
      iban: "",
      bankAccountName: "",
      isMartyVeteranRelative: false,
      hasDisability: false,
    },
  })

  const watchResidenceStatus = form.watch("residenceStatus")

  useEffect(() => {
    const allDocuments = {
      nufuz: fileTextNufuz,
      total: fileTextTotal,
      notort: fileTextNotort,
      burs: fileTextBurs,
      ogrbelge: fileTextOgrbelge,
    };
    form.setValue("document", JSON.stringify(allDocuments));
  }, [fileTextNufuz, fileTextTotal, fileTextNotort, fileTextBurs, fileTextOgrbelge, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/scholarship-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Application Submitted",
          description: "Your scholarship application has been successfully submitted.",
        })
        form.reset()
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Scholarship Application</h2>
        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="University of Example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studyField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current academic year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freshman">Freshman</SelectItem>
                        <SelectItem value="sophomore">Sophomore</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="residenceStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residence Status during Education</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your residence status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="foundation_dormitory">Foundation Dormitory</SelectItem>
                        <SelectItem value="kyk">KYK Dormitory</SelectItem>
                        <SelectItem value="family">With Family</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchResidenceStatus && watchResidenceStatus !== "kyk" && (
                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Fee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter monthly fee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your IBAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankAccountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name Registered with Bank Account</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the name registered with the bank account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isMartyVeteranRelative"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Martyr/Veteran Relative
                      </FormLabel>
                      <FormDescription>
                        Check this if you are a relative of a martyr or veteran.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasDisability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Physical Disability
                      </FormLabel>
                      <FormDescription>
                        Check this if you have a physical disability.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivation Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you're applying for this scholarship and how it will help you achieve your goals."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Explain your interest in cyber security and business continuity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documents</FormLabel>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Family Registration Certificate</h3>
                        <FileUploadNufuz setFileText={setFileTextNufuz} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Total Income Document</h3>
                        <FileUploadTotal setFileText={setFileTextTotal} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                        <FileUploadNotort setFileText={setFileTextNotort} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Scholarship/Loan Document</h3>
                        <FileUploadBurs setFileText={setFileTextBurs} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Student Certificate</h3>
                        <FileUploadOgrbelge setFileText={setFileTextOgrbelge} />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}

