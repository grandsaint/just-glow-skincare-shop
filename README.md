# Just Glow Skincare Boutique

Build a fully functional, premium skincare ecommerce website for a beauty brand called **JUST GLOW**.

The website should have a luxurious, modern, clean and feminine aesthetic. The primary brand colours should be glossy emerald green and white, with subtle light-green gradients and soft shadows. The design should feel fresh, elegant, youthful and premium.

Use a combination of stylish standard typography and beautiful handwritten fonts for selected headings, decorative phrases and brand statements. Maintain excellent readability throughout.

IMPORTANT: This should be a fully functional ecommerce website, not just a static landing page. All buttons, navigation links, product selectors, cart functions and checkout options must work.

## 1. HEADER / NAVIGATION

Create a clean, sticky navigation bar containing:

- JUST GLOW logo (stylish typography).
- Home
- Shop
- Collections
- About Us
- Contact
- Shopping cart icon with a live item counter.

Include a mobile-friendly hamburger menu.

The header should have a white background with glossy green accents.

## 2. HERO SECTION – SLIDING BANNER

Create a beautiful full-width sliding hero banner with 3 different slides.

Each slide should contain:

- High-quality skincare product imagery.
- A bold headline.
- A short supporting description.
- A prominent "SHOP ALL" button.

All text content must be LEFT-ALIGNED.

Suggested slide headlines:

Slide 1:
"Your Skin, Your Glow."
Description: Discover skincare essentials designed to make your skin feel refreshed, nourished and radiant.
Button: SHOP ALL

Slide 2:
"Glow Beyond Expectations."
Description: Give your skincare routine the attention it deserves with Just Glow.
Button: EXPLORE PRODUCTS

Slide 3:
"Let Your Natural Radiance Shine."
Description: Discover your next skincare favourite.
Button: SHOP NOW

The slider should automatically transition, include navigation arrows and indicator dots, and have smooth animations.

All Shop All buttons should navigate to the complete product catalogue.

## 3. FEATURED PRODUCTS

Create an attractive featured products section with:

- Section heading: "Our Glow Favourites"
- Short introductory text.
- Beautiful product cards.
- Product image.
- Product name.
- Price in Nigerian Naira (₦).
- Short product description.
- Add to Cart button.
- Quantity selector with + and - controls.

Feature these products:

1. Just Glow Radiance Shield Cream – ₦8,000
2. Just Glow Miracle Oil – ₦5,000
3. Just Glow Triple Action Scar Removal – ₦10,000
4. Just Glow Extra Lightening Lotion – ₦10,000

Use attractive product imagery and consistent card designs.

## 4. LATEST PRODUCTS

Create a section with the heading "Latest Products" aligned to the LEFT.

On the same horizontal line, place "View More" aligned to the RIGHT. The View More link should open the complete shop catalogue.

Display exactly FOUR products initially.

Each product card should contain:

- Product image.
- Product name.
- Price.
- Quantity selector.
- Add to Cart button.

The cards should have consistent dimensions, rounded corners and subtle hover animations.

On desktop, display four products in one row. On mobile, use a responsive two-column grid.

## 5. BROWSE BY COLLECTION

Create a visually appealing section titled "Browse By Collection".

Display FIVE large collection image cards with beautiful skincare photography.

Use these collections:

1. Body Care
2. Face Care
3. Soaps & Scrubs
4. Oils & Serums
5. Skin Treatments

Each collection card should:

- Have a large background image.
- Display its collection name.
- Include a subtle overlay.
- Zoom out slightly on hover.
- Have a smooth transition effect.
- Navigate to its corresponding collection page when clicked.

Make the collection section visually engaging and premium.

## 6. COMPLETE SHOP / PRODUCT CATALOGUE

Create a dedicated Shop page containing all 11 products.

Organise the products into these categories:

BODY CARE

- Just Glow Extra Lightening Lotion – ₦10,000
- Just Glow Super Lightening Body Milk Lotion – ₦10,000

FACE CARE

- Just Glow Super Lightening Face Cream – ₦5,000
- Just Glow Radiance Shield Cream – ₦8,000

SOAPS & EXFOLIATION

- Just Glow Body Treat Soap – ₦8,000
- Just Glow Super Lightening Soap – ₦8,000
- Just Glow Extra Lightening Soap – ₦10,000
- Super Lightening Scrub – ₦8,000

OILS & SERUMS

- Just Glow Miracle Oil for Redness of Face & Glowing Skin – ₦5,000
- Just Glow Super Lightening Oil – ₦5,000

SKIN TREATMENTS

- Just Glow Triple Action Scar Removal – ₦10,000

Include:

- Category filters.
- Product search.
- Product sorting.
- Product images.
- Product descriptions.
- Prices in Naira.
- Quantity selectors.
- Add to Cart buttons.
- Product detail pages.

Every product should have its own individual product page with a larger image, product description, price, quantity selector and Add to Cart button.

Do not invent medical or guaranteed skin-treatment claims. Use neutral product descriptions until verified product information is provided.

## 7. SHOPPING CART FUNCTIONALITY

Implement a fully functional shopping cart.

Customers must be able to:

- Add products to their cart.
- Increase or decrease quantities.
- Remove products.
- See the individual product prices.
- See the subtotal.
- See the total order amount.
- Continue shopping.
- Proceed to checkout.

The cart should update dynamically without refreshing the page.

Persist cart items using local storage so customers do not lose their selections when navigating between pages.

## 8. CHECKOUT OPTIONS – WHATSAPP & ONLINE PAYMENT

This is a very important feature.

Provide TWO checkout options:

OPTION A: CHECKOUT THROUGH WHATSAPP

Create a prominent green button labelled:

"ORDER VIA WHATSAPP"

When clicked, automatically generate a WhatsApp message containing all selected products and their details.

The generated message should look like this:

Hello Just Glow! I'd like to place an order.

MY ORDER:

1. Just Glow Extra Lightening Lotion
   Quantity: 2
   Price: ₦10,000
   Subtotal: ₦20,000

2. Just Glow Miracle Oil
   Quantity: 1
   Price: ₦5,000
   Subtotal: ₦5,000

TOTAL: ₦25,000

Please confirm product availability and provide payment and delivery details.

The WhatsApp checkout must:

- Automatically include every selected product.
- Include individual quantities.
- Include individual prices.
- Calculate each product subtotal.
- Calculate the overall order total.
- Open WhatsApp directly with the message already populated.
- Work on mobile and desktop.

Use a configurable WhatsApp business phone number in international format without the + sign.

Set a placeholder for the WhatsApp number that can easily be changed in the website settings.

OPTION B: ONLINE PAYMENT

Implement a secure online payment checkout using Paystack.

Customers should be able to:

- Enter their full name.
- Enter their phone number.
- Enter their email address.
- Enter their delivery address.
- Review their order.
- Pay securely through Paystack.

Important technical requirements:

- Use Paystack's official integration.
- Use a secure server-side payment initialization and verification flow.
- Never expose secret API keys in frontend code.
- Verify successful transactions before confirming orders.
- Display successful and unsuccessful payment messages.
- Save completed orders to the database.

Use environment variables for Paystack API keys.

## 9. ABOUT US SECTION

Create a beautiful About Us section with an image and text.

Heading:
"A Little About Just Glow"

Suggested description:

"At Just Glow, we believe that skincare is more than just a routine. It's an opportunity to care for yourself, embrace your beauty and feel confident in your skin. We bring together a selection of skincare essentials to make your everyday beauty routine more enjoyable. Your glow deserves attention, and we're here to be part of your journey."

Include a handwritten decorative phrase:

"Glow beautifully. Feel confidently. Be you."

Add a "Discover More" button.

## 10. CONTACT US SECTION

Create an elegant contact section containing:

- WhatsApp contact button.
- Business email placeholder.
- Instagram icon.
- Facebook icon.
- TikTok icon.
- Phone contact placeholder.

All social media icons should link to configurable social media URLs.

Include a short contact message:

"Have questions about our products or need help with your order? We'd love to hear from you!"

## 11. FOOTER

Create a premium footer containing:

- Just Glow logo.
- Short brand description.
- Quick navigation links.
- Shop categories.
- Contact information.
- Social media icons.
- Copyright notice.

Include a newsletter subscription form with an email input and Subscribe button.

## 12. DESIGN AND , EXPERIENCE

The overall design must follow these principles:

COLOUR PALETTE:

- Primary brand colour: Vibrant Orange (#F44C1D).

Secondary orange: Deep Orange (#E9431B).

Light accent: Soft Peach (#FFF0E9).

Background: Pure White (#FFFFFF).

Text: Deep Charcoal (#252525).

Secondary text: Warm Grey (#777777).

TYPOGRAPHY:

- Use a clean modern sans-serif font for body text.
- Use an elegant handwritten font for selected headings and decorative statements.
- Use bold typography for product names and prices.

VISUAL STYLE:

- Premium skincare ecommerce aesthetic.
- Large, high-quality product photography.
- Rounded product cards.
- Soft shadows.
- Smooth hover effects.
- Elegant transitions.
- Plenty of white space.
- Consistent spacing.
- Beautiful responsive layouts.

RESPONSIVENESS:
The website must work perfectly on:

- Desktop computers.
- Tablets.
- Android phones.
- iPhones.

## 13. ADMINISTRATIVE FUNCTIONALITY

Create a basic admin dashboard where the website owner can:

- Add new products.
- Edit product information.
- Delete products.
- Upload product images.
- Change prices.
- Manage product categories.
- View customer orders.
- Track order status.
- Update WhatsApp number.
- Update social media links.

Use Supabase for database and product/order management.

## 14. FINAL REQUIREMENTS

1. Build a complete multi-page ecommerce website.
2. Ensure all 11 products are added.
3. Ensure all prices are displayed in Nigerian Naira.
4. Make every Add to Cart button functional.
5. Make all quantity selectors functional.
6. Ensure WhatsApp checkout dynamically generates the correct order message.
7. Integrate Paystack securely.
8. Make all navigation and collection links functional.
9. Ensure the website is mobile-responsive.
10. Use attractive skincare imagery rather than generic placeholder graphics.
11. Avoid dead buttons and non-functional links.
12. Make the homepage visually impressive, polished and ready for real customers.

The final result should feel like a professionally designed skincare brand website, not a generic ecommerce template.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e9214658-763c-47ad-8f9f-44c24cafc92b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
