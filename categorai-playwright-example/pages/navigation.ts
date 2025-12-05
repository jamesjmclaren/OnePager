// components/Navigation.ts
import { Page } from '@playwright/test';
import { Pricing } from './pricingPage';
import { HomePage } from './homePage';

export class Navigation {
    static selectors = {
        pricing: '[data-testid="pricing-nav-link"]',
        home: '[data-testid="home-nav-link"]',
        about: '[data-testid="about-nav-link"]'
    }

    constructor(private page: Page) {}

    async goToPricing() {
        await this.page.click(Navigation.selectors.pricing);
        return new Pricing(this.page);
    }

    async goToHome() {
        await this.page.click(Navigation.selectors.home);
        return new HomePage(this.page);
    }
}