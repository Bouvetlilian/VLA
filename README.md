# VL Automobiles - Site Web

Site web officiel de VL Automobiles, mandataire automobile.

## 🚀 Installation et lancement du projet

### Prérequis
Assure-toi d'avoir installé :
- **Node.js** version 18 ou supérieure ([Télécharger Node.js](https://nodejs.org/))
- **Git** ([Télécharger Git](https://git-scm.com/))
- **VS Code** ([Télécharger VS Code](https://code.visualstudio.com/))

### Étape 1 : Télécharger le projet

1. Télécharge le fichier ZIP du projet
2. Décompresse-le sur ton ordinateur (par exemple dans `Documents/vla-automobiles`)
3. Ouvre VS Code
4. Dans VS Code, va dans `Fichier` → `Ouvrir le dossier` et sélectionne le dossier `vla-automobiles`

### Étape 2 : Installer les dépendances

1. Dans VS Code, ouvre le terminal intégré : 
   - Menu `Terminal` → `Nouveau Terminal`
   - Ou raccourci : `Ctrl + ù` (Windows/Linux) / `Cmd + ù` (Mac)

2. Dans le terminal, tape cette commande et appuie sur Entrée :
   ```bash
   npm install
   ```
   
   ⏳ Cela va télécharger toutes les bibliothèques nécessaires (cela peut prendre 2-3 minutes)

### Étape 3 : Lancer le serveur de développement

Une fois l'installation terminée, tape cette commande :
```bash
npm run dev
```

✅ Le site est maintenant accessible !

Ouvre ton navigateur et va sur : **http://localhost:3000**

### Étape 4 : Arrêter le serveur

Pour arrêter le serveur de développement :
- Dans le terminal, appuie sur `Ctrl + C`

## 📁 Structure du projet

```
vla-automobiles/
├── app/                      # Pages de l'application
│   ├── page.tsx             # Page d'accueil
│   ├── layout.tsx           # Layout principal (Header + Footer)
│   └── globals.css          # Styles globaux
├── components/              # Composants réutilisables
│   ├── Header.tsx           # En-tête avec navigation
│   ├── Footer.tsx           # Pied de page
│   ├── HeroSection.tsx      # Section hero (bandeau principal)
│   ├── AboutSection.tsx     # Section "Qui sommes-nous"
│   ├── TestimonialsSection.tsx  # Section témoignages
│   └── CTASection.tsx       # Section call-to-action finale
├── public/                  # Fichiers statiques (images, etc.)
│   └── images/             # Toutes les images du site
├── package.json            # Configuration npm
├── tailwind.config.js      # Configuration Tailwind (couleurs, fonts)
├── tsconfig.json           # Configuration TypeScript
└── next.config.js          # Configuration Next.js
```

## 🎨 Personnalisation

### Modifier les couleurs

Les couleurs sont définies dans `tailwind.config.js` :
```javascript
colors: {
  'vla-orange': '#FF8633',
  'vla-beige': '#F4EDDF',
  'vla-black': '#000000',
  'vla-white': '#FFFFFF',
}
```

### Modifier le texte

- **Page d'accueil** : ouvre `app/page.tsx`
- **En-tête** : ouvre `components/Header.tsx`
- **Pied de page** : ouvre `components/Footer.tsx`
- **Sections** : ouvre les fichiers correspondants dans `components/`

### Ajouter/Modifier des images

Place tes images dans le dossier `public/images/` et utilise-les comme ceci :
```tsx
<Image src="/images/nom-de-ton-image.jpg" alt="Description" />
```

## 🔧 Commandes utiles

```bash
# Lancer le serveur de développement
npm run dev

# Créer une version de production
npm run build

# Lancer la version de production
npm start

# Vérifier les erreurs de code
npm run lint
```

## 📱 Responsive Design

Le site est entièrement responsive et s'adapte automatiquement :
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🚀 Déploiement sur Vercel (Étapes futures)

1. Crée un compte sur [Vercel](https://vercel.com)
2. Connecte ton projet GitHub
3. Vercel déploiera automatiquement le site à chaque modification

## ⚡ Technologies utilisées

- **Next.js 14** - Framework React avec optimisations SEO
- **TypeScript** - JavaScript typé pour moins d'erreurs
- **Tailwind CSS** - Framework CSS utilitaire
- **Montserrat** - Police Google Fonts

## 🆘 Problèmes courants

### Le site ne se lance pas
- Vérifie que Node.js est bien installé : `node --version`
- Supprime le dossier `node_modules` et retape `npm install`

### Les images ne s'affichent pas
- Vérifie que les images sont bien dans `public/images/`
- Vérifie que le chemin commence par `/images/` (avec le slash)

### Erreur "Port 3000 already in use"
- Un autre processus utilise déjà le port 3000
- Soit arrête-le, soit utilise : `npm run dev -- -p 3001`

## 📞 Aide

Si tu rencontres des problèmes :
1. Lis bien les messages d'erreur dans le terminal
2. Vérifie que toutes les étapes d'installation sont complétées
3. Redemande-moi de l'aide en copiant le message d'erreur exact

## 🎯 Prochaines étapes

Une fois la page d'accueil validée, nous développerons :
- [ ] Page catalogue avec recherche avancée
- [ ] Page détail véhicule
- [ ] Formulaire "Acheter un véhicule"
- [ ] Formulaire "Vendre mon véhicule"
- [ ] Backend admin avec authentification
- [ ] Base de données pour les annonces

---

**Développé pour VL Automobiles** 🚗
