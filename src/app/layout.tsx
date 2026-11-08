import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";
import { PizzeriaProvider } from "../context/PizzeriaContext"; 
import { GeneralProvider } from "../context/GeneralContext";
import { CartProvider } from "../context/CartContext";
import { OrderProvider } from "../context/OrderContext";
import FooterSection from '../components/FooterSection';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pizzeria WebApp",
  description: "Gestione e ordinazioni pizzeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ backgroundColor: '#0f172a', color: '#fff', margin: 0 }}>
        
        <AuthProvider>
          <PizzeriaProvider>
            <GeneralProvider>
              <OrderProvider>
                <CartProvider>
                    <Navbar/>
                    {children}
                    <FooterSection />
                </CartProvider>
              </OrderProvider>
            </GeneralProvider>
          </PizzeriaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}