import { LightningElement,wire ,track } from 'lwc';
import getMembers from '@salesforce/apex/ProfileController.getMembers';
import getnextMembers from '@salesforce/apex/ProfileController.getnextMembers';
export default class StackCards extends LightningElement {

    flag= false;
    isWeekend = false;

    d = new Date();
    day = this.d.getDay(); //4 

    currentDate = new Date().toDateString();
    profiles;
    profiles1;
    @track nextDates = [];

    @wire(getMembers)
    wiredMembers({ error, data }) { 
        if (data) {
            this.profiles = data;
            if(this.day == 4){
              this.flag = true;

            }

            if(this.day == 0 || this.day == 6){
              this.isWeekend = true;

            }


            console.log(data);
            console.log("success");
        } else if (error) {
            console.error('Error fetching profile data:', error);
        }
    }
   
    // ...

@wire(getnextMembers)
wirednextMembers({ error, data }) {
    if (data) {
        this.profiles1 = data;

        // Check if both profiles1 and nextDates arrays are available
        if (this.profiles1 && this.nextDates && this.nextDates.length > 0) {
            // Map nextDates array to profiles1 array
            this.profiles1 = this.profiles1.map((profile, index) => ({
                ...profile,
                nextDate: this.nextDates[index]
            }));
        }

        console.log(this.profiles1);
    } else if (error) {
        console.error('Error fetching profile data:', error);
    }
}
// ...

    calculateNextDates() {
      let count = 0;
      let nextDate = new Date(this.currentDate);
      while (count < 4) {
          nextDate.setDate(nextDate.getDate() + 1);

          // Skip Sunday, Saturday, and Thursday
          if (
              nextDate.getDay() !== 0 && // Sunday
              nextDate.getDay() !== 6 && // Saturday
              nextDate.getDay() !== 4  && // Thursday
              !(nextDate.getMonth() === 11 && nextDate.getDate() === 25) && // 25th December
              !(nextDate.getMonth() === 0 && nextDate.getDate() === 26) && // 26th January
              !(nextDate.getMonth() === 2 && nextDate.getDate() === 25) && // 25th March
              !(nextDate.getMonth() === 4 && nextDate.getDate() === 1) && // 1st May
              !(nextDate.getMonth() === 7 && nextDate.getDate() === 15) && // 15th August
              !(nextDate.getMonth() === 9 && nextDate.getDate() === 2) && // 2nd October
              !(nextDate.getMonth() === 9 && nextDate.getDate() === 31) && // 31st October
              !(nextDate.getMonth() === 0 && nextDate.getDate() === 1)
                // Thursday
          ) {
              this.nextDates.push(nextDate.toDateString());
              count++;
          }
      }
  }
 

  connectedCallback() {
    this.rotateCards();
    this.calculateNextDates() ;
    console.log(this.nextDates) ;
   
    window.addEventListener("scroll", () => {
      this.handleScroll();
      
    });
  }

  rotateCards() {
    let cards = this.template.querySelectorAll(".card");
    let angle = 0;
    cards.forEach((card) => {
      if (card.classList.contains("active")) {
        card.style.transform = `translate(-50%, -120vh) rotate(-48deg)`;
      } else {
        card.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        angle = angle - 10;
      }
    });
  }

  handleScroll() {
    let cards = this.template.querySelectorAll(".card");
    let stackArea = this.template.querySelector(".stack-area");
    let proportion = stackArea.getBoundingClientRect().top / window.innerHeight;
    if (proportion <= 0) {
      let n = cards.length;
      let index = Math.ceil((proportion * n) / 2);
      index = Math.abs(index) - 1;
      for (let i = 0; i < n; i++) {
        if (i <= index) {
          cards[i].classList.add("active");
        } else {
          cards[i].classList.remove("active");
        }
      }
      this.rotateCards();
    }
  }
}