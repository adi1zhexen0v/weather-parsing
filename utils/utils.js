export const generateLightLevelAndPWM = (document) => {
  const hour = new Date(document.timestamp).getUTCHours();
  const minute = new Date(document.timestamp).getUTCMinutes();

  const sunriseHour = 7,
    sunriseMinute = 21;
  const maxLightHour = 12,
    maxLightMinute = 0;
  const sunsetHour = 16,
    sunsetMinute = 35;
  const nightLightLevel = 4.5;
  const dayMaxLightLevel = 0.5;

  let baseLightLevel;

  const timeInMinutes = (h, m) => h * 60 + m;
  const currentTime = timeInMinutes(hour, minute);
  const sunriseTime = timeInMinutes(sunriseHour, sunriseMinute);
  const maxLightTime = timeInMinutes(maxLightHour, maxLightMinute);
  const sunsetTime = timeInMinutes(sunsetHour, sunsetMinute);

  if (currentTime < sunriseTime || currentTime > sunsetTime) {
    baseLightLevel = nightLightLevel;
  } else if (currentTime >= sunriseTime && currentTime < maxLightTime) {
    const progress = (currentTime - sunriseTime) / (maxLightTime - sunriseTime);
    baseLightLevel = 1 - progress * (1 - dayMaxLightLevel);
  } else if (currentTime >= maxLightTime && currentTime <= sunsetTime) {
    const progress = (currentTime - maxLightTime) / (sunsetTime - maxLightTime);
    baseLightLevel = dayMaxLightLevel + progress * (1 - dayMaxLightLevel);
  }

  const cloudinessEffect = (document.cloudiness / 100) * 0.5;
  const lightLevel = Math.max(0, Math.min(5, baseLightLevel + cloudinessEffect)).toFixed(2);

  const pwm = Math.round((lightLevel / 5) * 255);

  return { lightLevel, pwm };
};
