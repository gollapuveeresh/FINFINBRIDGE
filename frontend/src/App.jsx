import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  const location = useLocation();

  return <AppRoutes key={location.pathname} />;
}

export default App;