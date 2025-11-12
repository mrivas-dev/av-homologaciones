'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@av/ui'
import { Input } from '@av/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@av/ui'
import { Button } from '@av/ui'
import { HomologationFormSchema } from '@av/types'
import { z } from 'zod'

const VehicleFormSchema = HomologationFormSchema.pick({ vehicle: true })

type VehicleFormData = z.infer<typeof VehicleFormSchema>

interface VehicleFormProps {
  onComplete: () => void
}

export function VehicleForm({ onComplete }: VehicleFormProps) {
  const t = useTranslations('homologation.steps.vehicle')
  
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(VehicleFormSchema),
    defaultValues: {
      vehicle: {
        type: 'trailer',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
        axles: undefined,
        length: undefined,
        width: undefined,
        height: undefined,
        max_weight: undefined,
      },
    },
  })

  const onSubmit = (data: VehicleFormData) => {
    console.log('Vehicle data:', data)
    onComplete()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicle.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="trailer">{t('trailer')}</SelectItem>
                    <SelectItem value="rollingBox">{t('rollingBox')}</SelectItem>
                    <SelectItem value="motorhome">{t('motorhome')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('year')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicle.brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('brand')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('brand')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('model')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('model')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicle.vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('vin')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('vin')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.license_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('licensePlate')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('licensePlate')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="vehicle.axles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('axles')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('axles')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('length')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('length')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('width')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('width')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicle.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('height')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('height')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle.max_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('maxWeight')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('maxWeight')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    </Form>
  )
}
