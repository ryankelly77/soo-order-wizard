'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SnackPackage {
  id: string;
  name: string;
  description: string;
  icon: string;
  pricePerPerson: number;
  contents: string[];
}

interface BeveragePackage {
  id: string;
  name: string;
  description: string;
  icon: string;
  pricePerPerson: number;
  contents: string[];
  image?: string;
}

interface SnacksSelectorProps {
  headCount: number;
  onSelect: (selection: {
    snackPackages: string[];
    beveragePackages: string[];
    skipSnacks: boolean;
    skipBeverages: boolean;
  }) => void;
  selected?: {
    snackPackages: string[];
    beveragePackages: string[];
    skipSnacks: boolean;
    skipBeverages: boolean;
  };
}

const SNACK_PACKAGES: SnackPackage[] = [
  {
    id: 'premium',
    name: 'Premium Snack Spread',
    description: 'An artfully arranged selection of gourmet treats perfect for mid-meeting energy boosts.',
    icon: '🍪',
    pricePerPerson: 8.95,
    contents: ['Cheese & Charcuterie', 'Mixed Nuts', 'Dark Chocolate', 'Fresh Fruit', 'Artisan Crackers', 'Hummus & Crudités'],
  },
  {
    id: 'light',
    name: 'Light & Healthy',
    description: 'Wholesome, guilt-free options to keep everyone focused and energized.',
    icon: '🥜',
    pricePerPerson: 6.50,
    contents: ['Trail Mix', 'Energy Bars', 'Fresh Fruit', 'Veggie Sticks', 'Greek Yogurt Dip', 'Rice Cakes'],
  },
];

const BEVERAGE_PACKAGES: BeveragePackage[] = [
  {
    id: 'sodas-water',
    name: 'Sodas & Water',
    description: 'Classic refreshments to keep your team hydrated throughout the day.',
    icon: '🥤',
    pricePerPerson: 3.95,
    contents: ['Coca-Cola', 'Diet Coke', 'Topo Chico', 'Bottled Water'],
    image: '/images/snacks/sodas-and-water.jpg',
  },
  {
    id: 'premium',
    name: 'Premium Beverages',
    description: 'Elevated sparkling waters and refreshers for a refined palate.',
    icon: '✨',
    pricePerPerson: 5.50,
    contents: ['San Pellegrino', 'La Croix Variety', 'Sparkling Juices', 'Premium Still Water'],
    image: '/images/snacks/premium-beverage.jpg',
  },
  {
    id: 'energy',
    name: 'Energy Add-On',
    description: 'Keep energy levels high with premium cold brews and energy drinks.',
    icon: '⚡',
    pricePerPerson: 4.95,
    contents: ['Premium Cold Brew', 'Nitro Coffee', 'Energy Drinks', 'Yerba Mate'],
    image: '/images/snacks/energy-drinks.jpg',
  },
];

export function SnacksSelector({ headCount, onSelect, selected }: SnacksSelectorProps) {
  const [selectedSnacks, setSelectedSnacks] = useState<string[]>(selected?.snackPackages || []);
  const [selectedBeverages, setSelectedBeverages] = useState<string[]>(selected?.beveragePackages || []);
  const [skipSnacks, setSkipSnacks] = useState(selected?.skipSnacks || false);
  const [skipBeverages, setSkipBeverages] = useState(selected?.skipBeverages || false);

  const handleSnackSelect = (packageId: string) => {
    const isSelected = selectedSnacks.includes(packageId);
    const newSelected = isSelected
      ? selectedSnacks.filter(id => id !== packageId)
      : [...selectedSnacks, packageId];
    setSelectedSnacks(newSelected);
    setSkipSnacks(false);
    onSelect({
      snackPackages: newSelected,
      beveragePackages: selectedBeverages,
      skipSnacks: false,
      skipBeverages,
    });
  };

  const handleBeverageSelect = (packageId: string) => {
    const isSelected = selectedBeverages.includes(packageId);
    const newSelected = isSelected
      ? selectedBeverages.filter(id => id !== packageId)
      : [...selectedBeverages, packageId];
    setSelectedBeverages(newSelected);
    setSkipBeverages(false);
    onSelect({
      snackPackages: selectedSnacks,
      beveragePackages: newSelected,
      skipSnacks,
      skipBeverages: false,
    });
  };

  const handleSkipSnacks = () => {
    const newSkip = !skipSnacks;
    setSkipSnacks(newSkip);
    if (newSkip) setSelectedSnacks([]);
    onSelect({
      snackPackages: newSkip ? [] : selectedSnacks,
      beveragePackages: selectedBeverages,
      skipSnacks: newSkip,
      skipBeverages,
    });
  };

  const handleSkipBeverages = () => {
    const newSkip = !skipBeverages;
    setSkipBeverages(newSkip);
    if (newSkip) setSelectedBeverages([]);
    onSelect({
      snackPackages: selectedSnacks,
      beveragePackages: newSkip ? [] : selectedBeverages,
      skipSnacks,
      skipBeverages: newSkip,
    });
  };

  return (
    <div className="snacks-selector">
      {/* Powered By Header */}
      <a href="#raptor-vending-snacks" className="powered-by-header">
        <span className="powered-by-text">Powered by <strong>Raptor Vending</strong></span>
      </a>

      {/* Snack Packages Section */}
      <div className="selection-section">
        <div className="section-header">
          <h2>Snack Packages</h2>
          <span className="section-optional">Optional</span>
        </div>

        <div className="snack-package-row">
          {SNACK_PACKAGES.map((pkg) => {
            const isSelected = selectedSnacks.includes(pkg.id);
            const totalPrice = pkg.pricePerPerson * headCount;

            return (
              <div
                key={pkg.id}
                className={`snack-package-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSnackSelect(pkg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSnackSelect(pkg.id);
                  }
                }}
              >
                <div className="snack-package-image">
                  <span className="snack-package-icon">{pkg.icon}</span>
                  {isSelected && (
                    <div className="snack-package-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="snack-package-details">
                  <h3 className="snack-package-name">{pkg.name}</h3>
                  <p className="snack-package-description">{pkg.description}</p>

                  <div className="snack-package-contents">
                    <div className="contents-title">What&apos;s Included</div>
                    <div className="contents-list">
                      {pkg.contents.map((item) => (
                        <span key={item} className="content-tag">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="snack-package-footer">
                    <div className="snack-pricing">
                      <span className="snack-price">${pkg.pricePerPerson.toFixed(2)}</span>
                      <span className="snack-price-unit">per person</span>
                    </div>
                    <div className="snack-total">
                      <span className="snack-total-label">Total for {headCount}:</span>
                      <span className="snack-total-value">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skip Snacks Option */}
        <div
          className={`skip-option ${skipSnacks ? 'selected' : ''}`}
          onClick={handleSkipSnacks}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSkipSnacks();
            }
          }}
        >
          <span className="skip-checkbox">
            {skipSnacks && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span>Skip snacks for this order</span>
        </div>
      </div>

      {/* Beverage Packages Section */}
      <div className="selection-section">
        <div className="section-header">
          <h2>Beverage Packages</h2>
          <span className="section-optional">Optional</span>
        </div>

        <div className="drink-grid">
          {BEVERAGE_PACKAGES.map((pkg) => {
            const isSelected = selectedBeverages.includes(pkg.id);
            const totalPrice = pkg.pricePerPerson * headCount;

            return (
              <div
                key={pkg.id}
                className={`drink-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleBeverageSelect(pkg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBeverageSelect(pkg.id);
                  }
                }}
              >
                {pkg.image ? (
                  <div className="drink-image">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      width={300}
                      height={140}
                      className="drink-photo"
                    />
                    {isSelected && (
                      <div className="drink-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="drink-icon">
                    {pkg.icon}
                    {isSelected && (
                      <div className="drink-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
                <h3 className="drink-name">{pkg.name}</h3>
                <p className="drink-description">{pkg.description}</p>
                <div className="drink-contents">
                  {pkg.contents.map((item) => (
                    <span key={item} className="content-tag">{item}</span>
                  ))}
                </div>
                <div className="drink-footer">
                  <div className="drink-pricing">
                    <span className="drink-price">${pkg.pricePerPerson.toFixed(2)} <span>/ person</span></span>
                  </div>
                  <div className="drink-total">
                    Total: ${totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skip Beverages Option */}
        <div
          className={`skip-option ${skipBeverages ? 'selected' : ''}`}
          onClick={handleSkipBeverages}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSkipBeverages();
            }
          }}
        >
          <span className="skip-checkbox">
            {skipBeverages && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span>Skip beverages for this order</span>
        </div>
      </div>

      {/* Raptor Vending Promo Section */}
      <div id="raptor-vending-snacks" className="raptor-promo-section">
        <Image
          src="/images/partners/raptor-vending-logo.png"
          alt="Raptor Vending"
          width={200}
          height={120}
          className="raptor-promo-logo"
        />
        <p className="raptor-promo-text">Would you like to get access to premium snacks and drinks in your building? See how we can upgrade your experience.</p>
        <a href="#" className="btn-raptor-cta">
          Find out how
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
