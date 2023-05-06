//A Vanilla JS mini library that tries to intelligently guess a URL from a given company name

//Wrap everything into a main function, so we can run everything with one function call
function companyNameToUrl (companyName){
    guessURL(companyName);
    scoreURL();
};

//Build list of common website prefixes and suffixes for trimming and potential URL generation
//to do: finish filling in the arrays with more options
const prefixes = ["http://", "https://", "www.", "http://www.", "https://www."];
const suffixes = [".com", ".net", ".org", ".co", ".us", ".io"];

//Build list of common characters that will need to be removed to find base name
const toRemove = [",", ".", "&", "-", "LLC", "Inc", "Company", "company", "Corporation",
"corporation", "Corp", "corp", "Enterprises", "enterprises"];
//Build list of common characters that can be added to base name
const toAdd = ["and", "-and-", "-", "LLC", "Inc", "Company", "company", "Corporation",
"corporation", "Corp", "corp", "Enterprises", "enterprises"];

//Set up empty arrays to be filled with info later
const companyBasicName = [];
const potentialURL = [];
const scores = [];

//Generate potential URLs from company name
//to do: create list of standard abbreviations, eg 'mgmt' for 'management', and do replacements
function guessURL (companyName){
    //First, cut companyName down to a more basic form
    var tempNameHolder = [];
    tempNameHolder.push(companyName);
    for (let i=0; i<toRemove.length; i++){
        var tempName = tempNameHolder[i];
        var replacementText = toRemove[i];
        var replacedCompanyName = tempName.replaceAll(replacementText, "");
        tempNameHolder.push(replacedCompanyName);
    };
    var likelyBasicName = tempNameHolder.pop();
    var trimmed = likelyBasicName.trim();
    companyBasicName.push(trimmed);
    for (let j=0; j<toAdd.length; j++) {
        var pieceToAdd = toAdd[j];
        var noSpace = trimmed.replaceAll(" ", pieceToAdd);
        companyBasicName.push(noSpace);
        var newEnding = trimmed.concat(pieceToAdd);
        companyBasicName.push(newEnding);
    };
    //Second, add website prefixes and suffixes to basic form of name
    for (let k=0; k<companyBasicName.length; k++){
        var basicName = companyBasicName[k];
        for (let l=0; l<prefixes.length; l++){
            for (let m=0; m<suffixes.length; m++){
                var prefix = prefixes[l];
                var suffix = suffixes[m];
                var firstPart = prefix.concat(basicName);
                var finishedURL = firstPart.concat(suffix);
                potentialURL.push(finishedURL);
            };
        };
    };
    //finally, delete any malformed URLs using 'while' due to changing array lengths
    var n = potentialURL.length;
    while (n--)
        {
            var maybeSpaces = potentialURL[n];
            if (maybeSpaces.includes(" "))
                {
                    potentialURL.splice(n, 1);
                };
        };
};

//Fetch website text from potential URLs and score likelihood of match
//to do: convert for Gsheet use by using UrlFetchApp
async function scoreURL(){
    for (i=0; i<potentialURL.length; i++){
        var URL = potentialURL[i];
        try {
            const response = await fetch(URL);
            const urlText = await response.text();
            if (response.status===200){
                for (j=0; j<companyBasicName.length; j++){
                    var regStem = "/";
                    var regEnding = "/g";
                    var regMid = companyBasicName[j];
                    var firstPartOfReg = regStem.concat(regMid);
                    var finalReg = firstPartOfReg.concat(regEnding);
                    let score = urlText.match(finalReg).length;
                    if (score == null){
                        scores.push(0);
                    }
                    else {
                        scores.push(score);
                    };
                };
            }
            else {
                scores.push(0);
            };
        }
        catch(error){
            scores.push(0);
        };
    };
    var highestScore = Math.max(...scores);
    var highestScoreIndex = scores.indexOf(highestScore);
    return potentialURL[highestScoreIndex];
};
