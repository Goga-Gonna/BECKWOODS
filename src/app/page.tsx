import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { FeaturedDrop } from "@/components/home/FeaturedDrop";
import { Categories } from "@/components/home/Categories";
import { Community } from "@/components/home/Community";
import { getFeatured } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeatured(4);
  return (
    <>
      <Hero />
      <Manifesto />
      <FeaturedDrop products={featured} />
      <Categories />
      <Community />
    </>
  );
}
