import {makeExecutableSchema} from 'graphql-tools';

const typeDefs = `
type Query {
  noop: String!
}

type MessageOps {
  message(id: ID!, wait: Int!): String!
}

type Mutation {
  message(id: ID!, wait: Int!): String!
  Nested: MessageOps
}
`

const msg = (id, wait) => new Promise(resolve => {
  setTimeout(() => {
    console.log({id, wait})
    let message = `response to message ${id}, wait is ${wait} seconds`;
    resolve(message);
  }, wait)
})

const resolvers = {
  Mutation: {
    message: (_, {id, wait}) => msg(id, wait),
    Nested: () => ({
      message: ({id, wait}) => msg(id, wait)
    })

  }
}

const schema = makeExecutableSchema({typeDefs, resolvers});
export {
  schema
};
