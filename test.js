process.env.TEST = "SOMETHING";
const woo = "weird";
console.log("export MY_ENV=example-value");
console.log(`export MY_ENV=${woo}`);
