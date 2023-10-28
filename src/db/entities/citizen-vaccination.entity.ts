import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Citizen } from './citizen.entity'
import { EntityBase } from './common'

@Entity('citizen-vaccinations')
export class CitizenVaccination extends EntityBase {
  @ManyToOne(() => Citizen, (citizen) => citizen.vaccinations)
  @JoinColumn()
  public citizen!: Citizen

  @Column('varchar')
  public citizenId!: string
}
