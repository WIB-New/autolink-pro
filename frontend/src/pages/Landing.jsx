import React, { useEffect } from 'react';
import {
  PublicNavbar, Hero, Standings, Fleet, Formules, Steps,
  Why, StatsBand, Testimonials, PartnerCta, DriverCta, Faq, Footer,
} from '../components/landing';
import PromoPopup from '../components/PromoPopup';

/* Page d'accueil — composition des sections réutilisables
   (src/components/landing/). Chaque section gère sa propre navigation. */
export default function Landing() {
  // Arrivée avec une ancre (/#etapes, /#tarifs…) depuis une autre page :
  // on fait défiler jusqu'à la section une fois le rendu terminé.
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <Hero />
      <Standings />
      <Fleet />
      <Formules />
      <Steps />
      <Why />
      <StatsBand />
      <Testimonials />
      <PartnerCta />
      <DriverCta />
      <Faq />
      <Footer />
      <PromoPopup />
    </div>
  );
}
