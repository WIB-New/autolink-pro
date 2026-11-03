/* Résout une URL de media backend (/media/…) en URL absolue.
   Les FileField DRF renvoient des chemins relatifs servis par Django. */
export const mediaUrl = (u) => {
  if (!u) return null;
  if (u.startsWith('http')) return u;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '') + u;
};

export const isImage = (u) => /\.(jpe?g|png|gif|webp|bmp)$/i.test(u || '');
export const isPdf = (u) => /\.pdf$/i.test(u || '');

/* Slots extérieurs du wizard photos — 'front34' est la cover officielle. */
const EXTERIOR_SLOTS = ['front34', 'front', 'side', 'rear34'];

/* Choisit la photo de couverture : priorité à l'extérieur (caption slot),
   sinon première photo dispo. */
export const vehicleCover = (v) => {
  const photos = v?.photos || [];
  if (!photos.length) return null;
  const ext = photos.find(p => p.caption === 'front34')
    || photos.find(p => EXTERIOR_SLOTS.includes(p.caption))
    || photos[0];
  return mediaUrl(ext.image || ext);
};
