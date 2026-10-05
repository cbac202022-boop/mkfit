import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

/** null quand aucune clé n'est configurée : le site passe alors en « mode démo ». */
export const stripe = key ? new Stripe(key) : null;
