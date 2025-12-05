import { expect, Page } from "@playwright/test";
import { HomePage } from "./homePage";

export class PricingModelDialogue {

    static selectors = {
       formId: 'pricing-modal-dialog',
        form: {
            companyName: 'input-company-name',
            email: 'input-contact-email',
            name: 'input-contact-name',
            websiteUrl: 'input-website',
            toolCategory: 'select-current-category',
            goals: 'textarea-message'
        }

    }

    constructor(private page: Page) {}
    
    async verify(){
         await expect(this.page.getByTestId(PricingModelDialogue.selectors.formId)).toBeVisible({timeout: 3000});
    }

    async submitForm() {

    }
}