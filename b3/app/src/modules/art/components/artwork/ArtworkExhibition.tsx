import { artworks, editionManifesto, interludes } from "@/modules/art/data/artworks";
import { ArtworkChapter } from "@/modules/art/components/artwork/ArtworkChapter";
import { EditionIntro } from "@/modules/art/components/artwork/EditionIntro";
import { StoryInterlude } from "@/modules/art/components/artwork/StoryInterlude";

export function ArtworkExhibition() {
  const [first, second] = artworks;

  return (
    <section id="artworks" className="relative border-t hairline">
      <EditionIntro manifesto={editionManifesto} />
      <StoryInterlude kicker={interludes[0].kicker} body={interludes[0].body} />
      {first && <ArtworkChapter art={first} />}
      <StoryInterlude kicker={interludes[1].kicker} body={interludes[1].body} />
      {second && <ArtworkChapter art={second} reverse />}
      <StoryInterlude kicker={interludes[2].kicker} body={interludes[2].body} />
    </section>
  );
}
