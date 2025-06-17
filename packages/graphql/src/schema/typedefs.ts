import { gql } from "apollo-server-express";

// Define GraphQL schema
export const typeDefs = gql`
  type Query {
    echo(message: String!): String!
  }

  type Mutation {
    addToBasket(sku: String!, basketId: String!, userId: String!): AddToBasketResponse!
  }

  type AddToBasketResponse {
    success: Boolean!
    message: String
  }
`;