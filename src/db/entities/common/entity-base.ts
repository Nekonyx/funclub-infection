import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn
} from 'typeorm'

import { getSnowflake } from '../../utils'

/**
 * Base class for all entities in the application.
 * Provides common properties such as id, createdAt, updatedAt, and deletedAt.
 */
export abstract class EntityBase {
  @Column({
    type: 'varchar'
  })
  public id: string = getSnowflake()

  @CreateDateColumn({
    type: 'timestamptz'
  })
  public createdAt = new Date()

  @UpdateDateColumn({
    type: 'timestamptz'
  })
  public updatedAt = new Date()

  @DeleteDateColumn({
    type: 'timestamptz'
  })
  public deletedAt?: Date
}
