# Środowisko Azure – instrukcja dla zespołu

## Co gdzie jest

- Subskrypcja: Azure for Students (właściciel: Oliwer). Reszta zespołu ma rolę Contributor na grupie `rg-salago`.
- Region: Sweden Central (w Poland Central brakowało wolnych maszyn).
- Adres aplikacji: https://salago-26465.swedencentral.cloudapp.azure.com

| Maszyna | IP | Co na niej działa |
|---|---|---|
| vm-web | 10.0.1.4, publiczny 20.91.245.147 | Caddy (HTTPS, przekierowanie, frontend z `/var/www/salago`, proxy `/api` → vm-app) |
| vm-app | 10.0.2.4 | backend Express, usługa `salago-api`, kod w `/opt/app/backend`, konfiguracja w `/opt/salago.env` |
| vm-db | 10.0.3.4 | PostgreSQL, baza `appdb`, użytkownik `sqladmin` |

Hasło do bazy jest tylko w `/opt/salago.env` na vm-app. Nie wrzucamy go do repo.

## Jak się dostać do maszyn

SSH jest celowo wyłączone (Blok 9, E2). Wszystko robimy z **Cloud Shella** w portalu Azure (ikonka `>_` u góry, tryb Bash) przez Run Command:

```bash
az vm run-command invoke -g rg-salago -n vm-app --command-id RunShellScript \
  --scripts "systemctl status salago-api --no-pager; journalctl -u salago-api -n 30 --no-pager"
```

Zamiast `vm-app` można podać `vm-web` albo `vm-db`, a w `--scripts` wpisać dowolne polecenie.

Przydatne polecenia:

```bash
# stan maszyn
az vm list -g rg-salago -d -o table

# czy aplikacja żyje
curl https://salago-26465.swedencentral.cloudapp.azure.com/api/health

# podgląd bazy
az vm run-command invoke -g rg-salago -n vm-db --command-id RunShellScript \
  --scripts "sudo -u postgres psql appdb -c 'SELECT id, nazwa FROM sale;'"
```

## Jak wgrać nową wersję kodu z GitHuba

Najpierw zmiana musi być na `main` w repo. Potem:

```bash
# backend
az vm run-command invoke -g rg-salago -n vm-app --command-id RunShellScript --scripts \
  "cd /opt/app && git fetch && git reset --hard origin/main && cd backend && HOME=/root npm install && systemctl restart salago-api"

# frontend
az vm run-command invoke -g rg-salago -n vm-web --command-id RunShellScript --scripts \
  "cd /opt/app && git fetch && git reset --hard origin/main && cd frontend && printf 'VITE_API_BASE_URL=/api\nVITE_USE_MOCK=false\n' > .env.production && HOME=/root npm ci && npm run build && rm -rf /var/www/salago/* && cp -r dist/. /var/www/salago/"
```

Uwaga: backend w chmurze używa PostgreSQL (pliki `backend/server.js`, `backend/database.js` i `backend/package.json` w wersji z `pg`). Te pliki muszą być w repo, zanim ktoś zrobi `git reset` na vm-app. Inaczej wróci stara wersja z SQLite i aplikacja przestanie działać.

## Koszty

Wszystko idzie z kredytu Azure for Students (nikt nie płaci z karty). 3 maszyny Standard_B2ats_v2 i publiczne IP kosztują około 1 USD dziennie. Koszty widać w Cost Management na subskrypcji (dostęp ma tylko Oliwer).

Wyłączenie maszyn na noc (aplikacja wtedy nie działa, adres i dane zostają):

```bash
az vm deallocate -g rg-salago --ids $(az vm list -g rg-salago --query "[].id" -o tsv)
az vm start      -g rg-salago --ids $(az vm list -g rg-salago --query "[].id" -o tsv)
```

## Zasady

- Nie usuwać `rg-salago` ani maszyn przed finałem 06.12.
- Nie otwierać portów 22, 3000, 5432 w NSG – to zepsuje Blok 9.
- Po zmianach w regułach NSG zaktualizować tabelę w README.md.
