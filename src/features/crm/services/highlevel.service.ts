import { createHighLevelClient } from '@/lib/highlevel/client';
import type { User, Order } from '@/contracts/types';

const PIPELINE_ID = process.env.HIGHLEVEL_PIPELINE_ID!;
const STAGE_IDS = {
  newLead: process.env.HIGHLEVEL_STAGE_NEW_LEAD!,
  qualified: process.env.HIGHLEVEL_STAGE_QUALIFIED!,
  proposal: process.env.HIGHLEVEL_STAGE_PROPOSAL!,
  won: process.env.HIGHLEVEL_STAGE_WON!,
  lost: process.env.HIGHLEVEL_STAGE_LOST!,
};

export async function syncUserToHighLevel(user: User): Promise<string> {
  const client = createHighLevelClient();

  // Check if contact exists
  try {
    const existing = await client.findContactByEmail(user.email);
    if (existing && (existing as { contact?: { id: string } }).contact) {
      const contactId = (existing as { contact: { id: string } }).contact.id;

      // Update existing contact
      await client.updateContact(contactId, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        companyName: user.companyName,
      });

      return contactId;
    }
  } catch {
    // Contact doesn't exist, create new one
  }

  // Create new contact
  const response = await client.createContact({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    companyName: user.companyName,
    tags: ['catering-app', 'customer'],
  });

  return (response as { contact: { id: string } }).contact.id;
}

export async function createOrderOpportunity(
  contactId: string,
  order: Order
): Promise<string> {
  const client = createHighLevelClient();

  const response = await client.createOpportunity({
    contactId,
    pipelineId: PIPELINE_ID,
    stageId: STAGE_IDS.newLead,
    name: `Order ${order.id} - ${order.eventDetails.eventName}`,
    monetaryValue: order.total,
    source: 'Catering App',
  });

  return (response as { opportunity: { id: string } }).opportunity.id;
}

export async function updateOpportunityStatus(
  opportunityId: string,
  orderStatus: Order['status']
): Promise<void> {
  const client = createHighLevelClient();

  const stageMap: Partial<Record<Order['status'], string>> = {
    pending_payment: STAGE_IDS.proposal,
    confirmed: STAGE_IDS.won,
    cancelled: STAGE_IDS.lost,
  };

  const stageId = stageMap[orderStatus];
  if (stageId) {
    await client.updateOpportunityStage(opportunityId, stageId);
  }
}

export async function addTagsToContact(
  contactId: string,
  tags: string[]
): Promise<void> {
  const client = createHighLevelClient();
  await client.addTagsToContact(contactId, tags);
}

export async function tagRepeatCustomer(contactId: string): Promise<void> {
  await addTagsToContact(contactId, ['repeat-customer', 'vip']);
}

export async function tagHighValueCustomer(
  contactId: string,
  totalSpend: number
): Promise<void> {
  const tags: string[] = [];

  if (totalSpend >= 5000) {
    tags.push('high-value', 'vip');
  } else if (totalSpend >= 2000) {
    tags.push('medium-value');
  }

  if (tags.length > 0) {
    await addTagsToContact(contactId, tags);
  }
}
