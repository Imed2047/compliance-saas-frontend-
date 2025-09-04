import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FolderOpen, 
  FileText, 
  Scale, 
  BarChart3, 
  User, 
  Plus,
  CheckCircle,
  AlertTriangle,
  LogOut
} from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dossiers')
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentAnalyses()
  }, [])

  const fetchRecentAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses/recent', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecentAnalyses(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      onLogout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      onLogout() // Déconnecter quand même côté client
    }
  }

  const menuItems = [
    { id: 'dossiers', label: 'Mes dossiers', icon: FolderOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analyse', label: 'Analyse conformité', icon: Scale },
    { id: 'rapports', label: 'Rapports', icon: BarChart3 },
    { id: 'compte', label: 'Mon compte', icon: User }
  ]

  const getStatusBadge = (status) => {
    if (status === 'conforme') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conforme
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          <AlertTriangle className="w-3 h-3 mr-1" />
          À risque
        </Badge>
      )
    }
  }

  return (
    <div className="flex h-screen">
      {/* Barre latérale */}
      <div 
        className="w-64 flex flex-col"
        style={{ backgroundColor: '#1F3C88' }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-600">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-3" />
            <h1 className="text-xl font-bold text-white">ComplianceAI</h1>
          </div>
        </div>

        {/* Menu de navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeMenu === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F5F6FA' }}>
        <div className="p-8">
          {/* Message de bienvenue */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour {user?.name || 'Cabinet'}
            </h1>
            <p className="text-gray-600">
              Gérez vos analyses de conformité en toute simplicité
            </p>
          </div>

          {/* Bouton principal */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              className="text-lg px-8 py-6"
              style={{ backgroundColor: '#3E92CC' }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Importer des documents
            </Button>
          </div>

          {/* Carte des dernières analyses */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Dernières analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement des analyses...
                </div>
              ) : recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune analyse disponible. Commencez par importer des documents.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {analysis.clientName}
                          </h3>
                          <p className="text-sm text-gray-500">{analysis.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(analysis.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

