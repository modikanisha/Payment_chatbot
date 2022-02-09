const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TYPES: Symbol("types"),
  FRIES: Symbol("fries"),
  GARLIC_BREAD: Symbol("garlicbread"),
  DRINKS: Symbol("drinks"),
  BROWNIE: Symbol("brownie"),
  PAYMENT: Symbol("payment"),
});

module.exports = class Italiano extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sTypes = "";
    this.sFries = "";
    this.sGarlicBread = "";
    this.sBrownie = "";
    this.sDrinks = "";
    this.sItem = "Burger";
  }
  estimatedvalue() {
    var value = 0;
    var tax = 1.13;
    if (this.sItem) {
      if (this.sSize && this.sSize.toLowerCase() == "large") {
        value = value + 4;
      } else if (this.sSize && this.sSize.toLowerCase() == "medium") {
        value = value + 3;
      } else {
        value = value + 2;
      }
    }
    if (this.sFries) {
      value = value + 4;
    }
    if (this.sBrownie) {
      value = value + 7;
    }
    if (this.sGarlicBread) {
      value = value + 6;
    }
    if (this.sDrinks) {
      if (this.sDrinks.toLowerCase() == "lemon juice") {
        value = value + 2;
      } else if (this.sDrinks.toLowerCase() == "mango juice") {
        value = value + 3;
      } else if (this.sDrinks.toLowerCase() == "coke") {
        value = value + 3;
      } else if (this.sDrinks.toLowerCase() == "coffee") {
        value = value + 4;
      }
    }
    value = value * tax;
    return value;
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE;
        aReturn.push("Welcome to Kanisha's Italiano.");
        aReturn.push("What size of Burger would you like?");
        break;
      case OrderState.SIZE:
        if (
          (sInput && sInput.toLowerCase() == "medium") ||
          sInput.toLowerCase() == "large"
        ) {
          this.stateCur = OrderState.TYPES;
          this.sSize = sInput;
          aReturn.push(
            "What type of bun would you like - White or Whole Wheat?"
          );
        } else {
          aReturn.push(
            `Hey my dear client !! You have selected ${sInput} size bun which is not available. Please select Large or Medium.`
          );
        }
        break;
      case OrderState.TYPES:
        if (
          (sInput && sInput.toLowerCase() == "white") ||
          sInput.toLowerCase() == "whole wheat"
        ) {
          this.stateCur = OrderState.GARLIC_BREAD;
          this.sTypes = sInput;
          aReturn.push("Would you like to have garlic bread with that?");
        } else {
          aReturn.push(
            `Hey my dear client !! You have selected ${sInput} type bun which is not available. Please select White or Whole Wheat.`
          );
        }
        break;
      case OrderState.GARLIC_BREAD:
        this.stateCur = OrderState.BROWNIE;
        if (sInput.toLowerCase() == "yes") {
          this.sGarlicBread = sInput;
        }
        aReturn.push("Would you like to have our special brownie with that?");
        break;
      case OrderState.BROWNIE:
        this.stateCur = OrderState.FRIES;
        if (sInput.toLowerCase() == "yes") {
          this.sBrownie = sInput;
        }
        aReturn.push(
          "What would you like to have our special cheese periperi fries with that?"
        );
        break;
      case OrderState.FRIES:
        this.stateCur = OrderState.DRINKS;
        if (sInput.toLowerCase() == "yes") {
          this.sFries = sInput;
        }
        aReturn.push("What would you like to drink?");
        aReturn.push("Lemon juice");
        aReturn.push("Mango juice");
        aReturn.push("Coke");
        aReturn.push("Coffee");
        break;
      case OrderState.DRINKS: {
        if (
          sInput.toLowerCase() == "lemon juice" ||
          sInput.toLowerCase() == "mango juice" ||
          sInput.toLowerCase() == "coke" ||
          sInput.toLowerCase() == "coffee"
        ) {
          this.stateCur = OrderState.PAYMENT;
          this.sDrinks = sInput;
          this.nOrder = this.estimatedvalue().toFixed(1);
          aReturn.push("Thank you for your purchase. Your order is");
          aReturn.push(`${this.sSize} ${this.sItem} on ${this.sTypes} bun`);
          if (this.sGarlicBread) {
            aReturn.push(`with garlic bread`);
          } else {
            aReturn.push(`with no garlic bread`);
          }
          if (this.sFries) {
            aReturn.push(`with cheese periperi`);
          } else {
            aReturn.push(`with no cheese periperi`);
          }
          if (this.sBrownie) {
            aReturn.push(`with brownie`);
          } else {
            aReturn.push(`with no brownie`);
          }
          if (this.sDrinks) {
            aReturn.push(`with ${this.sDrinks}`);
          }
          let d = new Date();
          d.setMinutes(d.getMinutes() + 20);
          aReturn.push(`Total Amount is $ ${this.nOrder}`);
          aReturn.push(`Your order will be ready at ${d.toTimeString()}`);
          aReturn.push(`Please pay for your order here`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        } else {
          aReturn.push(
            `Sorry!! You have selected ${sInput} drink which is not available. Please select another.`
          );
        }
        break;
      }
      case OrderState.PAYMENT:
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(
          `Your order will be delivered at ${d.toTimeString()} at ${
            sInput.purchase_units[0].shipping.address.address_line_1
          } ${sInput.purchase_units[0].shipping.address.admin_area_2}
           ${sInput.purchase_units[0].shipping.address.admin_area_1}
           ${sInput.purchase_units[0].shipping.address.postal_code}
            ${sInput.purchase_units[0].shipping.address.country_code}
            address`
        );
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }

    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID =
      process.env.SB_CLIENT_ID ||
      "put your client id here for testing ... Make sure that you delete it before committing";
    return `
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `;
  }
};
