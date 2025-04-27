/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

const quotes = [
  'In the face of darkness, let your light shine brighter than ever.',
  "True strength lies not in physical might, but in the purity of one's heart.",
  'The greatest battles are fought not with swords, but with love and compassion.',
  'The truest hero is not one who defeats others, but one who conquers their own fears.',
  'Have faith in the impossible, for miracles happen when you believe.',
  'Choose love over hatred, and you shall triumph over any adversary.',
  'Strength lies not in the absence of fear, but in the ability to face it head-on.',
  'In the darkest of times, a single act of kindness can illuminate the whole world.',
  "True wealth is found not in possessions, but in the richness of one's character.",
  'The strongest armor is built not of steel, but of empathy and understanding.',
  'When you believe in yourself, the whole universe conspires to help you succeed.',
  'In the face of despair, let hope be the flame that guides you forward.',
  'The power of love can transform even the fiercest of beasts into gentle creatures.',
  'Never underestimate the impact of a single act of kindness.',
  'In unity lies true strength, for together we can achieve the impossible.',
  'Courage is not the absence of fear, but the willingness to confront it.',
]

export default function QuotesPage() {
  return (
    <main className="flex-1 px-4 md:px-6 py-12 md:py-16">
      {/* Header */}
      <h1 className="text-2xl font-medium mb-6">Quotes</h1>

      {/* Quotes */}
      <div className="grid gap-y-8 pt-6">
        {quotes.map((entry, idx) => (
          <article key={idx} className="py-4">
            <div className="space-y-2">
              <p className="text-muted-foreground leading-relaxed">
                &quot;{entry}&quot;
              </p>
              <p className="text-muted-foreground leading-relaxed italic">
                — Geōrgius Magnus
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
