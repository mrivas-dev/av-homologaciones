'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Button } from '@av/ui'
import { Badge } from '@av/ui'
import { CreditCard, CheckCircle } from 'lucide-react'

interface PaymentFormProps {
  onComplete: () => void
}

export function PaymentForm({ onComplete }: PaymentFormProps) {
  const t = useTranslations('homologation.steps.payment')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid'>('pending')
  const [isProcessing, setIsProcessing] = useState(false)

  const amount = 15000 // ARS
  const currency = t('currency')

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('paid')
      setIsProcessing(false)
      setTimeout(() => {
        onComplete()
      }, 1500)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>{t('title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{t('amount')}</p>
                <p className="text-sm text-muted-foreground">
                  Costo de procesamiento de homologación
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${amount.toLocaleString('es-AR')} {currency}
                </p>
              </div>
            </div>

            {paymentStatus === 'pending' && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Procesa el pago para continuar con tu solicitud de homologación
                </p>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t('process')}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Pago seguro procesado a través de MercadoPago
                </p>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-medium">Procesando pago...</p>
                <p className="text-sm text-muted-foreground">
                  Por favor espera mientras procesamos tu pago
                </p>
              </div>
            )}

            {paymentStatus === 'paid' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-medium text-green-600">{t('paid')}</p>
                <p className="text-sm text-muted-foreground">
                  Tu pago ha sido procesado exitosamente
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Comprobante #MP{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {paymentStatus === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-medium">${amount.toLocaleString('es-AR')} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método:</span>
                <span className="font-medium">MercadoPago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seguridad:</span>
                <span className="font-medium">Encriptado SSL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reembolso:</span>
                <span className="font-medium">Política de 7 días</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
