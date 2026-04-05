import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/navbar.css/navbar';
import Home from './components/home/home';
import Compte from './components/compte/compte';
import Page from './components/home/Page';

const tabs = [
  { id: 'recommendations', label: '💡 Recommandations', description: 'Recevez des recommandations personnalisées pour des choix alimentaires plus sains.' },
  { id: 'scan', label: '📷 Scan', description: 'Scannez un code-barres pour obtenir immédiatement les informations nutritionnelles du produit.', hasScanButton: true },
  { id: 'ia', label: '🤖 IA', description: 'Posez vos questions à l’assistant intelligent pour mieux comprendre la qualité nutritionnelle.' },
  { id: 'recherche', label: '🔎 Recherche', description: 'Recherchez un produit ou un ingrédient pour comparer sa qualité et son prix.' },
];

const pageVariants = {
  initial: { opacity: 0, x: 100 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -100 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Home /></motion.div>} />
        <Route path="/home" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Home /></motion.div>} />
        <Route path="/compte" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><Compte /></motion.div>} />
        {tabs.map((tab) => (
          <Route
            key={tab.id}
            path={`/${tab.id}`}
            element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <Page title={tab.label} description={tab.description} hasScanButton={tab.hasScanButton} />
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
