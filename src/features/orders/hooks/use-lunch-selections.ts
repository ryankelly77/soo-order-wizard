'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LunchSelection } from '@/contracts/types';

interface AddLunchSelectionInput {
  orderId: string;
  attendeeName: string;
  attendeeEmail: string;
  menuItemId: string;
  menuItemName: string;
  specialInstructions?: string;
  dietaryRestrictions?: string[];
}

export function useLunchSelections(orderId: string) {
  const [selections, setSelections] = useState<LunchSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSelections = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('lunch_selections')
        .select('*')
        .eq('order_id', orderId);

      if (fetchError) throw new Error(fetchError.message);

      setSelections(
        data.map((item) => ({
          id: item.id,
          attendeeId: item.attendee_id,
          attendeeName: item.attendee_name,
          attendeeEmail: item.attendee_email,
          menuItemId: item.menu_item_id,
          menuItemName: item.menu_item_name,
          specialInstructions: item.special_instructions,
          dietaryRestrictions: item.dietary_restrictions,
          selectedAt: new Date(item.selected_at),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch selections');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const addSelection = useCallback(async (input: AddLunchSelectionInput) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('lunch_selections')
        .insert({
          order_id: input.orderId,
          attendee_name: input.attendeeName,
          attendee_email: input.attendeeEmail,
          menu_item_id: input.menuItemId,
          menu_item_name: input.menuItemName,
          special_instructions: input.specialInstructions,
          dietary_restrictions: input.dietaryRestrictions,
          selected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      const newSelection: LunchSelection = {
        id: data.id,
        attendeeId: data.attendee_id,
        attendeeName: data.attendee_name,
        attendeeEmail: data.attendee_email,
        menuItemId: data.menu_item_id,
        menuItemName: data.menu_item_name,
        specialInstructions: data.special_instructions,
        dietaryRestrictions: data.dietary_restrictions,
        selectedAt: new Date(data.selected_at),
      };

      setSelections((prev) => [...prev, newSelection]);
      return newSelection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add selection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeSelection = useCallback(async (selectionId: string) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('lunch_selections')
        .delete()
        .eq('id', selectionId);

      if (deleteError) throw new Error(deleteError.message);

      setSelections((prev) => prev.filter((s) => s.id !== selectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove selection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    selections,
    isLoading,
    error,
    fetchSelections,
    addSelection,
    removeSelection,
  };
}
