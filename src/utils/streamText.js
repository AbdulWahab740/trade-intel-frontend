// src/utils/streamText.js
export function streamTextInChunks(text, onChunk, onComplete, chunkSize = 100, delayMs = 50) {
  /**
   * Stream text by breaking into chunks of words
   * @param {string} text - Full text to stream
   * @param {function} onChunk - Callback for each chunk
   * @param {function} onComplete - Callback when done
   * @param {number} chunkSize - Characters per chunk (approximate)
   * @param {number} delayMs - Delay between chunks in milliseconds
   */
  
  const words = text.split(' ');
  let currentChunk = '';
  let index = 0;
  
  const streamInterval = setInterval(() => {
    if (index >= words.length) {
      clearInterval(streamInterval);
      if (currentChunk) {
        onChunk(currentChunk);
      }
      onComplete();
      return;
    }
    
    // Build chunk until we reach chunkSize
    while (index < words.length && currentChunk.length < chunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + words[index];
      index++;
    }
    
    // Send chunk
    onChunk(currentChunk);
    currentChunk = '';
    
  }, delayMs);
  
  // Return cancel function
  return () => clearInterval(streamInterval);
}

// Alternative: Stream by sentences (more natural)
export function streamTextBySentences(text, onChunk, onComplete, delayMs = 100) {
  /**
   * Stream text sentence by sentence
   */
  
  // Split by sentence endings
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let index = 0;
  
  const streamInterval = setInterval(() => {
    if (index >= sentences.length) {
      clearInterval(streamInterval);
      onComplete();
      return;
    }
    
    onChunk(sentences[index].trim() + ' ');
    index++;
    
  }, delayMs);
  
  return () => clearInterval(streamInterval);
}