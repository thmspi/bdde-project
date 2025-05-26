# Projet Graphe Groupe E-5


## Aperçu Projet 
Ce projet de Base de données avancées permet à un utilisateur de : 
- Voir la description de différents jeux de société ;
- Se créer un compte et modifier ses identifiants ;
- Noter un jeu et y mettre un avis ;
- Mettre en favoris un jeu de société que nous avons apprécié ;
- Voir ses favoris.




## Structure Projet 
- `app.js` : Application de notre site web qui fait l'appel à la BDD.
- `account.js` : gère les appels vers la BDD de tous les éléments liés au compte d'un utilisateur
- `game.js` : gère les appels vers la BDD de tous les éléments liés au jeu de société
- `index.js` : gère les appels vers la BDD de tous les éléments liés au recherche d'un jeu

- Document views : contient tous les fichiers pug qui affiche les pages web à l'écran


## Comment run le projet

1. Copier le projet sur son PC : git clone https://github.com/thmspi/bdde-project.git
2. Assurez-vous d'avoir les modules node et npm d'installer
	- node install
	- npm install
3. Connectez-vous à la BDD en remplissant les informations de la page app.js 
		const db = mysql.createConnection({
   			host: 'localhost',
   			user: 'root',
   			database: 'BDDA-project',
   			password: '',
		});
4. Lancer le projet dans le terminal avec la commande : npm run start


## Membres du Groupe
- Romain PREVOT
- Théo BRACQUEMART
- Thomas DOS SANTOS
- Thomas PICOU
