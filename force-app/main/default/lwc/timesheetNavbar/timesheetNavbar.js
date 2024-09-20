import { LightningElement, track, wire } from 'lwc';
import getLoggedInUserName from '@salesforce/apex/LogController.getLoggedInUserName';
import USER_ID from '@salesforce/user/Id';
import basePath from "@salesforce/community/basePath";
import checkManager from '@salesforce/apex/LogController.checkManager';
import { NavigationMixin } from "lightning/navigation";
import checkManagerOrSuperManager from '@salesforce/apex/LogController.checkManagerOrSuperManager';

export default class TimesheetNavbar extends NavigationMixin(LightningElement) {



    @track loggedInUserName;
    @track isManager = false;
    @track isManagerOrSuperManager = false;
    @track isDropdownVisible = false;

    @track isHomePage = false;
    @track isAdminPage = false;
    @track isAnalyticsPage = false;

    @wire(getLoggedInUserName, { userId: USER_ID })
    wiredLoggedInUser({ error, data }) {
        if (data) {
            this.loggedInUserName = data.Name;
        } else if (error) {
            console.error('Error Fetching LoggedIn User Name', error);
        }
    }

    updateActivePage(pageName) {
        this.isHomePage = pageName === 'home';
        this.isAdminPage = pageName === 'admin';
        this.isAnalyticsPage = pageName === 'analytics';
    }

    checkManager() {
        checkManager({ userId: USER_ID })
            .then(result => {
                this.isManager = result;
                console.log('Is manager? : ', result);
            }).catch(error => {
                console.error(error);
            })
    }

    checkManagerOrSuperManager() {
        checkManagerOrSuperManager({ userId: USER_ID })
            .then(result => {
                this.isManagerOrSuperManager = result;
                //console.log('Is Super manager? : ', result);
            }).catch(error => {
                console.error(error);
            })
    }

    connectedCallback() {
        this.checkManager();
        this.checkManagerOrSuperManager();
        this.updateActivePage(this.getCurrentPageName());
    }

    getCurrentPageName() {
        // You'll need to implement this method to determine the current page
        // This could be done by checking the current URL or using a navigation service
        // For example:
        const path = window.location.pathname;
        if (path.includes('member-log-overview')) return 'admin';
        if (path.includes('analytics')) return 'analytics';
        return 'home';
    }



    navigatetoadminpage(event) {
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/member-log-overview'
            }
        });
        this.updateActivePage('admin');
    }

    navigatetoanalyticspage(event) {
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/analytics'
            }
        });
        this.updateActivePage('analytics');
    }

    navigatetohomepage(event) {
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/'
            }
        });
        this.updateActivePage('home');
    }

  

    get logoutLink() {
        const sitePrefix = basePath.replace("/", "");
        const siteUrl = 'https://elastikteams7.my.site.com/Logmyhours';
        return `${siteUrl}/${sitePrefix}vforcesite/secur/logout.jsp`;
    }

    toggleDropdown() {
        this.isDropdownVisible = !this.isDropdownVisible; //boolean logic for visibility
    }
}