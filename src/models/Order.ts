export interface CustomerBasicDTO {
    userId: number;
    name: string;
    email: string;
    profileImage: string;
}

export interface OrderItemDTO {
    id: number;
    quantity: number;
    variantDetails: string;
    price: number;
    product: {
        id: number;
        title: string;
        slug: string;
        firstImage: string;
    };
}

export interface OrderSummaryDTO {
    id: number;
    amount: number;
    date: string;
    status: string;
    itemCount: number;
    customer: CustomerBasicDTO;
}

export interface OrderDetailDTO {
    id: number;
    amount: number;
    date: string;
    status: string;
    customer: CustomerBasicDTO;
    items: OrderItemDTO[];
}

export interface PaginaOrder {
    content: OrderSummaryDTO[];
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
