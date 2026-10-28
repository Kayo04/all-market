import {
    Baby, Bike, BookOpen, Briefcase, Building2, Car, CarFront, Hammer, Heart, Monitor,
    Palette, PartyPopper, PawPrint, PenTool, Plane, Scissors, Shirt, Smartphone, Sofa,
    Sparkles, Tag, Trees, Truck, Wrench, type LucideIcon,
} from 'lucide-react';
import { getCategoryByKey } from '@/lib/categories';

// Lucide components for the icon names used in categories.ts. Kept here (not in
// categories.ts) so server code that only needs the taxonomy doesn't pull in icons.
const ICONS: Record<string, LucideIcon> = {
    Baby, Bike, BookOpen, Briefcase, Building2, Car, CarFront, Hammer, Heart, Monitor,
    Palette, PartyPopper, PawPrint, PenTool, Plane, Scissors, Shirt, Smartphone, Sofa,
    Sparkles, Trees, Truck, Wrench,
};

export function categoryIcon(categoryKey: string): LucideIcon {
    const name = getCategoryByKey(categoryKey)?.icon;
    return (name && ICONS[name]) || Tag;
}
