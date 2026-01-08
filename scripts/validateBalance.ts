/**
 * Balance Validation Script
 *
 * Run with: npx tsx scripts/validateBalance.ts
 *
 * This script validates all existing cards and enemies against the balance system.
 */

import { CARD_DATABASE, ENEMIES } from '../constants';
import {
  validateCardBalance,
  validateEnemyBalance,
  validateAllCards,
  validateAllEnemies,
  generateValidationReport
} from '../utils/balanceValidator';

// Run validation
console.log('\n🔍 Starting FiC Balance Validation...\n');

// Validate cards
const cardResults = validateAllCards(CARD_DATABASE);
console.log(`📜 Validated ${CARD_DATABASE.length} cards`);

// Validate enemies
const enemyResults = validateAllEnemies(ENEMIES);
console.log(`👾 Validated ${Object.keys(ENEMIES).length} enemies`);

// Generate and print report
console.log('\n');
console.log(generateValidationReport(cardResults, enemyResults));

// Detailed power analysis for interesting cards
console.log('\n📊 POWER ANALYSIS (Selected Cards):');
console.log('───────────────────────────────────────────────────────────────');

const interestingCards = [103, 202, 304, 402, 404, 314, 401, 413];
for (const cardId of interestingCards) {
  const card = CARD_DATABASE.find(c => c.id === cardId);
  if (!card) continue;

  const result = cardResults.get(cardId);
  if (!result?.powerAnalysis) continue;

  const pa = result.powerAnalysis;
  console.log(`\n[${cardId}] ${card.name} (${card.rarity})`);
  console.log(`  Cost: ${card.cost} | Value: ${card.value}`);
  console.log(`  Power: ${pa.totalPower.toFixed(1)} | Budget: ${pa.budget} | Net: ${pa.netPower.toFixed(1)}`);
  console.log(`  Efficiency: ${pa.efficiency.toFixed(2)}/E | Rating: ${pa.balanceRating.toUpperCase()}`);
  if (pa.hasDownside) {
    console.log(`  Downside: ${pa.downsideValue.toFixed(1)}`);
  }
}

// Summary statistics
console.log('\n\n📈 BALANCE DISTRIBUTION:');
console.log('───────────────────────────────────────────────────────────────');

const ratings: Record<string, number> = {
  underpowered: 0,
  balanced: 0,
  strong: 0,
  overpowered: 0
};

cardResults.forEach(result => {
  if (result.powerAnalysis) {
    ratings[result.powerAnalysis.balanceRating]++;
  }
});

const total = CARD_DATABASE.length;
console.log(`  Underpowered: ${ratings.underpowered} (${(ratings.underpowered/total*100).toFixed(1)}%)`);
console.log(`  Balanced:     ${ratings.balanced} (${(ratings.balanced/total*100).toFixed(1)}%)`);
console.log(`  Strong:       ${ratings.strong} (${(ratings.strong/total*100).toFixed(1)}%)`);
console.log(`  Overpowered:  ${ratings.overpowered} (${(ratings.overpowered/total*100).toFixed(1)}%)`);

// Exit with error code if there are critical errors
let criticalErrors = 0;
cardResults.forEach(r => {
  criticalErrors += r.errors.filter(e => e.severity === 'critical').length;
});
enemyResults.forEach(r => {
  criticalErrors += r.errors.filter(e => e.severity === 'critical').length;
});

if (criticalErrors > 0) {
  console.log(`\n❌ ${criticalErrors} critical errors found!`);
  process.exit(1);
} else {
  console.log('\n✅ No critical errors!');
  process.exit(0);
}
