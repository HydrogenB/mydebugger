# MyDebugger Tools

## AES-256 CBC

```
import { aes256CbcEncryptRandomIV, aes256CbcDecryptRandomIV } from '../model/aes';

const encrypted = await aes256CbcEncryptRandomIV('your-key-123456789012345678901234', 'hello');
const decrypted = await aes256CbcDecryptRandomIV('your-key-123456789012345678901234', encrypted);
```

Use the AES-256 CBC tool in the UI to experiment with real-time encryption and decryption. A drop-down menu provides ready-made examples to help you understand how the algorithm works.
