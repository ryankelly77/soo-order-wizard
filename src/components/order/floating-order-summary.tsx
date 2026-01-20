'use client';

interface OrderSummaryItem {
  name: string;
  quantity?: number;
  price: number;
}

interface OrderSummarySection {
  title: string;
  items: OrderSummaryItem[];
}

interface FloatingOrderSummaryProps {
  eventName?: string;
  eventDate?: string;
  headCount?: number;
  sections: OrderSummarySection[];
  subtotal: number;
}

export function FloatingOrderSummary({
  eventName = 'Your Event',
  eventDate,
  headCount = 0,
  sections,
  subtotal,
}: FloatingOrderSummaryProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="order-summary-float">
      <h3 className="summary-title">Order Summary</h3>

      <div className="summary-event">
        <div className="summary-event-name">{eventName}</div>
        <div className="summary-event-details">
          {eventDate && `${formatDate(eventDate)} • `}
          {headCount} attendees
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="summary-section">
          <div className="summary-section-title">{section.title}</div>
          {section.items.map((item, itemIndex) => (
            <div key={itemIndex} className="summary-line">
              <span>
                {item.name}
                {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
              </span>
              <span className="value">${formatCurrency(item.price)}</span>
            </div>
          ))}
          {section.items.length === 0 && (
            <div className="summary-line">
              <span style={{ color: 'var(--soo-text-muted)', fontStyle: 'italic' }}>
                Not selected
              </span>
              <span className="value">—</span>
            </div>
          )}
        </div>
      ))}

      <div className="summary-total">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}
