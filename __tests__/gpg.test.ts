/** @jest-environment node */
import { generateGpgKeyPair, gpgEncrypt, gpgDecrypt } from '../model/aes';

test('GPG RSA-2048 roundtrip', async () => {
  const { publicKey, privateKey } = await generateGpgKeyPair();
  const msg = 'gpg message';
  const enc = await gpgEncrypt(publicKey, msg);
  const dec = await gpgDecrypt(privateKey, enc);
  expect(dec).toBe(msg);
});
