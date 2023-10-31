export enum Color {
  Blue = 0x1aa7ec,
  Green = 0x41fa90,
  Yellow = 0xfccf57,
  Red = 0xff6d6d
}

/** Страна */
export enum Country {
  Russia = 'ru',
  Ukraine = 'ua',
  Belarus = 'by',
  Kazakhstan = 'kz',
  Israel = 'il',
  USA = 'us',
  China = 'cn',
  Japan = 'jp',
  Palestine = 'ps'
}

/** Состояние гражданина */
export enum CitizenStatus {
  /** Здоров */
  Healthy = 'healthy',
  /** Инфицирован */
  Infected = 'infected',
  /** Излечён */
  Recovered = 'recovered',
  /** Скончался */
  Dead = 'dead'
}

/** Название вируса */
export const VIRUS_NAME = 'BSDM-69'

/** Иконка маски */
export const MASK_ICON = '😷'

/** Минимальный возможный возраст */
export const MIN_AGE = 16

/** Максимальный возможный возраст */
export const MAX_AGE = 70

/** Сообщения о кашле */
export const COUGH_MESSAGE: string[] = [
  '*кашляет*',
  '_кашляет_',
  '*кашель*',
  '_кашель_',
  '*кхе-кхе*',
  '_кхе-кхе_'
]

/**
 * Время до смерти в карантине в миллисекундах.
 * По умолчанию 3 дня.
 */
export const QUARANTIME_TIME = 1000

/**
 * Время до смерти вне карантина в миллисекундах.
 * По умолчанию 1.5 дня.
 */
export const DEATH_TIME = 1000

/**
 * Время между вакцинациями.
 * По умолчанию 12 часов
 */
export const VACCINATION_TIME = 86400 / 100 * 1000

/** Флаг страны */
export const CountryFlag: Record<Country, string> = {
  [Country.Russia]: '🇷🇺',
  [Country.Ukraine]: '🇺🇦',
  [Country.Belarus]: '🇧🇾',
  [Country.Kazakhstan]: '🇰🇿',
  [Country.Israel]: '🇮🇱',
  [Country.USA]: '🇺🇸',
  [Country.China]: '🇨🇳',
  [Country.Japan]: '🇯🇵',
  [Country.Palestine]: '🇵🇸'
}

/** Название страны */
export const CountryName: Record<Country, string> = {
  [Country.Russia]: 'Российская Империя',
  [Country.Ukraine]: 'Украинский Континент',
  [Country.Belarus]: 'Беларуская Держава',
  [Country.Kazakhstan]: 'Казахское Ханство',
  [Country.Israel]: 'Израильская Община',
  [Country.USA]: 'Соединённый Союз Америки',
  [Country.China]: 'Китайская Федерация',
  [Country.Japan]: 'Японский Иссекай',
  [Country.Palestine]: 'Палестинская Ядерная Держава'
}

/** Список стран */
export const CountryList: Country[] = [
  Country.Russia,
  Country.Ukraine,
  Country.Belarus,
  Country.Kazakhstan,
  Country.Israel,
  Country.USA,
  Country.China,
  Country.Japan,
  Country.Palestine
]
