import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import NotFoundContent from "./(shop)/not-found";

// URL inconnues : rendu hors du groupe (shop), on rajoute donc l'en-tête et le pied de page.
export default function RootNotFound() {
  return (
    <>
      <Header />
      <main id="contenu" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
