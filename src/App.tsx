import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { AdminApp } from './admin/AdminApp';
import { useRoute } from './lib/router';

function App() {
  const path = useRoute();

  if (path.startsWith('/admin')) return <AdminApp />;

  const categoryMatch = path.match(/^\/categoria\/([a-z0-9-]+)\/?$/);

  return (
    <>
      <Header />

      <main>{categoryMatch ? <CategoryPage slug={categoryMatch[1]} /> : <Home />}</main>

      <Footer />
    </>
  );
}

export default App;
