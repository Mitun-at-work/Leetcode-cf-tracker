// Real communist-inspired motivational quotes
export const COMMUNISM_QUOTES = [
  "Workers of the world, unite! You have nothing to lose but your chains.",
  "The history of all hitherto existing society is the history of class struggles.",
  "From each according to his ability, to each according to his needs.",
  "The theory of communism may be summed up in one sentence: Abolish private property.",
  "A specter is haunting Europe — the specter of communism.",
  "Let the ruling classes tremble at a communist revolution.",
  "The workers have nothing to lose but their chains. They have the world to gain.",
  "In a higher phase of communist society, after the enslaving subordination of the individual to the division of labor has disappeared.",
  "The communist movement is the most advanced and resolute of all working-class movements.",
  "Communism is not a state of affairs which is to be established, an ideal to which reality will have to adjust itself.",
  "The working class is revolutionary or it is nothing.",
  "Every step of real movement is more important than a dozen programmes.",
  "The only way to deal with an unfree world is to become so absolutely free that the very existence of such a world is a problem for you.",
  "We are not content with a capitalism reformed.",
  "The future is bright, the future is red.",
  "Beneath the cobblestones lies the beach.",
  "Solidarity is our weapon.",
  "In the struggle between you and the world, back the world.",
  "All that is solid melts into air.",
  "Ideas are far more powerful than guns.",
  "The point is not to interpret the world, but to change it.",
  "We make history, not the other way around.",
  "An injury to one is an injury to all.",
  "The people united will never be defeated.",
  "Rise up, work for a new world, together we will win.",
  "In unity there is strength.",
  "The masses make history.",
  "Comrades, the revolution is permanent.",
  "Long live the international spirit of the working class!",
  "Power to the people.",
  "All power to the soviets!",
  "The proletariat has nothing to lose but its chains.",
  "We shall overcome.",
  "No gods, no masters, only us.",
  "Working together, we are stronger.",
  "The future belongs to those who build it.",
  "Justice for all demands communism.",
  "Break the chains of capitalism.",
  "The revolution eats well.",
  "Vive la révolution!",
  "The workers will rise again.",
  "Common property, common future.",
  "Seize the means of production.",
  "We are the ones we've been waiting for.",
  "The revolution will not be televised.",
  "From oppression to liberation.",
  "Equal rights for equal people.",
  "The world is ours to transform.",
  "United we stand, divided we fall.",
  "Dignity, bread, and roses.",
  "The struggle continues.",
  "Humanity will be free.",
  "Organize, agitate, educate.",
  "The fight for freedom never ends.",
  "Today's struggle is tomorrow's freedom.",
  "Build the world anew.",
  "Comrades, forward to victory!",
  "The red flag waves eternal.",
  "For a just world, for all.",
  "Revolution is love.",
];

export function getRandomQuote(): string {
  return COMMUNISM_QUOTES[Math.floor(Math.random() * COMMUNISM_QUOTES.length)];
}

export function getQuoteOfTheDay(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return COMMUNISM_QUOTES[dayOfYear % COMMUNISM_QUOTES.length];
}
