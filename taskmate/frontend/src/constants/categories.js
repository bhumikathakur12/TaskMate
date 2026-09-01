import { Truck, Sparkles, Boxes, Wrench, ShoppingBag, PawPrint, Trees, Hammer, HelpCircle } from 'lucide-react';

export const CATEGORIES = [
  { value: 'delivery', label: 'Delivery & pickup', icon: Truck },
  { value: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { value: 'moving', label: 'Moving & hauling', icon: Boxes },
  { value: 'repairs', label: 'Repairs', icon: Wrench },
  { value: 'errands', label: 'Errands', icon: ShoppingBag },
  { value: 'petcare', label: 'Pet care', icon: PawPrint },
  { value: 'yardwork', label: 'Yard work', icon: Trees },
  { value: 'assembly', label: 'Assembly', icon: Hammer },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const formatRupees = (amount) =>
  `\u20b9${Number(amount).toLocaleString('en-IN')}`;
