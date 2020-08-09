# Esp32Manager

*Lisez ceci dans d'autres langues: [English](README.md)*

Projet IOT 2020 M1

Chaque arduino représente une série de capteurs.
Ces arduino relèveront des paramètres, qui alimenteront un dataset :
température,
lumière.

Afin de pouvoir émettre des prédictions, il faut préalablement créer un dataset, afin que notre modèle de machine learning puisse s’entraîner et faire des prédictions en direct suivant nos capteurs.
L’état de la machine, l’évolution des capteurs et l’évolution de nos prédictions seront visible sur un site internet.
Si l’état de la machine est reconnu comme en panne, une diode clignotera sur une arduino « mère », pour requérir une intervention humaine sur l’un des capteurs, afin de régler le problème et donc, réparer la machine.

## Lancement

### Backend

Il faut avoir Mongodb sur localhost:27017

Si c'est la première exécution il faut exécuter le script init_database.js pour créer les collections :

```bash
cd back
mongo < init_database.js
```

Puis pour lancer le backend :

```bash
cd back
npm install
npm start
```

### Machine Learning

Il faut avoir python 2.7 ou supérieur installée sur la machine ainsi que de pip

Aprés il suffit d'exécuter les commandes suivantes pour que les algorithmes de machine learning puissent tourner

```bash
cd machine\ learning
pip install -r requirements.txt
```

### Frontend

```bash
cd front
npm install
npm run serve
```

Le frontend sera sur localhost:8080
