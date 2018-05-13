import express from 'express';
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express';
import bodyParser from 'body-parser';

import {schema} from './schema';

import {execute, subscribe} from "graphql";
import {createServer} from "http";

const PORT = 4000;
const server = express();

server.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

server.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

server.listen(PORT, () => console.log(`GraphQL Server is now running on http://localhost:${PORT}`));
