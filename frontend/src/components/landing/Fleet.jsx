import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FLEET } from './data';
import VehicleCard from './VehicleCard';

/* « Véhicules prêts à partir » — sélection de la flotte */
export default function Fleet() {
  return (
    <section id="vehicules" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Véhicules prêts à partir
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Une sélection de véhicules inspectés et disponibles dès aujourd'hui
            à Douala et Yaoundé.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FLEET.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>

        <div className="text-center mt-10">
          <Link to="/catalogue"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md text-sm">
            Voir tout le catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
