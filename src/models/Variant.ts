export interface VariantOptionDTO {
    id: number;
    value: string;
    metaValue?: string;
}

export interface VariantTypeDTO {
    id: number;
    name: string;
    type: string; // 'button', 'color', etc.
    options: VariantOptionDTO[];
}

export interface VariantOptionCreateRequest {
    value: string;
    metaValue?: string;
}

export interface VariantTypeCreateRequest {
    name: string;
    type: string;
    options: VariantOptionCreateRequest[];
}
