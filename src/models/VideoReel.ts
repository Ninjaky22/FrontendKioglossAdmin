export interface VideoReel {
    id: number;
    videoUrl: string;
    thumbnailUrl: string;
    username: string;
    productId: number;
    productTitle: string;
    productPrice: string;
    productImage: string;
    createdAt: string;
}

export interface CreateVideoRequest {
    videoUrl: string;
    thumbnailUrl: string;
    username: string;
    productId: number;
}

export interface UpdateVideoRequest {
    videoUrl?: string;
    thumbnailUrl?: string;
    username?: string;
    productId?: number;
}
