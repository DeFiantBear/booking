# Farcaster Mini App Setup Guide

## What's Been Created

✅ **Farcaster Mini App SDK** - Installed and integrated  
✅ **Mini App Wrapper** - Handles splash screen and app readiness  
✅ **Embed Image** - 3:2 ratio SVG for feed embeds  
✅ **Manifest File** - `/.well-known/farcaster.json` with all required properties  
✅ **Next.js Config** - Proper headers for manifest discovery  

## Required PNG Images

The manifest requires PNG images (no alpha channel). You need to convert these SVG files to PNG:

### 1. Icon (1024x1024)
- **Source**: `public/icon.svg`
- **Required**: `public/icon-1024.png` (1024x1024, PNG, no alpha)
- **Use**: App icon in Mini App stores

### 2. Splash Image (200x200)
- **Source**: `public/splash.svg`
- **Required**: `public/splash-200.png` (200x200, PNG)
- **Use**: Loading screen when app launches

### 3. Hero Image (1200x630)
- **Source**: `public/hero.svg`
- **Required**: `public/hero-1200x630.png` (1200x630, PNG)
- **Use**: Promotional display in Mini App stores

## How to Convert SVG to PNG

### Option 1: Online Converters
- [Convertio](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [Online-Convert](https://image.online-convert.com/convert-to-png)

### Option 2: Design Tools
- **Figma**: Import SVG, export as PNG
- **Adobe Illustrator**: Open SVG, export as PNG
- **Sketch**: Import SVG, export as PNG

### Option 3: Command Line (if you have ImageMagick)
```bash
# Install ImageMagick first, then:
magick icon.svg icon-1024.png
magick splash.svg splash-200.png
magick hero.svg hero-1200x630.png
```

## Update Manifest After PNG Conversion

Once you have the PNG files, update the manifest URLs:

```json
{
  "miniapp": {
    "iconUrl": "https://booking.secondcitystudio.xyz/icon-1024.png",
    "splashImageUrl": "https://booking.secondcitystudio.xyz/splash-200.png",
    "heroImageUrl": "https://booking.secondcitystudio.xyz/hero-1200x630.png"
  }
}
```

## Testing Your Mini App

1. **Deploy** your changes
2. **Test manifest**: Visit `https://booking.secondcitystudio.xyz/.well-known/farcaster.json`
3. **Share URL** in Farcaster to test embed
4. **Verify** the embed appears correctly in feeds

## Next Steps

- [ ] Convert SVG files to PNG
- [ ] Update manifest with PNG URLs
- [ ] Deploy and test
- [ ] Consider adding Farcaster authentication
- [ ] Add sharing features for bookings

## Resources

- [Farcaster Mini App Documentation](https://miniapps.farcaster.xyz/)
- [Publishing Guide](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
