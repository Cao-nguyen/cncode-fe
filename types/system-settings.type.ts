// types/system-settings.type.ts
export interface IHistoryItem {
    field: string;
    oldValue: string;
    newValue: string;
    updatedBy: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updatedAt: string;
}

export interface ISystemSettings {
    _id: string;
    chinhSachBaoHanh: string;
    huongDanThanhToan: string;
    quyTrinhSuDung: string;
    gioiThieu: string;
    anToanBaoMat: string;
    dieuKhoanSuDung: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updatedBy?: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updateHistory: IHistoryItem[];
}

export interface IPublicContent {
    title: string;
    content: string;
    slug: string;
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}