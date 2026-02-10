# 🚀 GUIDE D'INSTALLATION - VL AUTOMOBILES

## ⚠️ IMPORTANT : SUIS CES ÉTAPES DANS L'ORDRE

### ÉTAPE 1 : Vérifier que Node.js est installé

1. Ouvre une invite de commande (Windows) ou un terminal (Mac/Linux)
   - **Windows** : Appuie sur `Windows + R`, tape `cmd` et appuie sur Entrée
   - **Mac** : Appuie sur `Cmd + Espace`, tape `terminal` et appuie sur Entrée
   
2. Tape cette commande et appuie sur Entrée :
   ```
   node --version
   ```

3. Tu dois voir un numéro de version comme `v18.17.0` ou `v20.10.0`
   
   ✅ **Si tu vois un numéro** : Node.js est installé, passe à l'étape 2
   
   ❌ **Si tu vois une erreur** : 
   - Va sur https://nodejs.org/
   - Télécharge la version "LTS" (recommandée)
   - Installe-la
   - Redémarre ton ordinateur
   - Recommence l'étape 1

---

### ÉTAPE 2 : Télécharger et ouvrir le projet

1. **Télécharge le fichier ZIP** que je vais te fournir
2. **Décompresse-le** dans un dossier facile à trouver (par exemple `Documents`)
3. **Ouvre Visual Studio Code**
4. Dans VS Code, clique sur `Fichier` → `Ouvrir le dossier`
5. Sélectionne le dossier `vla-automobiles` que tu viens de décompresser
6. Clique sur `Sélectionner le dossier`

---

### ÉTAPE 3 : Ouvrir le terminal dans VS Code

1. Dans VS Code, regarde en haut dans la barre de menu
2. Clique sur `Terminal` → `Nouveau Terminal`
3. En bas de VS Code, un panneau s'ouvre (c'est le terminal)

⚠️ **ATTENTION** : Vérifie que tu es bien dans le bon dossier
- Dans le terminal, tu dois voir quelque chose comme : 
  - `C:\Users\TonNom\Documents\vla-automobiles>` (Windows)
  - `~/Documents/vla-automobiles $` (Mac/Linux)

---

### ÉTAPE 4 : Installer les dépendances

1. Dans le terminal (en bas de VS Code), tape exactement cette commande :
   ```
   npm install
   ```

2. Appuie sur **Entrée**

3. **⏳ ATTENDS** : Des lignes de texte vont défiler (c'est normal)
   - Ça va prendre entre 2 et 5 minutes
   - Ne ferme rien, laisse faire
   
4. **✅ C'est terminé quand** :
   - Les lignes arrêtent de défiler
   - Tu revois le curseur clignotant prêt à taper une nouvelle commande
   - Tu vois quelque chose comme :
     ```
     added 285 packages in 2m
     ```

---

### ÉTAPE 5 : Lancer le site web

1. Dans le terminal, tape cette commande :
   ```
   npm run dev
   ```

2. Appuie sur **Entrée**

3. **⏳ ATTENDS quelques secondes**

4. **✅ C'est prêt quand** tu vois :
   ```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Ready in 2.5s
   ```

5. **Ouvre ton navigateur** (Chrome, Firefox, Safari, Edge...)

6. **Tape dans la barre d'adresse** :
   ```
   localhost:3000
   ```

7. Appuie sur **Entrée**

🎉 **TU DOIS VOIR TON SITE WEB** avec :
- Le logo VL Automobiles en haut
- Le texte "Trouver, négocier, réceptionner"
- Les boutons orange
- Toute la page d'accueil

---

### ÉTAPE 6 : Modifier le site (optionnel)

Tu peux maintenant modifier le site :

1. **Dans VS Code**, ouvre le fichier que tu veux modifier :
   - `app/page.tsx` pour la page d'accueil
   - `components/HeroSection.tsx` pour le bandeau principal
   - etc.

2. **Fais tes modifications** et sauvegarde (`Ctrl + S` ou `Cmd + S`)

3. **Retourne sur ton navigateur** : le site se recharge automatiquement !

---

### ÉTAPE 7 : Arrêter le serveur

Quand tu as fini de travailler :

1. **Retourne dans VS Code**
2. **Clique dans le terminal** (en bas)
3. **Appuie sur** `Ctrl + C` (Windows/Linux) ou `Cmd + C` (Mac)
4. **Confirme** en tapant `O` (ou `Y` en anglais) si demandé

Le serveur s'arrête, le site n'est plus accessible.

---

## 🆘 PROBLÈMES FRÉQUENTS

### ❌ "npm n'est pas reconnu..."
**Problème** : Node.js n'est pas installé ou pas dans le PATH
**Solution** : 
1. Désinstalle Node.js
2. Réinstalle-le depuis https://nodejs.org/
3. **IMPORTANT** : Coche la case "Ajouter au PATH" pendant l'installation
4. Redémarre ton ordinateur
5. Recommence depuis l'étape 1

---

### ❌ "Port 3000 is already in use"
**Problème** : Un autre programme utilise déjà le port 3000
**Solution 1** : Ferme tous les autres terminaux/invites de commande ouverts
**Solution 2** : Utilise un autre port :
```
npm run dev -- -p 3001
```
Puis va sur `localhost:3001` dans ton navigateur

---

### ❌ Les images ne s'affichent pas
**Problème** : Les images ne sont pas au bon endroit
**Solution** : 
1. Vérifie que le dossier `public/images` existe
2. Vérifie que toutes tes images sont dedans
3. Redémarre le serveur (`Ctrl + C` puis `npm run dev`)

---

### ❌ Le site ne se recharge pas automatiquement
**Problème** : Hot reload cassé
**Solution** :
1. Sauvegarde ton fichier (`Ctrl + S`)
2. Si ça ne marche toujours pas, rafraîchis manuellement le navigateur (`F5`)

---

## 📞 BESOIN D'AIDE ?

Si quelque chose ne marche pas :

1. **Lis bien le message d'erreur** dans le terminal
2. **Copie-colle le message d'erreur complet** et envoie-le moi
3. **Dis-moi à quelle étape tu es bloqué**

Je t'aiderai immédiatement !

---

## ✅ CHECKLIST AVANT DE ME CONTACTER

Avant de me demander de l'aide, vérifie que :

- [ ] Node.js est installé (`node --version` fonctionne)
- [ ] Tu es dans le bon dossier dans le terminal
- [ ] Tu as bien tapé `npm install` et attendu la fin
- [ ] Tu as bien tapé `npm run dev` (sans faute de frappe)
- [ ] Tu es allé sur `localhost:3000` dans ton navigateur
- [ ] Tu as essayé de redémarrer le serveur (`Ctrl + C` puis `npm run dev`)

---

**Bon courage ! Tu vas y arriver ! 💪**
