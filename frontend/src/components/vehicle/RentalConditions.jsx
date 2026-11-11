import React from 'react';
import { RotateCcw, ShieldCheck, AlertTriangle, Gauge, Fuel, MapPin, Clock, Zap, Plane, Building } from 'lucide-react';

const DAY_FR = { Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi', Jeu: 'Jeudi', Ven: 'Vendredi', Sam: 'Samedi', Dim: 'Dimanche' };

/* « Conditions de location & annulation » + « Politique carburant/kilométrage »
   + « Disponibilités & prise en charge » (réglages réels du propriétaire) */
export default function RentalConditions({ vehicle: v }) {
  const a = v.availability || {};
  const days = Object.entries(a.avail_days || {}).filter(([, on]) => on).map(([d]) => DAY_FR[d] || d);
  const hasPrefs = Object.keys(a).length > 0;
  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5">Conditions de location &amp; annulation</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: RotateCcw, title: 'Annulation gratuite',
              text: 'Jusqu\'à 24h avant le départ. Modification gratuite jusqu\'à 15 min avant la prise en charge.',
            },
            {
              icon: ShieldCheck, title: 'Paiement sécurisé',
              text: 'Fonds conservés par AutoLink Pro jusqu\'à la confirmation du trajet. Aucun débit avant la location.',
            },
            {
              icon: AlertTriangle, title: 'Politique de retard',
              text: '30 minutes d\'attente offertes. Au-delà, facturation horaire ou réattribution possible.',
            },
          ].map(c => (
            <div key={c.title} className="border border-slate-100 rounded-xl p-4">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                <c.icon size={17} className="text-teal-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm mb-1.5">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5">Politique carburant &amp; kilométrage</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
              <Gauge size={17} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm mb-1">{v.kmIncluded} km inclus / jour</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Au-delà : {v.kmRate} FCFA / km supplémentaire, décompté au retour du véhicule.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
              <Fuel size={17} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm mb-1">Carburant à niveau identique</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le véhicule est remis avec le plein — il doit être restitué au même niveau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disponibilités & prise en charge — réglages réels du propriétaire */}
      {hasPrefs && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-black text-slate-900 mb-5">Disponibilités &amp; prise en charge</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {days.length > 0 && (
              <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
                <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={17} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm mb-1">Jours de remise</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {days.join(', ')} · {a.drop_time || '—'} → {a.return_time || '—'}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={17} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm mb-1">Lieu de prise en charge</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {a.pickup_address || `Hub AutoLink ${a.pickup_hub === 'akwa' ? 'Akwa' : (a.pickup_hub || 'central')}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Zap size={17} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm mb-1">
                  {a.instant_booking ? 'Réservation instantanée' : 'Confirmation du propriétaire requise'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Préavis minimum : {a.notice_hours ? `${a.notice_hours} h avant le départ` : 'non précisé'}.
                </p>
              </div>
            </div>
            {(a.delivery_airport || a.delivery_hotel) && (
              <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
                <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  {a.delivery_airport ? <Plane size={17} className="text-teal-600" /> : <Building size={17} className="text-teal-600" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm mb-1">Livraison possible</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {[
                      a.delivery_airport ? 'Aéroport' : null,
                      a.delivery_hotel ? 'Hôtel / domicile' : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
