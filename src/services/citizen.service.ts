import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere
} from 'typeorm'

import { CitizenStatus, Country, MAX_AGE, MIN_AGE } from '../constants'
import { Citizen, getRepo } from '../db'
import { citizenEvents } from '../events/citizen'
import { getRandomCountry, getRandomInteger } from '../utils'

interface IConditions {
  id?: string
  userId?: string
  serverId?: string
  age?: number
  isImmune?: boolean
  country?: Country
  status?: CitizenStatus
  conditions?: FindOptionsWhere<Citizen>
}

export interface IGetCitizenParams extends IConditions {
  opts?: FindOneOptions<Citizen>
}

export interface IGetCitizenListParams extends IConditions {
  opts?: FindManyOptions<Citizen>
}

export interface IGetOrCreateOneCitizenParams extends IConditions {
  opts?: FindOneOptions<Citizen>
  creationParams: ICreateCitizenParams
}

export interface ICreateCitizenParams {
  userId: string
  serverId: string
  age?: number
  country?: Country
  isImmune?: boolean
  status?: CitizenStatus
  infectionDate?: Date
  recoveryDate?: Date
  deathDate?: Date
}

export interface IUpdateCitizenParams {
  id: string
  data: DeepPartial<Citizen>
}

export interface IDeleteCitizenParams {
  id: string
}

export class CitizenService {
  private readonly repo = getRepo(Citizen)

  public async getOne(params: IGetCitizenParams = {}): Promise<Citizen | null> {
    return this.repo.findOne({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async getList(params: IGetCitizenListParams = {}): Promise<Citizen[]> {
    return this.repo.find({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async getOrCreateOne(
    params: IGetOrCreateOneCitizenParams
  ): Promise<Citizen> {
    const entity = await this.getOne(params)

    if (entity) {
      return entity
    }

    return this.create(params.creationParams)
  }

  public async markInfected(citizen: Citizen, notify: boolean = true): Promise<void> {
    await this.updateStatus(citizen, CitizenStatus.Infected)
    citizenEvents.emit('infected', citizen, notify)
  }

  public async markRecovered(citizen: Citizen, notify: boolean = true): Promise<void> {
    await this.updateStatus(citizen, CitizenStatus.Recovered)
    citizenEvents.emit('recovered', citizen, notify)
  }

  public async markDead(citizen: Citizen, notify: boolean = true): Promise<void> {
    await this.updateStatus(citizen, CitizenStatus.Dead)
    citizenEvents.emit('died', citizen, notify)
  }

  public async create(params: ICreateCitizenParams): Promise<Citizen> {
    const entity = this.repo.create({
      userId: params.userId,
      serverId: params.serverId,
      age: params.age ?? getRandomInteger(MIN_AGE, MAX_AGE),
      country: params.country ?? getRandomCountry(),
      status: params.status ?? CitizenStatus.Healthy,
      isImmune: params.isImmune ?? false,
      infectionDate:
        params.status === CitizenStatus.Infected
          ? params.infectionDate || new Date()
          : undefined,
      recoveryDate:
        params.status === CitizenStatus.Recovered
          ? params.recoveryDate || new Date()
          : undefined,
      deathDate:
        params.status === CitizenStatus.Dead
          ? params.deathDate || new Date()
          : undefined
    })

    await this.repo.insert(entity)

    return entity
  }

  public async update(params: IUpdateCitizenParams): Promise<Citizen> {
    const entity = {
      ...params.data
    }

    await this.repo.update(params.id, entity)

    return entity as Citizen
  }

  public async updateStatus(
    citizen: Citizen,
    status: CitizenStatus,
    date: Date = new Date()
  ): Promise<Citizen> {
    if (citizen.status === status) {
      return citizen
    }

    return this.update({
      id: citizen.id,
      data: {
        status,
        infectionDate: status === CitizenStatus.Infected ? date : undefined,
        recoveryDate: status === CitizenStatus.Recovered ? date : undefined,
        deathDate: status === CitizenStatus.Dead ? date : undefined
      }
    })
  }

  public async updateImmuneStatus(
    citizen: Citizen,
    isImmune: boolean
  ): Promise<Citizen> {
    if (citizen.isImmune === isImmune) {
      return citizen
    }

    return this.update({
      id: citizen.id,
      data: {
        isImmune: isImmune
      }
    })
  }

  public async delete(params: IDeleteCitizenParams): Promise<boolean> {
    const result = await this.repo.softDelete(params.id)

    return Boolean(result.affected)
  }

  private makeConditions(params: IConditions): FindOptionsWhere<Citizen> {
    const conditions = params.conditions || {}

    if (typeof params.id !== 'undefined') {
      conditions.id = params.id
    }

    if (typeof params.userId !== 'undefined') {
      conditions.userId = params.userId
    }

    if (typeof params.serverId !== 'undefined') {
      conditions.serverId = params.serverId
    }

    if (typeof params.age !== 'undefined') {
      conditions.age = params.age
    }

    if (typeof params.isImmune !== 'undefined') {
      conditions.isImmune = params.isImmune
    }

    if (typeof params.country !== 'undefined') {
      conditions.country = params.country
    }

    if (typeof params.status !== 'undefined') {
      conditions.status = params.status
    }

    return conditions
  }
}
