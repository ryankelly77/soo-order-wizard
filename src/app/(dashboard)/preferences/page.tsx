'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoader, ButtonLoader } from '@/components/shared/loading-spinner';

export default function PreferencesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
  });

  const [address, setAddress] = useState({
    address: user?.preferences?.defaultDeliveryAddress?.address || '',
    addressLine2: user?.preferences?.defaultDeliveryAddress?.addressLine2 || '',
    city: user?.preferences?.defaultDeliveryAddress?.city || '',
    state: user?.preferences?.defaultDeliveryAddress?.state || '',
    zipCode: user?.preferences?.defaultDeliveryAddress?.zipCode || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: user?.preferences?.communicationPreferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.communicationPreferences?.smsNotifications ?? false,
    marketingEmails: user?.preferences?.communicationPreferences?.marketingEmails ?? false,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccessMessage('Profile updated successfully');
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultDeliveryAddress: { ...address, isDefault: true },
        }),
      });

      if (response.ok) {
        setSuccessMessage('Address updated successfully');
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationPreferences: notifications,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Notification preferences updated');
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="(512) 555-1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={profile.companyName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, companyName: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <ButtonLoader />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Default Delivery Address</CardTitle>
          <CardDescription>
            This address will be pre-filled when creating new orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={address.address}
              onChange={(e) =>
                setAddress((a) => ({ ...a, address: e.target.value }))
              }
              placeholder="123 Main Street"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Suite / Floor (Optional)</Label>
            <Input
              id="addressLine2"
              value={address.addressLine2}
              onChange={(e) =>
                setAddress((a) => ({ ...a, addressLine2: e.target.value }))
              }
              placeholder="Suite 400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, city: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, state: e.target.value }))
                }
                placeholder="TX"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={address.zipCode}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, zipCode: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveAddress} disabled={isSaving}>
              {isSaving && <ButtonLoader />}
              Save Address
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive order updates and confirmations via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) =>
                  setNotifications((n) => ({
                    ...n,
                    emailNotifications: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get text messages for delivery updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsNotifications}
                onChange={(e) =>
                  setNotifications((n) => ({
                    ...n,
                    smsNotifications: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">
                  Receive promotions and special offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.marketingEmails}
                onChange={(e) =>
                  setNotifications((n) => ({
                    ...n,
                    marketingEmails: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-gray-300"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={isSaving}>
              {isSaving && <ButtonLoader />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
