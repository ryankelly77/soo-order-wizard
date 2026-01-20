'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import type { LunchSelection } from '@/contracts/types';

interface AttendeeListProps {
  selections: LunchSelection[];
  headCount: number;
  onRemove?: (selectionId: string) => void;
  onResendInvite?: (email: string) => void;
  isEditable?: boolean;
}

export function AttendeeList({
  selections,
  headCount,
  onRemove,
  onResendInvite,
  isEditable = false,
}: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSelections = selections.filter(
    (selection) =>
      selection.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      selection.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const respondedCount = selections.length;
  const pendingCount = headCount - respondedCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Attendee Selections</CardTitle>
            <CardDescription>
              {respondedCount} of {headCount} attendees have submitted selections
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 items-center rounded-full bg-muted px-3">
              <span className="text-sm font-medium text-green-600">
                {respondedCount} responded
              </span>
            </div>
            {pendingCount > 0 && (
              <div className="flex h-8 items-center rounded-full bg-muted px-3">
                <span className="text-sm font-medium text-orange-600">
                  {pendingCount} pending
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(respondedCount / headCount) * 100}%` }}
          />
        </div>

        {/* Search */}
        {selections.length > 5 && (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Attendee List */}
        <div className="space-y-2">
          {filteredSelections.length > 0 ? (
            filteredSelections.map((selection) => (
              <AttendeeRow
                key={selection.id}
                selection={selection}
                isEditable={isEditable}
                onRemove={onRemove}
                onResendInvite={onResendInvite}
              />
            ))
          ) : searchQuery ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No attendees match your search
            </p>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No selections submitted yet. Share the link to collect lunch preferences.
            </p>
          )}
        </div>

        {/* Pending Placeholder */}
        {pendingCount > 0 && !searchQuery && (
          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Awaiting Response ({pendingCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(pendingCount, 5) }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground"
                >
                  ?
                </div>
              ))}
              {pendingCount > 5 && (
                <div className="flex h-8 items-center rounded-full bg-muted px-3 text-xs text-muted-foreground">
                  +{pendingCount - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AttendeeRowProps {
  selection: LunchSelection;
  isEditable: boolean;
  onRemove?: (selectionId: string) => void;
  onResendInvite?: (email: string) => void;
}

function AttendeeRow({
  selection,
  isEditable,
  onRemove,
  onResendInvite,
}: AttendeeRowProps) {
  const [showActions, setShowActions] = useState(false);

  const initials = selection.attendeeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{selection.attendeeName}</p>
        <p className="text-sm text-muted-foreground truncate">
          {selection.attendeeEmail}
        </p>
      </div>

      {/* Selection */}
      <div className="hidden flex-shrink-0 text-right sm:block">
        <p className="text-sm font-medium">{selection.menuItemName}</p>
        {selection.dietaryRestrictions && selection.dietaryRestrictions.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {selection.dietaryRestrictions.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="hidden flex-shrink-0 text-right md:block">
        <p className="text-xs text-muted-foreground">
          {new Date(selection.selectedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Actions */}
      {isEditable && (
        <div
          className={cn(
            'flex flex-shrink-0 gap-1 transition-opacity',
            showActions ? 'opacity-100' : 'opacity-0'
          )}
        >
          {onResendInvite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResendInvite(selection.attendeeEmail)}
              className="h-8 px-2"
            >
              <MailIcon className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(selection.id)}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
