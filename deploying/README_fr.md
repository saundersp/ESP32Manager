# Deployment sur serveur distant

*Lisez ceci dans d'autres langues: [English](README.md)*

## Dépendances

Il faut avoir installée au préalable NodeJS ainsi que serve

```bash
npm i -g serve
```

Les service sont configurée pour le répo git soit dans /home/USER/git/Esp32Manager à changer à votre besoin

## Linux (testée sur Debian 10)

Il faut avoir les fichiers Esp32ManagerBackend.service et Esp32ManagerFrontend.service dans /lib/systemd/system

puis lancer les commandes suivantes

```bash
systemctl restart Esp32ManagerBackend
systemctl restart Esp32ManagerFrontend
```

Si il y a un problème d'exécution vous pouvez vérifier le log avec

```bash
journalctl -u Esp32ManagerBackend -f
journalctl -u Esp32ManagerFrontend -f
```
