export const SUBNET_PREFIX_MIN = 24;
export const SUBNET_PREFIX_MAX = 30;
export const DECIMAL_VALUE_MIN = 0;
export const DECIMAL_VALUE_MAX = 255;

function randomInteger(min, max, random = Math.random) {
  return min + Math.floor(random() * (max - min + 1));
}

function shuffled(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function generateUniqueDistractors(correctAnswer, candidates, count = 3, random = Math.random) {
  const correct = String(correctAnswer);
  const unique = [...new Set(candidates.map(String))].filter((answer) => answer !== correct);
  if (unique.length < count) throw new Error('Not enough unique distractors.');
  return shuffled(unique, random).slice(0, count);
}

export function shuffleAnswers(correctAnswer, distractors, random = Math.random) {
  const correct = String(correctAnswer);
  const answers = shuffled([correct, ...distractors.map(String)], random);
  if (answers.length !== 4 || new Set(answers).size !== 4) {
    throw new Error('Quiz answers must contain four unique values.');
  }
  return { answers, correctAnswer: answers.indexOf(correct) };
}

function generateSubnetQuestion(random = Math.random) {
  const prefix = randomInteger(SUBNET_PREFIX_MIN, SUBNET_PREFIX_MAX, random);
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = totalAddresses - 2;
  const candidates = [
    totalAddresses,
    Math.max(0, usableHosts - 2),
    usableHosts + 2,
    prefix > SUBNET_PREFIX_MIN ? 2 ** (33 - prefix) - 2 : null,
    prefix < SUBNET_PREFIX_MAX ? 2 ** (31 - prefix) - 2 : null,
    Math.max(0, totalAddresses / 2),
  ].filter((value) => Number.isInteger(value) && value >= 0);
  const distractors = generateUniqueDistractors(usableHosts, candidates, 3, random);
  return {
    question: `Wie viele nutzbare Host-Adressen hat ein /${prefix}-Netz?`,
    ...shuffleAnswers(usableHosts, distractors, random),
    explanation: `Ein /${prefix}-Netz hat ${totalAddresses} Adressen. Abzüglich Netz- und Broadcastadresse bleiben ${usableHosts} nutzbare Hosts.`,
  };
}

function toEightBitBinary(value) {
  return value.toString(2).padStart(8, '0');
}

function generateDecimalBinaryQuestion(random = Math.random) {
  const decimal = randomInteger(DECIMAL_VALUE_MIN, DECIMAL_VALUE_MAX, random);
  const binary = toEightBitBinary(decimal);
  const candidates = Array.from({ length: 8 }, (_, bit) => toEightBitBinary(decimal ^ (1 << bit)));
  const distractors = generateUniqueDistractors(binary, candidates, 3, random);
  return {
    question: `Welche Binärzahl entspricht der Dezimalzahl ${decimal}?`,
    ...shuffleAnswers(binary, distractors, random),
    explanation: `Die Dezimalzahl ${decimal} entspricht binär ${binary}.`,
  };
}

export const GENERATED_QUIZ_QUESTIONS = Object.freeze([
  {
    id: 'network-subnet-hosts-generated',
    category: 'Netzwerk',
    difficulty: 'medium',
    type: 'generated',
    generate: generateSubnetQuestion,
  },
  {
    id: 'number-decimal-binary-generated',
    category: 'Zahlensysteme',
    difficulty: 'medium',
    type: 'generated',
    generate: generateDecimalBinaryQuestion,
  },
]);
