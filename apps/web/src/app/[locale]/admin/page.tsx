'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Button } from '@av/ui'
import { Badge } from '@av/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@av/ui'
import { Input } from '@av/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@av/ui'
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react'

interface DashboardStats {
  totalHomologations: number
  pendingReview: number
  approved: number
  rejected: number
  totalUsers: number
  totalRevenue: number
}

interface HomologationItem {
  id: string
  userId: string
  userEmail: string
  vehicleInfo: {
    type: string
    brand: string
    model: string
  }
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  submissionDate: string
  paymentStatus: 'paid' | 'pending'
}

export default function AdminPage() {
  const t = useTranslations('admin')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data
  const stats: DashboardStats = {
    totalHomologations: 156,
    pendingReview: 23,
    approved: 98,
    rejected: 35,
    totalUsers: 89,
    totalRevenue: 2340000,
  }

  const homologations: HomologationItem[] = [
    {
      id: 'HOM-2024-001',
      userId: 'user-123',
      userEmail: 'cliente@email.com',
      vehicleInfo: {
        type: 'Acoplado',
        brand: 'Wabash',
        model: 'DuraPlate HD',
      },
      status: 'under_review',
      submissionDate: '2024-01-15',
      paymentStatus: 'paid',
    },
    {
      id: 'HOM-2024-002',
      userId: 'user-456',
      userEmail: 'empresa@email.com',
      vehicleInfo: {
        type: 'Caja Rodante',
        brand: 'Great Dane',
        model: 'Freedom',
      },
      status: 'submitted',
      submissionDate: '2024-01-16',
      paymentStatus: 'paid',
    },
    {
      id: 'HOM-2024-003',
      userId: 'user-789',
      userEmail: 'transporte@email.com',
      vehicleInfo: {
        type: 'Motorhome',
        brand: 'Winnebago',
        model: 'Adventurer',
      },
      status: 'approved',
      submissionDate: '2024-01-10',
      paymentStatus: 'paid',
    },
  ]

  const getStatusInfo = (status: string) => {
    const statusMap = {
      submitted: {
        label: 'Enviada',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      under_review: {
        label: 'En revisión',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      approved: {
        label: 'Aprobada',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Rechazada',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }
    
    return statusMap[status as keyof typeof statusMap] || statusMap.submitted
  }

  const filteredHomologations = homologations.filter((h) => {
    const matchesSearch = h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.vehicleInfo.brand.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            Gestiona y supervisa todas las solicitudes de homologación
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">{t('dashboard')}</TabsTrigger>
            <TabsTrigger value="homologations">{t('homologations')}</TabsTrigger>
            <TabsTrigger value="users">{t('users')}</TabsTrigger>
            <TabsTrigger value="payments">{t('payments')}</TabsTrigger>
            <TabsTrigger value="reports">{t('reports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Homologaciones</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalHomologations}</div>
                  <p className="text-xs text-muted-foreground">+12% respecto al mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes de Revisión</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReview}</div>
                  <p className="text-xs text-muted-foreground">-5% respecto al mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+8% respecto al mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString('es-AR')}</div>
                  <p className="text-xs text-muted-foreground">+20% respecto al mes anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {homologations.slice(0, 3).map((h) => {
                    const statusInfo = getStatusInfo(h.status)
                    const Icon = statusInfo.icon
                    
                    return (
                      <div key={h.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{h.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {h.vehicleInfo.brand} {h.vehicleInfo.model} - {h.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {h.submissionDate}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homologations" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>{t('homologations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por ID, email o marca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="submitted">Enviadas</SelectItem>
                      <SelectItem value="under_review">En revisión</SelectItem>
                      <SelectItem value="approved">Aprobadas</SelectItem>
                      <SelectItem value="rejected">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Homologations List */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">ID</th>
                        <th className="text-left p-4 font-medium">Cliente</th>
                        <th className="text-left p-4 font-medium">Vehículo</th>
                        <th className="text-left p-4 font-medium">Estado</th>
                        <th className="text-left p-4 font-medium">Fecha</th>
                        <th className="text-left p-4 font-medium">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHomologations.map((h) => {
                        const statusInfo = getStatusInfo(h.status)
                        
                        return (
                          <tr key={h.id} className="border-b">
                            <td className="p-4 font-medium">{h.id}</td>
                            <td className="p-4">{h.userEmail}</td>
                            <td className="p-4">
                              {h.vehicleInfo.type} - {h.vehicleInfo.brand} {h.vehicleInfo.model}
                            </td>
                            <td className="p-4">
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-4">{h.submissionDate}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                                {h.status === 'under_review' && (
                                  <>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      {t('approve')}
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                      {t('reject')}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t('users')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Gestión de usuarios próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>{t('payments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Gestión de pagos próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reportes y análisis próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
