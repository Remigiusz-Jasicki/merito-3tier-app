# merito-3tier-app
# SalaGo

> Rezerwuj sale błyskawicznie.

SalaGo to aplikacja webowa do szybkiej rezerwacji sal na uczelni dla studentów, wykładowców i kół naukowych. Na planie budynku widać, które sale są wolne, a filtry pozwalają wybrać salę o odpowiedniej pojemności i wyposażeniu. Rezerwacja zajmuje kilka sekund, a aplikacja sama pilnuje terminów, wysyła przypomnienia i nie dopuszcza do podwójnych rezerwacji.

Ten plik to **główny przewodnik po repozytorium `merito-3tier-app`**. Szczegółowa dokumentacja znajduje się w folderze [`docs/`](docs/).

---

## Spis treści

1. [Funkcje](#funkcje)
2. [Technologie](#technologie)
3. [Architektura](#architektura)
4. [Struktura repozytorium](#struktura-repozytorium)
5. [Konfiguracja](#konfiguracja)
6. [Wdrożenie w Azure](#wdrożenie-w-azure)
7. [Praca w zespole](#praca-w-zespole)

---

## Funkcje

- Podgląd dostępności sal w czasie rzeczywistym
- Filtrowanie sal po pojemności i wyposażeniu (rzutnik, komputery, tablica)
- Rezerwacja i anulowanie rezerwacji jednym kliknięciem
- Blokada nakładających się rezerwacji
- Przypomnienia o zbliżających się rezerwacjach
- Logowanie kontem uczelnianym (Microsoft 365)
- Panel administratora: obłożenie sal i zatwierdzanie wniosków

## Technologie

| Warstwa      | Technologia          | Usługa w Azure                   |
|--------------|----------------------|----------------------------------|
| Front-end    | React                | Azure Static Web Apps            |
| Back-end     | Node.js (Express)    | Azure App Service                |
| Baza danych  | PostgreSQL           | Azure Database for PostgreSQL    |
| Logowanie    | Microsoft Entra ID   | Microsoft Entra ID               |

## Architektura

Aplikacja działa w modelu **3-tier**: warstwa prezentacji, warstwa logiki i warstwa danych.

![Schemat architektury SalaGo](docs/architektura.png)

Szczegółowy opis architektury znajduje się w folderze [`docs/`](docs/).

## Struktura repozytorium

```
merito-3tier-app/
├── backend/      # API Node.js + Express (warstwa logiki)
├── config/       # Konfiguracja i wzory zmiennych środowiskowych
├── docs/         # Dokumentacja projektu (architektura, wdrożenie)
├── frontend/     # Aplikacja React (warstwa prezentacji)
└── README.md     # Ten plik – główny przewodnik po repozytorium
```

| Folder | Warstwa / rola | Zawartość |
|---|---|---|
| [`frontend/`](frontend/) | Warstwa prezentacji | Interfejs użytkownika w React |
| [`backend/`](backend/) | Warstwa logiki | REST API w Node.js (Express), obsługa rezerwacji i logowania |
| [`config/`](config/) | Konfiguracja | Wzory plików `.env` – bez prawdziwych haseł i adresów |
| [`docs/`](docs/) | Dokumentacja | Opis architektury, schemat systemu, instrukcja wdrożenia |

Warstwa danych (PostgreSQL) działa jako usługa w Azure, dlatego nie ma osobnego folderu. Połączenie z nią back-end pobiera ze zmiennej środowiskowej `DATABASE_URL`.

## Konfiguracja

W kodzie **nie ma na sztywno wpisanych adresów URL, haseł ani kluczy**. Wszystkie takie wartości trafiają do zmiennych środowiskowych. Prawdziwe pliki `.env` nigdy nie trafiają do repozytorium. W repozytorium są tylko wzory w folderze [`config/`](config/).

### Back-end (`backend/.env`)

| Zmienna             | Opis                                         |
|---------------------|----------------------------------------------|
| `PORT`              | Port, na którym działa API                   |
| `DATABASE_URL`      | Connection string do bazy PostgreSQL         |
| `ENTRA_TENANT_ID`   | Identyfikator tenanta Microsoft Entra ID     |
| `ENTRA_CLIENT_ID`   | Identyfikator aplikacji w Entra ID           |
| `CORS_ORIGIN`       | Adres front-endu, który może wywoływać API   |

### Front-end (`frontend/.env`)

| Zmienna               | Opis                                   |
|-----------------------|----------------------------------------|
| `VITE_API_URL`        | Adres API back-endu                    |
| `VITE_ENTRA_CLIENT_ID`| Identyfikator aplikacji w Entra ID     |
| `VITE_ENTRA_TENANT_ID`| Identyfikator tenanta Microsoft Entra ID |

W Azure te same zmienne ustawia się w konfiguracji usług (App Service → *Environment variables*, Static Web Apps → *Environment variables*), a nie w plikach.

## Wdrożenie w Azure

| Komponent   | Usługa                          |
|-------------|---------------------------------|
| `frontend/` | Azure Static Web Apps           |
| `backend/`  | Azure App Service (Node.js)     |
| Baza danych | Azure Database for PostgreSQL – Flexible Server |
| Logowanie   | Rejestracja aplikacji w Microsoft Entra ID |

Instrukcja wdrożenia krok po kroku znajduje się w folderze [`docs/`](docs/).

## Praca w zespole

- Zadania i ich statusy prowadzimy na tablicy zadań projektu (GitHub Projects).
- Każda zmiana trafia na osobną gałąź i do `main` przechodzi przez pull request.
- Nazwy gałęzi: `feature/<nazwa>`, `fix/<nazwa>`, `docs/<nazwa>`.

### Zespół

| Osoba        | Rola                    |
|--------------|-------------------------|
| _Imię Nazwisko_ | _np. front-end_      |
| _Imię Nazwisko_ | _np. back-end_       |
| _Imię Nazwisko_ | _np. baza danych, dokumentacja_ |

---

Projekt realizowany w ramach zajęć na WSB Merito Wrocław.
