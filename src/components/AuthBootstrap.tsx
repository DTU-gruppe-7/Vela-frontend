import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function AuthBootstrap() {
    const hydrate = useAuthStore((state) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return null;
}