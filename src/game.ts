interface Game {
    id: number;
    name: string;
    imageUrl: string;
    packs: Pack[];
  }
  
  interface Pack {
    name: string;
    price: string;
  }
  