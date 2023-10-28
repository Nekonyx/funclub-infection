// @ts-check

/**
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  plop.setGenerator('entity', {
    description: 'typeorm entity',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'entity name please'
      }
    ],
    actions: [
      // 1. create a new entity
      {
        type: 'add',
        path: 'src/db/entities/{{kebabCase name}}.entity.ts',
        templateFile: 'scripts/plop/entity-template.hbs'
      },
      // 2. add entity to index.ts
      {
        type: 'modify',
        path: 'src/db/entities/index.ts',
        transform(template, data) {
          const pascalCase = plop.getHelper('pascalCase')(data.name)
          const kebabCase = plop.getHelper('kebabCase')(data.name)

          return `${template.trim()}\nexport { ${pascalCase} } from './${kebabCase}.entity'\n`
        }
      }
    ]
  })

  plop.setGenerator('service', {
    description: 'service for typeorm entity',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'entity name please'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/services/{{kebabCase name}}.service.ts',
        templateFile: 'scripts/plop/service-template.hbs'
      }
    ]
  })
}
