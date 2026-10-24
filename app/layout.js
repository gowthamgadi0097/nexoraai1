import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "NEXORA AI | Fully AI-automated car safety",
  description: "17 AI features for next-generation cars: prediction, protection and automation on the road.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer className="foot">NEXORA AI • Open Innovation Hackathon Project</footer>
      </body>
    </html>
  );
}
