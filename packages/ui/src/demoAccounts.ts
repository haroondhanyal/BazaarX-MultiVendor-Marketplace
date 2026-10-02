export type DemoRole = "admin" | "seller" | "buyer";

export interface DemoAccount {
  role: DemoRole;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
}

// These public credentials are only for this local demo app.
export const demoAccounts: Record<DemoRole, DemoAccount[]> = {
  admin: [
    { role: "admin", name: "Amina Rahman", email: "admin1@bazaarx.demo", password: "Admin@BazaarX1!", phone: "+92 300 1000001", city: "Karachi", country: "Pakistan" },
    { role: "admin", name: "Hamza Siddiqui", email: "admin2@bazaarx.demo", password: "Admin@BazaarX2!", phone: "+92 300 1000002", city: "Lahore", country: "Pakistan" },
  ],
  seller: [
    { role: "seller", name: "Sana Malik", email: "seller1@bazaarx.demo", password: "Seller@BazaarX1!", phone: "+92 300 2000001", city: "Karachi", country: "Pakistan" },
    { role: "seller", name: "Bilal Ahmed", email: "seller2@bazaarx.demo", password: "Seller@BazaarX2!", phone: "+92 300 2000002", city: "Lahore", country: "Pakistan" },
    { role: "seller", name: "Hira Noor", email: "seller3@bazaarx.demo", password: "Seller@BazaarX3!", phone: "+92 300 2000003", city: "Islamabad", country: "Pakistan" },
    { role: "seller", name: "Omar Farooq", email: "seller4@bazaarx.demo", password: "Seller@BazaarX4!", phone: "+92 300 2000004", city: "Peshawar", country: "Pakistan" },
    { role: "seller", name: "Zoya Iqbal", email: "seller5@bazaarx.demo", password: "Seller@BazaarX5!", phone: "+92 300 2000005", city: "Multan", country: "Pakistan" },
  ],
  buyer: [
    { role: "buyer", name: "Ayesha Khan", email: "buyer1@bazaarx.demo", password: "Buyer@BazaarX1!", phone: "+92 300 3000001", city: "Karachi", country: "Pakistan" },
    { role: "buyer", name: "Usman Tariq", email: "buyer2@bazaarx.demo", password: "Buyer@BazaarX2!", phone: "+92 300 3000002", city: "Lahore", country: "Pakistan" },
    { role: "buyer", name: "Maham Ali", email: "buyer3@bazaarx.demo", password: "Buyer@BazaarX3!", phone: "+92 300 3000003", city: "Islamabad", country: "Pakistan" },
    { role: "buyer", name: "Daniyal Shah", email: "buyer4@bazaarx.demo", password: "Buyer@BazaarX4!", phone: "+92 300 3000004", city: "Faisalabad", country: "Pakistan" },
    { role: "buyer", name: "Eman Raza", email: "buyer5@bazaarx.demo", password: "Buyer@BazaarX5!", phone: "+92 300 3000005", city: "Rawalpindi", country: "Pakistan" },
  ],
};

function customAccounts(role: DemoRole): DemoAccount[] {
  try {
    return JSON.parse(localStorage.getItem(`bx-demo-accounts-${role}`) ?? "[]") as DemoAccount[];
  } catch {
    return [];
  }
}

export function registerDemoAccount(
  role: DemoRole,
  account: Omit<DemoAccount, "role">,
): boolean {
  const normalizedEmail = account.email.trim().toLowerCase();
  if ([...demoAccounts[role], ...customAccounts(role)].some((item) => item.email.toLowerCase() === normalizedEmail)) return false;
  try {
    const accounts = customAccounts(role);
    accounts.push({ ...account, email: normalizedEmail, role });
    localStorage.setItem(`bx-demo-accounts-${role}`, JSON.stringify(accounts));
    return true;
  } catch {
    return false;
  }
}

export function authenticateDemoAccount(
  role: DemoRole,
  email: string,
  password: string,
): DemoAccount | undefined {
  return [...demoAccounts[role], ...customAccounts(role)].find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
  );
}
