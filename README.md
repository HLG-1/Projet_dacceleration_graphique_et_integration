# Book Analyzer - Système Complet d'Analyse de Livres

Un système automatisé **production-ready** utilisant une architecture moderne avec **interface web**, **n8n workflows**, et **MCP Server** pour analyser des livres et générer des résumés audio de haute qualité.

## **Fonctionnalités Complètes**

- **Interface web moderne** et intuitive
- **Recherche automatique** via Open Library API (gratuite) et Google Books API (fallback)  
- **Analyse intelligente** avec LLM (Groq/Claude/OpenAI)
- **Résumé structuré** et 7 idées clés
- **Génération audio** MP3 (Speechify/OpenAI/HuggingFace)
- **Design responsive** (mobile/desktop)
- **Workflow n8n** automatisé
- **API RESTful** complète

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE WEB                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Frontend (HTML/CSS/JS)                    │   │
│  │        - Recherche intuitive                         │   │
│  │        - Affichage résultats                          │   │
│  │        - Lecteur audio intégré                        │   │
│  └─────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP POST /webhook-test/analyze-book
                      ▼
┌─────────────────────┴───────────────────────────────────────┐
│               n8n Workflow Manager                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ Webhook     │ │ Validation  │ │ HTTP Request        │   │
│  │ Trigger     │ │ Title       │ │ MCP Server          │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP POST /analyze
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP Server (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           BookAnalyzerAgent                           │   │
│  │        (Orchestration & Intelligence)                │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │                                       │
│    ┌───────────────┼───────────────┬─────────────────┐     │
│    ▼               ▼               ▼                 ▼     │
│ │Search   │   │Scrape   │   │Analyze  │   │TTS      │   │
│ │Book     │   │Content  │   │Text     │   │Audio    │   │
│ └─────────┘   └─────────┘   └─────────┘   └─────────┘   │
│    │               │               │                 │     │
│    ▼               ▼               ▼                 ▼     │
│ Open           Cheerio       Groq/Claude     Speechify     │
│ Library API                   OpenAI          OpenAI        │
│ + Google                                             │
│ Books API                                            │
└─────────────────────────────────────────────────────────────┘
```

## Installation Rapide

### Prérequis
- **Node.js** 18+ 
- **npm** ou yarn
- **n8n** (Docker ou local)
- **Python 3** (pour le frontend)
- **Clés API** requises

### 1. Configuration du MCP Server

```bash
cd mcp-server

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
nano .env
```

#### Configuration `.env`

```env
# === LLM CONFIGURATION ===
LLM_PROVIDER=groq                    # Options: groq, anthropic, openai
LLM_MODEL=llama-3.3-70b-versatile    # Modèle Groq recommandé
GROQ_API_KEY=votre_clé_groq
# ANTHROPIC_API_KEY=votre_clé_anthropic
# OPENAI_API_KEY=votre_clé_openai

# === TTS CONFIGURATION ===
TTS_PROVIDER=speechify               # Options: speechify, openai, huggingface
TTS_VOICE=henry                      # Voix: henry, mia, george...
SPEECHIFY_API_KEY=votre_clé_speechify
# OPENAI_API_KEY=votre_clé_openai     # Pour TTS OpenAI
# HF_API_KEY=votre_clé_huggingface   # Pour TTS HuggingFace

# === SERVER CONFIGURATION ===
PORT=3000
NODE_ENV=development
DEBUG=true

# === SEARCH APIs ===
# Open Library API (gratuite, priorité) - Pas de clé requise
# Google Books API (fallback) - Optionnel avec clé
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
```

### API de Recherche de Livres

Le système utilise deux sources pour la recherche de livres :

#### 1. Open Library API (Primaire - Gratuite)
- **Aucune clé API requise**
- **30+ millions de livres**
- **Images de couverture**
- **Données bibliographiques complètes**
- **URL** : `https://openlibrary.org/search.json`

#### 2. Google Books API (Fallback)
- **Clé API requise** (optionnel)
- **Complémentaire à Open Library**
- **Configuration** : `GOOGLE_BOOKS_API_KEY=votre_clé`

**Note** : Le système fonctionne parfaitement avec Open Library API seule.

### 2. Démarrer le MCP Server

```bash
npm start
# Ou en développement: npm run dev
```

**Serveur actif sur :** `http://localhost:3000`

### 3. Configurer n8n

#### Option A : Installation Locale
```bash
npm install n8n -g
n8n start
```

#### Option B : Docker (Recommandé)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 4. Importer le Workflow n8n

1. Ouvrir n8n : `http://localhost:5678`
2. **Create New Workflow**
3. **...** → **Import from File**
4. Sélectionner `n8n-workflows/book-analyzer-main.json`
5. **Activate Workflow**

### 5. Démarrer l'Interface Web

```bash
cd frontend

# Démarrer le serveur web
python -m http.server 8080
```

**Interface disponible sur :** `http://localhost:8080`

##  Utilisation

### Interface Web (Recommandé)

1. **Ouvrez votre navigateur** : `http://localhost:8080`
2. **Entrez un nom de livre** ou cliquez sur les suggestions
3. **Cliquez sur "Analyser"**
4. **Explorez les résultats** :
   - Informations complètes du livre
   - Résumé détaillé
   - 7 idées clés numérotées
   - Lecteur audio intégré
   - Téléchargement MP3

### API Direct (Développeurs)

#### Via n8n Webhook
```bash
curl -X POST http://localhost:5678/webhook-test/analyze-book \
  -H "Content-Type: application/json" \
  -d '{"bookTitle": "Atomic Habits"}'
```

#### Via MCP Server Direct
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"bookTitle": "The Great Gatsby"}'
```

### Réponse Complète

```json
{
  "success": true,
  "bookInfo": {
    "title": "Atomic Habits",
    "authors": ["James Clear"],
    "publishedDate": "2018-10",
    "categories": ["Self-Help"],
    "pageCount": 320,
    "isbn": "9780735211292",
    "thumbnail": "https://...",
    "infoLink": "https://..."
  },
  "analysis": {
    "summary": "Atomic Habits offers a revolutionary system...",
    "keyIdeas": [
      "Small changes compound over time...",
      "The four laws of behavior change...",
      "Environment shapes behavior...",
      "Identity-based habits are sustainable...",
      "The plateau of latent potential...",
      "Habit stacking implementation...",
      "The 1% improvement principle..."
    ]
  },
  "audio": {
    "filename": "atomic_habits_summary.mp3",
    "path": "/path/to/audio.mp3",
    "sizeKB": 394.92,
    "duration": "~56s"
  },
  "metadata": {
    "analyzedAt": "2026-01-28T13:17:11.321Z",
    "llmProvider": "groq",
    "llmModel": "llama-3.3-70b-versatile"
  }
}
```

## API MCP Server

### Endpoints Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | Vérifier l'état du serveur |
| `GET` | `/tools` | Lister les outils disponibles |
| `POST` | `/analyze` | Analyser un livre (principal) |
| `POST` | `/tool/:toolName` | Exécuter un outil spécifique |
| `GET` | `/audio/:filename` | Télécharger un fichier audio |
| `GET` | `/audio/:filename/base64` | Obtenir l'audio en base64 |

### Exemples d'Utilisation

#### Analyser un livre
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"bookTitle": "Thinking, Fast and Slow"}'
```

#### Utiliser un outil spécifique
```bash
# Rechercher un livre
curl -X POST http://localhost:3000/tool/searchBook \
  -H "Content-Type: application/json" \
  -d '{"title": "The Lean Startup"}'

# Analyser du texte
curl -X POST http://localhost:3000/tool/analyzeText \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your content here...",
    "bookTitle": "Test Book"
  }'
```

## Tests et Débogage

### Tests Automatisés

```bash
cd mcp-server

# Tester tous les outils
npm test

# Test d'intégration complet
npm run test:integration
```

### Tests Manuels

```bash
# Test de santé du serveur
curl http://localhost:3000/health

# Test d'analyse complet
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"bookTitle": "1984"}'

# Télécharger l'audio généré
curl -O http://localhost:3000/audio/1984_summary.mp3
```

## Structure du Projet

```
book-analyzer-project/
├── 📁 mcp-server/                    # Serveur MCP principal
│   ├── 📄 server.js                 # Serveur Express
│   ├── 📄 agent.js                  # Agent intelligent
│   ├── 📄 config.js                 # Configuration
│   ├── 📄 package.json              # Dépendances
│   ├── 📄 .env                      # Variables d'environnement
│   ├── 📁 tools/                    # Outils MCP
│   │   ├── 📄 index.js              # Export des outils
│   │   ├── 📄 searchBook.js         # Recherche Google Books
│   │   ├── 📄 scrapeContent.js      # Extraction web
│   │   ├── 📄 analyzeText.js        # Analyse IA
│   │   └── 📄 textToSpeech.js       # Génération audio
│   └── 📁 output/                   # Fichiers générés
│       └── 📁 audio/                # Fichiers MP3
├── 📁 frontend/                     # Interface web utilisateur
│   ├── 📄 index.html               # Application web complète
│   ├── 📄 README.md                # Documentation frontend
│   └── 📄 style.css                # Styles (intégrés dans HTML)
├── 📁 n8n-workflows/                # Workflows n8n
│   └── 📄 book-analyzer-main.json   # Workflow principal
├── 📁 docs/                         # Documentation technique
├── 📁 tests/                        # Tests automatisés
└── 📄 README.md                     # Ce fichier
```

## Sécurité et Performance

### Sécurité
- ✅ **Rate limiting** : 10 requêtes/minute par IP
- ✅ **Timeout** : 60 secondes par analyse
- ✅ **Validation** des entrées strictes
- ✅ **Pas de stockage** de contenus complets (respect copyright)
- ✅ **CORS** configuré pour les origines autorisées

### Performance
-  **Analyse complète** en ~30-60 secondes
-  **Génération audio** en ~10-20 secondes
-  **Cache** des réponses Google Books
-  **Async/await** pour les opérations longues

##  Fonctionnalités

###  **Implémentées et Testées**
- [x] **Interface web moderne** avec design responsive
- [x] **Recherche automatique** via Google Books API
- [x] **Multi-LLM** : Groq, Claude, OpenAI
- [x] **Multi-TTS** : Speechify, OpenAI, HuggingFace
- [x] **Workflow n8n** complet avec gestion d'erreurs
- [x] **API RESTful** complète
- [x] **Gestion audio** : MP3, base64, streaming
- [x] **Validation** robuste des entrées
- [x] **Logs** détaillés pour débogage
- [x] **Architecture modulaire** extensible
- [x] **Suggestions de livres** intégrées
- [x] **Lecteur audio** natif dans le navigateur
- [x] **Téléchargement** des fichiers MP3

###  **Extensions Possibles**
- [ ] **Base de données** pour historique des analyses
- [ ] **Authentification** utilisateur
- [ ] **Analyses comparatives** de livres
- [ ] **Export PDF** des analyses
- [ ] **Intégrations** : Slack, Discord, Notion
- [ ] **Support multilingue**

## Dépannage

### Problèmes Communs

#### Le serveur ne démarre pas
```bash
# Vérifier les clés API
cat .env

# Vérifier les logs
npm start
```

#### Erreur "API key invalid"
- Vérifiez les clés dans `.env`
- Vérifiez les quotas API
- Testez avec un autre provider

#### n8n ne se connecte pas
```bash
# Vérifier que MCP server tourne
curl http://localhost:3000/health

# Vérifier l'URL dans le workflow n8n
# Doit être: http://host.docker.internal:3000/analyze
```

#### Audio ne se génère pas
- Vérifiez la clé TTS dans `.env`
- Testez avec un autre provider TTS
- Consultez les logs du serveur

#### Fichier audio corrompu
- Supprimez l'ancien fichier : `rm output/audio/*.mp3`
- Redémarrez le serveur
- Réessayez l'analyse

##  Documentation Complémentaire

- [**Architecture Détaillée**](docs/ARCHITECTURE.md) - Architecture technique complète
- [**Documentation API**](docs/API.md) - Référence API complète
- [**Guide de Développement**](docs/DEVELOPMENT.md) - Contribuer au projet
- [**Scénarios de Test**](tests/test-scenarios.md) - Cas d'usage détaillés

## Contribuer

1. **Fork** le projet
2. **Créer** une branche feature : `git checkout -b feature/nouvelle-fonction`
3. **Commit** vos changements : `git commit -am 'Ajout nouvelle fonctionnalité'`
4. **Push** : `git push origin feature/nouvelle-fonction`
5. **Pull Request** avec description détaillée


## Remerciements

- **Groq** - LLM ultra-rapide et économique
- **Speechify** - TTS avec voix naturelles
- **n8n Community** - Workflow automation
- **Google Books API** - Base de données livres mondiale


##  Quick Start (5 minutes)

```bash
# 1. Cloner et configurer le MCP Server
git clone <repo-url>
cd book-analyzer-project/mcp-server
npm install

# 2. Configurer les clés API
cp .env.example .env
# Éditer .env avec vos clés Groq + Speechify

# 3. Démarrer MCP Server
npm start                    # http://localhost:3000

# 4. Démarrer n8n (nouveau terminal)
docker run -p 5678:5678 n8nio/n8n
# Importer n8n-workflows/book-analyzer-main.json

# 5. Démarrer l'interface web (nouveau terminal)
cd ../frontend
python -m http.server 8080

# 6. Utiliser !
# Ouvrir http://localhost:8080
# Taper "Atomic Habits" et cliquer "Analyser"


##  **État du Projet**

**PROJET TERMINÉ ET FONCTIONNEL**

- Interface web intuitive
- Analyse complète avec IA
- Génération audio automatique  
- Workflow n8n automatisé
- Documentation complète

**Prêt pour la production !** 

---