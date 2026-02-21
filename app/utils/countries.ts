export interface Country {
  code: string
  name: string
  region: string
  language: string
}

export const regions = [
  'All',
  'Europe',
  'East Asia',
  'Southeast Asia',
  'South Asia',
  'Central Asia',
  'Middle East',
  'Africa',
  'North America',
  'Latin America',
  'Caribbean',
  'Oceania'
] as const

export const countries: Country[] = [
  // Europe
  { code: 'AL', name: 'Albania', region: 'Europe', language: 'Albanian' },
  { code: 'AD', name: 'Andorra', region: 'Europe', language: 'Catalan' },
  { code: 'AM', name: 'Armenia', region: 'Europe', language: 'Armenian' },
  { code: 'AT', name: 'Austria', region: 'Europe', language: 'German' },
  { code: 'AZ', name: 'Azerbaijan', region: 'Europe', language: 'Azerbaijani' },
  { code: 'BY', name: 'Belarus', region: 'Europe', language: 'Belarusian' },
  { code: 'BE', name: 'Belgium', region: 'Europe', language: 'Dutch' },
  { code: 'BA', name: 'Bosnia and Herzegovina', region: 'Europe', language: 'Bosnian' },
  { code: 'BG', name: 'Bulgaria', region: 'Europe', language: 'Bulgarian' },
  { code: 'HR', name: 'Croatia', region: 'Europe', language: 'Croatian' },
  { code: 'CY', name: 'Cyprus', region: 'Europe', language: 'Greek' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe', language: 'Czech' },
  { code: 'DK', name: 'Denmark', region: 'Europe', language: 'Danish' },
  { code: 'EE', name: 'Estonia', region: 'Europe', language: 'Estonian' },
  { code: 'FI', name: 'Finland', region: 'Europe', language: 'Finnish' },
  { code: 'FR', name: 'France', region: 'Europe', language: 'French' },
  { code: 'GE', name: 'Georgia', region: 'Europe', language: 'Georgian' },
  { code: 'DE', name: 'Germany', region: 'Europe', language: 'German' },
  { code: 'GR', name: 'Greece', region: 'Europe', language: 'Greek' },
  { code: 'HU', name: 'Hungary', region: 'Europe', language: 'Hungarian' },
  { code: 'IS', name: 'Iceland', region: 'Europe', language: 'Icelandic' },
  { code: 'IE', name: 'Ireland', region: 'Europe', language: 'Irish' },
  { code: 'IT', name: 'Italy', region: 'Europe', language: 'Italian' },
  { code: 'XK', name: 'Kosovo', region: 'Europe', language: 'Albanian' },
  { code: 'LV', name: 'Latvia', region: 'Europe', language: 'Latvian' },
  { code: 'LT', name: 'Lithuania', region: 'Europe', language: 'Lithuanian' },
  { code: 'LU', name: 'Luxembourg', region: 'Europe', language: 'Luxembourgish' },
  { code: 'MT', name: 'Malta', region: 'Europe', language: 'Maltese' },
  { code: 'MD', name: 'Moldova', region: 'Europe', language: 'Romanian' },
  { code: 'ME', name: 'Montenegro', region: 'Europe', language: 'Montenegrin' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', language: 'Dutch' },
  { code: 'MK', name: 'North Macedonia', region: 'Europe', language: 'Macedonian' },
  { code: 'NO', name: 'Norway', region: 'Europe', language: 'Norwegian' },
  { code: 'PL', name: 'Poland', region: 'Europe', language: 'Polish' },
  { code: 'PT', name: 'Portugal', region: 'Europe', language: 'Portuguese' },
  { code: 'RO', name: 'Romania', region: 'Europe', language: 'Romanian' },
  { code: 'RU', name: 'Russia', region: 'Europe', language: 'Russian' },
  { code: 'RS', name: 'Serbia', region: 'Europe', language: 'Serbian' },
  { code: 'SK', name: 'Slovakia', region: 'Europe', language: 'Slovak' },
  { code: 'SI', name: 'Slovenia', region: 'Europe', language: 'Slovenian' },
  { code: 'ES', name: 'Spain', region: 'Europe', language: 'Spanish' },
  { code: 'SE', name: 'Sweden', region: 'Europe', language: 'Swedish' },
  { code: 'CH', name: 'Switzerland', region: 'Europe', language: 'German' },
  { code: 'TR', name: 'Turkey', region: 'Europe', language: 'Turkish' },
  { code: 'UA', name: 'Ukraine', region: 'Europe', language: 'Ukrainian' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', language: 'English' },

  // East Asia
  { code: 'CN', name: 'China', region: 'East Asia', language: 'Mandarin Chinese' },
  { code: 'JP', name: 'Japan', region: 'East Asia', language: 'Japanese' },
  { code: 'KR', name: 'South Korea', region: 'East Asia', language: 'Korean' },
  { code: 'KP', name: 'North Korea', region: 'East Asia', language: 'Korean' },
  { code: 'MN', name: 'Mongolia', region: 'East Asia', language: 'Mongolian' },
  { code: 'TW', name: 'Taiwan', region: 'East Asia', language: 'Mandarin Chinese' },

  // Southeast Asia
  { code: 'BN', name: 'Brunei', region: 'Southeast Asia', language: 'Malay' },
  { code: 'KH', name: 'Cambodia', region: 'Southeast Asia', language: 'Khmer' },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia', language: 'Indonesian' },
  { code: 'LA', name: 'Laos', region: 'Southeast Asia', language: 'Lao' },
  { code: 'MY', name: 'Malaysia', region: 'Southeast Asia', language: 'Malay' },
  { code: 'MM', name: 'Myanmar', region: 'Southeast Asia', language: 'Burmese' },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia', language: 'Filipino' },
  { code: 'SG', name: 'Singapore', region: 'Southeast Asia', language: 'English' },
  { code: 'TH', name: 'Thailand', region: 'Southeast Asia', language: 'Thai' },
  { code: 'TL', name: 'Timor-Leste', region: 'Southeast Asia', language: 'Portuguese' },
  { code: 'VN', name: 'Vietnam', region: 'Southeast Asia', language: 'Vietnamese' },

  // South Asia
  { code: 'AF', name: 'Afghanistan', region: 'South Asia', language: 'Dari' },
  { code: 'BD', name: 'Bangladesh', region: 'South Asia', language: 'Bengali' },
  { code: 'BT', name: 'Bhutan', region: 'South Asia', language: 'Dzongkha' },
  { code: 'IN', name: 'India', region: 'South Asia', language: 'Hindi' },
  { code: 'MV', name: 'Maldives', region: 'South Asia', language: 'Dhivehi' },
  { code: 'NP', name: 'Nepal', region: 'South Asia', language: 'Nepali' },
  { code: 'PK', name: 'Pakistan', region: 'South Asia', language: 'Urdu' },
  { code: 'LK', name: 'Sri Lanka', region: 'South Asia', language: 'Sinhala' },

  // Central Asia
  { code: 'KZ', name: 'Kazakhstan', region: 'Central Asia', language: 'Kazakh' },
  { code: 'KG', name: 'Kyrgyzstan', region: 'Central Asia', language: 'Kyrgyz' },
  { code: 'TJ', name: 'Tajikistan', region: 'Central Asia', language: 'Tajik' },
  { code: 'TM', name: 'Turkmenistan', region: 'Central Asia', language: 'Turkmen' },
  { code: 'UZ', name: 'Uzbekistan', region: 'Central Asia', language: 'Uzbek' },

  // Middle East
  { code: 'BH', name: 'Bahrain', region: 'Middle East', language: 'Arabic' },
  { code: 'EG', name: 'Egypt', region: 'Middle East', language: 'Arabic' },
  { code: 'IR', name: 'Iran', region: 'Middle East', language: 'Persian' },
  { code: 'IQ', name: 'Iraq', region: 'Middle East', language: 'Arabic' },
  { code: 'IL', name: 'Israel', region: 'Middle East', language: 'Hebrew' },
  { code: 'JO', name: 'Jordan', region: 'Middle East', language: 'Arabic' },
  { code: 'KW', name: 'Kuwait', region: 'Middle East', language: 'Arabic' },
  { code: 'LB', name: 'Lebanon', region: 'Middle East', language: 'Arabic' },
  { code: 'OM', name: 'Oman', region: 'Middle East', language: 'Arabic' },
  { code: 'PS', name: 'Palestine', region: 'Middle East', language: 'Arabic' },
  { code: 'QA', name: 'Qatar', region: 'Middle East', language: 'Arabic' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East', language: 'Arabic' },
  { code: 'SY', name: 'Syria', region: 'Middle East', language: 'Arabic' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East', language: 'Arabic' },
  { code: 'YE', name: 'Yemen', region: 'Middle East', language: 'Arabic' },

  // Africa
  { code: 'DZ', name: 'Algeria', region: 'Africa', language: 'Arabic' },
  { code: 'AO', name: 'Angola', region: 'Africa', language: 'Portuguese' },
  { code: 'BJ', name: 'Benin', region: 'Africa', language: 'French' },
  { code: 'BW', name: 'Botswana', region: 'Africa', language: 'Setswana' },
  { code: 'BF', name: 'Burkina Faso', region: 'Africa', language: 'French' },
  { code: 'BI', name: 'Burundi', region: 'Africa', language: 'Kirundi' },
  { code: 'CV', name: 'Cape Verde', region: 'Africa', language: 'Portuguese' },
  { code: 'CM', name: 'Cameroon', region: 'Africa', language: 'French' },
  { code: 'CF', name: 'Central African Republic', region: 'Africa', language: 'Sango' },
  { code: 'TD', name: 'Chad', region: 'Africa', language: 'Arabic' },
  { code: 'KM', name: 'Comoros', region: 'Africa', language: 'Comorian' },
  { code: 'CD', name: 'DR Congo', region: 'Africa', language: 'French' },
  { code: 'CG', name: 'Republic of the Congo', region: 'Africa', language: 'French' },
  { code: 'CI', name: "Côte d'Ivoire", region: 'Africa', language: 'French' },
  { code: 'DJ', name: 'Djibouti', region: 'Africa', language: 'French' },
  { code: 'GQ', name: 'Equatorial Guinea', region: 'Africa', language: 'Spanish' },
  { code: 'ER', name: 'Eritrea', region: 'Africa', language: 'Tigrinya' },
  { code: 'SZ', name: 'Eswatini', region: 'Africa', language: 'Swazi' },
  { code: 'ET', name: 'Ethiopia', region: 'Africa', language: 'Amharic' },
  { code: 'GA', name: 'Gabon', region: 'Africa', language: 'French' },
  { code: 'GM', name: 'Gambia', region: 'Africa', language: 'English' },
  { code: 'GH', name: 'Ghana', region: 'Africa', language: 'English' },
  { code: 'GN', name: 'Guinea', region: 'Africa', language: 'French' },
  { code: 'GW', name: 'Guinea-Bissau', region: 'Africa', language: 'Portuguese' },
  { code: 'KE', name: 'Kenya', region: 'Africa', language: 'Swahili' },
  { code: 'LS', name: 'Lesotho', region: 'Africa', language: 'Sesotho' },
  { code: 'LR', name: 'Liberia', region: 'Africa', language: 'English' },
  { code: 'LY', name: 'Libya', region: 'Africa', language: 'Arabic' },
  { code: 'MG', name: 'Madagascar', region: 'Africa', language: 'Malagasy' },
  { code: 'MW', name: 'Malawi', region: 'Africa', language: 'Chichewa' },
  { code: 'ML', name: 'Mali', region: 'Africa', language: 'French' },
  { code: 'MR', name: 'Mauritania', region: 'Africa', language: 'Arabic' },
  { code: 'MU', name: 'Mauritius', region: 'Africa', language: 'English' },
  { code: 'MA', name: 'Morocco', region: 'Africa', language: 'Arabic' },
  { code: 'MZ', name: 'Mozambique', region: 'Africa', language: 'Portuguese' },
  { code: 'NA', name: 'Namibia', region: 'Africa', language: 'English' },
  { code: 'NE', name: 'Niger', region: 'Africa', language: 'French' },
  { code: 'NG', name: 'Nigeria', region: 'Africa', language: 'English' },
  { code: 'RW', name: 'Rwanda', region: 'Africa', language: 'Kinyarwanda' },
  { code: 'SN', name: 'Senegal', region: 'Africa', language: 'French' },
  { code: 'SC', name: 'Seychelles', region: 'Africa', language: 'Seychellois Creole' },
  { code: 'SL', name: 'Sierra Leone', region: 'Africa', language: 'English' },
  { code: 'SO', name: 'Somalia', region: 'Africa', language: 'Somali' },
  { code: 'ZA', name: 'South Africa', region: 'Africa', language: 'Zulu' },
  { code: 'SS', name: 'South Sudan', region: 'Africa', language: 'English' },
  { code: 'SD', name: 'Sudan', region: 'Africa', language: 'Arabic' },
  { code: 'TZ', name: 'Tanzania', region: 'Africa', language: 'Swahili' },
  { code: 'TG', name: 'Togo', region: 'Africa', language: 'French' },
  { code: 'TN', name: 'Tunisia', region: 'Africa', language: 'Arabic' },
  { code: 'UG', name: 'Uganda', region: 'Africa', language: 'English' },
  { code: 'ZM', name: 'Zambia', region: 'Africa', language: 'English' },
  { code: 'ZW', name: 'Zimbabwe', region: 'Africa', language: 'English' },

  // North America
  { code: 'CA', name: 'Canada', region: 'North America', language: 'English' },
  { code: 'US', name: 'United States', region: 'North America', language: 'English' },

  // Latin America
  { code: 'AR', name: 'Argentina', region: 'Latin America', language: 'Spanish' },
  { code: 'BO', name: 'Bolivia', region: 'Latin America', language: 'Spanish' },
  { code: 'BR', name: 'Brazil', region: 'Latin America', language: 'Portuguese' },
  { code: 'CL', name: 'Chile', region: 'Latin America', language: 'Spanish' },
  { code: 'CO', name: 'Colombia', region: 'Latin America', language: 'Spanish' },
  { code: 'CR', name: 'Costa Rica', region: 'Latin America', language: 'Spanish' },
  { code: 'CU', name: 'Cuba', region: 'Latin America', language: 'Spanish' },
  { code: 'DO', name: 'Dominican Republic', region: 'Latin America', language: 'Spanish' },
  { code: 'EC', name: 'Ecuador', region: 'Latin America', language: 'Spanish' },
  { code: 'SV', name: 'El Salvador', region: 'Latin America', language: 'Spanish' },
  { code: 'GT', name: 'Guatemala', region: 'Latin America', language: 'Spanish' },
  { code: 'HN', name: 'Honduras', region: 'Latin America', language: 'Spanish' },
  { code: 'MX', name: 'Mexico', region: 'Latin America', language: 'Spanish' },
  { code: 'NI', name: 'Nicaragua', region: 'Latin America', language: 'Spanish' },
  { code: 'PA', name: 'Panama', region: 'Latin America', language: 'Spanish' },
  { code: 'PY', name: 'Paraguay', region: 'Latin America', language: 'Spanish' },
  { code: 'PE', name: 'Peru', region: 'Latin America', language: 'Spanish' },
  { code: 'PR', name: 'Puerto Rico', region: 'Latin America', language: 'Spanish' },
  { code: 'UY', name: 'Uruguay', region: 'Latin America', language: 'Spanish' },
  { code: 'VE', name: 'Venezuela', region: 'Latin America', language: 'Spanish' },

  // Caribbean
  { code: 'BZ', name: 'Belize', region: 'Caribbean', language: 'English' },
  { code: 'GY', name: 'Guyana', region: 'Caribbean', language: 'English' },
  { code: 'HT', name: 'Haiti', region: 'Caribbean', language: 'Haitian Creole' },
  { code: 'JM', name: 'Jamaica', region: 'Caribbean', language: 'English' },
  { code: 'SR', name: 'Suriname', region: 'Caribbean', language: 'Dutch' },
  { code: 'TT', name: 'Trinidad and Tobago', region: 'Caribbean', language: 'English' },

  // Oceania
  { code: 'AU', name: 'Australia', region: 'Oceania', language: 'English' },
  { code: 'FJ', name: 'Fiji', region: 'Oceania', language: 'Fijian' },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania', language: 'English' },
  { code: 'PG', name: 'Papua New Guinea', region: 'Oceania', language: 'Tok Pisin' },
  { code: 'WS', name: 'Samoa', region: 'Oceania', language: 'Samoan' },
  { code: 'TO', name: 'Tonga', region: 'Oceania', language: 'Tongan' },
  { code: 'VU', name: 'Vanuatu', region: 'Oceania', language: 'Bislama' },
]

export const languages: string[] = [...new Set(countries.map(c => c.language))].sort()

export function getCountryName(code: string): string {
  return countries.find(c => c.code === code)?.name || code
}

export function getCountryRegion(code: string): string {
  return countries.find(c => c.code === code)?.region || 'Other'
}

export function getCountryLanguage(code: string): string {
  return countries.find(c => c.code === code)?.language || ''
}
