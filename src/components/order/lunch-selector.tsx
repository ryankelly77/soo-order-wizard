'use client';

import { useState } from 'react';

interface OrderItem {
  optionId: string;
  quantity: number;
}

interface Attendee {
  id: number;
  name: string;
  email: string;
  sent: boolean;
  ordered: boolean;
}

interface LunchOption {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  pricePerPerson: number;
  tags: string[];
  popular?: boolean;
  ingredients?: string[];
  calories?: number;
  protein?: string;
  allergens?: string[];
  videoUrl?: string;
}

interface LunchSelectorProps {
  headCount: number;
  onSelect: (selection: { optionId: string; headCount: number } | null) => void;
  selected: { optionId: string; headCount: number } | null;
}

const STORAGE_URL = 'https://uccjzzwkjxfpatdxdmja.supabase.co/storage/v1/object/public/menu-images';

const LUNCH_OPTIONS: LunchOption[] = [
  {
    id: 'chicken-rigatoni',
    name: 'Chicken Rigatoni',
    description: 'Creamy tomato sauce with tender pulled chicken and parmesan',
    image: `${STORAGE_URL}/chicken-rigatoni.jpeg`,
    icon: '🍗',
    pricePerPerson: 24.95,
    tags: [],
    popular: true,
    ingredients: ['Rigatoni pasta', 'Pulled chicken breast', 'Creamy tomato sauce', 'Parmesan cheese', 'Fresh basil', 'Garlic'],
    calories: 620,
    protein: '38g',
    allergens: ['Wheat', 'Dairy'],
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich, creamy tomato-based curry sauce',
    image: `${STORAGE_URL}/butter-chicken.jpg`,
    icon: '🧈',
    pricePerPerson: 25.95,
    tags: ['GF'],
    ingredients: ['Chicken thighs', 'Tomato curry sauce', 'Butter', 'Cream', 'Garam masala', 'Basmati rice'],
    calories: 580,
    protein: '42g',
    allergens: ['Dairy'],
  },
  {
    id: 'cauliflower-tikka-masala',
    name: 'Cauliflower Tikka Masala',
    description: 'Roasted cauliflower in aromatic tikka masala sauce',
    image: `${STORAGE_URL}/cauliflower-tikka-masala.jpeg`,
    icon: '🥦',
    pricePerPerson: 22.95,
    tags: ['VEGETARIAN', 'GF'],
    ingredients: ['Roasted cauliflower', 'Tikka masala sauce', 'Coconut cream', 'Chickpeas', 'Basmati rice', 'Fresh cilantro'],
    calories: 420,
    protein: '14g',
    allergens: ['Tree nuts'],
  },
  {
    id: 'chicken-mushroom-alfredo',
    name: 'Chicken Mushroom Alfredo',
    description: 'Creamy alfredo with grilled chicken and sautéed mushrooms',
    image: `${STORAGE_URL}/chicken-mushroom-alfredo.jpeg`,
    icon: '🍄',
    pricePerPerson: 25.95,
    tags: [],
    ingredients: ['Fettuccine pasta', 'Grilled chicken breast', 'Cremini mushrooms', 'Alfredo sauce', 'Parmesan', 'Garlic'],
    calories: 680,
    protein: '44g',
    allergens: ['Wheat', 'Dairy'],
  },
  {
    id: 'grilled-chimichurri-chicken',
    name: 'Grilled Chimichurri Chicken',
    description: 'Herb-marinated grilled chicken with fresh chimichurri sauce',
    image: `${STORAGE_URL}/grilled-chimichurri-chicken.jpg`,
    icon: '🌿',
    pricePerPerson: 26.95,
    tags: ['GF'],
    ingredients: ['Grilled chicken breast', 'Chimichurri sauce', 'Fresh parsley', 'Oregano', 'Roasted vegetables', 'Quinoa'],
    calories: 480,
    protein: '46g',
    allergens: [],
    videoUrl: 'https://player.vimeo.com/video/1156503520',
  },
  {
    id: 'mascarpone-spinach-mac',
    name: 'Mascarpone & Spinach Mac and Cheese',
    description: 'Creamy mascarpone cheese pasta with fresh spinach',
    image: `${STORAGE_URL}/mascarpone-and-pinach-mac-and-cheese.jpeg`,
    icon: '🧀',
    pricePerPerson: 21.95,
    tags: ['VEGETARIAN'],
    ingredients: ['Cavatappi pasta', 'Mascarpone cheese', 'Fresh spinach', 'Parmesan', 'Garlic', 'Nutmeg'],
    calories: 590,
    protein: '22g',
    allergens: ['Wheat', 'Dairy'],
  },
  {
    id: 'pesto-chicken-fettuccine',
    name: 'Pesto Chicken Fettuccine',
    description: 'Fettuccine tossed in basil pesto with grilled chicken',
    image: `${STORAGE_URL}/pesto-chicken-fettuccine.jpg`,
    icon: '🌿',
    pricePerPerson: 24.95,
    tags: [],
    ingredients: ['Fettuccine pasta', 'Grilled chicken', 'Basil pesto', 'Pine nuts', 'Parmesan', 'Cherry tomatoes'],
    calories: 640,
    protein: '40g',
    allergens: ['Wheat', 'Dairy', 'Tree nuts'],
    videoUrl: 'https://player.vimeo.com/video/1156507166',
  },
  {
    id: 'beef-barbacoa-bowl',
    name: 'Beef Barbacoa Bowl',
    description: 'Slow-cooked shredded beef with rice, beans, and toppings',
    image: `${STORAGE_URL}/beef-barbacoa-bowl.jpg`,
    icon: '🥘',
    pricePerPerson: 26.95,
    tags: ['GF'],
    ingredients: ['Shredded beef barbacoa', 'Cilantro lime rice', 'Black beans', 'Pico de gallo', 'Guacamole', 'Sour cream'],
    calories: 650,
    protein: '48g',
    allergens: ['Dairy'],
  },
  {
    id: 'southwest-beef-chili',
    name: 'Southwest Beef & Bean Chili',
    description: 'Hearty beef and bean chili with southwest spices',
    image: `${STORAGE_URL}/southwest-beef-and-bean-chili.jpeg`,
    icon: '🌶️',
    pricePerPerson: 23.95,
    tags: ['GF'],
    ingredients: ['Ground beef', 'Kidney beans', 'Black beans', 'Tomatoes', 'Southwest spices', 'Cornbread'],
    calories: 520,
    protein: '36g',
    allergens: ['Wheat'],
  },
];

export function LunchSelector({ headCount, onSelect, selected }: LunchSelectorProps) {
  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardQuantity, setCardQuantity] = useState<number>(1);

  // Send link mode
  const [showSendLink, setShowSendLink] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: 1, name: '', email: '', sent: false, ordered: false },
    { id: 2, name: '', email: '', sent: false, ordered: false },
    { id: 3, name: '', email: '', sent: false, ordered: false },
  ]);

  // Expanded card for details
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const addToOrder = (optionId: string, quantity: number) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.optionId === optionId);
      if (existing) {
        return prev.map(item =>
          item.optionId === optionId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { optionId, quantity }];
    });
    setSelectedCard(null);
    setCardQuantity(1);
  };

  const removeFromOrder = (optionId: string) => {
    setOrderItems(prev => prev.filter(item => item.optionId !== optionId));
  };

  const updateQuantity = (optionId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(optionId);
    } else {
      setOrderItems(prev =>
        prev.map(item =>
          item.optionId === optionId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const addAttendee = () => {
    const newId = Math.max(...attendees.map(a => a.id)) + 1;
    setAttendees(prev => [...prev, { id: newId, name: '', email: '', sent: false, ordered: false }]);
  };

  const sendLink = (id: number) => {
    setAttendees(prev =>
      prev.map(a => (a.id === id ? { ...a, sent: true } : a))
    );
  };

  const removeAttendee = (id: number) => {
    if (attendees.length > 1) {
      setAttendees(prev => prev.filter(a => a.id !== id));
    }
  };

  const updateAttendee = (id: number, field: 'name' | 'email', value: string) => {
    setAttendees(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const getOptionById = (id: string) => LUNCH_OPTIONS.find(o => o.id === id);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = orderItems.reduce((sum, item) => {
    const option = getOptionById(item.optionId);
    return sum + (option?.pricePerPerson || 0) * item.quantity;
  }, 0);

  return (
    <div className="lunch-selector">
      {/* Powered By Header */}
      <a href="#raptor-vending" className="powered-by-header">
        <span className="powered-by-text">Powered by <strong>Raptor Vending</strong></span>
      </a>

      {/* Menu Options Section - Primary Focus */}
      <div className="menu-section">
        <div className="menu-section-header">
          <div className="menu-section-title">
            <h2>Available Menu Options</h2>
            <p className="menu-section-note">Select meals and quantities for your event</p>
          </div>
          <button
            className={`btn-send-link-toggle ${showSendLink ? 'active' : ''}`}
            onClick={() => setShowSendLink(!showSendLink)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showSendLink ? 'Hide Link Form' : 'Send Link to Attendees'}
          </button>
        </div>

        {/* Send Link Form - Collapsible */}
        {showSendLink && (
          <div className="send-link-section">
            <div className="send-link-info">
              <div className="send-link-icon">🔗</div>
              <div className="send-link-content">
                <h4>Let attendees choose their own meals</h4>
                <p>Enter names and email addresses below. Each person will receive a personalized link to select their meal from the menu.</p>
              </div>
            </div>

            <div className="attendee-list-compact">
              <div className="attendee-list-header-compact">
                <span className="header-num">#</span>
                <span className="header-name">Name</span>
                <span className="header-email">Email Address</span>
                <span className="header-action"></span>
                <span className="header-status">Sent</span>
                <span className="header-status">Ordered</span>
                <span className="header-delete"></span>
              </div>

              {attendees.map((attendee, index) => (
                <div key={attendee.id} className="attendee-row-compact">
                  <span className="attendee-num">{index + 1}</span>
                  <input
                    type="text"
                    className="attendee-input-compact"
                    placeholder="Attendee name"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                  />
                  <input
                    type="email"
                    className="attendee-input-compact"
                    placeholder="email@company.com"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(attendee.id, 'email', e.target.value)}
                  />
                  <div className="attendee-send-cell">
                    {!attendee.sent && attendee.email && (
                      <button
                        className="btn-send-single"
                        onClick={() => sendLink(attendee.id)}
                      >
                        Send
                      </button>
                    )}
                  </div>
                  <div className={`status-indicator ${attendee.sent ? 'complete' : ''}`}>
                    {attendee.sent && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className={`status-indicator ${attendee.ordered ? 'complete' : ''}`}>
                    {attendee.ordered && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <button
                    className="btn-remove-attendee"
                    onClick={() => removeAttendee(attendee.id)}
                    disabled={attendees.length <= 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="attendee-list-footer">
                <button className="btn-add-attendee" onClick={addAttendee}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Another Attendee
                </button>
                <button className="btn-send-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Send All Links
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Food Grid */}
        <div className="lunch-options-grid">
          {LUNCH_OPTIONS.map((option) => {
            const orderItem = orderItems.find(item => item.optionId === option.id);
            const isInOrder = !!orderItem;
            const isExpanded = expandedOption === option.id;

            return (
              <div
                key={option.id}
                className={`lunch-option-card preview ${isExpanded ? 'expanded' : ''} ${isInOrder ? 'in-order' : ''}`}
                onClick={() => setExpandedOption(isExpanded ? null : option.id)}
              >
                {/* Image Area */}
                <div className="lunch-option-image">
                  {playingVideoId === option.id && option.videoUrl ? (
                    <iframe
                      src={`${option.videoUrl}?autoplay=1&muted=1`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="lunch-option-video"
                    />
                  ) : option.image ? (
                    <img src={option.image} alt={option.name} />
                  ) : (
                    <span className="lunch-option-emoji">{option.icon}</span>
                  )}

                  {/* Popular Badge */}
                  {option.popular && playingVideoId !== option.id && (
                    <div className="lunch-popular-badge">Popular</div>
                  )}

                  {/* In Order Badge */}
                  {isInOrder && (
                    <div className="lunch-in-order-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {orderItem.quantity} added
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="lunch-option-content">
                  <div className="lunch-option-header">
                    <h3 className="lunch-option-name">{option.name}</h3>
                    <span className="lunch-option-price">${formatCurrency(option.pricePerPerson)}</span>
                  </div>
                  <p className="lunch-option-desc">{option.description}</p>

                  <div className="lunch-option-tags-row">
                    {option.tags.length > 0 && (
                      <div className="lunch-option-tags">
                        {option.tags.map((tag) => (
                          <span key={tag} className="dietary-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    {option.videoUrl && (
                      <button
                        className="video-play-btn-inline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingVideoId(playingVideoId === option.id ? null : option.id);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        {playingVideoId === option.id ? 'Stop Video' : 'Watch Video'}
                      </button>
                    )}
                  </div>

                  {/* Expand hint */}
                  {!isExpanded && (
                    <div className="lunch-option-expand-hint">
                      <span>Tap for details</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="lunch-option-details">
                      <div className="details-section">
                        <h4>Ingredients</h4>
                        <p>{option.ingredients?.join(', ')}</p>
                      </div>

                      <div className="details-nutrition">
                        {option.calories && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{option.calories}</span>
                            <span className="nutrition-label">Calories</span>
                          </div>
                        )}
                        {option.protein && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{option.protein}</span>
                            <span className="nutrition-label">Protein</span>
                          </div>
                        )}
                      </div>

                      {option.allergens && option.allergens.length > 0 && (
                        <div className="details-section allergens">
                          <h4>Allergens</h4>
                          <div className="allergen-tags">
                            {option.allergens.map((allergen) => (
                              <span key={allergen} className="allergen-tag">{allergen}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Order Button */}
                  <div className="lunch-option-actions" onClick={(e) => e.stopPropagation()}>
                    {isInOrder ? (
                      <div className="quantity-controls-inline">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(option.id, orderItem.quantity - 1)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" strokeLinecap="round" />
                          </svg>
                        </button>
                        <span className="qty-value">{orderItem.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(option.id, orderItem.quantity + 1)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-add-to-order-card"
                        onClick={() => addToOrder(option.id, 1)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="lunch-order-summary">
          <div className="order-summary-header">
            <h3>Your Order</h3>
            <span className="order-summary-count">{totalItems} items</span>
          </div>
          <div className="order-summary-items">
            {orderItems.map((item) => {
              const option = getOptionById(item.optionId);
              if (!option) return null;
              return (
                <div key={item.optionId} className="order-summary-item">
                  <div className="order-item-info">
                    <span className="order-item-qty">{item.quantity}x</span>
                    <span className="order-item-name">{option.name}</span>
                  </div>
                  <span className="order-item-price">
                    ${formatCurrency(option.pricePerPerson * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="order-summary-total">
            <span>Subtotal</span>
            <span className="total-amount">${formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}

      {/* Raptor Vending Promo Section */}
      <div id="raptor-vending" className="raptor-promo-section">
        <img
          src="/images/partners/raptor-vending-logo.png"
          alt="Raptor Vending"
          className="raptor-promo-logo"
        />
        <p className="raptor-promo-text">Would you like to get these same chef-prepared meals available in your office building 24/7?</p>
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
