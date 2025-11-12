'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Button } from '@av/ui'
import { Badge } from '@av/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@av/ui'
import { VehicleForm } from '@/components/homologation/vehicle-form'
import { DocumentsForm } from '@/components/homologation/documents-form'
import { PaymentForm } from '@/components/homologation/payment-form'
import { ReviewForm } from '@/components/homologation/review-form'
import { ChevronRight, CheckCircle } from 'lucide-react'

type Step = 'vehicle' | 'documents' | 'payment' | 'review'

export default function HomologarPage() {
  const t = useTranslations('homologation')
  const [currentStep, setCurrentStep] = useState<Step>('vehicle')
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])

  const steps: { id: Step; label: string }[] = [
    { id: 'vehicle', label: t('steps.vehicle.title') },
    { id: 'documents', label: t('steps.documents.title') },
    { id: 'payment', label: t('steps.payment.title') },
    { id: 'review', label: t('steps.review.title') },
  ]

  const handleStepComplete = (step: Step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
    
    const currentIndex = steps.findIndex(s => s.id === step)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleStepChange = (step: Step) => {
    setCurrentStep(step)
  }

  const getStepStatus = (step: Step) => {
    if (completedSteps.includes(step)) return 'completed'
    if (currentStep === step) return 'current'
    return 'pending'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground">
            Complete el formulario para iniciar el proceso de homologación
          </p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        ${status === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                        ${status === 'current' ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''}
                        ${status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden md:block">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-muted mx-4" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps.find(s => s.id === currentStep)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentStep} onValueChange={(value) => handleStepChange(value as Step)}>
              <TabsList className="hidden">
                {steps.map(step => (
                  <TabsTrigger key={step.id} value={step.id}>
                    {step.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="vehicle">
                <VehicleForm onComplete={() => handleStepComplete('vehicle')} />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsForm onComplete={() => handleStepComplete('documents')} />
              </TabsContent>

              <TabsContent value="payment">
                <PaymentForm onComplete={() => handleStepComplete('payment')} />
              </TabsContent>

              <TabsContent value="review">
                <ReviewForm onComplete={() => handleStepComplete('review')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = steps.findIndex(s => s.id === currentStep)
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1].id)
              }
            }}
            disabled={currentStep === 'vehicle'}
          >
            Anterior
          </Button>

          {currentStep !== 'review' && (
            <Button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep)
                if (currentIndex < steps.length - 1 && completedSteps.includes(currentStep)) {
                  setCurrentStep(steps[currentIndex + 1].id)
                }
              }}
              disabled={!completedSteps.includes(currentStep)}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
