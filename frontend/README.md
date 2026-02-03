# 📚 Book Analyzer Frontend

Interface web moderne et intuitive pour le système d'analyse de livres.

## 🎯 Fonctionnalités

- **Interface élégante** avec design moderne et responsive
- **Saisie intuitive** du nom du livre avec suggestions
- **Affichage complet** des résultats d'analyse
- **Lecteur audio** intégré pour écouter les résumés
- **Téléchargement** des fichiers MP3 générés
- **Gestion des erreurs** avec messages clairs
- **Loading states** avec animations fluides

## 🚀 Utilisation

### Option 1: Ouvrir directement (plus simple)
1. Double-cliquez sur `index.html`
2. Le navigateur s'ouvre automatiquement
3. Commencez à analyser des livres !

### Option 2: Serveur local (recommandé)
```bash
cd frontend

# Avec Python 3
python -m http.server 8080

# Ou avec Node.js
npx serve .

# Ou avec PHP
php -S localhost:8080
```

Puis ouvrez `http://localhost:8080` dans votre navigateur.

## 🔧 Configuration

L'interface se connecte automatiquement à votre webhook n8n :
- **URL**: `http://localhost:5678/webhook/analyze-book`

Pour modifier l'URL, éditez la ligne 425 dans `index.html` :
```javascript
const API_BASE = 'http://localhost:5678/webhook/analyze-book';
```

## 📱 Compatibilité

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile responsive

## 🎨 Personnalisation

### Changer les couleurs
Modifiez les variables CSS dans la section `<style>` :
```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Ajouter des suggestions
Modifiez la section `.suggestion-chips` dans le HTML :
```html
<div class="chip" data-book="Votre Livre">Votre Livre</div>
```

### Modifier l'API
Changez la constante `API_BASE` dans le JavaScript.

## 🐛 Dépannage

### Problème CORS
Si vous avez des erreurs CORS, assurez-vous que votre MCP server autorise les requêtes depuis votre domaine.

### Connexion refusée
Vérifiez que :
- n8n est démarré (`http://localhost:5678`)
- Le workflow est activé
- Le webhook est correctement configuré

### Audio ne fonctionne pas
- Vérifiez que le MCP server génère bien des fichiers audio
- Vérifiez les liens de téléchargement dans les résultats

## 📸 Captures d'écran

L'interface inclut :
- Page d'accueil avec champ de recherche
- Suggestions de livres populaires
- Affichage des informations du livre
- Résumé et idées clés
- Lecteur audio intégré

---

**Prêt à analyser des livres en toute simplicité !** 🚀
