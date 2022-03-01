// At its simplest, the access control returns a yes or no value depending on the users session

import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

// Permissions check if someone meets a criteria - yes or no

export const permissions = {
  ...generatedPermissions,
  isAwesome({ session }: ListAccessArgs): boolean {
    return session?.data.name.includes('AlsoPeters');
  },
};

// Rule based function
// Rules can retrun a boolean - yes or no - or a filter wich limits which products they can CRUD.
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    return { user: { id: session.itemId } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything.
    }
    // They should only see available products (based on the status field)
    return { status: 'AVAILABLE' };
  },
};
