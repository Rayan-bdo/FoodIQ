import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/navbar/navbar';
import { LanguageProvider } from "./translations/LanguageContext";

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
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -100 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// 🔁 Routes animées
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Login />
          </motion.div>
        } />

        <Route path="/scanner" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Scanner />
          </motion.div>
        } />

        <Route path="/historique" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Historique />
          </motion.div>
        } />

        <Route path="/ia" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <IA />
          </motion.div>
        } />

        <Route path="/recherche" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Recherche />
          </motion.div>
        } />

        <Route path="/profil" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Profil />
          </motion.div>
        } />

        <Route path="/parametres" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Parametres />
          </motion.div>
        } />

        <Route path="/profil/edit" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <ModifierProfil />
          </motion.div>
        } />

        <Route path="/changer-mdp" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <ChangerMotDePasse />
          </motion.div>
        } />

        <Route path="*" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Login />
          </motion.div>
        } />

      </Routes>
    </AnimatePresence>
  );
}

// 🧠 App principale
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