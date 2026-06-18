import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/navbar/navbar';
import { LanguageProvider } from "./translations/LanguageContext";
import PrivateRoute from './components/PrivateRoute';

// PAGES
import Scanner from './components/pages/Scanner';
import Historique from './components/pages/Historique';
import IA from './components/pages/IA';
import Recherche from './components/pages/Recherche';
import Profil from './components/pages/Profil';
import Login from './components/pages/Login';
import Parametres from './components/pages/Parametres';
import ModifierProfil from './components/pages/ModifierProfil';
import ChangerMotDePasse from './components/pages/ChangerMotDePasse';

// 🎬 Animations
const pageVariants = {
  initial: { opacity: 0, x: 100 },
  in:      { opacity: 1, x: 0 },
  out:     { opacity: 0, x: -100 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function Page({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Pages publiques */}
        <Route path="/" element={<Page><Login /></Page>} />
        <Route path="/scanner" element={<Page><Scanner /></Page>} />
        <Route path="/historique" element={<Page><Historique /></Page>} />
        <Route path="/ia" element={<Page><IA /></Page>} />
        <Route path="/recherche" element={<Page><Recherche /></Page>} />

        {/* Pages protégées — PrivateRoute vérifie l'auth avant d'afficher quoi que ce soit */}
        <Route path="/profil" element={
          <PrivateRoute>
            <Page><Profil /></Page>
          </PrivateRoute>
        } />

        <Route path="/parametres" element={
          <PrivateRoute>
            <Page><Parametres /></Page>
          </PrivateRoute>
        } />

        <Route path="/profil/edit" element={
          <PrivateRoute>
            <Page><ModifierProfil /></Page>
          </PrivateRoute>
        } />

        <Route path="/changer-mdp" element={
          <PrivateRoute>
            <Page><ChangerMotDePasse /></Page>
          </PrivateRoute>
        } />

        <Route path="*" element={<Page><Login /></Page>} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          <Navbar />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;