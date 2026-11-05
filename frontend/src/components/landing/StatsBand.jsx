import React from 'react';
import AnimatedCounter from './AnimatedCounter';

/* Bande de statistiques (teal) */
export default function StatsBand() {
  return (
    <section className="py-14 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-1">
              <AnimatedCounter target={150} suffix="+" />
            </div>
            <div className="text-teal-100 text-sm font-medium">Véhicules vérifiés</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-1">
              <AnimatedCounter target={3400} suffix="+" />
            </div>
            <div className="text-teal-100 text-sm font-medium">Locations réussies</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-1 flex items-center justify-center gap-2">
              4,9<span className="text-2xl text-teal-200">/5</span>
            </div>
            <div className="text-teal-100 text-sm font-medium">Satisfaction client</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-1">10+</div>
            <div className="text-teal-100 text-sm font-medium">Villes couvertes</div>
          </div>
        </div>
      </div>
    </section>
  );
}
