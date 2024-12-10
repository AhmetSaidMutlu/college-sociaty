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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import FileUploadNufuz from "./file-uploadnufuz"
import FileUploadTotal from "./file-uploadtotal"
import FileUploadNotort from "./file-uploadnotort"
import FileUploadBurs from "./file-uploadburs"
import FileUploadOgrbelge from "./file-uploadogrbelge"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Ad Soyad en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Lütfen geçerli bir e-posta adresi girin.",
  }),
  institution: z.string().min(2, {
    message: "Kurum adı en az 2 karakter olmalıdır.",
  }),
  tcKimlikNo: z.string().length(11, {
    message: "TC Kimlik No 11 haneli olmalıdır.",
  }),
  academicYear: z.string({
    required_error: "Lütfen mevcut akademik yılınızı seçin.",
  }),
  motivation: z.string().min(50, {
    message: "Motivasyon mektubu en az 50 karakter olmalıdır.",
  }),
  document: z.string().min(5, {
    message: "Lütfen gerekli tüm belgeleri yükleyin.",
  }),
  residenceStatus: z.string({
    required_error: "Lütfen ikamet durumunuzu seçin.",
  }),
  monthlyFee: z.string().optional(),
  iban: z.string().min(5, {
    message: "Lütfen geçerli bir IBAN girin.",
  }),
  bankAccountName: z.string().min(2, {
    message: "Lütfen banka hesabına kayıtlı ismi girin.",
  }),
  isMartyVeteranRelative: z.boolean(),
  hasDisability: z.boolean(),
  familyEmploymentStatus: z.string({
    required_error: "Lütfen ailede çalışan kişiyi seçiniz.",
  }),
  employmentType: z.string().optional(),
  monthlyNetIncome: z.string().optional(),
})

export function ScholarshipApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [fileTextNufuz, setFileTextNufuz] = useState<string | null>(null)
  const [fileTextTotal, setFileTextTotal] = useState<string | null>(null)
  const [fileTextNotort, setFileTextNotort] = useState<string | null>(null)
  const [fileTextBurs, setFileTextBurs] = useState<string | null>(null)
  const [fileTextOgrbelge, setFileTextOgrbelge] = useState<string | null>(null)
  const [isScholarshipEnabled, setIsScholarshipEnabled] = useState(true);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      institution: "",
      tcKimlikNo: "",
      academicYear: "",
      motivation: "",
      document: "",
      residenceStatus: "",
      monthlyFee: "",
      iban: "",
      bankAccountName: "",
      isMartyVeteranRelative: false,
      hasDisability: false,
      familyEmploymentStatus: "",
      employmentType: "",
      monthlyNetIncome: "",
      
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

  useEffect(() => {
    const fetchScholarshipStatus = async () => {
      try {
        const response = await fetch('/api/scholarship-status');
        const data = await response.json();
        setIsScholarshipEnabled(data.isEnabled);
      } catch (error) {
        console.error('Failed to fetch scholarship status:', error);
        toast({
          title: "Error",
          description: "Failed to check scholarship application status. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchScholarshipStatus();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Form validation
    const result = formSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten();
      const errorMessages = Object.values(errors.fieldErrors).flat();
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doğru bir şekilde doldurun: " + errorMessages.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Check if all required documents are uploaded
    const documents = JSON.parse(values.document);
    const requiredDocuments = ['nufuz', 'notort', 'burs', 'ogrbelge'];
    const missingDocuments = requiredDocuments.filter(doc => !documents[doc]);
    
    if (missingDocuments.length > 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli belgeleri yükleyin: " + missingDocuments.join(", "),
        variant: "destructive",
      });
      return;
    }

    setShowAlertDialog(true);
  }

  async function handleFormSubmission(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Check for duplicate TC Kimlik No
      const tcCheckResponse = await fetch('/api/check-tc-kimlik-no', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tcKimlikNo: values.tcKimlikNo }),
      });

      if (!tcCheckResponse.ok) {
        const errorData = await tcCheckResponse.json();
        throw new Error(errorData.message || 'Bu TC Kimlik No ile daha önce başvuru yapılmış.');
      }

      const response = await fetch('/api/scholarship-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Başvuru gönderilemedi');
      }

      setIsSubmitted(true);
      toast({
        title: "Başarılı",
        description: "Başvurunuz başarıyla gönderildi.",
        variant: "default",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Başvuru gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowAlertDialog(false);
    }
  }

  if (!isScholarshipEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Burs Başvurusu</CardTitle>
          <CardDescription>Scholarship Application</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500 font-semibold">
            Burs başvurusu açılmamıştır
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-[350px] mx-auto mt-16">
        <CardHeader>
          <CardTitle>Başvurunuz Alındı</CardTitle>
          <CardDescription>Sizi en kısa sürede bilgilendireceğiz.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Burs Başvurusu</h2>
        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
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
                    <FormLabel className="text-lg font-medium">E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@ornek.com" {...field} />
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
                    <FormLabel className="text-lg font-medium">Kurum</FormLabel>
                    <FormControl>
                      <Input placeholder="Örnek Üniversitesi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tcKimlikNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">TC Kimlik No</FormLabel>
                    <FormControl>
                      <Input placeholder="TC Kimlik No" {...field} />
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
                    <FormLabel className="text-lg font-medium">Mevcut Akademik Yıl</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Mevcut akademik yılınızı seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hazirlik">Hazırlık</SelectItem>
                        <SelectItem value="birinci">1. Sınıf</SelectItem>
                        <SelectItem value="ikinci">2. Sınıf</SelectItem>
                        <SelectItem value="ucuncu">3. Sınıf</SelectItem>
                        <SelectItem value="dorduncu">4. Sınıf</SelectItem>
                        <SelectItem value="lisansustu">Lisansüstü</SelectItem>
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
                    <FormLabel className="text-lg font-medium">Eğitim Sırasında İkamet Durumu</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="İkamet durumunuzu seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kira">Kiralık</SelectItem>
                        <SelectItem value="vakif_yurt">Vakıf Yurdu</SelectItem>
                        <SelectItem value="kyk">KYK Yurdu</SelectItem>
                        <SelectItem value="aile">Aile Yanı</SelectItem>
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
                      <FormLabel className="text-lg font-medium">Aylık Ücret</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Aylık ücreti girin" {...field} />
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
                    <FormLabel className="text-lg font-medium">IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="IBAN numaranızı girin" {...field} />
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
                    <FormLabel className="text-lg font-medium">Banka Hesabına Kayıtlı İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Banka hesabına kayıtlı ismi girin" {...field} />
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
                      <FormLabel className="text-lg font-medium">
                        Şehit/Gazi Yakını
                      </FormLabel>
                      <FormDescription>
                        Şehit veya gazi yakınıysanız bu seçeneği işaretleyin.
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
                      <FormLabel className="text-lg font-medium">
                        Fiziksel Engel
                      </FormLabel>
                      <FormDescription>
                        Fiziksel engelliyseniz bu seçeneği işaretleyin.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="familyEmploymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Ailede Çalışan Kişi</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("employmentType", "");
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baba">Baba</SelectItem>
                        <SelectItem value="anne">Anne</SelectItem>
                        <SelectItem value="baba_anne">Baba ve Anne</SelectItem>
                        <SelectItem value="baba_anne_diger">Baba, Anne ve Diğer Aile Üyeleri</SelectItem>
                        <SelectItem value="kimse">Kimse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("familyEmploymentStatus") && form.watch("familyEmploymentStatus") !== "kimse" && (
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Çalışma Durumu</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="memur">Memur</SelectItem>
                          <SelectItem value="emekli">Emekli</SelectItem>
                          <SelectItem value="serbest">Serbest Çalışan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(form.watch("employmentType") === "emekli" || form.watch("employmentType") === "serbest") && (
                <FormField
                  control={form.control}
                  name="monthlyNetIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Aylık Net Gelir</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Aylık net geliri giriniz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Motivasyon Beyanı</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Burs başvurusunun nedenlerini ve hedeflerinize nasıl yardımcı olacağını anlatın."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      En az 50 karakter. Siber güvenlik ve iş sürekliliğine olan ilginizi açıklayın.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Belgeler</FormLabel>
                    <div className="space-y-4">
                      <div>
                        <FormLabel className="text-lg font-medium">Aile Kayıt Belgesi</FormLabel>
                        <FormDescription>Aile kayıt belgenizi yükleyin.</FormDescription>
                        <FileUploadNufuz setFileText={setFileTextNufuz} />
                      </div>
                      {form.watch("employmentType") === "memur" && (
                        <div>
                          <FormLabel className="text-lg font-medium">Toplam Gelir Belgesi</FormLabel>
                          <FormDescription>Toplam gelir belgenizi yükleyin.</FormDescription>
                          <FileUploadTotal setFileText={setFileTextTotal} />
                        </div>
                      )}
                      <div>
                        <FormLabel className="text-lg font-medium">Transkript</FormLabel>
                        <FormDescription>Transkriptinizi yükleyin.</FormDescription>
                        <FileUploadNotort setFileText={setFileTextNotort} />
                      </div>
                      <div>
                        <FormLabel className="text-lg font-medium">Burs/Kredi Belgesi</FormLabel>
                        <FormDescription>Burs veya kredi belgenizi yükleyin.</FormDescription>
                        <FileUploadBurs setFileText={setFileTextBurs} />
                      </div>
                      <div>
                        <FormLabel className="text-lg font-medium">Öğrenci Belgesi</FormLabel>
                        <FormDescription>Öğrenci belgenizi yükleyin.</FormDescription>
                        <FileUploadOgrbelge setFileText={setFileTextOgrbelge} />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
            </form>
          </Form>
          <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Başvuruyu Gönder</AlertDialogTitle>
                <AlertDialogDescription>
                  Başvurunuzu göndermek üzeresiniz. Gönderildikten sonra form düzenlenemeyecektir. Lütfen tüm bilgilerin doğru olduğundan emin olun.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleFormSubmission(form.getValues())}>
                  Onayla ve Gönder
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  )
}

