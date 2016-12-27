# koa-graphql-batch
### Koa 2 middleware to support query batching for [react-relay-network-layer](https://github.com/nodkz/react-relay-network-layer)

This is a port of [react-relay-network-layer](https://github.com/nodkz/react-relay-network-layer) own `express` middleware.

## Install
```
npm i koa-graphql-batch --save
```
Plus some peer dependencies you probably already have:
```
npm i graphql koa@^2.0.0 koa-graphql --save
```
And `koa-convert` to use `koa-graphql` with Koa@2
```
npm i koa-convert --save
```
## Usage
This works exactly as the default `express` middleware.
```js
import koa from 'koa';

import graphqlHTTP from 'koa-graphql';
import graphqlBatchHTTPWrapper from 'koa-graphql-batch';

/* some middleware to convert request.body to a JS object */
import bodyParser from 'koa-bodyparser';

/* koa-graphql is a Koa@1 middleware, so needs to be converted */
import convert from 'koa-convert';

/* you'll need some routing middleware also */
import Router from 'koa-router';

import myGraphqlSchema from './graphqlSchema';

const port = 3000;
const server = new Koa();
consr router = new Router();

/* setup standard `graphqlHTTP` Koa middleware */
const graphqlServer = convert(graphqlHTTP({
  schema: myGraphqlSchema,
  formatError: (error) => ({ // better errors for development. `stack` used in `gqErrors` middleware
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack.split('\n') : null,
  }),
}));

/* declare route for batch query */
router.all('/graphql/batch',
  bodyParser(),
  graphqlBatchHTTPWrapper(graphqlServer)
);

/* declare standard graphql route */
router.all('/graphql',
  graphqlServer
);

/* mount routes */
server.use(router.routes()).use(router.allowedMethods());

server.listen(port);
```

## License
MIT
