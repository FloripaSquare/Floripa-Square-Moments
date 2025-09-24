export interface ItemUrl {
  key: string;
  url: string;
}

// lib/types.ts
export type SearchOut = {
  [x: string]: null;
  items: ItemUrl[]; // 👈 agora é array de objetos
  zip?: string; // 👈 backend chama zip, não zip_url
};

export interface UserOut {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
}
