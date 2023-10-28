import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere
} from 'typeorm'

import { getRepo, Server } from '../db'

interface IConditions {
  id?: string
  guildId?: string
  isEpidemic?: boolean
  conditions?: FindOptionsWhere<Server>
}

export interface IGetServerParams extends IConditions {
  opts?: FindOneOptions<Server>
}

export interface IGetServerListParams extends IConditions {
  opts?: FindManyOptions<Server>
}

export interface IGetOrCreateOneServerParams extends IConditions {
  opts?: FindOneOptions<Server>
  creationParams: ICreateServerParams
}

export interface ICreateServerParams {
  guildId: string
  infectedRoleId?: string
  nurseRoleId?: string
  deadRoleId?: string
  quarantineRoleId?: string
  quarantineChannelId?: string
  isEpidemic?: boolean
}

export interface IUpdateServerParams {
  id: string
  data: DeepPartial<Server>
}

export interface IDeleteServerParams {
  id: string
}

export class ServerService {
  private readonly repo = getRepo(Server)

  public async getOne(params: IGetServerParams = {}): Promise<Server | null> {
    return this.repo.findOne({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async getList(params: IGetServerListParams = {}): Promise<Server[]> {
    return this.repo.find({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async getOrCreateOne(
    params: IGetOrCreateOneServerParams
  ): Promise<Server> {
    const entity = await this.getOne(params)

    if (entity) {
      return entity
    }

    return this.create(params.creationParams)
  }

  public async create(params: ICreateServerParams): Promise<Server> {
    const entity = this.repo.create({
      guildId: params.guildId,
      isEpidemic: params.isEpidemic,
      infectedRoleId: params.infectedRoleId,
      nurseRoleId: params.nurseRoleId,
      deadRoleId: params.deadRoleId,
      quarantineRoleId: params.quarantineRoleId,
      quarantineChannelId: params.quarantineChannelId
    })

    await this.repo.insert(entity)

    return entity
  }

  public async update(params: IUpdateServerParams): Promise<Server> {
    const entity = {
      ...params.data
    }

    await this.repo.update(params.id, entity)

    return entity as Server
  }

  public async delete(params: IDeleteServerParams): Promise<boolean> {
    const result = await this.repo.softDelete(params.id)

    return Boolean(result.affected)
  }

  private makeConditions(params: IConditions): FindOptionsWhere<Server> {
    const conditions = params.conditions || {}

    if (typeof params.id !== 'undefined') {
      conditions.id = params.id
    }

    if (typeof params.guildId !== 'undefined') {
      conditions.guildId = params.guildId
    }

    if (typeof params.isEpidemic !== 'undefined') {
      conditions.isEpidemic = params.isEpidemic
    }

    return conditions
  }
}
