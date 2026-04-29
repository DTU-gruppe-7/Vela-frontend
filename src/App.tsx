import { useEffect } from 'react';
import AppRouter from './navigation/AppRouter';
import AuthBootstrap from './components/AuthBootstrap';

function App() {
    return (
        <>
            <AuthBootstrap />
            <AppRouter />
        </>
    );
    const hydrate = useAuthStore((s) => s.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return <AppRouter />;
}

export default App
