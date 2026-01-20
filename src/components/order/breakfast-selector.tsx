'use client';

import { useState } from 'react';
import type { BreakfastSelection } from '@/contracts/types';

interface BreakfastSelectorProps {
  selected: Partial<BreakfastSelection> | null;
  headCount: number;
  onSelect: (selection: Partial<BreakfastSelection> | null) => void;
  onAddonsChange?: (addons: string[]) => void;
}

const BREAKFAST_PACKAGES = [
  {
    id: 'continental',
    type: 'continental' as const,
    name: 'Continental Classic',
    description: 'A timeless selection of European-inspired pastries and fresh fruits to start your day.',
    includedItems: [
      'Assorted croissants & Danish pastries',
      'Fresh seasonal fruit display',
      'Artisan breads with butter & preserves',
      'Greek yogurt parfaits',
      'Premium coffee & tea service',
    ],
    pricePerPerson: 18.95,
    icon: '🥐',
    image: '/images/breakfast/continental-classic.jpg',
    tags: ['VEGETARIAN'],
  },
  {
    id: 'executive',
    type: 'hot' as const,
    name: 'Executive Brunch',
    description: 'An elevated experience featuring hot items and premium ingredients for discerning palates.',
    includedItems: [
      'Eggs Benedict with hollandaise',
      'Smoked salmon display',
      'Quiche Lorraine & spinach quiche',
      'French pastry assortment',
      'Fresh fruit & berries',
      'Premium coffee & tea service',
    ],
    pricePerPerson: 32.95,
    icon: '🍳',
    image: '/images/breakfast/executive-brunch.jpg',
    tags: ['GF OPTIONS'],
    popular: true,
  },
  {
    id: 'health',
    type: 'premium' as const,
    name: 'Health & Vitality',
    description: 'Fuel your team with nutrient-rich options designed for energy and focus.',
    includedItems: [
      'Açai bowls with granola',
      'Avocado toast bar',
      'Fresh-pressed juice trio',
      'Protein power bites',
      'Overnight oats selection',
      'Herbal tea & cold brew',
    ],
    pricePerPerson: 26.95,
    icon: '🥗',
    image: '/images/breakfast/health-vitality.jpg',
    tags: ['VEGAN', 'GF'],
  },
];

const OPTIONAL_ADDONS = [
  { id: 'espresso', name: 'Espresso Bar', price: 4.95, icon: '☕', image: '/images/breakfast/espresso-bar.jpg' },
  { id: 'juice', name: 'Fresh Juice Station', price: 5.95, icon: '🧃', image: '/images/breakfast/fresh-juice.jpg' },
  { id: 'bacon', name: 'Bacon & Sausage', price: 6.95, icon: '🥓', image: '/images/breakfast/bacon-sausage.jpg' },
  { id: 'waffle', name: 'Waffle Station', price: 7.95, icon: '🧇', image: '/images/breakfast/waffle-station.jpg' },
];

export function BreakfastSelector({
  selected,
  headCount,
  onSelect,
  onAddonsChange,
}: BreakfastSelectorProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleSelect = (packageType: 'continental' | 'hot' | 'premium') => {
    onSelect({
      packageType,
      headCount,
      items: [],
    });
  };

  const handleAddonToggle = (addonId: string) => {
    const newAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter((id) => id !== addonId)
      : [...selectedAddons, addonId];
    setSelectedAddons(newAddons);
    onAddonsChange?.(newAddons);
  };

  return (
    <div className="breakfast-selector">
      {/* Package Grid - 3 columns */}
      <div className="breakfast-package-grid">
        {BREAKFAST_PACKAGES.map((pkg) => {
          const isSelected = selected?.packageType === pkg.type;

          return (
            <div
              key={pkg.id}
              className={`breakfast-package-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(pkg.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(pkg.type);
                }
              }}
            >
              {/* Image Area */}
              <div className="package-image-area">
                {pkg.image ? (
                  <img src={pkg.image} alt={pkg.name} className="package-image" />
                ) : (
                  <span className="package-emoji">{pkg.icon}</span>
                )}

                {/* Popular Ribbon */}
                {pkg.popular && (
                  <div className="popular-ribbon">Most Popular</div>
                )}

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="package-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="package-content">
                <h3 className="package-title">{pkg.name}</h3>
                <p className="package-desc">{pkg.description}</p>

                <div className="package-includes">
                  <div className="includes-label">Includes</div>
                  <ul className="includes-items">
                    {pkg.includedItems.map((item, index) => (
                      <li key={index}>
                        <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="package-footer">
                  <div className="package-pricing">
                    <span className="package-price">${pkg.pricePerPerson.toFixed(2)}</span>
                    <span className="package-price-unit">per person</span>
                  </div>
                  <div className="package-tags">
                    {pkg.tags.map((tag) => (
                      <span key={tag} className="dietary-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Add-ons */}
      <div className="addons-section">
        <div className="addons-header">
          <h3 className="addons-title">Optional Add-ons</h3>
          <p className="addons-subtitle">Enhance your breakfast experience</p>
        </div>

        <div className="addons-grid">
          {OPTIONAL_ADDONS.map((addon) => {
            const isAddonSelected = selectedAddons.includes(addon.id);

            return (
              <div
                key={addon.id}
                className={`addon-card ${isAddonSelected ? 'selected' : ''}`}
                onClick={() => handleAddonToggle(addon.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddonToggle(addon.id);
                  }
                }}
              >
                <div className="addon-image-area">
                  {addon.image ? (
                    <img src={addon.image} alt={addon.name} />
                  ) : (
                    <span className="addon-icon">{addon.icon}</span>
                  )}
                </div>
                <div className="addon-content">
                  <span className="addon-name">{addon.name}</span>
                  <span className="addon-price">+${addon.price.toFixed(2)}/person</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
