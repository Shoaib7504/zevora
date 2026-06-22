'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function UserProfile() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('(555) 019-2834');
  
  const [street, setStreet] = useState('123 Innovation Drive');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94103');
  const [country, setCountry] = useState('United States');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Update your personal details, contact coordinates, and shipping address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        
        {/* Profile Card left */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <div className="mx-auto h-24 w-24 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold text-3xl border border-zinc-200 dark:border-zinc-800">
              {firstName.charAt(0) || 'U'}
            </div>
            
            <h3 className="mt-4 font-bold text-lg text-zinc-900 dark:text-zinc-100">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Member since June 2026
            </p>
            
            <div className="mt-6 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 dark:border-zinc-800/50">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {user?.primaryEmailAddress?.emailAddress || 'guest@example.com'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit fields right */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <User className="h-4 w-4 text-[#4F46E5]" />
              <span>Personal & Shipping Details</span>
            </h4>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute top-3 left-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="sm:col-span-2 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-4">
                  <MapPin className="h-3.5 w-3.5 text-[#06B6D4]" />
                  <span>Shipping Address</span>
                </h5>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">State / Region</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Zip / Postal Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-transparent outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:focus:border-[#4F46E5] transition-all"
                />
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-2">
              {saved && (
                <span className="flex items-center text-xs font-bold text-[#06B6D4] animate-fade-in">
                  Changes saved successfully!
                </span>
              )}
              <Button 
                type="submit" 
                disabled={saving}
                className="cursor-pointer bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold flex items-center gap-1.5 px-5 rounded-full"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </Button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
