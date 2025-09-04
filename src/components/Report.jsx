import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ArrowLeft, 
  Download,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  MapPin,
  Hash,
  XCircle
} from 'lucide-react'

const Report = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [analysisData, setAnalysisData] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalysisAndReport()
  }, [id])

  const fetchAnalysisAndReport = async () => {
    try {
      // Récupérer les données d'analyse
      const analysisResponse = await fetch(`/api/analyses/${id}`, {
        credentials: 'include'
      })

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json()
        setAnalysisData(analysis)

        // Vérifier si un rapport existe déjà
        try {
          const reportResponse = await fetch(`/api/analyses/${id}/report`, {
            credentials: 'include'
          })
          
          if (reportResponse.ok) {
            const report = await reportResponse.json()
            setReportData(report)
          }
        } catch (reportError) {
          // Pas de rapport existant, c'est normal
        }
      } else {
        setError('Analyse non trouvée')
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/analyses/${id}/report`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data.report)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la génération du rapport')
      }
    } catch (err) {
      setError('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = async () => {
    if (!reportData) return

    try {
      const response = await fetch(`/api/reports/${reportData.id}/download`, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = reportData.report_filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        setError('Erreur lors du téléchargement')
      }
    } catch (err) {
      setError('Erreur lors du téléchargement')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-orange-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/analysis/${id}`)} variant="outline">
            Retour à l'analyse
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6FA' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(`/analysis/${id}`)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'analyse
              </Button>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2" style={{ color: '#1F3C88' }} />
                <h1 className="text-lg font-semibold" style={{ color: '#1F3C88' }}>
                  ComplianceAI
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              {!reportData && (
                <Button
                  onClick={generateReport}
                  disabled={generating}
                  style={{ backgroundColor: '#3E92CC' }}
                >
                  {generating ? 'Génération...' : 'Générer PDF'}
                </Button>
              )}
              {reportData && (
                <Button
                  onClick={downloadReport}
                  style={{ backgroundColor: '#3E92CC' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rapport de conformité
          </h1>
          <p className="text-gray-600">
            {reportData ? 'Aperçu du rapport PDF' : 'Génération du rapport PDF'} pour {analysisData?.client_name}
          </p>
        </div>

        {!reportData ? (
          /* Message de génération */
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rapport PDF non généré</h3>
              <p className="text-gray-600 mb-6">
                Cliquez sur "Générer PDF" pour créer le rapport de conformité complet.
              </p>
              <Button
                onClick={generateReport}
                disabled={generating}
                size="lg"
                style={{ backgroundColor: '#3E92CC' }}
              >
                {generating ? 'Génération en cours...' : 'Générer le rapport PDF'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Aperçu du rapport */
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {/* En-tête du rapport */}
              <div 
                className="p-8 text-white"
                style={{ backgroundColor: '#1F3C88' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold">ComplianceAI</h2>
                      <p className="text-blue-100">Rapport d'analyse de conformité</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">Date d'analyse</p>
                    <p className="font-semibold">
                      {new Date(analysisData.analysis_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Résumé de conformité */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Résumé de conformité</h3>
                    <Badge 
                      className={`px-4 py-2 text-sm ${
                        analysisData.overall_status === 'compliant' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {analysisData.overall_status === 'compliant' ? 'Conforme' : 'À risque'}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {analysisData.risk_score}
                        </div>
                        <p className="text-sm text-gray-600">Score de risque (1-5)</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {analysisData.risk_analysis?.filter(r => r.type === 'conforme').length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Éléments conformes</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {analysisData.risk_analysis?.filter(r => r.type !== 'conforme').length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Points d'attention</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations client */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Informations client</h3>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Nom</p>
                          <p className="font-medium">{analysisData.extracted_info?.nom || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Hash className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">SIRET</p>
                          <p className="font-medium">{analysisData.extracted_info?.siret || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start md:col-span-2">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-medium">{analysisData.extracted_info?.adresse || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Date document</p>
                          <p className="font-medium">{analysisData.extracted_info?.dateDoc || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note finale */}
                <div className="border-t pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Note finale</h3>
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {analysisData.risk_score}/5
                    </div>
                    <p className="text-gray-600">
                      {analysisData.overall_status === 'compliant' 
                        ? 'Ce dossier est conforme aux exigences de conformité.'
                        : 'Ce dossier présente des points d\'attention nécessitant un suivi.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/analysis/${id}`)}
          >
            Retour à l'analyse
          </Button>
          {reportData && (
            <Button
              onClick={downloadReport}
              style={{ backgroundColor: '#3E92CC' }}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le rapport PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Report

