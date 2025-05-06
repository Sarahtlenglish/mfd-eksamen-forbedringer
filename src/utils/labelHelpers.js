// src/utils/labelHelpers.js

// Generisk label-finder
export function findLabel(options, value) {
  if (!options || !value) return value || 'Ikke valgt'
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

// Domænespecifikke helpers (importér dine configs her)
import { enhederConfig } from '@/configs/enhederConfig'
import { egenkontrolConfig } from '@/config/egenkontrolConfig'
import { tjeklisteConfig } from '@/config/tjeklisteConfig'
import { rolleOptions } from '@/configs/brugerConfig'

// Enheder
export const getLocationLabel = value => findLabel(enhederConfig.locations, value)
export const getTypeLabel = value => findLabel(enhederConfig.types, value)

// Brugere
export const getRoleLabel = value => findLabel(rolleOptions, value)

// Egenkontrol/tjekliste
export const getFrekvensLabel = value => findLabel(tjeklisteConfig.frekvensOptions, value)
export const getTidspunktLabel = value => findLabel(egenkontrolConfig.tidspunktOptions, value)
export const getTjeklisteTypeLabel = value => findLabel(tjeklisteConfig.typeOptions, value)

// Data processering med labels
export const processEnheder = (enheder) => {
  return enheder.map(item => ({
    ...item,
    type: getTypeLabel(item.type),
    location: getLocationLabel(item.location)
  }))
}

export const processTjeklister = (tjeklister) => {
  return tjeklister.map(item => ({
    ...item,
    type: getTjeklisteTypeLabel(item.type),
    frekvens: getFrekvensLabel(item.frekvens)
  }))
}

export const processBrugere = (brugere) => {
  return brugere.map(item => ({
    ...item,
    rolle: getRoleLabel(item.rolle)
  }))
}
