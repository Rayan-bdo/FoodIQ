# FoodIQ

**FoodIQ** est une application développée dans le cadre d’un **Projet de Fin d’Année (PFA)** à **ESISA**. L’objectif principal de ce projet est de créer une plateforme permettant aux utilisateurs d’obtenir rapidement des informations claires et utiles sur les produits alimentaires qu’ils consomment. L’application permettra notamment de **scanner le code-barres d’un produit alimentaire** afin d’accéder instantanément à ses **informations nutritionnelles**, d’obtenir une **analyse de sa qualité pour la santé**, et de **comparer son prix dans les magasins proches**.

## Contexte et problème

Aujourd’hui, les consommateurs sont de plus en plus attentifs à leur alimentation et à la qualité des produits qu’ils achètent. Cependant, les informations présentes sur les emballages alimentaires sont souvent **complexes, difficiles à comprendre ou peu visibles**. Il devient donc difficile pour un consommateur de savoir rapidement si un produit est bon ou mauvais pour la santé.

En parallèle, les prix des produits alimentaires peuvent varier d’un magasin à un autre. Il est donc également compliqué pour les consommateurs de **trouver rapidement le meilleur prix pour un produit donné**, surtout lorsqu’ils se trouvent dans un magasin ou qu’ils font leurs courses.

Ces problèmes montrent le besoin d’un outil simple permettant de **centraliser les informations nutritionnelles et économiques des produits alimentaires** afin d’aider les consommateurs à prendre de meilleures décisions.

## Solution proposée

Pour répondre à ces problématiques, le projet **FoodIQ** propose une application qui permet aux utilisateurs de **scanner le code-barres d’un produit alimentaire** à l’aide de leur téléphone ou d’une interface web. Une fois le produit scanné, l’application affiche différentes informations importantes telles que :

- Les **valeurs nutritionnelles du produit** (calories, sucre, sel, matières grasses, protéines, etc.)
- Les **ingrédients et additifs présents dans le produit**
- Une **analyse de la qualité nutritionnelle** permettant d’évaluer si le produit est sain ou non
- Une **comparaison des prix dans les magasins proches** afin d’identifier le magasin proposant le meilleur prix

L’objectif est de fournir aux utilisateurs une **vision claire, rapide et accessible** des produits alimentaires afin de les aider à faire des choix plus sains et plus économiques.

## Fonctionnalités principales

L’application FoodIQ proposera plusieurs fonctionnalités principales :

- **Scan de code-barres** pour identifier rapidement un produit alimentaire
- **Affichage des informations nutritionnelles détaillées**
- **Analyse de la qualité nutritionnelle du produit**
- **Identification des additifs et ingrédients**
- **Comparaison des prix dans les magasins proches**
- **Historique des produits scannés**
- **Assistant intelligent basé sur l’IA** permettant de répondre aux questions des utilisateurs concernant la nutrition ou les produits alimentaires

L’intégration d’un assistant basé sur l’intelligence artificielle permettra aux utilisateurs de poser des questions telles que :

- Ce produit est-il bon pour la santé ?
- Existe-t-il une alternative plus saine ?
- Quels sont les effets de certains ingrédients ?

Cela permettra d’améliorer l’expérience utilisateur et d’apporter un **accompagnement personnalisé**.

## Technologies utilisées

Le projet est développé avec la **stack MERN**, qui est une architecture moderne et largement utilisée pour le développement d’applications web.

### Frontend
Le frontend de l’application est développé avec **React.js**, qui permet de créer une interface utilisateur dynamique, rapide et interactive.

Technologies utilisées :
- React.js
- HTML
- CSS
- JavaScript

### Backend
Le backend de l’application est développé avec **Node.js** et **Express.js**, qui permettent de gérer la logique serveur, les requêtes API et la communication avec la base de données.

Technologies utilisées :
- Node.js
- Express.js
- REST API

### Base de données
Les données de l’application seront stockées dans **MongoDB**, une base de données NoSQL adaptée aux applications web modernes.

### Autres outils et services
Le projet peut également utiliser :
- une **API externe** pour récupérer les informations nutritionnelles des produits
- un **scanner de code-barres**
- une **API d’intelligence artificielle** pour l’assistant conversationnel

## Architecture du projet

Le projet suit une architecture classique basée sur la séparation entre le frontend et le backend.


🔐 Sécurité de l’application

La sécurité constitue un aspect essentiel du projet FoodIQ, notamment en raison de la gestion des données utilisateurs, des interactions avec des API externes et de l’exposition de services via une API web. Plusieurs mécanismes ont été mis en place afin de garantir la confidentialité, l’intégrité et la disponibilité des données.

🔑 Authentification et gestion des sessions

L’authentification des utilisateurs est basée sur l’utilisation de JSON Web Tokens (JWT) stockés de manière sécurisée dans des cookies HTTP.

Utilisation de cookies avec les attributs HttpOnly, Secure et SameSite pour limiter les attaques XSS et CSRF
Vérification du token côté serveur pour sécuriser les routes protégées
Gestion des accès selon les rôles (utilisateur, administrateur)
🛡️ Protection des API

Afin de protéger les endpoints de l’API contre les abus et les attaques :

Mise en place d’un rate limiting pour limiter le nombre de requêtes par utilisateur (protection contre les attaques DoS)
Validation et sanitisation des données entrantes pour éviter les injections (NoSQL injection, XSS)
Utilisation de middlewares de sécurité (ex : helmet) pour sécuriser les headers HTTP
🔒 Sécurisation des données
Les mots de passe des utilisateurs sont hachés (bcrypt) avant stockage en base de données
Aucune donnée sensible n’est stockée en clair
Les variables sensibles (clés API, secrets JWT) sont stockées dans des variables d’environnement (.env)
🌐 Sécurité des communications
Utilisation du protocole HTTPS pour chiffrer les échanges entre le client et le serveur
Protection contre les attaques de type Man-in-the-Middle
🚫 Protection contre les abus et la fraude

Dans le contexte spécifique de FoodIQ, des mécanismes sont envisagés pour limiter les usages frauduleux :

Détection de requêtes anormales ou répétitives (bot, scraping abusif)
Vérification de la cohérence des données liées aux codes-barres (ex : produits dupliqués ou incohérents)
Limitation des appels aux API externes pour éviter les abus
🔍 Bonnes pratiques de développement sécurisé
Séparation claire entre frontend et backend
Utilisation de dépendances maintenues et mises à jour régulièrement
Principe du moindre privilège dans l’accès aux ressources
Gestion centralisée des erreurs pour éviter les fuites d’informations sensibles
