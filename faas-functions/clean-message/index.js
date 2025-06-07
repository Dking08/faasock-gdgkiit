function main(params) {
  const { message } = params;

  if (!message) {
    return { error: 'Message is required' };
  }

  const profanityWords = ['idiot', 'stupid', 'dumb', 'hate', 'damn', 'shit'];
  let cleanedMessage = message;

  profanityWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleanedMessage = cleanedMessage.replace(regex, '*'.repeat(word.length));
  });

  return {
    original: message,
    cleaned: cleanedMessage,
    filtered: cleanedMessage !== message
  };
}

exports.main = main;
