import { redirect } from 'next/navigation';

// Redirect authenticated users to the public order wizard
// The wizard now works for both authenticated and guest users
export default function NewOrderRedirect() {
  redirect('/order/new');
}
