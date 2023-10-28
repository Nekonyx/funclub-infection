import { createHash } from 'crypto'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { musicCard as CardImage } from 'musicard'
import { resolve } from 'path'

const certificatesDir = resolve(process.cwd(), './data/certificates')

export interface IGetVaccinationCertificateParams {
  id: string
  isDead: boolean
  username: string
  avatarUrl: string
}

export async function getVaccinationCertificate(
  params: IGetVaccinationCertificateParams
): Promise<Buffer> {
  const hash = createHash('md5')
    .update(params.username + params.avatarUrl)
    .digest('hex')

  const path = resolve(certificatesDir, `${params.id}-${hash}.png`)

  if (existsSync(path)) {
    return readFile(path)
  }

  const card = new CardImage({
    author: params.isDead ? 'Умер' : 'Вакцинирован',
    name: params.username,
    color: '#28aef4',
    thumbnail: params.avatarUrl,
    brightness: 100,
    progress: 50,
    theme: 'dynamic'
  })

  const buffer = await card.build()

  await writeFile(path, buffer)

  return buffer
}
