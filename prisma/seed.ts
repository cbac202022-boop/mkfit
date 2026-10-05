import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Générateur pseudo-aléatoire déterministe : le seed produit toujours les mêmes données.
let state = 42;
function rand() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const IMG = {
  gymMan: img("1517836357463-d25dfeac3438"),
  gymRack: img("1534438327276-14e5300c3a48"),
  womanWorkout: img("1571019613454-1cb2f99b2d8b"),
  shoeRed: img("1542291026-7eec264c27ff"),
  shoeNeon: img("1606107557195-0e29a4b5b4aa"),
  shoeWhite: img("1608231387042-66d1773070a5"),
  shoePastel: img("1595950653106-6c9ebd614d3a"),
  shoeGreyOrange: img("1600185365483-26d7a4cc7519"),
  shoeCamel: img("1549298916-b41d501d3772"),
  shoeStreet: img("1460353581641-37baddab0fa2"),
  shoeKnit: img("1491553895911-0055eca6402d"),
  shoesOnFeet: img("1556906781-9a412961c28c"),
  teeWhite: img("1521572163474-6864f9cf17ab"),
  teeBlack: img("1583743814966-8936f5b7be1a"),
  teeGraphic: img("1576566588028-4147f3842f27"),
  hoodieGrey: img("1556821840-3a63f95609a7"),
  sweatWhite: img("1620799140408-edc6dcb6d633"),
  bomber: img("1591047139829-d91aecb6caea"),
  jogger: img("1506629082955-511b1aa562c8"),
  braGym: img("1594381898411-846e7d193883"),
  womanBack: img("1574680096145-d05b474e2155"),
  hexDumbbells: img("1638536532686-d610adfc8e5c"),
  dumbbellsBand: img("1584735935682-2f2b69dff9d2"),
  battleRope: img("1599058917212-d750089bc07e"),
  gymDark: img("1593079831268-3381b0db4a77"),
  barbell: img("1517963879433-6ad2b056d712"),
  dumbbellRack: img("1576678927484-cc907957088c"),
  proteinScoop: img("1593095948071-474c5cc2989d"),
  shakerKitchen: img("1579722820308-d74e571900a9"),
  proteinBars: img("1622484212850-eb596d769edc"),
  runnerSunset: img("1594882645126-14020914d58d"),
  bottle: img("1602143407151-7111542de6e8"),
  backpackNavy: img("1553062407-98eeb64c6a62"),
  backpackTrek: img("1622260614153-03223fb72052"),
  yogaMats: img("1601925260368-ae2f83cf8b7f"),
  yogaMatDark: img("1592432678016-e910b452f9a2"),
  cardio: img("1598289431512-b97b0917affc"),
  yogaSunset: img("1544367567-0f2fcb009e0b"),
  womenMats: img("1518611012118-696072aa579a"),
  womanBarbell: img("1541534741688-6078c6bfb5c5"),
  womanPlank: img("1599447421416-3414500d18a5"),
  womanBra: img("1434682881908-b43d0467b798"),
  watch: img("1523275335684-37898b6baf30"),
  tracker: img("1575311373937-040b8e1fd5b6"),
  kettlebell: img("1556817411-31ae72fa3ea0"),
  shoeLace: img("1483721310020-03333e577078"),
  track: img("1461896836934-ffe607ba8211"),
  runningLegs: img("1476480862126-209bfaa8edc8"),
  runnersNight: img("1552674605-db6ffd4facb5"),
};

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOES = ["39", "40", "41", "42", "43", "44", "45"];
const ONE = ["Unique"];

type Color = { name: string; hex: string };
const C = {
  noir: { name: "Noir", hex: "#0a0a0a" },
  blanc: { name: "Blanc", hex: "#ffffff" },
  gris: { name: "Gris chiné", hex: "#9ca3af" },
  neon: { name: "Vert néon", hex: "#c6ff00" },
  rouge: { name: "Rouge", hex: "#dc2626" },
  bleu: { name: "Bleu acier", hex: "#4b6584" },
  terracotta: { name: "Terracotta", hex: "#c2714f" },
  camel: { name: "Camel", hex: "#b7834b" },
  pastel: { name: "Pastel", hex: "#e9d5ff" },
  sauge: { name: "Vert sauge", hex: "#86a789" },
  marine: { name: "Bleu marine", hex: "#1e293b" },
  vertForet: { name: "Vert forêt", hex: "#2f5d50" },
  bordeaux: { name: "Bordeaux", hex: "#7f1d1d" },
  chocolat: { name: "Chocolat", hex: "#5c3a21" },
  vanille: { name: "Vanille", hex: "#f3e5ab" },
  fraise: { name: "Fraise", hex: "#f472b6" },
  citron: { name: "Citron", hex: "#fde047" },
  nature: { name: "Nature", hex: "#f5f5f4" },
} satisfies Record<string, Color>;

type SeedProduct = {
  name: string;
  category: string;
  brand: string;
  price: number; // euros
  compareAt?: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: Color[];
  featured?: boolean;
  sizeLabel?: string;
  colorLabel?: string;
  daysAgo: number; // ancienneté, pour « nouveautés »
};

const categories = [
  {
    name: "Vêtements",
    slug: "vetements",
    description: "T-shirts techniques, sweats, leggings et shorts pensés pour la performance.",
    image: IMG.braGym,
  },
  {
    name: "Chaussures",
    slug: "chaussures",
    description: "Running, training, trail : la paire adaptée à chaque séance.",
    image: IMG.shoesOnFeet,
  },
  {
    name: "Accessoires",
    slug: "accessoires",
    description: "Sacs, gourdes, montres connectées et tapis pour aller plus loin.",
    image: IMG.yogaMats,
  },
  {
    name: "Musculation",
    slug: "musculation",
    description: "Haltères, barres, kettlebells : équipez votre home gym.",
    image: IMG.dumbbellRack,
  },
  {
    name: "Nutrition",
    slug: "nutrition",
    description: "Protéines, créatine et snacks pour soutenir vos objectifs.",
    image: IMG.proteinScoop,
  },
];

const products: SeedProduct[] = [
  // ——— Vêtements ———
  {
    name: "T-shirt Training Dry-Fit",
    category: "vetements",
    brand: "MKFit",
    price: 29.9,
    description:
      "Tissu technique ultra-léger qui évacue la transpiration et sèche en quelques minutes. Coupe athlétique, coutures plates anti-frottements. Idéal pour la salle comme pour le running.",
    images: [IMG.teeWhite, IMG.gymMan],
    sizes: APPAREL,
    colors: [C.blanc, C.noir],
    featured: true,
    daysAgo: 5,
  },
  {
    name: "T-shirt Oversize Core",
    category: "vetements",
    brand: "MKFit",
    price: 34.9,
    description:
      "Coton bio épais 220 g/m², coupe oversize et épaules tombantes. Le basique à porter avant, pendant et après l'entraînement.",
    images: [IMG.teeBlack, IMG.gymRack],
    sizes: APPAREL,
    colors: [C.noir, C.blanc, C.gris],
    daysAgo: 12,
  },
  {
    name: "T-shirt Graphic Original",
    category: "vetements",
    brand: "Urban Athletics",
    price: 32,
    description:
      "T-shirt en coton peigné avec impression rétro. Col côtelé qui garde sa forme lavage après lavage.",
    images: [IMG.teeGraphic],
    sizes: APPAREL,
    colors: [C.blanc],
    daysAgo: 60,
  },
  {
    name: "Sweat à capuche Heavy",
    category: "vetements",
    brand: "MKFit",
    price: 64.9,
    compareAt: 79.9,
    description:
      "Molleton gratté 380 g/m² pour un maximum de chaleur. Capuche doublée, poche kangourou et bords côtelés. Parfait pour l'échauffement ou la récupération.",
    images: [IMG.hoodieGrey, IMG.runnersNight],
    sizes: APPAREL,
    colors: [C.gris, C.noir],
    featured: true,
    daysAgo: 30,
  },
  {
    name: "Sweat col rond Essential",
    category: "vetements",
    brand: "Nordline",
    price: 54.9,
    description:
      "Sweat doux et respirant en coton et polyester recyclé. Une coupe nette qui se porte aussi bien à la salle qu'en ville.",
    images: [IMG.sweatWhite],
    sizes: APPAREL,
    colors: [C.blanc, C.sauge],
    daysAgo: 3,
  },
  {
    name: "Bomber Training Wind",
    category: "vetements",
    brand: "Urban Athletics",
    price: 89,
    description:
      "Veste coupe-vent déperlante, légère et compressible. Poches zippées et doublure en mesh pour une ventilation optimale.",
    images: [IMG.bomber],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.terracotta, C.noir],
    daysAgo: 8,
  },
  {
    name: "Brassière Performance",
    category: "vetements",
    brand: "Velocity",
    price: 39.9,
    description:
      "Maintien fort pour les activités à impact élevé. Bretelles croisées dans le dos, coussinets amovibles et tissu à séchage rapide.",
    images: [IMG.braGym, IMG.womanBra],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.noir, C.bordeaux],
    featured: true,
    daysAgo: 15,
  },
  {
    name: "Legging Sculpt Taille Haute",
    category: "vetements",
    brand: "Velocity",
    price: 49.9,
    description:
      "Legging opaque squat-proof avec ceinture haute gainante et poche latérale pour smartphone. Tissu 4 directions pour une liberté totale de mouvement.",
    images: [IMG.womanBack, IMG.womanBarbell, IMG.womanPlank],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.noir, C.marine],
    featured: true,
    daysAgo: 2,
  },
  {
    name: "Short Running 2-en-1",
    category: "vetements",
    brand: "Stride",
    price: 34.9,
    description:
      "Short léger avec cuissard intégré anti-frottements, poche arrière zippée et détails réfléchissants pour courir en sécurité.",
    images: [IMG.runningLegs, IMG.track],
    sizes: APPAREL,
    colors: [C.noir, C.bleu],
    daysAgo: 20,
  },
  {
    name: "Jogger Tech",
    category: "vetements",
    brand: "Nordline",
    price: 59.9,
    description:
      "Pantalon de jogging en tissu stretch déperlant, chevilles resserrées et poches zippées. Confort et style au quotidien.",
    images: [IMG.jogger],
    sizes: APPAREL,
    colors: [C.bleu, C.noir],
    daysAgo: 45,
  },

  // ——— Chaussures ———
  {
    name: "Runner Flash",
    category: "chaussures",
    brand: "Stride",
    price: 129.9,
    description:
      "Chaussure de running polyvalente avec mousse réactive et mesh respirant. Drop 8 mm, pour vos sorties quotidiennes jusqu'au semi-marathon.",
    images: [IMG.shoeRed, IMG.shoeLace],
    sizes: SHOES,
    colors: [C.rouge],
    featured: true,
    daysAgo: 10,
  },
  {
    name: "Volt Racer",
    category: "chaussures",
    brand: "Stride",
    price: 149.9,
    description:
      "Chaussure de compétition ultra-légère (210 g) avec plaque de propulsion. Conçue pour battre vos records sur 10 km et marathon.",
    images: [IMG.shoeNeon, IMG.runnersNight],
    sizes: SHOES,
    colors: [C.neon],
    featured: true,
    daysAgo: 1,
  },
  {
    name: "Court Classic",
    category: "chaussures",
    brand: "Nordline",
    price: 89.9,
    description:
      "Sneaker en cuir lisse au design épuré. Semelle cousue et intérieur rembourré pour un confort durable.",
    images: [IMG.shoeWhite],
    sizes: SHOES,
    colors: [C.blanc],
    daysAgo: 90,
  },
  {
    name: "Cloud Pastel",
    category: "chaussures",
    brand: "Velocity",
    price: 119.9,
    description:
      "Amorti maximal et tige en maille douce. La chaussure lifestyle qui suit vos journées actives.",
    images: [IMG.shoePastel],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: [C.pastel],
    daysAgo: 6,
  },
  {
    name: "Air Trainer",
    category: "chaussures",
    brand: "Stride",
    price: 139.9,
    compareAt: 159.9,
    description:
      "Unité d'amorti visible au talon, stabilité latérale renforcée. Idéale pour le cross-training et les cours collectifs.",
    images: [IMG.shoeGreyOrange],
    sizes: SHOES,
    colors: [C.gris],
    featured: true,
    daysAgo: 35,
  },
  {
    name: "Trail Explorer",
    category: "chaussures",
    brand: "Summit",
    price: 134.9,
    description:
      "Semelle à crampons de 5 mm, pare-pierre et tige déperlante. Accroche et protection sur tous les terrains.",
    images: [IMG.shoeCamel],
    sizes: SHOES,
    colors: [C.camel],
    daysAgo: 50,
  },
  {
    name: "Street Runner",
    category: "chaussures",
    brand: "Urban Athletics",
    price: 99.9,
    description:
      "Inspiration running des années 90, confort moderne. Semelle EVA légère et empiècements en suède.",
    images: [IMG.shoeStreet, IMG.shoesOnFeet],
    sizes: SHOES,
    colors: [C.blanc, C.gris],
    daysAgo: 25,
  },
  {
    name: "Training Knit",
    category: "chaussures",
    brand: "MKFit",
    price: 109.9,
    description:
      "Tige en tricot sans couture, semelle plate et stable pour les mouvements de musculation et de HIIT.",
    images: [IMG.shoeKnit],
    sizes: SHOES,
    colors: [C.gris, C.noir],
    daysAgo: 4,
  },

  // ——— Accessoires ———
  {
    name: "Gourde isotherme 750 ml",
    category: "accessoires",
    brand: "MKFit",
    price: 24.9,
    description:
      "Acier inoxydable double paroi : 24 h au frais, 12 h au chaud. Sans BPA, bouchon étanche.",
    images: [IMG.bottle],
    sizes: ONE,
    colors: [C.sauge, C.noir],
    daysAgo: 14,
  },
  {
    name: "Sac à dos Urban 25 L",
    category: "accessoires",
    brand: "Nordline",
    price: 69.9,
    description:
      "Compartiment ordinateur 15\", poche chaussures ventilée et tissu déperlant. Du bureau à la salle sans changer de sac.",
    images: [IMG.backpackNavy],
    sizes: ONE,
    colors: [C.marine, C.noir],
    featured: true,
    daysAgo: 40,
  },
  {
    name: "Sac à dos Trek 40 L",
    category: "accessoires",
    brand: "Summit",
    price: 99.9,
    description:
      "Dos ventilé, ceinture lombaire rembourrée et housse de pluie intégrée. Pour la randonnée et les longs week-ends.",
    images: [IMG.backpackTrek],
    sizes: ONE,
    colors: [C.vertForet],
    daysAgo: 70,
  },
  {
    name: "Tapis de yoga Grip 6 mm",
    category: "accessoires",
    brand: "Velocity",
    price: 39.9,
    description:
      "Surface antidérapante sur les deux faces, 6 mm d'épaisseur pour protéger les articulations. Sangle de transport incluse.",
    images: [IMG.yogaMats, IMG.yogaMatDark, IMG.yogaSunset],
    sizes: ONE,
    colors: [C.sauge, C.noir],
    daysAgo: 18,
  },
  {
    name: "Montre GPS Pulse",
    category: "accessoires",
    brand: "Pulse Tech",
    price: 199.9,
    compareAt: 249,
    description:
      "GPS multi-bandes, cardio au poignet, 20 jours d'autonomie et plus de 30 modes sportifs. Étanche 50 m.",
    images: [IMG.watch],
    sizes: ONE,
    colors: [C.blanc, C.noir],
    featured: true,
    daysAgo: 9,
  },
  {
    name: "Bracelet connecté Fit Band",
    category: "accessoires",
    brand: "Pulse Tech",
    price: 49.9,
    description:
      "Suivi des pas, du sommeil et de la fréquence cardiaque. Écran AMOLED et 14 jours d'autonomie.",
    images: [IMG.tracker],
    sizes: ONE,
    colors: [C.noir],
    daysAgo: 55,
  },
  {
    name: "Kit élastiques de résistance",
    category: "accessoires",
    brand: "MKFit",
    price: 29.9,
    description:
      "5 bandes de résistance (de 5 à 25 kg), poignées, sangle de porte et pochette. Entraînez-vous partout.",
    images: [IMG.dumbbellsBand, IMG.womenMats],
    sizes: ONE,
    colors: [C.noir],
    daysAgo: 7,
  },

  // ——— Musculation ———
  {
    name: "Haltères hexagonaux 2 × 10 kg",
    category: "musculation",
    brand: "IronCore",
    price: 59.9,
    description:
      "Paire d'haltères en fonte gainée de caoutchouc. La forme hexagonale évite qu'ils roulent et protège le sol.",
    images: [IMG.hexDumbbells, IMG.gymRack],
    sizes: ONE,
    colors: [C.noir],
    featured: true,
    daysAgo: 22,
  },
  {
    name: "Set haltères réglables 2 × 20 kg",
    category: "musculation",
    brand: "IronCore",
    price: 149.9,
    description:
      "Deux barres courtes, disques de 1,25 à 5 kg et colliers de serrage. Faites évoluer la charge selon vos progrès.",
    images: [IMG.dumbbellRack],
    sizes: ONE,
    colors: [C.noir],
    daysAgo: 65,
  },
  {
    name: "Corde ondulatoire 12 m",
    category: "musculation",
    brand: "IronCore",
    price: 79.9,
    description:
      "Corde de 38 mm de diamètre en polyester tressé, poignées thermorétractables. Cardio et renforcement explosif.",
    images: [IMG.battleRope],
    sizes: ONE,
    colors: [C.noir],
    daysAgo: 80,
  },
  {
    name: "Barre olympique 20 kg",
    category: "musculation",
    brand: "IronCore",
    price: 219,
    description:
      "Barre de 2,20 m homologuée, manchons sur roulements, moletage moyen. Charge maximale : 680 kg.",
    images: [IMG.barbell, IMG.gymDark],
    sizes: ONE,
    colors: [C.noir],
    daysAgo: 100,
  },
  {
    name: "Kettlebell fonte",
    category: "musculation",
    brand: "IronCore",
    price: 54.9,
    description:
      "Kettlebell monobloc en fonte avec poignée large et texturée. Swings, snatchs et goblet squats en toute sécurité.",
    images: [IMG.kettlebell],
    sizes: ["8 kg", "12 kg", "16 kg", "20 kg"],
    sizeLabel: "Poids",
    colors: [C.noir],
    daysAgo: 28,
  },
  {
    name: "Ceinture de force cuir",
    category: "musculation",
    brand: "IronCore",
    price: 44.9,
    description:
      "Cuir épais de 10 mm, boucle à ardillon double. Stabilise le tronc sur les squats et soulevés de terre lourds.",
    images: [IMG.gymMan],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.noir],
    daysAgo: 75,
  },
  {
    name: "Gants d'entraînement Grip",
    category: "musculation",
    brand: "MKFit",
    price: 19.9,
    description:
      "Paume renforcée en silicone, dos respirant et fermeture velcro. Protège les mains sans perdre la sensation de la barre.",
    images: [IMG.womanBarbell],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.noir],
    daysAgo: 33,
  },

  // ——— Nutrition ———
  {
    name: "Whey Isolate",
    category: "nutrition",
    brand: "MKFit Nutrition",
    price: 39.9,
    description:
      "Isolat de lactosérum à 90 % de protéines, faible en lactose et en sucres. 25 g de protéines par dose, se mélange en quelques secondes.",
    images: [IMG.proteinScoop, IMG.shakerKitchen],
    sizes: ["1 kg"],
    colors: [C.chocolat, C.vanille, C.fraise],
    sizeLabel: "Contenance",
    colorLabel: "Saveur",
    featured: true,
    daysAgo: 11,
  },
  {
    name: "Barres protéinées × 12",
    category: "nutrition",
    brand: "MKFit Nutrition",
    price: 29.9,
    description:
      "20 g de protéines par barre, faible en sucres, enrobage chocolat croquant. La collation idéale après l'effort.",
    images: [IMG.proteinBars],
    sizes: ["Boîte de 12"],
    colors: [C.chocolat],
    sizeLabel: "Format",
    colorLabel: "Saveur",
    daysAgo: 3,
  },
  {
    name: "Créatine monohydrate 500 g",
    category: "nutrition",
    brand: "MKFit Nutrition",
    price: 24.9,
    description:
      "Créatine pure micronisée, sans additif. 3 g par jour pour soutenir la force et la puissance lors des efforts intenses.",
    images: [IMG.shakerKitchen],
    sizes: ["500 g"],
    colors: [C.nature],
    sizeLabel: "Contenance",
    colorLabel: "Saveur",
    daysAgo: 48,
  },
  {
    name: "BCAA Récupération",
    category: "nutrition",
    brand: "MKFit Nutrition",
    price: 27.9,
    description:
      "Acides aminés ramifiés au ratio 2:1:1 avec électrolytes. Se boit pendant ou après la séance.",
    images: [IMG.runnerSunset],
    sizes: ["400 g"],
    colors: [C.citron, C.fraise],
    sizeLabel: "Contenance",
    colorLabel: "Saveur",
    daysAgo: 58,
  },
  {
    name: "Shaker Pro 700 ml",
    category: "nutrition",
    brand: "MKFit",
    price: 12.9,
    description:
      "Shaker étanche avec grille de mélange, compartiment à poudre vissable et graduations. Passe au lave-vaisselle.",
    images: [IMG.womanWorkout],
    sizes: ONE,
    colors: [C.noir, C.neon],
    daysAgo: 16,
  },
];

const reviewTemplates = [
  { rating: 5, title: "Excellent produit", comment: "Qualité au top, je recommande sans hésiter. Livraison rapide en plus." },
  { rating: 5, title: "Parfait", comment: "Exactement ce que je cherchais. Les finitions sont impeccables." },
  { rating: 4, title: "Très bon rapport qualité/prix", comment: "Très satisfait dans l'ensemble, petit bémol sur la taille qui taille un peu juste." },
  { rating: 4, title: "Bon achat", comment: "Confortable et solide après plusieurs semaines d'utilisation intensive." },
  { rating: 3, title: "Correct", comment: "Fait le travail, mais je m'attendais à un peu mieux pour ce prix." },
  { rating: 5, title: "Je rachèterai", comment: "Deuxième achat de ce produit, toujours aussi satisfait." },
  { rating: 2, title: "Déçu", comment: "La couleur ne correspond pas tout à fait aux photos." },
];

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🧹 Nettoyage de la base…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  console.log("👤 Utilisateurs…");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mkfit.fr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  await prisma.user.create({
    data: {
      name: "Admin MKFit",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const customerHash = await bcrypt.hash("Client123!", 10);
  const customerNames = ["Camille Martin", "Lucas Bernard", "Inès Petit", "Hugo Robert", "Léa Durand"];
  const customers = [];
  for (const [i, name] of customerNames.entries()) {
    customers.push(
      await prisma.user.create({
        data: {
          name,
          email: i === 0 ? "client@mkfit.fr" : `${slugify(name)}@example.com`,
          passwordHash: customerHash,
          addresses:
            i === 0
              ? {
                  create: {
                    fullName: name,
                    line1: "12 rue du Stade",
                    postalCode: "75015",
                    city: "Paris",
                    phone: "0601020304",
                    isDefault: true,
                  },
                }
              : undefined,
        },
      }),
    );
  }

  console.log("🗂  Catégories…");
  const categoryIds: Record<string, string> = {};
  for (const [position, cat] of categories.entries()) {
    const created = await prisma.category.create({ data: { ...cat, position } });
    categoryIds[cat.slug] = created.id;
  }

  console.log(`👟 ${products.length} produits…`);
  for (const p of products) {
    const slug = slugify(p.name);
    const createdAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000);
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: Math.round(p.price * 100),
        compareAtPrice: p.compareAt ? Math.round(p.compareAt * 100) : null,
        brand: p.brand,
        categoryId: categoryIds[p.category],
        featured: p.featured ?? false,
        salesCount: randInt(0, 400),
        sizeLabel: p.sizeLabel ?? "Taille",
        colorLabel: p.colorLabel ?? "Couleur",
        createdAt,
        images: {
          create: p.images.map((url, position) => ({
            url,
            alt: position === 0 ? p.name : `${p.name} – vue ${position + 1}`,
            position,
          })),
        },
        variants: {
          create: p.colors.flatMap((color) =>
            p.sizes.map((size) => ({
              sku: `${slug}-${slugify(color.name)}-${slugify(size)}`.toUpperCase(),
              size,
              color: color.name,
              colorHex: color.hex,
              // ~10 % des variantes en rupture pour illustrer la gestion de stock
              stock: rand() < 0.1 ? 0 : randInt(2, 40),
            })),
          ),
        },
      },
    });

    // Avis clients
    const reviewCount = randInt(0, 4);
    const shuffled = [...customers].sort(() => rand() - 0.5).slice(0, reviewCount);
    for (const customer of shuffled) {
      const t = reviewTemplates[randInt(0, reviewTemplates.length - 1)];
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: customer.id,
          rating: t.rating,
          title: t.title,
          comment: t.comment,
          createdAt: new Date(createdAt.getTime() + randInt(1, 20) * 3600 * 1000),
        },
      });
    }
  }

  console.log("🏷  Codes promo…");
  await prisma.promoCode.createMany({
    data: [
      { code: "BIENVENUE10", type: "PERCENT", value: 10 },
      { code: "MKFIT20", type: "PERCENT", value: 20, minSubtotal: 10000 },
      { code: "LIVRAISON5", type: "FIXED", value: 500, minSubtotal: 3000 },
    ],
  });

  console.log("✅ Seed terminé.");
  console.log(`   Admin  : ${adminEmail} / ${adminPassword}`);
  console.log("   Client : client@mkfit.fr / Client123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
