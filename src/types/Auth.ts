export interface AuthResponse {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    dateOfBirth?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    dateOfBirth?: string;
}