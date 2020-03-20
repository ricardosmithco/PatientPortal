var hostUrl = "https://mobilea-patientportal-api.azurewebsites.net/api/";
var caseId = 225902; 
var accessKey = "W9tkZiYMaosc4Daaw1JtpFSE/JPZHyNyaeARzmK6De9Div5qLwtxlA==";
var chartNumber = 924127331;
var viewModel;

function initialize(){
    
    try{
        returnQuestionnaireData();
    }catch(error){
        console.log("error in questionnaire initialization");
    }
}

initialize();

// When the user scrolls the page, execute myFunction 
window.onscroll = function() {myFunction()};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

function returnQuestionnaireData(){
    try{
        Promise.all([Questionnaire(), lookupQuestionType()]).then((result)=>{
            console.info(result[0]);
            console.info(result[1]);
            //viewModel = ko.mapping.fromJSON(result[0]);
           ko.applyBindings(result);
        });

    }catch(error){
        console.error("error in returnQuestionnaireData");
    }
}

function lookupQuestionType(){
    return new Promise((resolve, reject)=>{
        $.ajax({
            type: "GET",
            url: `${hostUrl}Lookup/QuestionType`,
            contentType: "application/json",
            success: (result) => resolve(result),
            error: (error) => reject(error)
        });
    });
}

 function Questionnaire(){
     return new Promise((resolve, reject) =>{
         $.ajax({
             type: "GET",
             url: `${hostUrl}Questionnaire/${caseId}`,
             headers:{"x-functions-key" : accessKey, "chart-number": chartNumber},
             contentType: "application/json",
             success: (result) => resolve(result),
             error: (error) => reject(error)
         });
     });
 }