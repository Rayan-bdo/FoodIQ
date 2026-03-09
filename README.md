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
