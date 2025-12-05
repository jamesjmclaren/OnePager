import { test, expect } from '@playwright/test';
import { urls } from '../config/urls'
import { HomePage } from "../pages/homePage";
import { Pricing } from "../pages/pricingPage";
import { Navigation } from "../pages/navigation";

//Test we're on the right page
test('I can navigate to the price page', async ({ page }) => {
  await page.goto(urls.base);
  let home = new HomePage(page);
  home.verify();
  let navigation = new Navigation(page);
  let p: Pricing = await navigation.goToPricing();
  p.verify();
});

test ('I can submit a request for the Category Featured feature', async ({page}) => {
  await page.goto(urls.base);
  let home = new HomePage(page);
  home.verify();
  let navigation = new Navigation(page);
  let p: Pricing = await navigation.goToPricing();
  p.verify();
  let categoryPricing = await p.selectCategoryPricing();
  categoryPricing.verify();
})

