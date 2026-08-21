import "./globals.css";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Dandicraft | Arts & Crafts Kits | Lakewood, NJ",
  description: "Craft Moments. Create Memories. Experience the Magic of Dandicraft. Premium paint-by-numbers, washable paint kits, custom canvas, stuff-a-bear kits, custom photo pillows, and candle art.",
  metadataBase: new URL("https://dandicraft.com"),
  openGraph: {
    title: "Dandicraft | Arts & Crafts Kits",
    description: "Premium paint-by-numbers, washable paint kits, stuff-a-bear kits, custom photo pillows, and candle art.",
    url: "https://dandicraft.com",
    siteName: "Dandicraft",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "calc(100vh - 250px)" }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
