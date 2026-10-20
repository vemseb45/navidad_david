import crypto from 'crypto';

export class TrackingGenerator {
  public static generateTrackingNumber(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ND-2026-${randomHex}`;
  }

  public static generateBoldReference(trackingNumber: string): string {
    return `BOLD-${trackingNumber}`;
  }
}
