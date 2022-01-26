import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';

// Make a fake graphql template literal
const graphql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: graphql`
    type Mutation {
      addToCart(productID: ID): CartItem
    }
  `,
  resolvers: {
    Mutation: {
      addToCart() {
        // Custom code goes here
        console.log('Add to cart');
      },
    },
  },
});
