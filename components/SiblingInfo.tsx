import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useFieldArray, useForm } from "react-hook-form"

export type SiblingData = {
  name: string
  educationStatus: string
}

type SiblingInfoProps = {
  control: any
  register: any
}

export function SiblingInfo({ control, register }: SiblingInfoProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "siblings"
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Kardeş Bilgileri</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap gap-4 mb-4">
          <FormField
            control={control}
            name={`siblings.${index}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Kardeş Adı</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Kardeşin adını girin" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`siblings.${index}.educationStatus`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Eğitim Durumu</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Eğitim durumunu seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-6 yas arası">0-6 yaş arası</SelectItem>
                    <SelectItem value="ilkokul">İlkokul</SelectItem>
                    <SelectItem value="ortaokul">Ortaokul</SelectItem>
                    <SelectItem value="lise">Lise</SelectItem>
                    <SelectItem value="universite">Üniversite</SelectItem>
                    <SelectItem value="mezun">Mezun</SelectItem>
                    <SelectItem value="Çalışıyor">Çalışıyor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="destructive" onClick={() => remove(index)}>Sil</Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', educationStatus: '' })}
      >
        Kardeş Bilgis Ekle
      </Button>
    </div>
  )
}

