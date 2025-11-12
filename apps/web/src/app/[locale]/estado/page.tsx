'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Input } from '@av/ui'
import { Button } from '@av/ui'
import { Badge } from '@av/ui'
import { Search, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react'

interface HomologationStatus {
  id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed'
  submissionDate: string
  estimatedCompletion: string
  vehicleInfo: {
    type: string
    brand: string
    model: string
    year: number
  }
  documents: {
    total: number
    approved: number
    pending: number
  }
  payment: {
    status: 'pending' | 'paid' | 'refunded'
    amount: number
  }
  notes?: string
}

export default function EstadoPage() {
  const t = useTranslations('status')
  const [searchId, setSearchId] = useState('')
  const [homologation, setHomologation] = useState<HomologationStatus | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchId.trim()) return

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock data - in real app, this would come from the API
      const mockData: HomologationStatus = {
        id: searchId,
        status: 'under_review',
        submissionDate: '2024-01-15',
        estimatedCompletion: '2024-01-22',
        vehicleInfo: {
          type: 'Acoplado',
          brand: 'Wabash',
          model: 'DuraPlate HD',
          year: 2023,
        },
        documents: {
          total: 4,
          approved: 3,
          pending: 1,
        },
        payment: {
          status: 'paid',
          amount: 15000,
        },
        notes: 'Documentación en revisión técnica. Se requiere inspección física.',
      }
      
      setHomologation(mockData)
      setIsSearching(false)
    }, 1500)
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      draft: {
        label: t('statuses.draft'),
        color: 'bg-gray-100 text-gray-800',
        icon: FileText,
      },
      submitted: {
        label: t('statuses.submitted'),
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      under_review: {
        label: t('statuses.underReview'),
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      approved: {
        label: t('statuses.approved'),
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        label: t('statuses.rejected'),
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
      completed: {
        label: t('statuses.completed'),
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
    }
    
    return statusMap[status as keyof typeof statusMap] || statusMap.draft
  }

  const getPaymentStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        label: t('paymentStatus.pending'),
        color: 'bg-yellow-100 text-yellow-800',
      },
      paid: {
        label: t('paymentStatus.paid'),
        color: 'bg-green-100 text-green-800',
      },
      refunded: {
        label: t('paymentStatus.refunded'),
        color: 'bg-gray-100 text-gray-800',
      },
    }
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground">
            Ingrese el número de solicitud para consultar el estado
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('search')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Ej: HOM-2024-001234"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {homologation && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Solicitud #{homologation.id}</span>
                  <Badge className={getStatusInfo(homologation.status).color}>
                    {(() => {
                      const Icon = getStatusInfo(homologation.status).icon
                      return <Icon className="w-3 h-3 mr-1" />
                    })()}
                    {getStatusInfo(homologation.status).label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Información del Vehículo</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Tipo:</span> {homologation.vehicleInfo.type}</p>
                      <p><span className="text-muted-foreground">Marca:</span> {homologation.vehicleInfo.brand}</p>
                      <p><span className="text-muted-foreground">Modelo:</span> {homologation.vehicleInfo.model}</p>
                      <p><span className="text-muted-foreground">Año:</span> {homologation.vehicleInfo.year}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Fechas</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Fecha de envío:</span> {homologation.submissionDate}</p>
                      <p><span className="text-muted-foreground">Finalización estimada:</span> {homologation.estimatedCompletion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Documentos totales</span>
                    <span className="font-medium">{homologation.documents.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documentos aprobados</span>
                    <span className="font-medium text-green-600">{homologation.documents.approved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documentos pendientes</span>
                    <span className="font-medium text-yellow-600">{homologation.documents.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(homologation.documents.approved / homologation.documents.total) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">${homologation.payment.amount.toLocaleString('es-AR')} ARS</p>
                    <p className="text-sm text-muted-foreground">Costo de procesamiento</p>
                  </div>
                  <Badge className={getPaymentStatusInfo(homologation.payment.status).color}>
                    {getPaymentStatusInfo(homologation.payment.status).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {homologation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{homologation.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
