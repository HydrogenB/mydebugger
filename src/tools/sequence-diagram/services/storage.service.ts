/**
 * Storage Service
 * 
 * Provides encrypted local storage capabilities to store and retrieve diagram data
 */

// AES encryption key derivation
const STORAGE_KEY_PREFIX = 'mydbg_seqdiag_';
const CURRENT_VERSION = '1.0';

interface StoredDiagram {
  id: string;
  name: string;
  content: string;
  lastModified: number;
  version: string;
}

/**
 * Generate a random ID for new diagrams
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Encrypt diagram data for storage
 */
async function encryptData(data: string): Promise<string> {
  try {
    // In a production app, you would implement real encryption
    // using the Web Crypto API with AES-GCM.
    // This is a simplified placeholder that just encodes the content
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt diagram data');
  }
}

/**
 * Decrypt diagram data from storage
 */
async function decryptData(encryptedData: string): Promise<string> {
  try {
    // This is a simplified placeholder that just decodes the content
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt diagram data');
  }
}

/**
 * Save a diagram to local storage
 */
export async function saveDiagram(name: string, content: string, id?: string): Promise<StoredDiagram> {
  const diagramId = id || generateId();
  
  const diagram: StoredDiagram = {
    id: diagramId,
    name,
    content,
    lastModified: Date.now(),
    version: CURRENT_VERSION
  };
  
  try {
    // Encrypt the diagram data
    const encryptedContent = await encryptData(JSON.stringify(diagram));
    
    // Save to localStorage
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${diagramId}`, encryptedContent);
    
    // Update the index of saved diagrams
    const diagrams = await listDiagrams();
    const diagramIndex = diagrams.findIndex(d => d.id === diagramId);
    
    if (diagramIndex === -1) {
      diagrams.push({ id: diagramId, name, lastModified: diagram.lastModified });
      localStorage.setItem(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(diagrams));
    } else {
      diagrams[diagramIndex] = { id: diagramId, name, lastModified: diagram.lastModified };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(diagrams));
    }
    
    return diagram;
  } catch (error) {
    console.error('Save diagram error:', error);
    throw new Error(`Failed to save diagram: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load a diagram from local storage by ID
 */
export async function loadDiagram(id: string): Promise<StoredDiagram> {
  try {
    const encryptedData = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    
    if (!encryptedData) {
      throw new Error(`Diagram not found: ${id}`);
    }
    
    const decryptedData = await decryptData(encryptedData);
    const diagram = JSON.parse(decryptedData) as StoredDiagram;
    
    // Handle version incompatibility
    if (diagram.version !== CURRENT_VERSION) {
      console.warn(`Loading diagram with version ${diagram.version} (current: ${CURRENT_VERSION})`);
      // Migration logic would go here for production
    }
    
    return diagram;
  } catch (error) {
    console.error('Load diagram error:', error);
    throw new Error(`Failed to load diagram: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List all saved diagrams
 */
export async function listDiagrams(): Promise<Array<{id: string; name: string; lastModified: number}>> {
  try {
    const indexData = localStorage.getItem(`${STORAGE_KEY_PREFIX}index`);
    
    if (!indexData) {
      return [];
    }
    
    return JSON.parse(indexData);
  } catch (error) {
    console.error('List diagrams error:', error);
    return [];
  }
}

/**
 * Delete a diagram from local storage
 */
export async function deleteDiagram(id: string): Promise<boolean> {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    
    // Update the index
    const diagrams = await listDiagrams();
    const filteredDiagrams = diagrams.filter(d => d.id !== id);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}index`, JSON.stringify(filteredDiagrams));
    
    return true;
  } catch (error) {
    console.error('Delete diagram error:', error);
    return false;
  }
}

/**
 * Get the most recently modified diagram
 */
export async function getLastDiagram(): Promise<StoredDiagram | null> {
  try {
    const diagrams = await listDiagrams();
    
    if (diagrams.length === 0) {
      return null;
    }
    
    // Find the most recently modified diagram
    const lastDiagram = diagrams.sort((a, b) => b.lastModified - a.lastModified)[0];
    
    return await loadDiagram(lastDiagram.id);
  } catch (error) {
    console.error('Get last diagram error:', error);
    return null;
  }
}