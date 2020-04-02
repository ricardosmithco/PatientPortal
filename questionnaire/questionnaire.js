var hostUrl = "https://mobilea-patientportal-api.azurewebsites.net/api/";
var caseId = 230277;
var accessKey = "W9tkZiYMaosc4Daaw1JtpFSE/JPZHyNyaeARzmK6De9Div5qLwtxlA==";
var chartNumber = 840928234;
var viewModel;

function initialize() {
  try {
    $("#Loading").show();
    returnQuestionnaireData();
    $("#MedicalHistory select").change(function(){ 
        console.info("im in a selector");
        onQuestionChanged(this); 
    });
    
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

function onBindingComplete() {
  $("#Loading").hide();
  $("#MedicalHistory").show();

  /*Attach an .onChange() event to questions*/
  $("#MedicalHistory select").change(function () { onQuestionChanged(this); });
  $("#MedicalHistory textarea").change(function () { onQuestionChanged(this); });
  $("#MedicalHistory [type=text]").change(function () { onQuestionChanged(this); });
  $("#MedicalHistory [type=date]").change(function () { onQuestionChanged(this); });
  $("#MedicalHistory [type=number]").change(function () { onQuestionChanged(this); });

 /* $("#MedicalHistory [type=checkbox]").change(function (eventObject: JQueryEventObject): void { onQuestionChanged(this); });
  $("#MedicalHistory [type=radio]").change(function (eventObject: JQueryEventObject): void { onQuestionChanged(this); });
  $("#MedicalHistory [type=search]").change(function (eventObject: JQueryEventObject): void { onSearchSelected(this); });
  */
  /* Initialize jQuery.Mask plugin. */
  //$("#MedicalHistory [data-inputmask-mask]").inputmask();
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
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

function submitAnswer(questionId, questionValues) {
 
    let postData = {caseId: caseId, questionId: questionId, questionValues: questionValues };
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: `${hostUrl}Questionnaire`,
        contentType: "application/json",
        headers: {"x-functions-key": accessKey , "chart-number": chartNumber },
        data: JSON.stringify(postData),
        success: (result) => resolve(result),
        error: (error) => reject(error)
      });
    });
}


function onQuestionChanged (ctrl){
    
  /*extract values from my control and pass it to my promise*/
  console.info(ctrl);
  //console.info('onQuestionChange() Trigger');
  var questionValues = [$(ctrl).val()]; // HACK: Single values 
  var questionId = parseInt($(ctrl).attr("id").replace("Q",""), 10); //HACK: only works for Ids on elements
  //console.info(questionValues);
  //console.info(questionId);
  submitAnswer(questionId, questionValues);
}

function checkQuestionDependencies(allQuestions, data){
  if(data.dependencies().length === 0){
    return true;
  }
  
  for(let dependency of data.dependencies()){
    let dependencyQId = dependency.questionId();
    let dependencyQValue = dependency.questionValue();

    for(let question of allQuestions){
      if(question.questionId() === dependencyQId && question.questionValue() === dependencyQValue){
          return true;
      }
    }  
  }
  return false;
}


