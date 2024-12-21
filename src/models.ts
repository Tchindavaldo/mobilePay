// models.ts

export interface Pack {
    name: string;
    price: string;
  }
  
  export interface Game {
    id: number;
    name: string;
    imageUrl: string;
    packs: Pack[];
  }
  