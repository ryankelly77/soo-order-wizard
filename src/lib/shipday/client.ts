const SHIPDAY_API_URL = 'https://api.shipday.com';

interface ShipdayConfig {
  apiKey: string;
}

interface ShipdayOrderPayload {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryInstruction?: string;
  orderSource?: string;
  tips?: number;
  tax?: number;
  discountAmount?: number;
  deliveryFee?: number;
  totalOrderCost?: number;
  paymentMethod?: string;
  expectedDeliveryDate?: string;
  expectedDeliveryTime?: string;
  expectedPickupTime?: string;
  orderItems?: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

class ShipdayClient {
  private apiKey: string;

  constructor(config: ShipdayConfig) {
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${SHIPDAY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shipday API error: ${error}`);
    }

    return response.json();
  }

  async createOrder(payload: ShipdayOrderPayload) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async getOrderStatus(orderId: string) {
    return this.request(`/orders/${orderId}/status`);
  }

  async cancelOrder(orderId: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }
}

export function createShipdayClient(): ShipdayClient {
  const apiKey = process.env.SHIPDAY_API_KEY;

  if (!apiKey) {
    throw new Error('Missing SHIPDAY_API_KEY environment variable');
  }

  return new ShipdayClient({ apiKey });
}

export type { ShipdayOrderPayload };
