const git = require("git-rev-sync");
const fs = require('fs')

// https://usefulangle.com/post/187/nodejs-get-date-time
const date_ob = git.date();

// current date
// adjust 0 before single digit date
const date = ("0" + date_ob.getDate()).slice(-2);

// current month
const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
const year = date_ob.getFullYear();

// current hours
const hours = ("0" + date_ob.getHours()).slice(-2);

// current minutes
const minutes = ("0" + date_ob.getMinutes()).slice(-2);

// current seconds
const seconds = ("0" + date_ob.getSeconds()).slice(-2);;

// prints date & time in YYYY-MM-DD HH:MM:SS format
const formattedDate = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

const version = `${git.branch()} ${git.short()} ${formattedDate}`;

console.log(version);

fs.writeFile('./projects/pwa/public/version.txt', version, (err: any) => {
  if (err) {
    console.error(err)
    return
  }
  //file written successfully
});
