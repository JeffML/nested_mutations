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
  Sequencer: MessageOps
  Sequential: MessageOps
}
`

const msg = (id, wait) => new Promise(resolve => {
  setTimeout(() => {
    console.log({id, wait})
    let message = `response to message ${id}, wait is ${wait} seconds`;
    resolve(message);
  }, wait)
})

// original Sequencer (Mathew Lanigan)
class Sequential {
  constructor() {
    this.promise = Promise.resolve()
  }

  message({id, wait}) {
    this.promise = this.promise.then(() => msg(id, wait))
    return this.promise
  }
}

class Sequencer {
  constructor(target, options) {
    let { promise = Promise.resolve() } = options || {};
    this.promise = promise;

    return this.wrap(target);
  }

  wrap(val) {
    if ((typeof val === 'object' || typeof val === 'function') && val !== null) {
      return new Proxy(val, this);
    }

    return val;
  }

  get(target, prop, receiver) {
    const val = target[prop];

    if (typeof val === 'function') {
      return (...args) => {
        this.promise = this.promise.then(async () => {
          const ret = await val(...args);
          return this.wrap(ret);
        });
        return this.promise;
      }
    } else {
      return this.wrap(val);
    }
  }
}

const resolvers = {
  Mutation: {
    message: (_, {id, wait}) => msg(id, wait),
    Nested: () => ({
      message: ({id, wait}) => msg(id, wait)
    }),
    Sequencer: () => new Sequencer({
      message: ({id, wait}) => msg(id, wait)
    }),
    Sequential: () => new Sequential(),
  }
}

export {
  typeDefs, resolvers
};
