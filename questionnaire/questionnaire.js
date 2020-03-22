var hostUrl = "https://mobilea-patientportal-api.azurewebsites.net/api/";
var caseId = 225902;
var accessKey = "W9tkZiYMaosc4Daaw1JtpFSE/JPZHyNyaeARzmK6De9Div5qLwtxlA==";
var chartNumber = 924127331;
var viewModel;

function initialize() {
  try {
    $("#Loading").show();
    returnQuestionnaireData();
  } catch (error) {
    console.log("error in questionnaire initialization");
  }
}

initialize();

function lookupQuestionType() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: `${hostUrl}Lookup/QuestionType`,
      contentType: "application/json",
      success: result => resolve(result),
      error: error => reject(error)
    });
  });
}

function onBindingComplete(){
    $("#Loading").hide();
    $("#Q77").inputmask("9.9");
    $("#MedicalHistory").show();
}

function Questionnaire() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: `${hostUrl}Questionnaire/${caseId}`,
      headers: { "x-functions-key": accessKey, "chart-number": chartNumber },
      contentType: "application/json",
      success: result => resolve(result),
      error: error => reject(error)
    });
  });
}

function returnQuestionnaireData() {
    try {
      Promise.all([Questionnaire(), lookupQuestionType()]).then(result => {
        console.info(result[0]);
        console.info(result[1]);
        viewModel = ko.mapping.fromJS(result[0]);
        viewModel.onBindingComplete = onBindingComplete;
        ko.applyBindings(viewModel);
      });
    } catch (error) {
      console.error("error in returnQuestionnaireData");
    }
  }

// When the user scrolls the page, execute myFunction 
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

function submitAnswer(){
    try{
        return new Promise ((resolve, reject) =>{

        })

    } catch (error){}
}
