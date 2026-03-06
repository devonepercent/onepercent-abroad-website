

# Update Social Share Thumbnail

Currently, the OG image points to `https://lovable.dev/opengraph-image-p98pqg.png` (a Lovable placeholder). We need to replace it with OnePercent Abroad's own branding.

## Changes

**`index.html`** — Update the 3 meta image tags:
- `og:image`
- `twitter:image`
- Also update `og:title`, `og:description`, and `twitter:site` if needed to match branding

**Options for the image:**
1. Use the existing logo (`/src/assets/logo-blue.png`) — but OG images should ideally be 1200×630px
2. Create/upload a proper OG image to `/public/og-image.png` and reference it with the full URL `https://onepercentabroad.com/og-image.png`

Since a proper 1200×630 OG image would look best, I'll use the blue logo asset as the image for now and set the meta tags to point to it. You can later replace `/public/og-image.png` with a designed 1200×630 graphic.

## Summary of edits

- Copy or reference the logo as `/public/og-image.png`
- Update `index.html` meta tags to use `https://onepercentabroad.com/og-image.png`
- Update `og:title` and `og:description` to match current branding text

