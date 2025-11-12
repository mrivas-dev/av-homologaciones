'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@av/ui'
import { Button } from '@av/ui'
import { Input } from '@av/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@av/ui'
import { Badge } from '@av/ui'
import { Upload, File, X } from 'lucide-react'

interface DocumentFile {
  id: string
  name: string
  type: string
  file: File
}

interface DocumentsFormProps {
  onComplete: () => void
}

export function DocumentsForm({ onComplete }: DocumentsFormProps) {
  const t = useTranslations('homologation.steps.documents')
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const documentTypes = [
    { value: 'id_card', label: t('idCard') },
    { value: 'vehicle_title', label: t('vehicleTitle') },
    { value: 'insurance', label: t('insurance') },
    { value: 'safety_certificate', label: t('safetyCertificate') },
    { value: 'other', label: t('other') },
  ]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    const newDocuments: DocumentFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'other',
      file,
    }))
    
    setDocuments((prev) => [...prev, ...newDocuments])
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const updateDocumentType = (id: string, type: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, type } : doc))
    )
  }

  const handleSubmit = () => {
    if (documents.length === 0) {
      alert('Por favor suba al menos un documento')
      return
    }
    
    console.log('Documents:', documents)
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>{t('upload')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Arrastre y suelte archivos aquí
            </p>
            <p className="text-muted-foreground mb-4">
              o haga clic para seleccionar archivos
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Seleccionar Archivos
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Subidos ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <File className="w-8 h-8 text-muted-foreground" />
                  
                  <div className="flex-1">
                    <p className="font-medium">{document.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(document.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <Select
                    value={document.type}
                    onValueChange={(value) => updateDocumentType(document.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(document.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full" disabled={documents.length === 0}>
        Continuar
      </Button>
    </div>
  )
}
