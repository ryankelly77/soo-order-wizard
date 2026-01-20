import { createClient } from '@/lib/supabase/client';
import { SHARE_LINK_EXPIRATION_DAYS } from '@/contracts/constants';

export interface ShareLink {
  token: string;
  shareUrl: string;
  expiresAt: Date;
}

export async function generateShareLink(
  orderId: string,
  expirationDays: number = SHARE_LINK_EXPIRATION_DAYS
): Promise<ShareLink> {
  const supabase = createClient();

  // Generate a secure token
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  // Update the order with the share token
  const { error } = await supabase
    .from('orders')
    .update({
      share_token: token,
      share_token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  const shareUrl = `${window.location.origin}/order/${orderId}/join/${token}`;

  return {
    token,
    shareUrl,
    expiresAt,
  };
}

export async function validateShareToken(
  orderId: string,
  token: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('share_token, share_token_expires_at')
    .eq('id', orderId)
    .single();

  if (error || !data) return false;

  if (data.share_token !== token) return false;

  const expiresAt = new Date(data.share_token_expires_at);
  if (expiresAt < new Date()) return false;

  return true;
}

export async function revokeShareLink(orderId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('orders')
    .update({
      share_token: null,
      share_token_expires_at: null,
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
