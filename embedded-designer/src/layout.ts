import { autoinject } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { UIApplication, UIConstants, UIEvent } from "aurelia-ui-framework";

@autoinject()
export class Layout {
    router: Router;
    constants = UIConstants;

    configureRouter(config: RouterConfiguration, router: Router) {
        this.router = router;
        config.options.pushState = true;
        config.options.hashChange = true;
        config.options.root = '/';
        config.title = UIConstants.Title;
        config.mapUnknownRoutes('home');
        config.map([
            {
                route: ['', 'home'], moduleId: 'app', nav: false, auth: false, name: 'home'
            }
        ]);
    }
}