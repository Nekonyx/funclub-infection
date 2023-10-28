import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm'

import { CitizenStatus, Country } from '../../constants'
import { CitizenVaccination } from './citizen-vaccination.entity'
import { EntityBase } from './common'
import { Server } from './server.entity'

@Index(['userId', 'serverId'], {
  unique: true
})
@Entity('citizens')
export class Citizen extends EntityBase {
  /** Возраст */
  @Index()
  @Column('integer')
  public age!: number

  /** Страна проживания */
  @Index()
  @Column('char', {
    length: 2
  })
  public country!: Country

  /** Статус гражданина */
  @Index()
  @Column('varchar', {
    default: CitizenStatus.Healthy
  })
  public status!: CitizenStatus

  /** Дата инфицирования */
  @Index()
  @Column('datetime', {
    nullable: true
  })
  public infectionDate?: Date

  /** Дата выздоровления */
  @Index()
  @Column('datetime', {
    nullable: true
  })
  public recoveryDate?: Date

  /** Дата смерти */
  @Index()
  @Column('datetime', {
    nullable: true
  })
  public deathDate?: Date

  @Index()
  @Column('boolean', {
    default: false
  })
  public isImmune?: boolean

  /** ID пользователя */
  @Index()
  @Column('varchar')
  public userId!: string

  /** Сервер */
  @ManyToOne(() => Server, (server) => server.citizens)
  @JoinColumn()
  public server!: Server

  /** ID сервера */
  @Index()
  @Column('varchar')
  public serverId!: string

  /** Список вакцинации */
  @OneToMany(() => CitizenVaccination, (vaccination) => vaccination.citizen)
  public vaccinations!: CitizenVaccination[]
}
