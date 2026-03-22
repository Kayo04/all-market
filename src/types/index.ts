// ─── User ───────────────────────────────────────────────
export type UserRole = 'client' | 'pro';

export interface GeoLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface Rating {
    userId: string;
    score: number; // 1-5
    comment: string;
    createdAt: Date;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    isVerified: boolean;
    location?: GeoLocation;
    avatar?: string;
    bio?: string;
    skills?: string[];
    ratings: Rating[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── Category ───────────────────────────────────────────
export interface SubCategory {
    key: string;
    labelEN: string;
    labelPT: string;
}

export interface Category {
    key: string;
    icon: string; // lucide icon name
    labelEN: string;
    labelPT: string;
    subcategories: SubCategory[];
    type: 'service' | 'product';
}

// ─── Request ────────────────────────────────────────────
export type RequestStatus = 'open' | 'in_progress' | 'closed';
export type ItemCondition = 'new' | 'used' | 'any';
export type RequestType = 'service' | 'product';

export interface IRequest {
    _id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    budget: number;
    location: GeoLocation;
    locationLabel?: string; // human-readable, e.g. "Lisbon, Portugal"
    status: RequestStatus;
    type: RequestType;
    userId: string;
    isFeatured: boolean;
    // Equipment-specific fields
    itemCondition?: ItemCondition;
    acceptsTrades?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Proposal ───────────────────────────────────────────
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface IProposal {
    _id: string;
    requestId: string;
    proId: string;
    message: string;
    price: number;
    status: ProposalStatus;
    createdAt: Date;
}

// ─── Proposal Draft (Templates) ─────────────────────────
export interface IProposalDraft {
    _id: string;
    proId: string;
    title: string; // e.g. "Standard Plumbing Quote"
    message: string;
    defaultPrice?: number;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Notification ───────────────────────────────────────
export type NotificationType = 'new_proposal' | 'proposal_accepted' | 'new_message' | 'system';

export interface INotification {
    _id: string;
    userId: string;
    type: NotificationType;
    content: string;
    readStatus: boolean;
    relatedId?: string; // requestId or proposalId
    createdAt: Date;
}

// ─── Dictionary / i18n ──────────────────────────────────
export type Locale = 'en' | 'pt';
