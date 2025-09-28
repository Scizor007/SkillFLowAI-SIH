
export let currentUtterance: SpeechSynthesisUtterance | null = null;

export const textToSpeech = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject("Speech synthesis is not supported in this browser.");
      return;
    }

    if (currentUtterance && window.speechSynthesis.speaking) {
      // If there is already a speech in progress, pause it
      window.speechSynthesis.pause();
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Optional settings
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = (event) => reject(event.error);

    currentUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  });
};

export const resumeSpeech = (): void => {
  if (currentUtterance) {
    window.speechSynthesis.resume();
  }
};

export const stopSpeech = (): void => {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }
};
