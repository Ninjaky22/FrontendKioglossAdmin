import type { VariantOptionDTO } from './Variant';

export interface SizeDTO {
    id: number;
    name: string;
}

export interface ColorDTO {
    id: number;
    name: string;
    hexCode?: string;
}

export interface TagDTO {
    id: number;
    name: string;
    imageURL?: string;
}

export interface ImageDTO {
    id: number;
    url: string;
}

export interface ProductVariantDTO {
    id: number;
    options: VariantOptionDTO[];
    stock: number;
    sku: string;
    imageUrl?: string;
}

export interface Product {
    id: number;
    title: string;
    price: string;
    description: string;
    slug: string;
    stock: number;
    status: 'draft' | 'published';
    published: string;
    tags: TagDTO[];
    images: ImageDTO[];
    attributes?: Record<string, string>;
    variants?: ProductVariantDTO[];
}

export interface ProductDetailDTO extends Product {}

export interface PaginaProduct {
    content: Product[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ProductVariantRequestDTO {
    id?: number;
    optionIds?: number[];
    stock: number;
    sku: string;
    imageUrl?: string;
}

export interface CreateProductRequest {
    title: string;
    price: number;
    description: string;
    slug: string;
    status: 'draft' | 'published';
    stock?: number;
    tagIds: number[];
    attributes?: Record<string, string>;
    variants?: ProductVariantRequestDTO[];
}

export interface UpdateProductRequest {
    title?: string;
    price?: number;
    description?: string;
    slug?: string;
    status?: 'draft' | 'published';
    stock?: number;
    tagIds?: number[];
    attributes?: Record<string, string>;
    variants?: ProductVariantRequestDTO[];
}

export interface UploadImageRequest {
    productId: number;
    imageBase64: string;
}