export interface User {
    _id: string;
    name: string;
    email: string;
    isProfileCompleted: boolean;
    avatar?: string;
}

export interface GoogleLoginResponse {
    token: string;
    user: User;
}