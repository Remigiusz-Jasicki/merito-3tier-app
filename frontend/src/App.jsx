import DataList from './components/DataList';
import { trybDanych } from './services/api';

export default function App() {
  return (
    <main className="kontener">
      <header>
        <h1>SalaGo</h1>
        <p className="podtytul">Rezerwuj sale błyskawicznie</p>
      </header>
      <DataList />
      <footer>Źródło danych: {trybDanych}</footer>
    </main>
  );
}