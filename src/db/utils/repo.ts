import { EntityTarget, ObjectLiteral, Repository } from 'typeorm'

import { dataSource } from '../data-source'

const cache = new Map<EntityTarget<ObjectLiteral>, Repository<any>>()

/**
 * Returns a repository instance for the given entity target. If the repository instance
 * is not already cached, it will be created and cached for future use.
 *
 * @template T - The type of the entity.
 * @param {EntityTarget<T>} target - The entity target for which to get the repository instance.
 * @returns {Repository<T>} - The repository instance for the given entity target.
 */
export function getRepo<T extends ObjectLiteral>(
  target: EntityTarget<T>
): Repository<T> {
  let repo = cache.get(target)

  if (!repo) {
    repo = dataSource.getRepository(target)
    cache.set(target, repo)
  }

  return repo
}
