const mongoose = require('mongoose');

const vocabWordSchema = new mongoose.Schema({
  set: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabSet', required: true },
  word: { type: String, required: true },
  pronunciation: { type: String, default: '' }, // /ˈæk.sɪs/
  wordType: { type: String, default: '' }, // n, v, adj, adv...
  meaning: { type: String, required: true },
  example: { type: String, default: '' },
  exampleMeaning: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  order: { type: Number, default: 1 },
});

vocabWordSchema.index({ set: 1, order: 1 });

module.exports = mongoose.model('VocabWord', vocabWordSchema);
