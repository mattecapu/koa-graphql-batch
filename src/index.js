import { formatError } from 'graphql';

export default function (graphqlHTTPMiddleware, formatErrorFn = formatError) {
	return (context, next) => {
		let { response, request } = context;

		response.type =
			'application/json';

		return Promise.all(
			request.body.map((data) => {
				/*
					create stub request, response and context
					to fake usual objects for the GraphQL middleware
				*/
				const subRequest = {
					__proto__:
						request.__proto__,
					...request,
					body:
						data
				};
				const subResponse = {
					__proto__:
							response.__proto__,
					...response
				}
				const subContext = {
					...context,
					response:
						subResponse,
					request:
						subRequest,
					req:
						subRequest,
					res:
						subResponse
				};

				return graphqlHTTPMiddleware(subContext)
					.then(() => {
						return {
							id:
								data.id,
							status:
								subContext.response.status,
							payload:
								subContext.response.body
						}
					});
			})
		).then((responses) => {
			return {
				/* use last given status */
				status:
					responses.reduce(
						(last, { status }) => status || last,
						200
					),
				/* each payload is already a JSON string, so JSON.stringify would not work as intended */
				body: `[${
					responses.map(({ id, payload }) => {
						return `{ "id": "${id}", "payload": ${payload} }`;
					}).join(', ')
				}]`
			};
		}).catch((error) => {
			/* batching error: return errors */
			return {
				status:
					500,
				body: request.body.map(({ id }) => {
					return {
						id,
						payload: JSON.stringify({
							errors:
								[ formatErrorFn(error) ]
						})
					}
				})
			}
		}).then(({ status, body }) => {
			response.status =
				status;
			response.body =
				body;
		}).then(
			next
		);
	};
}
