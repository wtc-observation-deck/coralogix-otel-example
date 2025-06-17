import { addToBasketResolver } from "../resolvers/addToBasket.resolver.js";
import { echoResolver } from "../resolvers/echo.resolver.js";

import { IResolvers } from "@graphql-tools/utils";

// Define resolvers
export const resolvers: IResolvers<string, unknown>  = {
  Query: {
    echo: echoResolver,
  },
  Mutation: {
    addToBasket: addToBasketResolver
  },
};