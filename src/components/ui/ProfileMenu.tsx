import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({ onClose }: ProfileMenuProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleProfile = () => {
    navigate('/profile');
    onClose();
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
      <>
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-100"
          >
           <FaUser className="text-lg" />
            <span className="font-medium text-sm">Min profil</span>
          </button>

          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-medium text-sm">Log ud</span>
          </button>
        </div>
      </>
  );
}