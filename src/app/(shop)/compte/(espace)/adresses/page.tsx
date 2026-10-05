import { AddressManager } from "@/components/account/address-manager";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  const user = await requireUser("/compte/adresses");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <section aria-labelledby="addresses-title">
      <h2 id="addresses-title" className="heading-md mb-6">
        Mes adresses
      </h2>
      <AddressManager addresses={addresses} />
    </section>
  );
}
