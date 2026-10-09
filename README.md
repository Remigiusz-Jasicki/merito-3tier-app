# merito-3tier-app
SalaGo
Rezerwuj sale błyskawicznie.

SalaGo to aplikacja webowa do szybkiej rezerwacji sal na uczelni dla studentów, wykładowców i kół naukowych. Na planie budynku widać, które sale są wolne, a filtry pozwalają wybrać salę o odpowiedniej pojemności i wyposażeniu. Rezerwacja zajmuje kilka sekund, a aplikacja sama pilnuje terminów, wysyła przypomnienia i nie dopuszcza do podwójnych rezerwacji.

Ten plik to główny przewodnik po repozytorium. Szczegółowa dokumentacja znajduje się w folderze docs/.


Spis treści
Funkcje
Technologie
Architektura
Struktura repozytorium
Uruchomienie lokalne
Konfiguracja
Wdrożenie w Azure
Praca w zespole


Funkcje
Podgląd dostępności sal w czasie rzeczywistym
Filtrowanie sal po pojemności i wyposażeniu (rzutnik, komputery, tablica)
Rezerwacja i anulowanie rezerwacji jednym kliknięciem
Blokada nakładających się rezerwacji
Przypomnienia o zbliżających się rezerwacjach
Logowanie kontem uczelnianym (Microsoft 365)
Panel administratora: obłożenie sal i zatwierdzanie wniosków
Technologie
Warstwa
Technologia
Usługa w Azure
Front-end
React
Azure Static Web Apps
Back-end
Node.js (Express)
Azure App Service
Baza danych
PostgreSQL
Azure Database for PostgreSQL
Logowanie
Microsoft Entra ID
Microsoft Entra ID

Architektura
Aplikacja działa w modelu 3-tier: warstwa prezentacji, warstwa logiki i warstwa danych.

flowchart LR

    U["Użytkownicy<br/>(studenci, kadra)"]

    subgraph T1["Warstwa prezentacji"]

        FE["Frontend React<br/>Azure Static Web Apps"]

    end

    subgraph T2["Warstwa logiki"]

        API["API Node.js (Express)<br/>Azure App Service"]

        AUTH["Logowanie<br/>Microsoft Entra ID"]

    end

    subgraph T3["Warstwa danych"]

        DB[("Baza PostgreSQL<br/>Azure Database")]

    end

    U -->|HTTPS| FE

    FE -->|REST API| API

    API -->|SQL| DB

    API -.->|weryfikacja| AUTH

Szczegółowy opis architektury: docs/architektura.md
Struktura repozytorium
salago/

├── docs/                # Dokumentacja projektu (architektura, API, schemat bazy)

├── frontend/            # Aplikacja React (warstwa prezentacji)

│   ├── src/

│   └── package.json

├── backend/             # API Node.js + Express (warstwa logiki)

│   ├── src/

│   └── package.json

├── config/              # Pliki konfiguracyjne i wzory zmiennych środowiskowych

│   ├── frontend.env.example

│   └── backend.env.example

├── .gitignore

└── README.md            # Ten plik – główny przewodnik po repozytorium
