import express from 'express';
import {ApolloServer} from 'apollo-server-express';

import {typeDefs, resolvers} from './schema';

const PORT = 4000;
const server = new ApolloServer({typeDefs, resolvers});

const app = express();
server.applyMiddleware({app})

app.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
