import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { musicCard as CardImage } from 'musicard'
import { resolve } from 'path'

import { Color } from '../../constants'

const certificatesDir = resolve(process.cwd(), './data/certificates')

export interface IGetVaccinationCertificateParams {
  id: string
  username: string
  avatarUrl: string
}

export async function getVaccinationCertificate(
  params: IGetVaccinationCertificateParams
): Promise<Buffer> {
  const path = resolve(certificatesDir, `${params.id}.png`)

  if (existsSync(path)) {
    return readFile(path)
  }

  const card = new CardImage({
    author: 'Справка о вакцинации',
    name: params.username,
    color: 'auto',
    thumbnail: params.avatarUrl,
    brightness: 50,
    progress: 100,
    theme: 'dynamic'
  })

  const buffer = await card.build()

  await writeFile(path, buffer)

  return buffer
}
