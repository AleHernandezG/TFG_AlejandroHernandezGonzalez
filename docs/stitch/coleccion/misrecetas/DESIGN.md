# Design System Strategy: The Culinary Editorial

## 1. Overview & Creative North Star

This design system is built upon the Creative North Star of **"The Digital Gourmet Editorial."** Unlike generic social platforms that prioritize rapid-fire consumption, this system is designed to mirror the tactile, warm experience of a high-end culinary magazine. It blends the communal urgency of BeReal with the refined aesthetic of a boutique cookbook.

The system breaks the "template" look by rejecting rigid, boxy grids in favor of **Intentional Asymmetry and Tonal Layering**. We move away from the "app-like" feel by using generous white space (Spacing Scale 8 and 10) and overlapping elements that feel organic and hand-curated. The goal is to make every recipe and community post feel like a featured story, not just a row in a database.

---

## 2. Colors & Surface Philosophy

The palette is anchored in warmth. We utilize Creamy Whites and Soft Ochres to stimulate the appetite and evoke the feeling of a sun-drenched kitchen.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example:
*   A section containing "Trending Recipes" should use `surface-container-low` (#f4f4f0) to sit softly against the `background` (#faf9f5).
*   Visual separation is achieved through depth and tone, never through "strokes."

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine papers. 
*   **Level 0 (Base):** `surface` (#faf9f5)
*   **Level 1 (Sections):** `surface-container-low` (#f4f4f0)
*   **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff)
By nesting a `lowest` (pure white) card inside a `low` (cream) section, we create a natural, soft lift that feels sophisticated and effortless.

### The "Glass & Gradient" Rule
Floating elements, such as the bottom navigation bar or top search overlays, should utilize **Glassmorphism**. Apply `surface` with 80% opacity and a `backdrop-blur` of 12px. This allows food photography colors to bleed through, ensuring the UI feels integrated with the content.

---

## 3. Typography: The Editorial Voice

We use **Plus Jakarta Sans** for its modern geometric clarity and high x-height, providing an approachable yet authoritative tone.

*   **Display & Headlines:** Use `display-md` or `headline-lg` for recipe titles. These must use "Generous Letter Spacing" (0.02em to 0.05em) to give the words room to breathe, mimicking premium print titles.
*   **Body:** `body-lg` is our workhorse. We prioritize legibility by keeping line-heights generous (1.6x) to ensure long-form cooking instructions are easy to follow in a busy kitchen.
*   **Labels:** Use `label-md` for metadata (e.g., "Keto", "15 mins"). These should be set in all caps with increased letter spacing to provide a "branded" feel to small details.

---

## 4. Elevation & Depth

We eschew traditional "drop shadows" for **Ambient Tonal Depth.**

*   **The Layering Principle:** Most depth is achieved via the Surface Hierarchy (Section 2). A card doesn't need a shadow if its background color contrast does the work.
*   **Ambient Shadows:** When a card requires a floating state (e.g., a "Trending" card), use a shadow tinted with `on-surface` (#1b1c1a). 
    *   *Values:* `0px 12px 32px rgba(27, 28, 26, 0.06)`. It should be almost imperceptible—a soft "glow" of darkness rather than a hard edge.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#d5c4b2) at 15% opacity. It should feel like a suggestion of an edge, not a container.

---

## 5. Components

### Cards (The Hero Component)
Cards use the `xl` (1.5rem / 24px) corner radius. Following the image wireframe, recipe cards should feature an asymmetrical layout: images that bleed to one edge, with text content hugged by `spacing-4` (1.4rem) internal padding. 
*   *Rule:* No divider lines between the image and the text. Use a subtle `surface-variant` color shift if separation is needed.

### Buttons & Chips
*   **Primary CTA:** Use `primary` (#855400) with `on-primary` (#ffffff) text. For a "Signature" feel, apply a subtle linear gradient from `primary` to `primary_container` (#e8a855) to add a gentle luster.
*   **Chips:** Use `full` (9999px) roundness. Active chips use `primary_fixed`, while inactive chips use `surface-container-high` without a border.

### Search & Inputs
Inspired by the wireframe’s pill-shaped search, use `full` roundness and a `surface-container-highest` background. Icons should be minimalist line style, using the `secondary` (#5f5e5e) token.

### Navigation (The Floating Dock)
The bottom navigation should be a floating "pod" rather than a full-width bar. Use `full` roundness, `surface-container-lowest` with Glassmorphism, and an Ambient Shadow to make it appear as if it’s hovering above the content.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. Try `spacing-5` on the left and `spacing-3` on the right for recipe titles to create a contemporary, editorial flow.
*   **Do** prioritize "white space as a separator." If you feel the need to add a line, add `spacing-6` of empty space instead.
*   **Do** use photography as a background element. Let the warm ochres of the UI complement the natural colors of the food.

### Don'ts
*   **Don't** use pure black (#000000). Always use `on-background` (#1b1c1a) for text to maintain the warm, "printed" feel.
*   **Don't** use the `DEFAULT` (0.5rem) corner radius for main containers. Stick to `xl` (1.5rem) to keep the "Welcoming" brand personality.
*   **Don't** use high-contrast borders. If the background and the card are too similar, use a Tonal Layer (e.g., moving from `surface` to `surface-container-low`) rather than a stroke.