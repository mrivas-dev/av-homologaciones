'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Button } from '@av/ui'
import { Badge } from '@av/ui'
import { Separator } from '@av/ui'
import { CheckCircle, File, CreditCard, Truck } from 'lucide-react'

interface ReviewFormProps {
  onComplete: () => void
}

export function ReviewForm({ onComplete }: ReviewFormProps) {
  const t = useTranslations('homologation.steps.review')

  // Mock data - in real app, this would come from the form state
  const vehicleData = {
    type: 'trailer',
    brand: 'Wabash',
    model: 'DuraPlate HD',
    year: 2023,
    vin: '1WVDAX9Z0PD123456',
    licensePlate: 'AB123CD',
    axles: 2,
    length: 1370,
    width: 260,
    height: 400,
    maxWeight: 25000,
  }

  const documents = [
    { name: 'DNI Titular.pdf', type: 'id_card' },
    { name: 'Título Vehicular.pdf', type: 'vehicle_title' },
    { name: 'Seguro.pdf', type: 'insurance' },
  ]

  const paymentData = {
    amount: 15000,
    currency: 'ARS',
    status: 'paid',
    transactionId: 'MP1234567890',
  }

  const handleSubmit = () => {
    console.log('Submitting homologation request...')
    onComplete()
  }

  const getVehicleTypeLabel = (type: string) => {
    const types = {
      trailer: 'Acoplado',
      rollingBox: 'Caja Rodante',
      motorhome: 'Motorhome',
    }
    return types[type as keyof typeof types] || type
  }

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      id_card: 'DNI/Cédula',
      vehicle_title: 'Título del vehículo',
      insurance: 'Seguro',
      safety_certificate: 'Certificado de seguridad',
      other: 'Otro',
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Información del Vehículo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{getVehicleTypeLabel(vehicleData.type)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Marca</p>
              <p className="font-medium">{vehicleData.brand}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Modelo</p>
              <p className="font-medium">{vehicleData.model}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Año</p>
              <p className="font-medium">{vehicleData.year}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">VIN</p>
              <p className="font-medium">{vehicleData.vin}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Patente</p>
              <p className="font-medium">{vehicleData.licensePlate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ejes</p>
              <p className="font-medium">{vehicleData.axles}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Peso Máximo</p>
              <p className="font-medium">{vehicleData.maxWeight.toLocaleString('es-AR')} kg</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dimensiones (L×A×H)</p>
              <p className="font-medium">
                {vehicleData.length}×{vehicleData.width}×{vehicleData.height} cm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="w-5 h-5" />
            <span>Documentación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDocumentTypeLabel(doc.type)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Subido
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Información de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Monto Pagado</p>
                <p className="text-sm text-muted-foreground">Procesamiento de homologación</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${paymentData.amount.toLocaleString('es-AR')} {paymentData.currency}
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Pagado
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>ID de Transacción: {paymentData.transactionId}</p>
              <p>Método: MercadoPago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Confirmación de Envío</h4>
        <p className="text-sm text-blue-800 mb-3">
          Al confirmar, su solicitud de homologación será enviada para revisión. 
          Podrá seguir el estado de su solicitud en tiempo real a través de nuestro portal.
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tiempo estimado de revisión: 5-7 días hábiles</li>
          <li>• Recibirá notificaciones por correo electrónico</li>
          <li>• Puede consultar el estado en cualquier momento</li>
        </ul>
      </div>

      <Button onClick={handleSubmit} size="lg" className="w-full">
        {t('confirm')}
      </Button>
    </div>
  )
}
