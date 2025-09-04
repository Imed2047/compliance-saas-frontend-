# ComplianceAI Frontend

Interface utilisateur moderne pour le SaaS de conformité ComplianceAI.

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
pnpm install

# Démarrage du serveur de développement
pnpm run dev

# Build pour la production
pnpm run build
```

## 🛠️ Technologies

- **React 18** - Framework frontend
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI modernes
- **React Router** - Navigation côté client
- **Lucide React** - Icônes

## 📁 Structure

```
src/
├── components/
│   ├── ui/              # Composants shadcn/ui
│   ├── Login.jsx        # Page de connexion
│   ├── Dashboard.jsx    # Tableau de bord
│   ├── UploadDocument.jsx # Upload de fichiers
│   ├── Analysis.jsx     # Résultats d'analyse
│   └── Report.jsx       # Génération de rapports
├── App.jsx             # Composant principal
└── main.jsx            # Point d'entrée
```

## ⚙️ Configuration

Le proxy API est configuré dans `vite.config.js` pour rediriger les requêtes `/api` vers le backend Flask sur le port 5001.

## 🎨 Design System

- **Couleurs principales**: Bleu foncé (#1F3C88), Bleu clair (#3E92CC)
- **Typographie**: Inter/Roboto
- **Composants**: shadcn/ui avec Tailwind CSS
- **Responsive**: Mobile-first design

