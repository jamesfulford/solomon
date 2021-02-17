import React from 'react';
import { Header } from './components/Header';
import { Home } from './pages/home/Home';
import { PlanContainer } from './pages/plan/PlanContainer';
import { useAuth0 } from '@auth0/auth0-react';
import { Footer } from './components/Footer';



function App() {
  const { isAuthenticated } = useAuth0();
  return (
    <>
      <Header />
      { isAuthenticated ? <div style={{ minHeight: '85vh'}}><PlanContainer /></div> : <Home />}
      <Footer />
    </>
  );
}

export default App;
