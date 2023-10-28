import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere
} from 'typeorm'

import { CitizenVaccination, getRepo } from '../db'

interface IConditions {
  id?: string
  citizenId?: string
  conditions?: FindOptionsWhere<CitizenVaccination>
}

export interface IGetCitizenVaccinationParams extends IConditions {
  opts?: FindOneOptions<CitizenVaccination>
}

export interface IGetCitizenVaccinationListParams extends IConditions {
  opts?: FindManyOptions<CitizenVaccination>
}

export interface ICreateCitizenVaccinationParams {
  citizenId: string
}

export interface IUpdateCitizenVaccinationParams {
  id: string
  data: DeepPartial<CitizenVaccination>
}

export interface IDeleteCitizenVaccinationParams {
  id: string
}

export class CitizenVaccinationService {
  private readonly repo = getRepo(CitizenVaccination)

  public async getOne(
    params: IGetCitizenVaccinationParams = {}
  ): Promise<CitizenVaccination | null> {
    return this.repo.findOne({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async getList(
    params: IGetCitizenVaccinationListParams = {}
  ): Promise<CitizenVaccination[]> {
    return this.repo.find({
      where: this.makeConditions(params),
      ...params.opts
    })
  }

  public async create(
    params: ICreateCitizenVaccinationParams
  ): Promise<CitizenVaccination> {
    const entity = this.repo.create({
      citizenId: params.citizenId
    })

    await this.repo.insert(entity)

    return entity
  }

  public async update(
    params: IUpdateCitizenVaccinationParams
  ): Promise<CitizenVaccination> {
    const entity = {
      ...params.data
    }

    await this.repo.update(params.id, entity)

    return entity as CitizenVaccination
  }

  public async delete(
    params: IDeleteCitizenVaccinationParams
  ): Promise<boolean> {
    const result = await this.repo.softDelete(params.id)

    return Boolean(result.affected)
  }

  private makeConditions(
    params: IConditions
  ): FindOptionsWhere<CitizenVaccination> {
    const conditions = params.conditions || {}

    if (typeof params.id !== 'undefined') {
      conditions.id = params.id
    }

    if (typeof params.citizenId !== 'undefined') {
      conditions.citizenId = params.citizenId
    }

    return conditions
  }
}
