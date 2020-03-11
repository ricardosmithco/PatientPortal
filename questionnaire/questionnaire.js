var hostUrl = "https://mobilea-patientportal-api-dev.azurewebsites.net/api/";
var caseId = 222571; 
var accessKey = "A2H/Qa2n70XZtta7zFYpq4P6UtbAWISn8upCMqVPOxBWHyx51Xkylw==";
var chartNumber = 850628090;

function initialize(){
    try{
        returnQuestionnaireData();

    }catch(error){
        console.log("error in questionnaire initialization");
    }
}

initialize();

function returnQuestionnaireData(){
    try{
        Promise.all([Questionnaire(), lookupQuestionType()]).then((result)=>{
            console.info(result[0]);
            console.info(result[1]);
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