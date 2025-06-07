function main(params) {
  const msg = params.message;

  if (!msg) {
    return { error: 'Message is required' };
  }

  const posWords = ['happy', 'good', 'great', 'awesome', 'love'];
  const negWords = ['sad', 'bad', 'terrible', 'hate', 'angry'];

  const msgLower = msg.toLowerCase();
  let pos = 0, neg = 0;

  posWords.forEach(w => {
    if (msgLower.includes(w)) pos++;
  });

  negWords.forEach(w => {
    if (msgLower.includes(w)) neg++;
  });

  let mood = 'neutral';
  let conf = 0.5;

  if (pos > neg) {
    mood = 'positive';
    conf = Math.min(0.9, 0.6 + pos * 0.1);
  } else if (neg > pos) {
    mood = 'negative';
    conf = Math.min(0.9, 0.6 + neg * 0.1);
  }

  return {
    message: msg,
    sentiment: mood,
    confidence: conf,
    scores: { positive: pos, negative: neg }
  };
}

exports.main = main;

