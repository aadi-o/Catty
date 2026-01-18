
export enum CatMood {
  NEUTRAL = 'NEUTRAL',
  ROASTING = 'ROASTING',
  LAUGHING = 'LAUGHING',
  DISGUSTED = 'DISGUSTED',
  BORED = 'BORED'
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'cat';
  mood?: CatMood;
  timestamp: number;
}

export interface CatResponse {
  reply: string;
  mood: CatMood;
}
