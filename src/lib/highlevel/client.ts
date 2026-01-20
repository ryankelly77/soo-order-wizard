const HIGHLEVEL_API_URL = 'https://rest.gohighlevel.com/v1';

interface HighLevelConfig {
  apiKey: string;
  locationId: string;
}

interface CreateContactPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customField?: Record<string, string>;
}

interface CreateOpportunityPayload {
  contactId: string;
  pipelineId: string;
  stageId: string;
  name: string;
  monetaryValue?: number;
  source?: string;
}

class HighLevelClient {
  private apiKey: string;
  private locationId: string;

  constructor(config: HighLevelConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${HIGHLEVEL_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HighLevel API error: ${error}`);
    }

    return response.json();
  }

  async createContact(payload: CreateContactPayload) {
    return this.request('/contacts/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        locationId: this.locationId,
      }),
    });
  }

  async getContact(contactId: string) {
    return this.request(`/contacts/${contactId}`);
  }

  async findContactByEmail(email: string) {
    return this.request(
      `/contacts/lookup?email=${encodeURIComponent(email)}&locationId=${this.locationId}`
    );
  }

  async updateContact(contactId: string, payload: Partial<CreateContactPayload>) {
    return this.request(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async addTagsToContact(contactId: string, tags: string[]) {
    return this.request(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async createOpportunity(payload: CreateOpportunityPayload) {
    return this.request('/opportunities/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        locationId: this.locationId,
      }),
    });
  }

  async updateOpportunityStage(opportunityId: string, stageId: string) {
    return this.request(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify({ stageId }),
    });
  }

  async addPromoToContact(
    contactId: string,
    promo: { code: string; value: number; expiresAt: string }
  ) {
    return this.request(`/contacts/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        body: `Promo code ${promo.code} (${promo.value}% off) - Expires: ${promo.expiresAt}`,
      }),
    });
  }
}

export function createHighLevelClient(): HighLevelClient {
  const apiKey = process.env.HIGHLEVEL_API_KEY;
  const locationId = process.env.HIGHLEVEL_LOCATION_ID;

  if (!apiKey || !locationId) {
    throw new Error('Missing HighLevel credentials');
  }

  return new HighLevelClient({ apiKey, locationId });
}

export type { CreateContactPayload, CreateOpportunityPayload };
