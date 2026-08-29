import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Library from "./pages/Library.jsx";
import Search from "./pages/Search.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/libreria" element={<Library />} />
          <Route path="/cerca" element={<Search />} />
          <Route path="/libro/:id" element={<BookDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
