/**
 * Official EMVCo PromptPay Payload Generator (Bank of Thailand Specification)
 * Generates genuine QR payload readable by all Thai Banking Apps (K PLUS, SCB, Krungthai NEXT, etc.)
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i) & 0xff;
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function tag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return id + len + value;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  const cleaned = target.replace(/[^0-9]/g, '');
  let targetTag = '';

  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Thai Mobile Number (08X-XXX-XXXX -> 00668XXXXXXXX)
    const formattedPhone = '0066' + cleaned.substring(1);
    const subTags = tag('00', 'A000000677010111') + tag('01', formattedPhone);
    targetTag = tag('29', subTags);
  } else if (cleaned.length === 13) {
    // Thai National Citizen ID / Tax ID
    const subTags = tag('00', 'A000000677010111') + tag('02', cleaned);
    targetTag = tag('29', subTags);
  } else if (cleaned.length === 15) {
    // e-Wallet ID
    const subTags = tag('00', 'A000000677010111') + tag('03', cleaned);
    targetTag = tag('29', subTags);
  } else {
    // Fallback: Default to mobile format if possible
    const formattedPhone = '0066' + (cleaned.startsWith('0') ? cleaned.substring(1) : cleaned);
    const subTags = tag('00', 'A000000677010111') + tag('01', formattedPhone);
    targetTag = tag('29', subTags);
  }

  const hasAmount = amount !== undefined && amount > 0;
  let payload = '';
  payload += tag('00', '01'); // Format Indicator
  payload += tag('01', hasAmount ? '12' : '11'); // 12 = Dynamic (with amount), 11 = Static
  payload += targetTag; // Merchant Info
  payload += tag('53', '764'); // Currency: THB
  if (hasAmount) {
    payload += tag('54', amount.toFixed(2)); // Transaction Amount
  }
  payload += tag('58', 'TH'); // Country: TH

  // CRC16 Checksum (Tag 63 length 04)
  const checksumPrefix = payload + '6304';
  const checksum = crc16(checksumPrefix);
  return checksumPrefix + checksum;
}
