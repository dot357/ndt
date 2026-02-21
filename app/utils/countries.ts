export interface Country {
  code: string
  name: string
  region: string
}

export const regions = [
  'All',
  'Europe',
  'East Asia',
  'Southeast Asia',
  'South Asia',
  'Middle East',
  'Africa',
  'North America',
  'Latin America',
  'Oceania'
] as const

export const countries: Country[] = [
  { code: 'AF', name: 'Afghanistan', region: 'South Asia' },
  { code: 'AR', name: 'Argentina', region: 'Latin America' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'BR', name: 'Brazil', region: 'Latin America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'CN', name: 'China', region: 'East Asia' },
  { code: 'CO', name: 'Colombia', region: 'Latin America' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'EG', name: 'Egypt', region: 'Middle East' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'ET', name: 'Ethiopia', region: 'Africa' },
  { code: 'FI', name: 'Finland', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'GH', name: 'Ghana', region: 'Africa' },
  { code: 'GR', name: 'Greece', region: 'Europe' },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia' },
  { code: 'IN', name: 'India', region: 'South Asia' },
  { code: 'IR', name: 'Iran', region: 'Middle East' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'JP', name: 'Japan', region: 'East Asia' },
  { code: 'KE', name: 'Kenya', region: 'Africa' },
  { code: 'KR', name: 'South Korea', region: 'East Asia' },
  { code: 'MX', name: 'Mexico', region: 'Latin America' },
  { code: 'MY', name: 'Malaysia', region: 'Southeast Asia' },
  { code: 'NG', name: 'Nigeria', region: 'Africa' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe' },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia' },
  { code: 'PK', name: 'Pakistan', region: 'South Asia' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'RO', name: 'Romania', region: 'Europe' },
  { code: 'RU', name: 'Russia', region: 'Europe' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East' },
  { code: 'SE', name: 'Sweden', region: 'Europe' },
  { code: 'TH', name: 'Thailand', region: 'Southeast Asia' },
  { code: 'TR', name: 'Turkey', region: 'Europe' },
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'VN', name: 'Vietnam', region: 'Southeast Asia' },
  { code: 'ZA', name: 'South Africa', region: 'Africa' }
]

export function getCountryName(code: string): string {
  return countries.find(c => c.code === code)?.name || code
}

export function getCountryRegion(code: string): string {
  return countries.find(c => c.code === code)?.region || 'Other'
}
