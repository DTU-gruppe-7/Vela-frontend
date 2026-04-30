export interface AuthUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string | null;
    dateOfBirth?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: AuthUser;
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}
