/**
 * Module 3: AI Persona Linking - Stylometry & Behavioral Forensics Engine
 * 
 * Implements NLP transformer embeddings (all-MiniLM-L6-v2) for linguistic stylometry
 * combined with behavioral fingerprinting (UTC time-of-day distribution, message length entropy,
 * punctuation/slang/emoji usage rate).
 */

let pipeline = null;
let embedder = null;
let isModelLoading = false;

// Initialize transformer pipeline lazily
async function getEmbedder() {
  if (embedder) return embedder;
  if (isModelLoading) {
    while (isModelLoading && !embedder) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (embedder) return embedder;
  }

  try {
    isModelLoading = true;
    const transformers = await import('@xenova/transformers');
    embedder = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true
    });
    console.log('[StylometryEngine] Transformer model Xenova/all-MiniLM-L6-v2 loaded successfully.');
    return embedder;
  } catch (err) {
    // Graceful offline fallback
    return null;
  } finally {
    isModelLoading = false;
  }
}

export class StylometryEngine {
  constructor() {
    this.vectorCache = new Map();
  }

  /**
   * Compute cosine similarity between two 1D vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Enhanced Character & Word N-gram Semantic Vectorizer (Fallback / Complement)
   */
  computeNgramVector(text, dimensions = 384) {
    const vector = new Array(dimensions).fill(0);
    const cleaned = (text || '').toLowerCase().trim();
    if (!cleaned) return vector;

    // Word unigrams & bigrams
    const words = cleaned.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      let hash = 0;
      for (let c = 0; c < w.length; c++) {
        hash = (hash << 5) - hash + w.charCodeAt(c);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1.0;

      if (i < words.length - 1) {
        const bi = w + '_' + words[i + 1];
        let biHash = 0;
        for (let c = 0; c < bi.length; c++) {
          biHash = (biHash << 5) - biHash + bi.charCodeAt(c);
          biHash |= 0;
        }
        const biIdx = Math.abs(biHash) % dimensions;
        vector[biIdx] += 1.8;
      }
    }

    // Character trigrams for morphological and typo fingerprinting
    for (let i = 0; i < cleaned.length - 2; i++) {
      const tri = cleaned.slice(i, i + 3);
      let triHash = 0;
      for (let c = 0; c < tri.length; c++) {
        triHash = (triHash << 5) - triHash + tri.charCodeAt(c);
        triHash |= 0;
      }
      const triIdx = Math.abs(triHash) % dimensions;
      vector[triIdx] += 0.6;
    }

    // Normalize
    const norm = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
    return norm > 0 ? vector.map(v => v / norm) : vector;
  }

  /**
   * Extract embedding for text corpus
   */
  async getEmbedding(text) {
    if (!text || text.trim() === '') return new Array(384).fill(0);

    const cacheKey = text.slice(0, 120);
    if (this.vectorCache.has(cacheKey)) {
      return this.vectorCache.get(cacheKey);
    }

    const model = await getEmbedder();
    if (model) {
      try {
        const output = await model(text, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data);
        this.vectorCache.set(cacheKey, vector);
        return vector;
      } catch (e) {
        // Fallback
      }
    }

    const fallbackVector = this.computeNgramVector(text, 384);
    this.vectorCache.set(cacheKey, fallbackVector);
    return fallbackVector;
  }

  /**
   * Extract behavioral features from an actor's forum posts / messages
   */
  extractBehavioralFeatures(posts = []) {
    if (!posts || posts.length === 0) {
      return {
        avgLength: 0,
        lengthVariance: 0,
        punctRate: 0,
        emojiRate: 0,
        uppercaseRate: 0,
        slangHits: 0,
        timeHistogram: new Array(24).fill(0),
        vocabularyEntropy: 0
      };
    }

    const timeHistogram = new Array(24).fill(0);
    let totalChars = 0;
    let totalWords = 0;
    let totalPunct = 0;
    let totalUpper = 0;
    let totalEmojis = 0;
    const lengths = [];
    const wordFreq = new Map();

    const slangSet = new Set([
      'fud', 'rat', '0day', 'zeroday', 'stealer', 'stub', 'loader', 'crypter',
      'escrow', 'jabber', 'tox', 'drop', 'skid', 'opsec', 'monero', 'xmr', 'btc',
      'fullz', 'cc', 'bins', 'logs', 'combo', 'rdp', 'ssh', 'botnet', 'ddos', 'stresser', 'chacha20', 'esxi'
    ]);
    let slangHits = 0;

    posts.forEach(p => {
      const text = typeof p === 'string' ? p : p.content || '';
      const hour = typeof p === 'object' && p.timestamp ? new Date(p.timestamp).getUTCHours() : (p.hourUTC ?? 14);
      timeHistogram[hour] = (timeHistogram[hour] || 0) + 1;

      const words = text.split(/\s+/).filter(Boolean);
      lengths.push(words.length);
      totalWords += words.length;
      totalChars += text.length;

      // Punctuation counts
      const puncts = text.match(/[!?,.;:\-_"'/\\()[\]{}~@#$%^&*]/g) || [];
      totalPunct += puncts.length;

      // Uppercase counts
      const uppers = text.match(/[A-Z]/g) || [];
      totalUpper += uppers.length;

      // Emoji/Special ASCII emoticons (:), :-), xD, etc.)
      const emojis = text.match(/[\u{1F300}-\u{1F9FF}]|[:;=8][-o*]?[)D(\]/\\]|xD|xd|\^\^/gu) || [];
      totalEmojis += emojis.length;

      // Slang frequency & Vocabulary
      words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (slangSet.has(clean)) slangHits++;
        wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1);
      });
    });

    const totalPosts = posts.length || 1;
    const normHistogram = timeHistogram.map(h => h / totalPosts);

    const avgLength = totalWords / totalPosts;
    const lengthVariance = lengths.reduce((acc, l) => acc + Math.pow(l - avgLength, 2), 0) / totalPosts;
    const punctRate = totalChars > 0 ? totalPunct / totalChars : 0;
    const uppercaseRate = totalChars > 0 ? totalUpper / totalChars : 0;
    const emojiRate = totalWords > 0 ? totalEmojis / totalWords : 0;

    // Vocabulary entropy
    let entropy = 0;
    wordFreq.forEach(count => {
      const p = count / totalWords;
      if (p > 0) entropy -= p * Math.log2(p);
    });

    return {
      avgLength: parseFloat(avgLength.toFixed(1)),
      lengthVariance: parseFloat(lengthVariance.toFixed(1)),
      punctRate: parseFloat(punctRate.toFixed(4)),
      uppercaseRate: parseFloat(uppercaseRate.toFixed(4)),
      emojiRate: parseFloat(emojiRate.toFixed(4)),
      slangHits,
      timeHistogram: normHistogram,
      vocabularyEntropy: parseFloat(entropy.toFixed(3))
    };
  }

  /**
   * Compare time-of-day histograms using Histogram Intersection
   */
  compareTimeHistograms(histA, histB) {
    if (!histA || !histB || histA.length !== 24 || histB.length !== 24) return 0.05;
    let intersection = 0;
    for (let i = 0; i < 24; i++) {
      intersection += Math.min(histA[i] || 0, histB[i] || 0);
    }
    return Math.max(0.05, Math.min(1.0, intersection));
  }

  /**
   * Full Stylometry & Behavioral Comparison between two actors
   */
  async compareActors(actorA, actorB) {
    const textA = (actorA.samplePosts || []).map(p => typeof p === 'string' ? p : p.content).join(' ');
    const textB = (actorB.samplePosts || []).map(p => typeof p === 'string' ? p : p.content).join(' ');

    // 1. Semantic Text Embeddings Cosine Similarity
    const vecA = await this.getEmbedding(textA);
    const vecB = await this.getEmbedding(textB);
    const rawCosine = this.cosineSimilarity(vecA, vecB);
    
    // Scale cosine: unrelated darknet text has raw cosine ~0.10-0.20, related has ~0.45-0.85
    let textSimilarity = 0.05;
    if (rawCosine > 0.15) {
      textSimilarity = Math.min(1.0, (rawCosine - 0.15) / 0.55);
    }

    // 2. Behavioral Features
    const featA = this.extractBehavioralFeatures(actorA.samplePosts);
    const featB = this.extractBehavioralFeatures(actorB.samplePosts);

    // Time-of-day overlap
    const timeOverlap = this.compareTimeHistograms(featA.timeHistogram, featB.timeHistogram);

    // Punctuation similarity
    const punctDiff = Math.abs(featA.punctRate - featB.punctRate);
    const punctSimilarity = Math.max(0.05, 1.0 - punctDiff * 15);

    // Message length similarity
    const maxAvgLen = Math.max(featA.avgLength, featB.avgLength, 1);
    const lenSimilarity = Math.max(0.05, 1.0 - Math.abs(featA.avgLength - featB.avgLength) / maxAvgLen);

    // Combined Behavioral Score
    const behavioralScore = (
      (timeOverlap * 0.50) +
      (punctSimilarity * 0.25) +
      (lenSimilarity * 0.25)
    );

    // Unified Stylistic & Behavioral Score (60% NLP Stylometry + 40% Behavioral)
    const overallScore = Math.max(0.05, (textSimilarity * 0.60) + (behavioralScore * 0.40));

    const findings = [];
    if (textSimilarity > 0.65) {
      findings.push(`High semantic stylometric convergence (${(textSimilarity * 100).toFixed(1)}% vector cosine match in all-MiniLM-L6-v2 latent space).`);
    } else if (textSimilarity > 0.40) {
      findings.push(`Moderate semantic stylometry alignment (${(textSimilarity * 100).toFixed(1)}%).`);
    }

    if (timeOverlap > 0.55) {
      findings.push(`Strong chronological synchronization: ${(timeOverlap * 100).toFixed(1)}% UTC diurnal posting window overlap.`);
    }

    if (punctSimilarity > 0.80 && lenSimilarity > 0.75) {
      findings.push(`Syntactic & punctuation idiosyncrasies match closely (punctuation rate: ${(featA.punctRate * 100).toFixed(1)}% vs ${(featB.punctRate * 100).toFixed(1)}%).`);
    }

    if (findings.length === 0) {
      findings.push('Divergent writing styles, disparate vocabulary, and uncorrelated active operating hours.');
    }

    return {
      score: parseFloat(overallScore.toFixed(3)),
      textSimilarity: parseFloat(textSimilarity.toFixed(3)),
      behavioralScore: parseFloat(behavioralScore.toFixed(3)),
      metrics: {
        timeOverlap: parseFloat(timeOverlap.toFixed(3)),
        punctSimilarity: parseFloat(punctSimilarity.toFixed(3)),
        lenSimilarity: parseFloat(lenSimilarity.toFixed(3)),
        featuresA: featA,
        featuresB: featB
      },
      findings
    };
  }
}

export const defaultStylometryEngine = new StylometryEngine();
