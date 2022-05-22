import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { Role } from './schemas/Role';
import { User } from './schemas/User';
import { CartItem } from './schemas/CartItem';
import { OrderItem } from './schemas/OrderItem';
import { Order } from './schemas/Order';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import 'dotenv/config';

import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations';
import { permissionsList } from './schemas/fields';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const originWhiteList = [
  'https://sick-fits-frontend-git-main-kylethieves.vercel.app',
  'https://sick-fits-frontend-kylethieves.vercel.app',
  'https://sick-fits-frontend-git-main-kylethieves.vercel.app/',
];

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long should they stay signed in?
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: add in initial roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: originWhiteList,
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        console.log('------- Connected to the database! -------');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      // Schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
      OrderItem,
      Order,
      Role,
    }),
    graphql: {
      // @ts-ignore
      cors: {
        origin: originWhiteList,
      },
    },
    extendGraphqlSchema,
    ui: {
      // Show the UI only for people who pass this test
      isAccessAllowed: ({ session }) =>
        // console.log(session);
        !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  })
);
