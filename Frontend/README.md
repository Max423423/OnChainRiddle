# Frontend - OnchainRiddle

## 🧪 Stratégie de Tests

### ✅ Tests Unitaires Frontend

Les tests unitaires frontend testent la logique métier et les composants de manière isolée :

#### 1. **Tests de Composants** - Priorité Haute
```bash
# Lancer les tests unitaires
npm test
```

**Avantages :**
- Testent la logique d'affichage conditionnel
- Vérifient les interactions utilisateur
- Testent la gestion d'état
- Tests rapides et fiables

**Exemples de tests :**
```javascript
// Tests du composant RiddleGame
- Affichage conditionnel selon l'état du wallet
- Interactions utilisateur (clics, formulaires)
- Gestion des erreurs
- Accessibilité et structure UI
```

#### 2. **Tests de Hooks** - Priorité Haute
```javascript
// Tests du hook useWallet
- État initial du wallet
- Connexion/déconnexion
- Gestion des événements MetaMask
- Gestion des erreurs
```

#### 3. **Tests d'Utilitaires** - Priorité Moyenne
```javascript
// Tests des fonctions de validation
- Validation d'adresses Ethereum
- Validation de noms de joueurs
- Validation de réponses
- Formatage d'adresses
```

### 🎯 Avantages des Tests Unitaires

#### ✅ Ce qu'ils testent :
- **Logique métier** - Validation, formatage, gestion d'état
- **Composants isolés** - Affichage, interactions, accessibilité
- **Hooks personnalisés** - Gestion d'état, effets secondaires
- **Utilitaires** - Fonctions pures, validation

#### ❌ Ce qu'ils ne remplacent PAS :
- **Tests d'intégration** - Flux complet utilisateur
- **Tests de contrats** - Smart contracts
- **Tests E2E** - Expérience utilisateur complète

### 🚀 Mise en Place

#### Tests de Composants
```bash
# Lancer tous les tests
npm test

# Lancer en mode watch
npm test -- --watch

# Lancer avec couverture
npm test -- --coverage
```

#### Tests de Hooks
```bash
# Tests spécifiques aux hooks
npm test -- useWallet
```

#### Tests d'Utilitaires
```bash
# Tests spécifiques aux utilitaires
npm test -- validation
```

### 📊 Structure des Tests

```
src/
├── presentation/
│   ├── components/
│   │   └── RiddleGame.test.tsx    # Tests du composant principal
│   └── hooks/
│       └── useWallet.test.tsx     # Tests du hook wallet
└── shared/
    └── utils/
        └── validation.test.ts     # Tests des utilitaires
```

### 🎯 Priorités de Tests

#### 1. **Tests de Composants** (Priorité Haute)
- Affichage conditionnel
- Interactions utilisateur
- Gestion des erreurs
- Accessibilité

#### 2. **Tests de Hooks** (Priorité Haute)
- Gestion d'état
- Effets secondaires
- Événements externes
- Gestion d'erreurs

#### 3. **Tests d'Utilitaires** (Priorité Moyenne)
- Fonctions pures
- Validation
- Formatage
- Logique métier

### 💡 Bonnes Pratiques

#### 1. **Tests isolés**
```typescript
// Chaque test doit être indépendant
beforeEach(() => {
  // Reset des mocks et état
});
```

#### 2. **Mocks appropriés**
```typescript
// Mocker les dépendances externes
jest.mock('../hooks/useWallet', () => ({
  useWallet: () => mockUseWallet
}));
```

#### 3. **Assertions claires**
```typescript
// Tester le comportement, pas l'implémentation
expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
```

### 🔄 Intégration avec le Workflow

#### 1. **Avant chaque commit**
```bash
npm test
```

#### 2. **Tests de régression**
```bash
npm test -- --watchAll=false
```

#### 3. **Couverture de code**
```bash
npm test -- --coverage --watchAll=false
```

### 📈 Métriques de Qualité

- **Couverture de code** : % de code testé
- **Tests passants** : Tous les tests verts
- **Temps d'exécution** : Tests rapides (< 30s)
- **Maintenabilité** : Tests faciles à maintenir

### 🎯 Résultat

Cette approche de tests unitaires offre :
- ✅ **Tests rapides** et fiables
- ✅ **Couverture ciblée** des fonctionnalités critiques
- ✅ **Maintenance facile** et coût réduit
- ✅ **Détection de régressions** efficace
- ✅ **Documentation vivante** du code

Les tests unitaires complètent parfaitement les tests de contrats et offrent une assurance qualité pour la logique frontend. 