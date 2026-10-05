import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container py-10">
      <h1 className="heading-lg mb-8">Mon panier</h1>
      <CartView />
    </div>
  );
}
