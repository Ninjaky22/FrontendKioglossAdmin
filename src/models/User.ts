export interface AccountSummaryDTO {
    id: number;
    pointsPerPurchase: number;
    isActive: boolean;
    address?: any;
}

export interface UserDashboardDTO {
    id: number;
    email: string;
    name: string;
    phoneNumber?: string;
    profileImage?: string;
    isActive: boolean;
    isStaff: boolean;
    isSuperuser: boolean;
    account?: AccountSummaryDTO;
    totalOrders: number;
    totalFavorites: number;
}

export interface PaginaUser {
    content: UserDashboardDTO[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface UserDetailDTO extends UserDashboardDTO {
    recentOrders?: any[];
}
