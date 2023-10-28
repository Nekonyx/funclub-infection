export enum Color {
  Blue = 0x7289da,
  Green = 0x43b581,
  Yellow = 0xe6c547,
  Red = 0xf04747
}

/** Страна */
export enum Country {
  Russia = 'ru',
  Ukraine = 'ua',
  Belarus = 'by',
  Kazakhstan = 'kz',
  Israel = 'il',
  USA = 'us',
  China = 'cn'
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
export const COUGH_MESSAGE: string[] = ['*кашляет*', '*кашель*', '*кхе-кхе*']

/**
 * Время до выздоровления в карантине в миллисекундах.
 * По умолчанию 2 дня.
 */
export const RECOVERY_TIME = 86400 * 2 * 1000

/**
 * Время до смерти вне карантина в миллисекундах.
 * По умолчанию 1.5 дня.
 */
export const DEATH_TIME = 86400 * 1.5 * 1000

/**
 * Время между вакцинациями.
 * По умолчанию 1 день
 */
export const VACCINATION_TIME = 86400 * 1 * 1000

/** Флаг страны */
export const CountryFlag: Record<Country, string> = {
  [Country.Russia]: '🇷🇺',
  [Country.Ukraine]: '🇺🇦',
  [Country.Belarus]: '🇧🇾',
  [Country.Kazakhstan]: '🇰🇿',
  [Country.Israel]: '🇮🇱',
  [Country.USA]: '🇺🇸',
  [Country.China]: '🇨🇳'
}

/** Название страны */
export const CountryName: Record<Country, string> = {
  [Country.Russia]: 'Российская Империя',
  [Country.Ukraine]: 'Украинский Союз',
  [Country.Belarus]: 'Беларуская Держава',
  [Country.Kazakhstan]: 'Казахское Ханство',
  [Country.Israel]: 'Израильская Община',
  [Country.USA]: 'Соединённый Материк Америки',
  [Country.China]: 'Китайская Федерация'
}

/** Список стран */
export const CountryList: Country[] = [
  Country.Russia,
  Country.Ukraine,
  Country.Belarus,
  Country.Kazakhstan,
  Country.Israel,
  Country.USA,
  Country.China
]
