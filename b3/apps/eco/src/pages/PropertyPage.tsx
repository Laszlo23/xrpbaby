import { Nav } from "@/components/Nav";
import { CommunityPledge } from "@/components/property/CommunityPledge";
import { FinalHook } from "@/components/FinalHook";
import { Footer } from "@/components/Footer";
import { LiquidityLoop } from "@/components/property/LiquidityLoop";
import { OwnershipModel } from "@/components/property/OwnershipModel";
import { PlaceSignals } from "@/components/property/PlaceSignals";
import { PropertyDeepDive } from "@/components/property/PropertyDeepDive";
import { PropertyFooterSwitcher } from "@/components/property/PropertyFooterSwitcher";
import { PropertyHero } from "@/components/property/PropertyHero";
import { PropertyTwoFutures } from "@/components/property/PropertyTwoFutures";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getPropertyBySlug } from "@/lib/properties";
import { Navigate, useParams } from "react-router-dom";

export default function PropertyPage() {
  const { slug } = useParams<{ slug: string }>();
  const property = slug ? getPropertyBySlug(slug) : undefined;

  useDocumentTitle(property ? `${property.headline} · Building Culture` : "Property · Building Culture");

  if (!slug || !property) {
    return <Navigate to="/land" replace />;
  }

  return (
    <main id="bc-final-immersive" data-theme="land" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav theme="land" storyHubHref="/land" joinHref="#join" />
      <PropertyHero property={property} />
      <PlaceSignals property={property} />
      <OwnershipModel property={property} />
      <LiquidityLoop property={property} />
      <PropertyTwoFutures property={property} />
      <PropertyDeepDive property={property} />
      <CommunityPledge property={property} />
      <FinalHook />
      <PropertyFooterSwitcher />
      <Footer />
    </main>
  );
}
