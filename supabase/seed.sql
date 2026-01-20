-- =============================================================================
-- SOO CATERING SEED DATA
-- =============================================================================

-- =============================================================================
-- BREAKFAST PACKAGES
-- =============================================================================

INSERT INTO public.breakfast_packages (name, type, description, price_per_person, minimum_head_count, included_items, is_available) VALUES
(
  'Continental Breakfast',
  'continental',
  'A light and refreshing start to your day with fresh pastries, fruit, and beverages.',
  8.95,
  10,
  ARRAY['Assorted pastries and muffins', 'Fresh seasonal fruit display', 'Orange juice and apple juice', 'Fresh brewed coffee and hot tea', 'Butter, jam, and cream cheese'],
  true
),
(
  'Hot Breakfast Buffet',
  'hot',
  'A hearty breakfast spread with scrambled eggs, bacon, and all the fixings.',
  14.95,
  10,
  ARRAY['Fluffy scrambled eggs', 'Crispy bacon and sausage links', 'Breakfast potatoes', 'Fresh seasonal fruit', 'Assorted pastries', 'Orange juice', 'Fresh brewed coffee and hot tea'],
  true
),
(
  'Executive Breakfast',
  'premium',
  'An elevated breakfast experience featuring made-to-order omelets and premium selections.',
  19.95,
  15,
  ARRAY['Made-to-order omelet station', 'Eggs Benedict with hollandaise', 'Applewood smoked bacon and maple sausage', 'Crispy hash browns', 'Fresh fruit parfaits with granola', 'Assorted artisan pastries', 'Fresh squeezed juices', 'Premium coffee service'],
  true
);

-- =============================================================================
-- LUNCH ENTREES
-- =============================================================================

INSERT INTO public.menu_items (name, description, category, price, dietary_tags, allergens, is_available, is_popular, serving_size, calories) VALUES
-- Sandwiches
(
  'Grilled Chicken Club',
  'Herb-marinated grilled chicken breast with bacon, lettuce, tomato, and garlic aioli on ciabatta.',
  'lunch_entree',
  13.95,
  ARRAY[]::TEXT[],
  ARRAY['gluten', 'eggs', 'dairy'],
  true,
  true,
  '1 sandwich',
  680
),
(
  'Turkey Avocado Wrap',
  'Sliced turkey breast with fresh avocado, mixed greens, tomato, and chipotle ranch in a spinach tortilla.',
  'lunch_entree',
  12.95,
  ARRAY[]::TEXT[],
  ARRAY['gluten', 'dairy'],
  true,
  true,
  '1 wrap',
  520
),
(
  'Caprese Panini',
  'Fresh mozzarella, vine-ripened tomatoes, fresh basil, and balsamic glaze on pressed focaccia.',
  'lunch_entree',
  11.95,
  ARRAY['vegetarian'],
  ARRAY['gluten', 'dairy'],
  true,
  false,
  '1 panini',
  450
),
(
  'Mediterranean Veggie Wrap',
  'Hummus, falafel, cucumber, tomato, red onion, and tzatziki in a whole wheat wrap.',
  'lunch_entree',
  11.95,
  ARRAY['vegetarian', 'vegan-optional'],
  ARRAY['gluten', 'sesame'],
  true,
  false,
  '1 wrap',
  480
),
-- Hot Entrees
(
  'Herb-Crusted Salmon',
  'Atlantic salmon with a Dijon herb crust, served with roasted vegetables and lemon dill sauce.',
  'lunch_entree',
  18.95,
  ARRAY['gluten-free'],
  ARRAY['fish', 'dairy'],
  true,
  true,
  '6 oz fillet',
  420
),
(
  'Chicken Marsala',
  'Pan-seared chicken breast in a rich Marsala wine sauce with mushrooms, served over pasta.',
  'lunch_entree',
  15.95,
  ARRAY[]::TEXT[],
  ARRAY['gluten', 'dairy'],
  true,
  true,
  '6 oz chicken + pasta',
  580
),
(
  'Beef Tenderloin Medallions',
  'Petite beef tenderloin medallions with red wine reduction, served with garlic mashed potatoes.',
  'lunch_entree',
  22.95,
  ARRAY['gluten-free'],
  ARRAY['dairy'],
  true,
  false,
  '5 oz beef',
  520
),
(
  'Stuffed Bell Peppers',
  'Roasted bell peppers filled with quinoa, black beans, corn, and topped with cashew cream.',
  'lunch_entree',
  13.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY['tree-nuts'],
  true,
  false,
  '2 pepper halves',
  380
);

-- =============================================================================
-- LUNCH SIDES
-- =============================================================================

INSERT INTO public.menu_items (name, description, category, price, dietary_tags, allergens, is_available, is_popular, serving_size, calories) VALUES
(
  'Roasted Seasonal Vegetables',
  'Chef''s selection of seasonal vegetables roasted with olive oil and fresh herbs.',
  'lunch_side',
  4.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  true,
  '4 oz',
  120
),
(
  'Garlic Mashed Potatoes',
  'Creamy Yukon gold potatoes whipped with roasted garlic and butter.',
  'lunch_side',
  4.50,
  ARRAY['vegetarian', 'gluten-free'],
  ARRAY['dairy'],
  true,
  true,
  '4 oz',
  180
),
(
  'Wild Rice Pilaf',
  'Blend of wild and long grain rice with toasted almonds and dried cranberries.',
  'lunch_side',
  4.95,
  ARRAY['vegetarian', 'vegan'],
  ARRAY['tree-nuts'],
  true,
  false,
  '4 oz',
  160
),
(
  'Steamed Broccoli',
  'Fresh broccoli florets lightly steamed and seasoned with sea salt.',
  'lunch_side',
  3.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  false,
  '4 oz',
  55
);

-- =============================================================================
-- LUNCH SALADS
-- =============================================================================

INSERT INTO public.menu_items (name, description, category, price, dietary_tags, allergens, is_available, is_popular, serving_size, calories) VALUES
(
  'Classic Caesar Salad',
  'Crisp romaine lettuce, house-made croutons, shaved Parmesan, and creamy Caesar dressing.',
  'lunch_salad',
  9.95,
  ARRAY['vegetarian'],
  ARRAY['gluten', 'dairy', 'eggs', 'fish'],
  true,
  true,
  'Individual portion',
  320
),
(
  'Mixed Greens Salad',
  'Spring mix with cherry tomatoes, cucumber, red onion, and choice of dressing.',
  'lunch_salad',
  7.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  false,
  'Individual portion',
  120
),
(
  'Greek Salad',
  'Romaine lettuce, Kalamata olives, feta cheese, cucumber, tomato, red onion, and oregano vinaigrette.',
  'lunch_salad',
  10.95,
  ARRAY['vegetarian', 'gluten-free'],
  ARRAY['dairy'],
  true,
  true,
  'Individual portion',
  280
);

-- =============================================================================
-- SNACK PACKAGES
-- =============================================================================

INSERT INTO public.snack_packages (name, type, description, price_per_person, minimum_head_count, included_items, is_available) VALUES
(
  'Afternoon Break',
  'basic',
  'A light mid-day refreshment with cookies, fruit, and beverages.',
  6.95,
  10,
  ARRAY['Assorted cookies and brownies', 'Fresh seasonal fruit', 'Bottled water', 'Assorted soft drinks', 'Fresh brewed coffee and hot tea'],
  true
),
(
  'Premium Snack Station',
  'premium',
  'An elevated snack experience with cheese, charcuterie, and artisan treats.',
  12.95,
  15,
  ARRAY['Artisan cheese display with crackers', 'Cured meat selection', 'Fresh vegetable crudites with dips', 'Mixed nuts and dried fruits', 'Gourmet cookies and pastries', 'Sparkling water and premium sodas', 'Premium coffee and tea service'],
  true
);

-- =============================================================================
-- DRINK PACKAGES
-- =============================================================================

INSERT INTO public.menu_items (name, description, category, price, dietary_tags, allergens, is_available, is_popular, serving_size, calories) VALUES
(
  'Basic Beverage Service',
  'Essential hydration with water, coffee, and tea service throughout your event.',
  'drink_package',
  3.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  true,
  'Per person',
  0
),
(
  'Standard Beverage Package',
  'Complete beverage service including soft drinks, juices, coffee, and tea.',
  'drink_package',
  5.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  true,
  'Per person',
  0
),
(
  'Premium Beverage Package',
  'Full-service beverage bar with specialty coffees, premium teas, fresh juices, and sparkling water.',
  'drink_package',
  8.95,
  ARRAY['vegetarian', 'vegan', 'gluten-free'],
  ARRAY[]::TEXT[],
  true,
  false,
  'Per person',
  0
);
