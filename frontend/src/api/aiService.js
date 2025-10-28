import { pipeline, env } from '@xenova/transformers';

// Use the Web Worker backend for better performance
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.0/dist/';

let textGenerator = null;

// Initialize the text generation pipeline
const getTextGenerator = async () => {
  if (!textGenerator) {
    console.log('Loading text generation model...');
    textGenerator = await pipeline('text-generation', 'Xenova/t5-small');
    console.log('Text generation model loaded');
  }
  return textGenerator;
};

/**
 * Generate an accommodation description using a local AI model
 * @param {Object} accommodationData - The accommodation data
 * @returns {Promise<string>} - Generated description
 */
export const generateAccommodationDescription = async (accommodationData) => {
  console.log('Generating description with data:', accommodationData);
  
  try {
    const generator = await getTextGenerator();
    const prompt = `Write a short description for a ${accommodationData.type} "${accommodationData.nom}" in ${acmodationData.adresse} for ${accommodationData.capacite} people at ${accommodationData.prix}€ per night.`;
    
    // Generate text with the model
    const output = await generator(prompt, {
      max_new_tokens: 100,
      temperature: 0.7,
      do_sample: true,
    });
    
    return output[0].generated_text;
  } catch (error) {
    console.error('Error generating description:', error);
    // Fallback to template-based generation if AI fails
    return `A beautiful ${accommodationData.type} named "${accommodationData.nom}" located in ${accommodationData.adresse}. ` +
           `Can accommodate ${accommodationData.capacite} guests. ` +
           `Price: ${accommodationData.prix}€ per night.`;
  }
};

// Simple template-based description generator as a fallback
export const generateSimpleDescription = (data) => {
  const templates = [
    `Welcome to ${data.nom}, a lovely ${data.type} located in ${data.adresse}. ` +
    `Perfect for ${data.capacite} guests, this accommodation offers great value at ${data.prix}€ per night.`,
    
    `${data.nom} is a charming ${data.type} situated in the heart of ${data.adresse}. ` +
    `With space for ${data.capacite} guests, it's available for just ${data.prix}€ per night.`,
    
    `Experience comfort at ${data.nom}, a cozy ${data.type} in ${data.adresse}. ` +
    `Ideal for ${data.capacite} guests, book now for only ${data.prix}€ per night.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};

export default {
  generateAccommodationDescription,
  generateSimpleDescription
};
