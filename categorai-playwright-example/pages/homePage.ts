import {expect, Page, selectors} from '@playwright/test'

export  class HomePage {

    static selectors = {
        heroTitle: '[data-testid="hero-title"]',
        pricing: '[data-testid="pricing-nav-link"]',
    }

    constructor(protected page: Page) {
        this.verify();
    }

    async verify(){
        await expect(this.page.locator(HomePage.selectors.heroTitle)).toHaveText("Discover the Best AI Tools");
    }
}