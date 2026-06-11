import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stripePremium = process.env.STRIPE_PRICE_PREMIUM ?? "price_premium_dev";
  const stripeFamily = process.env.STRIPE_PRICE_FAMILY ?? "price_family_dev";
  const stripeTourist = process.env.STRIPE_PRICE_TOURIST ?? "price_tourist_dev";

  const plans = [
    {
      code: "FREE",
      name: "Free Plan",
      description: "Basic Austrian guidance for newcomers",
      priceMonthly: 0,
      aiMessagesLimit: 30,
      documentLimit: 3,
      bccGrantPerMonth: null,
      bccRenewalPrice: null,
      features: ["basic_guidance", "basic_translation", "nearby_services", "basic_checklists"],
    },
    {
      code: "PREMIUM",
      name: "Premium Plan",
      description: "Unlimited AI and document analysis",
      priceMonthly: 999,
      priceYearly: 9990,
      aiMessagesLimit: null,
      documentLimit: null,
      stripePriceId: stripePremium,
      bccGrantPerMonth: 100,
      bccGrantOnSignup: 10,
      bccRenewalPrice: 100,
      features: [
        "unlimited_ai",
        "document_analysis",
        "letter_explanation",
        "reply_drafts",
        "benefit_guidance",
        "housing_support",
        "appointment_reminders",
        "profile_memory",
        "priority_support",
      ],
    },
    {
      code: "FAMILY",
      name: "Family Plan",
      description: "Support for the whole family",
      priceMonthly: 1499,
      priceYearly: 14990,
      aiMessagesLimit: null,
      documentLimit: null,
      stripePriceId: stripeFamily,
      bccGrantPerMonth: 150,
      bccRenewalPrice: 150,
      features: ["all_premium", "family_members", "child_benefits", "school_guidance", "document_vault"],
    },
    {
      code: "NGO_PARTNER",
      name: "NGO / Partner Plan",
      description: "For support organizations",
      priceMonthly: 0,
      aiMessagesLimit: null,
      documentLimit: null,
      features: ["partner_dashboard", "case_overview", "analytics", "custom_onboarding"],
    },
    {
      code: "TOURIST",
      name: "Tourist / Long-Stay Plan",
      description: "For stays of 1–12 months",
      priceMonthly: 499,
      priceYearly: 4990,
      aiMessagesLimit: 100,
      documentLimit: 10,
      stripePriceId: stripeTourist,
      bccGrantPerMonth: 50,
      bccRenewalPrice: 50,
      features: ["visa_overview", "transport", "insurance", "city_guides", "german_basics"],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  const categories = [
    { slug: "government", name: "Government", icon: "landmark", sortOrder: 1 },
    { slug: "ams", name: "AMS", icon: "briefcase", sortOrder: 2 },
    { slug: "healthcare", name: "Healthcare", icon: "heart-pulse", sortOrder: 3 },
    { slug: "social", name: "Social Services", icon: "hand-heart", sortOrder: 4 },
    { slug: "education", name: "Education", icon: "graduation-cap", sortOrder: 5 },
    { slug: "legal", name: "Legal Aid", icon: "scale", sortOrder: 6 },
    { slug: "embassy", name: "Embassies", icon: "globe", sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const govCat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "government" } });
  const amsCat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "ams" } });
  const healthCat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "healthcare" } });
  const socialCat = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: "social" } });

  const offices = [
    {
      categoryId: govCat.id,
      name: "MA 35 – Einwanderung und Staatsbürgerschaft",
      description: "Immigration and citizenship office for Vienna. Handles residence permits, extensions, and registration matters.",
      address: "Magistratsstraße 5",
      city: "Wien",
      postalCode: "1082",
      latitude: 48.2102,
      longitude: 16.3441,
      phone: "+43 1 4000 35600",
      website: "https://www.wien.gv.at/amtswege/einwanderung/",
      openingHours: { mon: "8:00–15:00", tue: "8:00–15:00", wed: "8:00–15:00", thu: "8:00–15:00", fri: "8:00–12:00" },
      languages: ["de", "en"],
    },
    {
      categoryId: amsCat.id,
      name: "AMS Wien",
      description: "Public employment service. Job search, unemployment benefits, and career counseling.",
      address: "Guglgasse 7-9",
      city: "Wien",
      postalCode: "1030",
      latitude: 48.1867,
      longitude: 16.4201,
      phone: "+43 1 50175 0",
      website: "https://www.ams.at",
      openingHours: { mon: "8:00–16:00", tue: "8:00–16:00", wed: "8:00–16:00", thu: "8:00–16:00", fri: "8:00–12:00" },
      languages: ["de", "en", "tr", "ar"],
    },
    {
      categoryId: healthCat.id,
      name: "ÖGK Wien – Customer Service",
      description: "Austrian health insurance. e-card, doctor registration, and insurance questions.",
      address: "Wienerbergstraße 15-19",
      city: "Wien",
      postalCode: "1100",
      latitude: 48.1689,
      longitude: 16.3736,
      phone: "+43 5 0777 0",
      website: "https://www.oegk.at",
      openingHours: { mon: "7:30–15:30", tue: "7:30–15:30", wed: "7:30–15:30", thu: "7:30–15:30", fri: "7:30–12:00" },
      languages: ["de", "en"],
    },
  ];

  for (const office of offices) {
    const existing = await prisma.governmentOffice.findFirst({
      where: { name: office.name },
    });
    if (!existing) {
      await prisma.governmentOffice.create({ data: office });
    }
  }

  const ngos = [
    {
      categoryId: socialCat.id,
      name: "Caritas Wien – Beratungsstelle",
      description: "Social counseling, food support, and integration help for people in need.",
      address: "Lazarettgasse 36",
      city: "Wien",
      postalCode: "1090",
      latitude: 48.2215,
      longitude: 16.3567,
      phone: "+43 1 51552 0",
      website: "https://www.caritas-wien.at",
      languages: ["de", "en", "ar", "fa", "uk"],
    },
    {
      categoryId: socialCat.id,
      name: "Diakonie Österreich",
      description: "Social services, refugee support, and community integration programs.",
      address: "Rotensterngasse 12",
      city: "Wien",
      postalCode: "1020",
      latitude: 48.2167,
      longitude: 16.3833,
      phone: "+43 1 512 26 26",
      website: "https://www.diakonie.at",
      languages: ["de", "en", "uk", "ar"],
    },
    {
      categoryId: socialCat.id,
      name: "Volkshilfe Wien",
      description: "Counseling for migrants, debt advice, and social support services.",
      address: "Laxenburger Straße 43",
      city: "Wien",
      postalCode: "1100",
      latitude: 48.1756,
      longitude: 16.3711,
      phone: "+43 1 606 66 0",
      website: "https://www.volkshilfe-wien.at",
      languages: ["de", "en", "tr", "ar", "uk"],
    },
  ];

  for (const ngo of ngos) {
    const existing = await prisma.nGO.findFirst({ where: { name: ngo.name } });
    if (!existing) {
      await prisma.nGO.create({ data: ngo });
    }
  }

  const adminEmail = "admin@buildingculture.org";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "Admin",
      role: Role.ADMIN,
      profile: {
        create: {
          preferredLang: "en",
          onboardingDone: true,
        },
      },
    },
  });

  console.log("Seed complete:", { adminId: admin.id, plans: plans.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
