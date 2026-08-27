/* Extrait un id vidéo YouTube depuis n'importe quelle forme d'URL usuelle
   (watch?v=, youtu.be/, shorts/, déjà en /embed/) pour construire l'iframe
   d'intégration — partagé entre creationsCompagnie.jsx et archives.jsx. */
export function youtubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
