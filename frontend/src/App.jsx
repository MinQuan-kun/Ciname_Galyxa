import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <div className="bg-gray-950 min-h-screen font-sans">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Sau này sẽ thêm route chi tiết phim và đặt vé ở đây */}
      </Routes>
    </div>
  );
}

export default App;