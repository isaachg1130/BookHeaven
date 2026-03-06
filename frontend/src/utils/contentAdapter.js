import { getImageUrl } from "./imageUtils";

export const adaptContent = (item, type = "libro") => {
  if (!item) return null;

  const title = item.titulo || item.nombre || item.title || "Sin título";
  const author = item.autor || item.author || "Desconocido";

  // Para audiobooks, extraer duración correctamente
  let duration = item.duracion || item.duration || 0;
  if (type === "audiobook" && item.duracion_segundos) {
    duration = item.duracion_segundos;
  }

  return {
    // Campos de la API (español)
    id: item.id,
    titulo: title,
    autor: author,
    descripcion:
      item.descripcion || item.description || "Sin descripción disponible.",
    genero: item.genero || item.genre || item.generos?.[0] || "",
    imagen: item.imagen || item.image,
    pdf: item.pdf || item.archivo,
    audio: item.audio || item.archivo_audio,
    narrador: item.narrador || item.narrator,
    is_premium: item.is_premium || false,
    tiene_derechos_autor: item.tiene_derechos_autor || false,
    popularidad: item.popularidad || 50,

    // Campos adaptados (inglés) para compatibilidad
    title: title,
    poster: getImageUrl(item.imagen || item.image),
    backdrop: getImageUrl(item.imagen || item.image),
    description:
      item.descripcion || item.description || "Sin descripción disponible.",
    author: author,
    narrator: item.narrador || item.narrator,
    audioFile: item.audio || item.archivo_audio,
    genres: item.generos || item.genres || (item.genero ? [item.genero] : []),
    match: 90 + Math.floor(Math.random() * 10),
    age: item.edad_recomendada || item.recommended_age || "12+",
    duration:
      type === "audiobook"
        ? duration
        : type === "libro"
          ? "Libro"
          : type === "manga"
            ? "Manga"
            : "Cómic",
    year: new Date(
      item.created_at || item.fecha_publicacion || Date.now(),
    ).getFullYear(),
    isPremium: item.is_premium || false,
    type: type,
    contentType: type,
    file: item.pdf || item.archivo || item.audio || item.archivo_audio,
  };
};

export const adaptContentList = (items, type) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => adaptContent(item, type)).filter(Boolean);
};
