
export type UserRole = 
  | 'admin' 
  | 'md' 
  | 'it' 
  | 'design' 
  | 'client-manager' 
  | 'store' 
  | 'accounts' 
  | 'site' 
  | 'client'
  | 'site-engineer'
  | 'purchase-manager'
  | 'qa-manager'
  | 'tender-manager'
  | 'finance-controller'
  | 'central-store-manager';

export interface RolePermissions {
  projectManagement: boolean;
  tenderManagement: boolean;
  billingModule: boolean;
  assetsAndMachinery: boolean;
  purchaseManagement: boolean;
  accountsModule: boolean;
  qualityAssurance: boolean;
  centralStoreAccess: boolean;
  approvalAuthority: string[];
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: true,
    centralStoreAccess: true,
    approvalAuthority: ['all']
  },
  md: {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: true,
    centralStoreAccess: true,
    approvalAuthority: ['all']
  },
  'site-engineer': {
    projectManagement: true,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['material-request', 'labor-entry']
  },
  'purchase-manager': {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: false,
    centralStoreAccess: true,
    approvalAuthority: ['purchase-order', 'vendor-approval']
  },
  'qa-manager': {
    projectManagement: true,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['quality-inspection', 'material-acceptance']
  },
  'tender-manager': {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: true,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['tender-submission', 'bid-preparation']
  },
  'finance-controller': {
    projectManagement: false,
    tenderManagement: false,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['payment-approval', 'budget-allocation']
  },
  'central-store-manager': {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: true,
    approvalAuthority: ['inter-site-transfer', 'asset-allocation']
  },
  store: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['material-request', 'stock-update']
  },
  site: {
    projectManagement: true,
    tenderManagement: false,
    billingModule: true,
    assetsAndMachinery: true,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['project-milestone', 'labor-approval']
  },
  accounts: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['payment-processing', 'expense-approval']
  },
  'client-manager': {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['client-communication']
  },
  design: {
    projectManagement: true,
    tenderManagement: true,
    billingModule: false,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['design-approval', 'material-specification']
  },
  it: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: true,
    approvalAuthority: ['system-access']
  },
  client: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: []
  }
};
