# Klaro — Module "Demandes d'aide financière"

Implémentation fullstack d'un module de gestion des demandes d'aide financière, développé avec NestJS 9 + PostgreSQL (backend) et Angular 15 + Angular Material (frontend).

---

## Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 18
- Angular CLI 15
- npm

### Backend

```bash
cd backend
npm install
```

Créer la base de données PostgreSQL :
```sql
CREATE DATABASE klaro_test;
```

Mettre à jour les identifiants de connexion dans `src/app.module.ts` :
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'tonmotdepasse',
  database: 'klaro_test',
  entities: [AidRequest],
  synchronize: true,
})
```

Démarrer le backend :
```bash
npm run start:dev
```

L'API sera disponible sur `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application sera disponible sur `http://localhost:4200`.

---

## Endpoints API

### POST `/aid-requests`
Créer une nouvelle demande (statut initial : PENDING).

**Body :**
```json
{
  "beneficiaryId": "00000000-0000-0000-0000-000000000001",
  "category": "FOOD",
  "amount": 150,
  "description": "Besoin d'aide pour les courses du mois"
}
```

### GET `/aid-requests?beneficiaryId=...&status=...&page=1&limit=10`
Lister les demandes avec filtres optionnels et pagination.

### PATCH `/aid-requests/:id/status`
Mettre à jour le statut d'une demande (transitions valides uniquement).

**Body :**
```json
{
  "status": "UNDER_REVIEW"
}
```

---

## Règles métier

- Le montant doit être strictement positif et plafonné à 5 000€
- Un bénéficiaire ne peut pas avoir plus de 2 demandes actives (PENDING ou UNDER_REVIEW) simultanément
- Transitions de statut autorisées :
  - `PENDING` → `UNDER_REVIEW` ou `REJECTED`
  - `UNDER_REVIEW` → `APPROVED` ou `REJECTED`
  - Toute autre transition retourne une erreur 400 avec un message explicite

---

## Choix techniques et compromis

### Accès base de données — TypeORM
J'ai choisi TypeORM avec le driver `pg` natif car il s'intègre naturellement dans l'écosystème NestJS, offre un typage TypeScript fort via les décorateurs, et garde l'architecture simple pour ce périmètre. `synchronize: true` est activé uniquement en développement pour générer automatiquement les tables — à désactiver en production et remplacer par des migrations.

### Auth — Mocked
Firebase Auth est simulé via `AuthMockService` qui retourne un `currentUserId` et un `currentRole` codés en dur. En production, cela serait remplacé par `firebase.auth().currentUser.uid` et un custom claim Firebase pour la gestion des rôles.

### CORS
CORS activé dans `main.ts` pour autoriser les requêtes depuis `http://localhost:4200` en développement.

---

## Ce que j'aurais fait avec plus de temps

### Frontend
- **NgRx** : Mise en place d'un store NgRx avec actions, reducers, selectors et effects pour remplacer les BehaviorSubjects. Cela apporterait une gestion d'état plus robuste, un historique des mutations, et une meilleure séparation des responsabilités à mesure que l'application grandit.
- **Architecture plus avancée** : Séparation claire des enums et interfaces dans des fichiers dédiés (`enums/`, `interfaces/`) pour une meilleure maintenabilité et réutilisabilité entre modules.

### Backend
- **Séparation des enums et interfaces** : Avec un seul service dans ce test, il était plus simple et pragmatique de tout regrouper dans le même module. Avec plus de temps et plusieurs modules, j'aurais séparé les enums (`aid-category.enum.ts`, `aid-status.enum.ts`) et les interfaces dans des dossiers partagés (`src/common/enums/`, `src/common/interfaces/`).
- **Migrations TypeORM** : Remplacer `synchronize: true` par des migrations versionnées pour un environnement de production.
- **Variables d'environnement** : Utiliser `@nestjs/config` avec un fichier `.env` pour les credentials PostgreSQL.
- **Docker Compose** : Conteneuriser le backend et la base de données pour un démarrage en une commande.

---

## Partie 3 — Réflexion technique

### 1. Migration Angular 15 → 19 : difficultés majeures

La première difficulté est l'adoption des **Standalone Components** introduits progressivement depuis Angular 14 et devenus la norme en v17+. Migrer une app basée sur NgModules demande une refonte de la structure des imports dans chaque composant. La deuxième difficulté concerne les **Signals**, le nouveau système de réactivité d'Angular 19 qui remplace progressivement RxJS dans les templates — cela implique de revoir la logique des BehaviorSubjects et des async pipes. Je procéderais par étapes : d'abord `ng update` version par version (15→16→17→18→19), puis migration vers les Standalone Components, et enfin adoption progressive des Signals sur les nouveaux composants sans réécrire l'existant d'un coup.

### 2. Hasura + NestJS : quand utiliser l'un plutôt que l'autre ?

Je préconise d'utiliser **Hasura directement** pour les opérations CRUD simples sans logique métier — par exemple, récupérer la liste des demandes filtrées par statut pour l'écran gestionnaire (`GET /aid-requests`). Hasura génère automatiquement les queries GraphQL sur PostgreSQL, ce qui évite d'écrire un endpoint REST dans NestJS pour une simple lecture de données. En revanche, je passe par **NestJS** pour tout ce qui implique des règles métier : la création d'une demande (`POST /aid-requests`) avec la vérification du plafond de 2 demandes actives, ou la mise à jour du statut avec la validation des transitions autorisées. Ces logiques ne peuvent pas être exprimées dans Hasura sans passer par des Event Triggers ou des Actions, ce qui devient vite complexe à maintenir.

### 3. BehaviorSubject vs NgRx/Signals

Pour une application de cette taille avec un seul service, le **BehaviorSubject** est le choix pragmatique : simple, lisible, et suffisant. Si l'équipe veut évoluer vers une solution plus robuste, je proposerais **NgRx** avec le pattern Store/Actions/Reducers/Effects pour les raisons suivantes : traçabilité complète des mutations d'état via les DevTools, séparation claire entre la logique métier (effects) et la logique d'état (reducers), et meilleure scalabilité quand plusieurs composants partagent le même état. Une alternative plus légère serait **NgRx ComponentStore** pour un état local par feature, ou les **Signals Angular** (v17+) si l'équipe migre vers Angular 19, car ils offrent une réactivité fine-grained sans la verbosité de NgRx.
