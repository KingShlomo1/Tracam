/** Fun little photo challenges to keep travel photography playful. */

export interface Challenge {
  id: string;
  emoji: string;
  text: string;
}

export const CHALLENGES: Challenge[] = [
  { id: "sunrise", emoji: "🌅", text: "Catch a sunrise or sunset" },
  { id: "local-food", emoji: "🍜", text: "A plate of local food before you dig in" },
  { id: "animal", emoji: "🐾", text: "An animal in the wild (elephants count!)" },
  { id: "reflection", emoji: "💧", text: "A reflection in water or glass" },
  { id: "door", emoji: "🚪", text: "A beautiful old door or window" },
  { id: "market", emoji: "🧺", text: "Colour and chaos at a local market" },
  { id: "stranger", emoji: "😊", text: "A friendly stranger (ask first!)" },
  { id: "from-above", emoji: "🕊️", text: "A view from up high" },
  { id: "tiny-detail", emoji: "🔍", text: "A tiny detail most people walk past" },
  { id: "soft-red", emoji: "🍓", text: "Something soft red, just like Tracam" },
];
