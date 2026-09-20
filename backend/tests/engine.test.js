/**
 * AegisTrace Test Suite
 * Validates all 4 evidence modules, the Bayesian Fusion Engine, and target attribution accuracy.
 */

import { dbStore } from '../data/mockDatabase.js';
import { defaultInfraScanner } from '../services/infraScanner.js';
import { defaultIdentityGraph } from '../services/identityGraph.js';
import { defaultStylometryEngine } from '../services/stylometryEngine.js';
import { defaultCryptoEngine } from '../services/cryptoCorrelation.js';
import { defaultFusionEngine } from '../services/fusionEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=======================================================');
  console.log('🧪 RUNNING AEGISTRACE ATTRIBUTION ENGINE VERIFICATION');
  console.log('=======================================================\n');

  // Test 1: Actor Loading
  const actors = dbStore.getAllActors();
  assert(actors.length === 18, `Loaded 18 threat actor profiles (found: ${actors.length})`);

  // Test 2: Module 1 - Infra Scanner
  console.log('\n--- Module 1: Infrastructure Leak Scanner ---');
  const actor1 = dbStore.getActorById('ACTOR-001'); // KryptonGhost
  const infraScan = defaultInfraScanner.scanOnionRecord(actor1.infrastructure);
  assert(infraScan.matched === true, 'KryptonGhost onion infrastructure matched clearnet OVH host');
  assert(infraScan.score >= 0.85, `High confidence leak score generated (score: ${infraScan.score})`);
  assert(infraScan.indicators.statusPageExposed === true, 'Detected exposed status page');

  // Test 3: Module 2 - Identity Graph & Link Prediction
  console.log('\n--- Module 2: Identity Graph & Link Prediction ---');
  const actor3 = dbStore.getActorById('ACTOR-003'); // SilkCobalt
  const actor4 = dbStore.getActorById('ACTOR-004'); // HydraMedic
  const graphEval = defaultIdentityGraph.evaluateGraphLink(actor3, actor4);
  assert(graphEval.hasHardLink === true, 'SilkCobalt <-> HydraMedic detected shared PGP key hard link');
  assert(graphEval.score >= 0.90, `Hard link evaluated with high score (score: ${graphEval.score})`);

  // Test Link Prediction on pair without hard links
  const actor5 = dbStore.getActorById('ACTOR-005'); // ZeroByte_Dev
  const actor6 = dbStore.getActorById('ACTOR-006'); // NexusRogue
  const linkPred = defaultIdentityGraph.predictLink(actor5, actor6);
  assert(linkPred.predictionScore >= 0.50, `Link prediction detected strong category/TTP overlap (score: ${linkPred.predictionScore})`);

  // Test 4: Module 3 - Stylometry & Behavioral Forensics
  console.log('\n--- Module 3: Stylometry & Behavioral Forensics ---');
  const actor2 = dbStore.getActorById('ACTOR-002'); // VektorZero
  const styleRes = await defaultStylometryEngine.compareActors(actor1, actor2);
  assert(styleRes.score >= 0.70, `KryptonGhost <-> VektorZero high stylometric match (score: ${styleRes.score})`);
  assert(styleRes.metrics.timeOverlap > 0.60, `Synchronized UTC posting time-of-day overlap (${(styleRes.metrics.timeOverlap * 100).toFixed(1)}%)`);

  // Test 5: Module 4 - Crypto Correlation & Temporal Check
  console.log('\n--- Module 4: Crypto Correlation & Temporal Sync ---');
  const cryptoRes1_2 = defaultCryptoEngine.compareActorWallets(actor1, actor2);
  assert(cryptoRes1_2.score >= 0.85, `KryptonGhost <-> VektorZero detected common-input Wasabi cluster (score: ${cryptoRes1_2.score})`);
  
  const cryptoRes3_4 = defaultCryptoEngine.compareActorWallets(actor3, actor4);
  assert(cryptoRes3_4.temporalEvents.length > 0, 'SilkCobalt <-> HydraMedic detected temporal transaction vs escrow sync (< 45 min delta)');

  // Test 6: Novel Bayesian Evidence Fusion Engine
  console.log('\n--- Bayesian Evidence Fusion Engine ---');
  const attribPair1_2 = await dbStore.computeAttribution('ACTOR-001', 'ACTOR-002');
  console.log(`  -> KryptonGhost <-> VektorZero Attribution Confidence: ${attribPair1_2.confidenceScore}%`);
  console.log(`  -> Evidence Trail Breakdown:`);
  attribPair1_2.evidenceTrail.forEach(t => {
    console.log(`     * ${t.module}: Score=${t.scorePercent}%, Weight=${t.weight}, Contribution=${t.contributionPercent}% [${t.tier}]`);
  });
  assert(attribPair1_2.confidenceScore >= 80, `Target Case 1 (KryptonGhost <-> VektorZero) achieved >=80% confidence (actual: ${attribPair1_2.confidenceScore}%)`);
  assert(attribPair1_2.evidenceTrail.length === 4, 'Full 4-module evidence trail generated');
  assert(attribPair1_2.auditMath.combinedLikelihoodRatio > 1.0, 'Bayesian combined likelihood ratio confirms positive belief update');

  // Test 7: Target Case 2 (SilkCobalt <-> HydraMedic)
  const attribPair3_4 = await dbStore.computeAttribution('ACTOR-003', 'ACTOR-004');
  console.log(`  -> SilkCobalt <-> HydraMedic Attribution Confidence: ${attribPair3_4.confidenceScore}%`);
  assert(attribPair3_4.confidenceScore >= 85, `Target Case 2 (SilkCobalt <-> HydraMedic) achieved >=85% confidence (actual: ${attribPair3_4.confidenceScore}%)`);

  // Test 8: Decoy Discrimination Test (Uncorrelated Personas)
  const attribDecoy = await dbStore.computeAttribution('ACTOR-001', 'ACTOR-003');
  console.log(`  -> KryptonGhost <-> SilkCobalt (Decoy Pair) Confidence: ${attribDecoy.confidenceScore}%`);
  assert(attribDecoy.confidenceScore < 35, `Decoy pair correctly scored low (< 35%, actual: ${attribDecoy.confidenceScore}%)`);

  console.log('\n=======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
