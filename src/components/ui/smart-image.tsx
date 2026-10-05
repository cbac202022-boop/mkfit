import Image, { type ImageProps } from "next/image";

const OPTIMIZED_HOSTS = ["images.unsplash.com", "placehold.co"];

/**
 * next/image n'optimise que les domaines déclarés dans next.config.ts.
 * Les URL saisies dans l'admin peuvent venir d'ailleurs : on les affiche alors sans optimisation.
 */
export function SmartImage({ src, alt, ...props }: ImageProps & { src: string }) {
  let unoptimized = true;
  try {
    unoptimized = !OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    unoptimized = !src.startsWith("/");
  }
  return <Image src={src} alt={alt} unoptimized={unoptimized} {...props} />;
}
