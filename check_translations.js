// Script to identify missing translation keys
const hardcodedStrings = [
  'basicSettings',
  'effects',
  'displayOptions',
  'calendarEvents',
  'eventsStored',
  'noEventsStored',
  'calendarEventsHelp',
  'unit',
  'showWeatherCountdown',
  'showAirQuality',
  'forecastModes',
  'units'
];

import fs from 'fs';
const translationsFile = fs.readFileSync('src/utils/translations.js', 'utf8');

console.log('Missing translation keys:');
hardcodedStrings.forEach(key => {
  if (!translationsFile.includes(`${key}:`)) {
    console.log(`- ${key}`);
  } else {
    console.log(`✓ ${key} (found)`);
  }
});
