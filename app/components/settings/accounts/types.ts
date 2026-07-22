export type AccountCategory = 'banking' | 'investment';

export type AccountTypeLabel = 'Broker' | 'Exchange' | 'Web3 Wallet';

export interface PendingDisconnect {
  id: string;
  name: string;
  category: AccountCategory;
  accountType?: AccountTypeLabel;
}

export interface AccountListItem {
  id: string;
  name: string;
  subtitle: string;
  logo: string;
}
