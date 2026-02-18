import { } from 'react'
import AppRouter from './navigation/AppRouter';
import MainLayout from './components/layout/MainLayout';


function App() {

  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
}

export default App
