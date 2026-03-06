import { useEffect } from 'react'
import AppRouter from './navigation/AppRouter';
import { useAuthStore } from './stores/authStore';


function App() {
    const hydrate = useAuthStore((s) => s.hydrate);

    // Gendan session fra localStorage ved app-start
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return <AppRouter />;
}

export default App
