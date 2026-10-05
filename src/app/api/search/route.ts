import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [{ name: { contains: q } }, { brand: { contains: q } }, { category: { name: { contains: q } } }],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      brand: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
    orderBy: { salesCount: "desc" },
    take: 6,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      brand: p.brand,
      image: p.images[0]?.url ?? null,
    })),
  });
}
