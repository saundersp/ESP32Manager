# Remote server deployment

*Lisez ceci dans d'autres langues: [English](README.md)*

## Dependencies

NodeJS and serve must be installed beforehand

```bash
npm i -g serve
```

The services are configured for the git fix either in/home/USER/git/Esp32Manager to change as needed

## Linux (tested on Debian 10)

You must have the files Esp32ManagerBackend.service and Esp32ManagerFrontend.service in/lib/systemd/system

then run the following commands

```bash
systemctl restart Esp32ManagerBackend
systemctl restart Esp32ManagerFrontend
```

If there is a runtime problem you can check the log with

```bash
journalctl -u Esp32ManagerBackend -f
journalctl -u Esp32ManagerFrontend -f
```
