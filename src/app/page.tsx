import { Altimeter } from "@/components/site/Altimeter";
import { Details, Faq, Footer, Hero, Packages, Plan, ReadyToJump } from "@/components/site/Sections";
import { Showcase } from "@/components/site/Showcase";
import { SiteHeader } from "@/components/site/SiteClient";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Packages />
        <Showcase />
        <Plan />
        <Details />
        <Faq />
        <ReadyToJump />
      </main>
      <Footer />
      <Altimeter />
    </>
  );
}
