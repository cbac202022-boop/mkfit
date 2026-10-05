import { TextField } from "@/components/ui/form";

export type AddressValues = {
  fullName?: string;
  line1?: string;
  line2?: string | null;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string | null;
};

/** Champs d'adresse réutilisés par le carnet d'adresses et le checkout. */
export function AddressFields({
  values = {},
  errors = {},
  prefix = "",
}: {
  values?: AddressValues;
  errors?: Record<string, string>;
  prefix?: string; // ex. "address." pour les erreurs imbriquées du checkout
}) {
  const err = (name: string) => errors[`${prefix}${name}`];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Nom complet"
        name="fullName"
        autoComplete="name"
        defaultValue={values.fullName}
        error={err("fullName")}
        required
      />
      <TextField
        className="sm:col-span-2"
        label="Adresse"
        name="line1"
        autoComplete="address-line1"
        defaultValue={values.line1}
        error={err("line1")}
        required
      />
      <TextField
        className="sm:col-span-2"
        label="Complément d'adresse (facultatif)"
        name="line2"
        autoComplete="address-line2"
        defaultValue={values.line2 ?? ""}
        error={err("line2")}
      />
      <TextField
        label="Code postal"
        name="postalCode"
        autoComplete="postal-code"
        inputMode="numeric"
        defaultValue={values.postalCode}
        error={err("postalCode")}
        required
      />
      <TextField label="Ville" name="city" autoComplete="address-level2" defaultValue={values.city} error={err("city")} required />
      <TextField
        label="Pays"
        name="country"
        autoComplete="country-name"
        defaultValue={values.country ?? "France"}
        error={err("country")}
        required
      />
      <TextField
        label="Téléphone (facultatif)"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={values.phone ?? ""}
        error={err("phone")}
      />
    </div>
  );
}
