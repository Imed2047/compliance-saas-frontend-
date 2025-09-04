import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle,
  ArrowLeft
} from 'lucide-react'

const UploadDocument = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const uploadFile = async (file, fileId) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Mettre à jour le statut du fichier
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: 100, status: 'completed', documentId: data.document.id }
              : f
          )
        )

        // Déclencher l'analyse automatiquement
        await analyzeDocument(data.document.id, fileId)
        
      } else {
        const errorData = await response.json()
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', error: errorData.error }
              : f
          )
        )
      }
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: 'Erreur de connexion' }
            : f
        )
      )
    }
  }

  const analyzeDocument = async (documentId, fileId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'analyzed', analysisId: data.id }
              : f
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    }
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      return validTypes.includes(file.type)
    })

    validFiles.forEach((file, index) => {
      const fileId = Date.now() + index
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading'
      }

      setUploadedFiles(prev => [...prev, newFile])

      // Simuler la progression puis uploader
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => {
            if (f.id === fileId && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + Math.random() * 20, 90)
              return { ...f, progress: newProgress }
            }
            return f
          })
        )
      }, 200)

      // Démarrer l'upload après 1 seconde
      setTimeout(() => {
        clearInterval(interval)
        uploadFile(file, fileId)
      }, 1000)
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'analyzed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (file) => {
    switch (file.status) {
      case 'analyzed':
        return <Badge className="bg-green-100 text-green-800">Analysé</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Uploadé</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
    }
  }

  const hasAnalyzedFiles = uploadedFiles.some(f => f.status === 'analyzed')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6FA' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2" style={{ color: '#1F3C88' }} />
                <h1 className="text-lg font-semibold" style={{ color: '#1F3C88' }}>
                  ComplianceAI
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Téléverser un document
          </h1>
          <p className="text-gray-600">
            Importez vos documents pour analyse de conformité
          </p>
        </div>

        {/* Zone de drag & drop */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Glisser-déposer un fichier ici
              </h3>
              <p className="text-gray-600 mb-4">
                ou cliquez pour parcourir vos fichiers
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundColor: '#3E92CC' }}
              >
                Parcourir mes fichiers
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-sm text-gray-500 mt-4">
                Formats acceptés : PDF / JPG / PNG
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Liste des fichiers uploadés */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers en cours de traitement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        {file.status === 'uploading' && (
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex-1 max-w-xs">
                              <Progress value={file.progress} className="h-2" />
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round(file.progress)}%
                            </span>
                          </div>
                        )}
                        {file.error && (
                          <p className="text-sm text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(file)}
                    </div>
                  </div>
                ))}
              </div>
              
              {hasAnalyzedFiles && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    onClick={() => {
                      const analyzedFile = uploadedFiles.find(f => f.status === 'analyzed')
                      if (analyzedFile) {
                        navigate(`/analysis/${analyzedFile.analysisId}`)
                      }
                    }}
                    style={{ backgroundColor: '#3E92CC' }}
                  >
                    Voir les analyses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default UploadDocument

