import { expect, Page } from "@playwright/test";
import { HomePage } from "./homePage";
import { PricingModelDialogue } from "./pricingModel";

export class Pricing {

    static selectors = {
        heroTitle: 'pricing-hero-title',
        freeListing: '',
        categoryListing: 'pricing-card-featured',
        categoryListingButton: 'pricing-cta-featured',
        homePageListing: ''

    }

    constructor(private page: Page) {}
    
    async verify(){
         await expect(this.page.getByTestId(Pricing.selectors.heroTitle)).toHaveText("Flexible Pricing for Your Visibility Needs");
    }

    async selectCategoryPricing(){
        await this.page.getByTestId(Pricing.selectors.categoryListing).isVisible({timeout: 5000});
        await this.page.getByTestId(Pricing.selectors.categoryListingButton).click();
        return new PricingModelDialogue(this.page);
    }
}