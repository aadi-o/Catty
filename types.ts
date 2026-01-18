
export enum CatMood {
  NEUTRAL = 'NEUTRAL',
  ROASTING = 'ROASTING',
  LAUGHING = 'LAUGHING',
  DISGUSTED = 'DISGUSTED',
  BORED = 'BORED',
  ANGRY = 'ANGRY',
  SMUG = 'SMUG',
  SURPRISED = 'SURPRISED',
  SLEEPY = 'SLEEPY',
  HAPPY_SMILE = 'HAPPY_SMILE',
  EVIL_SMILE = 'EVIL_SMILE',
  CURIOUS = 'CURIOUS',
  ANNOYED = 'ANNOYED',
  PLOTTING = 'PLOTTING',
  SARCASTIC = 'SARCASTIC',
  THINKING = 'THINKING'
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'cat';
  mood?: CatMood;
  audioData?: string;
  timestamp: number;
}

export interface CatResponse {
  reply: string;
  mood: CatMood;
}
