import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Car, ShieldCheck, ChevronDown } from 'lucide-react';
import { CAMEROON_CITIES } from '../../utils/cities';

const TOUTES = 'Toutes';
const city = (v) => (CAMEROON_CITIES.includes(v) ? v : 'Douala');

/* Barre de recherche de véhicule — redirige vers le catalogue public
   avec les critères en query params (?ville=&retour=&debut=&fin=&categorie=&etat=). */
export default function SearchWidget({ compact = false, initialValues = {}, onSearch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    debut: initialValues.debut || '',
    fin: initialValues.fin || '',
    depart: city(initialValues.depart || initialValues.ville),
    retour: city(initialValues.retour),
    categorie: initialValues.categorie || TOUTES,
    etat: initialValues.etat || TOUTES,
  });

  const submit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ ville: form.depart, retour: form.retour });
    if (form.debut) q.set('debut', form.debut);
    if (form.fin) q.set('fin', form.fin);
    if (form.categorie !== TOUTES) q.set('categorie', form.categorie);
    if (form.etat !== TOUTES) q.set('etat', form.etat);

    // Si une fonction de callback est fournie (ex. sur la page catalogue), on l'exécute, sinon on navigue
    if (onSearch) {
      onSearch(form);
    } else {
      navigate(`/catalogue?${q.toString()}`);
    }
  };

  /* span = largeur du champ sur grand écran (grille de 5 colonnes : 4 champs + bouton) */
  const fields = [
    { key: 'debut',  label: 'Date de début',  icon: Calendar,    type: 'date', span: 'lg:col-span-1' },
    { key: 'fin',    label: 'Date de fin',    icon: Calendar,    type: 'date', span: 'lg:col-span-1' },
    { key: 'depart', label: 'Lieu de départ', icon: MapPin,      type: 'select', span: 'lg:col-span-1',
      options: CAMEROON_CITIES },
    { key: 'retour', label: 'Lieu de retour', icon: MapPin,      type: 'select', span: 'lg:col-span-1',
      options: CAMEROON_CITIES },
    // { key: 'categorie', label: 'Catégorie',   icon: Car,         type: 'select', span: 'lg:col-span-4',
    //   options: [TOUTES, 'BASIC', 'STANDARD', 'PREMUIM', 'GOLD'] },
    // { key: 'etat',   label: 'État du véhicule', icon: ShieldCheck, type: 'select', span: 'lg:col-span-4',
    //   options: [TOUTES, 'Neuf', 'comme Neuf', 'Second Main'] },
  ];

  const inputClass =
    'w-full h-[46px] pl-9 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';

  return (
    <form onSubmit={submit}
      className={`bg-white rounded-2xl shadow-lg border border-slate-100 ${compact ? 'p-3' : 'p-4 sm:p-5 lg:p-6'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 items-end">
        {fields.map(f => (
          <div key={f.key} className={f.span}>
            <label htmlFor={`sw-${f.key}`}
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              {f.label}
            </label>
            <div className="relative">
              <f.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {f.type === 'select' ? (
                <>
                  <select id={`sw-${f.key}`} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={`${inputClass} appearance-none pr-9 cursor-pointer`}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </>
              ) : (
                <input id={`sw-${f.key}`} type="date" value={form[f.key]}
                  min={f.key === 'fin' ? form.debut || undefined : undefined}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className={`${inputClass} pr-3`} />
              )}
            </div>
          </div>
        ))}

        <div className="sm:col-span-2 lg:col-span-1">
          <button type="submit"
            className="w-full h-[46px] flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 rounded-xl transition-colors shadow-md text-sm whitespace-nowrap">
            <Search size={17} />
          </button>
        </div>
      </div>
    </form>
  );
}