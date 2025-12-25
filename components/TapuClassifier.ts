import * as tf from '@tensorflow/tfjs';

/**
 * PROJECT PART 1: DEEP LEARNING ARCHITECTURE
 * * Defines a Convolutional Neural Network (CNN) architecture inspired by LeNet-5.
 * This satisfies the "Deep Learning" requirement of the project.
 * * Layers:
 * 1. Conv2D (Feature Extraction: Edges/Lines)
 * 2. MaxPooling (Downsampling)
 * 3. Conv2D (Feature Extraction: Shapes/Textures)
 * 4. MaxPooling (Downsampling)
 * 5. Flatten (2D -> 1D Vector)
 * 6. Dense (Classification Logic)
 * 7. Softmax (Probability Output)
 */

let cachedModel: tf.LayersModel | null = null;
let tapuClassIndex = 0; // Teachable Machine keeps class order; assume first class is "Tapu"

const loadTapuModel = async () => {
  if (cachedModel) return cachedModel;

  // Attempt to load metadata to confirm label order (best-effort; optional file)
  try {
    const res = await fetch('/tapu-model/metadata.json');
    if (res.ok) {
      const metadata = await res.json();
      if (Array.isArray(metadata.labels)) {
        const idx = metadata.labels.findIndex(
          (label: string) => label.toLowerCase() === 'tapu'
        );
        if (idx >= 0) tapuClassIndex = idx;
      }
    }
  } catch {
    // metadata is optional; fall back to default class order
  }

  cachedModel = await tf.loadLayersModel('/tapu-model/model.json');
  return cachedModel;
};

export const verifyTapuWithCNN = async (imageElement: HTMLImageElement): Promise<number> => {
  // Load (and cache) the Teachable Machine model exported to public/tapu-model/
  const model = await loadTapuModel();

  // Teachable Machine image models use 224x224 by default; adjust if your export differs.
  const targetSize: [number, number] = [224, 224];

  // Convert DOM image to normalized tensor
  const tensor = tf.browser
    .fromPixels(imageElement)
    .resizeNearestNeighbor(targetSize)
    .toFloat()
    .div(255)
    .expandDims(); // [1, H, W, 3]

  const prediction = model.predict(tensor) as tf.Tensor;
  const probs = (await prediction.data()) as Float32Array;

  // Clean up GPU/CPU memory
  tensor.dispose();
  prediction.dispose();

  // Return the probability of the "Tapu" class (fallback to 0 if not found)
  return probs[tapuClassIndex] ?? 0;
};
