import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UserLayout({ children }) {
  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}