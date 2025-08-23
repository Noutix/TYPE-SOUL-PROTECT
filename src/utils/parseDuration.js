// utils/parseDuration.js

/**
 * Convertit une durée (ex: "1d", "2h", "30m", "45s") en millisecondes.
 * @param {string} str - Durée en texte
 * @returns {number|null} Durée en ms ou null si invalide
 */
function parseDuration(str) {
  if (!str || typeof str !== "string") return null;

  const regex = /(\d+)([dhms])/g;
  let match;
  let duration = 0;

  while ((match = regex.exec(str)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "d":
        duration += value * 24 * 60 * 60 * 1000;
        break;
      case "h":
        duration += value * 60 * 60 * 1000;
        break;
      case "m":
        duration += value * 60 * 1000;
        break;
      case "s":
        duration += value * 1000;
        break;
      default:
        return null;
    }
  }

  return duration > 0 ? duration : null;
}

module.exports = parseDuration;
