import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  FileText
} from 'lucide-react'

const Analysis = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data)
      } else {
        setError('Analyse non trouvée')
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (type) => {
    switch (type) {
      case 'conforme':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'incoherence':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'risque':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (type) => {
    switch (type) {
      case 'conforme':
        return CheckCircle
      case 'incoherence':
        return AlertTriangle
      case 'risque':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'analyse...</p>
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
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Retour au dashboard
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

      <div className="max-w-6xl mx-auto p-8">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyse de conformité — Dossier {analysisData.client_name}
          </h1>
          <p className="text-gray-600">
            Résultats de l'analyse automatique des documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations extraites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Informations extraites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-gray-900">{analysisData.extracted_info?.nom || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">N° SIRET</label>
                    <p className="text-gray-900">{analysisData.extracted_info?.siret || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Adresse</label>
                    <p className="text-gray-900">{analysisData.extracted_info?.adresse || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date document</label>
                    <p className="text-gray-900">{analysisData.extracted_info?.dateDoc || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyse des risques */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse des risques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.risk_analysis?.map((risk, index) => {
                    const Icon = getRiskIcon(risk.type)
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getRiskColor(risk.type)}`}
                      >
                        <div className="flex items-start">
                          <Icon className="h-5 w-5 mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{risk.label}</h4>
                            <p className="text-sm mt-1">{risk.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisData.recommendations?.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Score de risque */}
            <Card>
              <CardHeader>
                <CardTitle>Score de risque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {analysisData.risk_score}/5
                  </div>
                  <p className="text-sm text-gray-600">
                    {analysisData.risk_score <= 2 ? 'Niveau de risque faible' :
                     analysisData.risk_score <= 3 ? 'Niveau de risque modéré' :
                     'Niveau de risque élevé'}
                  </p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analysisData.risk_score <= 2 ? 'bg-green-500' :
                        analysisData.risk_score <= 3 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(analysisData.risk_score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate(`/report/${id}`)}
                  className="w-full"
                  style={{ backgroundColor: '#3E92CC' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger rapport PDF
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Rapport complet avec toutes les analyses
                </p>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Voir documents source
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Signaler un problème
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis

