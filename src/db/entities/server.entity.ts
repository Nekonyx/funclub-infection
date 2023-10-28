import { Column, Entity, Index, OneToMany } from 'typeorm'

import { Citizen } from './citizen.entity'
import { EntityBase } from './common'

@Entity('servers')
export class Server extends EntityBase {
  /** ID сервера */
  @Index()
  @Column('varchar')
  public guildId!: string

  /** Находится ли в состоянии эпидемии */
  @Index()
  @Column('boolean', {
    default: false
  })
  public isEpidemic!: boolean

  /** Кол-во препаратов */
  @Index()
  @Column('integer', {
    default: 5
  })
  public drugsCount!: number

  /** Роль инфицированного */
  @Index()
  @Column('varchar', {
    nullable: true
  })
  public infectedRoleId?: string

  /** Роль доктора */
  @Index()
  @Column('varchar', {
    nullable: true
  })
  public nurseRoleId?: string

  /** Роль умершего */
  @Index()
  @Column('varchar', {
    nullable: true
  })
  public deadRoleId?: string

  /** Роль изолированного */
  @Index()
  @Column('varchar', {
    nullable: true
  })
  public quarantineRoleId?: string

  /** ID канала с карантина */
  @Index()
  @Column('varchar', {
    nullable: true
  })
  public quarantineChannelId?: string

  /** Граждане сервера */
  @OneToMany(() => Citizen, (citizen) => citizen.server)
  public citizens!: Citizen[]

  /** Активен ли сервер */
  public get isActive(): boolean {
    return Boolean(
      this.infectedRoleId &&
        this.nurseRoleId &&
        this.deadRoleId &&
        this.quarantineRoleId &&
        this.quarantineChannelId
    )
  }
}
