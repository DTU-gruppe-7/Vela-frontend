import LoginPage from '../auth/LoginPage';
import { Outlet } from 'react-router-dom'

export const LandingPage = () => {
    return (
        <div className="flex min-h-screen">
        {/* Venstre side med opskriftskarrusel */}
        <div className="flex w-1/2 items-center justify-center bg-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Opskriftskarrusel</h2>
                <p className="text-gray-500">Her kommer de roterende billeder til at ligge</p>
            </div>
        </div>
        
        {/* Højre side med Auth komponent */}
        <div className="flex w-1/2 items-center justify-center bg-white">
            <div className="w-full max-w-md p-8">
                <Outlet />
            </div>
        </div>
        </div>
    );
};