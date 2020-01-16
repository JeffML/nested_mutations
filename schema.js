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

// The original mutation sequencer by Mathew Lanigan
// This is the one used in the freeCodeCamp article
class Sequential {
  constructor() {
    this.promise = Promise.resolve()
  }

  message({id, wait}) {
    this.promise = this.promise.then(() => msg(id, wait))
    return this.promise
  }
}

/* 
The following is an attempt to create a generalized sequencer:
"The main benefit of the Sequencer over my original Sequential implementation 
is that Sequencer is a generalization that can be applied to any non-root 
resolver object, and doesn't require the underlying object to be aware 
of the promise at all." -- Mathew Lanigan

This was not covered in the article.
 */  
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
