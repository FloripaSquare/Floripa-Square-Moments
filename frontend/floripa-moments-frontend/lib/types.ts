// lib/types.ts
export type ItemUrl = {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // caso tenha outros campos dinâmicos
};

export type SearchOut = {
  items: ItemUrl[]; // array de objetos, obrigatório
  zip?: string; // optional
  nextCursor?: string | null; // opcional para paginação
};

export interface UserOut {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
}
