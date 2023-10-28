import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'

import { getSnowflake } from '../../utils'

/**
 * Base class for all entities in the application.
 * Provides common properties such as id, createdAt, updatedAt, and deletedAt.
 */
export abstract class EntityBase {
  @PrimaryColumn('varchar')
  public id: string = getSnowflake()

  @CreateDateColumn({
    type: 'datetime'
  })
  public createdAt = new Date()

  @UpdateDateColumn({
    type: 'datetime'
  })
  public updatedAt = new Date()

  @DeleteDateColumn({
    type: 'datetime'
  })
  public deletedAt?: Date
}
