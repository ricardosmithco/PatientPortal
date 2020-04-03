var hostUrl = "https://mobilea-patientportal-api.azurewebsites.net/api/";
var caseId = 228853;
var accessKey = "W9tkZiYMaosc4Daaw1JtpFSE/JPZHyNyaeARzmK6De9Div5qLwtxlA==";
var chartNumber = 862780682;
var viewModel;

function initialize() {
    try {
        /* First show Loading symbol while we make API call and do our bindings*/
        $("#Loading").show();
        returnQuestionnaireData();
    } catch (error) {
        console.log("error in questionnaire initialization");
    }
}

/* Below we invoke our initialize function*/
initialize();

/* Checks the messageType within json and styles the conditional text and icon */
function checkConditions(messageType) {
    if (messageType === 1) {
        return "fa fa-exclamation-triangle text-info";
    }
    if (messageType === 2) {
        return "fa fa-exclamation-triangle text-warning";
    }
    return "fa fa-exclamation-triangle text-danger";
}

/* Checks the messageType within json and styles the conditional message */
function checkAlert(messageType) {
    if (messageType === 1) {
        return "alert alert-info mt-3";
    }
    if (messageType === 2) {
        return "alert alert-warning mt-3";
    }
    return "alert alert-danger mt-3";
}

/*loop through dependencies and decide if questions should be shown,
here we are receiving all question, and an individual question*/
function checkQuestionDependencies(allQuestions, data) {
    if (data.dependencies().length === 0) {
        return true;
    }

    for (let dependency of data.dependencies()) {
        let dependencyQId = dependency.questionId();
        let dependencyQValue = dependency.questionValue();

        for (let question of allQuestions) {
            if (
                question.questionId() === dependencyQId &&
                question.questionValue() === dependencyQValue
            ) {
                return true;
            }
        }
    }
    return false;
}

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

/* This function executes after our Binding is complete*/
function onBindingComplete() {
    /* We hide loader and then show the Questionnaire*/
    $("#Loading").hide();
    $("#MedicalHistory").show();

    $("#MedicalHistory [data-toggle='tooltip']").tooltip();

    /*Attach an .onChange() event to questions*/
    $("#MedicalHistory select").change(function () {
        onQuestionChanged(this);
    });
    $("#MedicalHistory textarea").change(function () {
        onQuestionChanged(this);
    });
    $("#MedicalHistory [type=text]").change(function () {
        onQuestionChanged(this);
    });
    $("#MedicalHistory [type=date]").change(function () {
        onQuestionChanged(this);
    });
    $("#MedicalHistory [type=number]").change(function () {
        onQuestionChanged(this);
    });
    $("#MedicalHistory [type=checkbox]").change(function () {
        onQuestionChanged(this);
    });
    /* $("#MedicalHistory [type=radio]").change(function (eventObject: JQueryEventObject): void { onQuestionChanged(this); });
    $("#MedicalHistory [type=search]").change(function (eventObject: JQueryEventObject): void { onSearchSelected(this); });
    */
    /* Initialize jQuery.Mask plugin. */
    //$("#MedicalHistory [data-inputmask-mask]").inputmask();
}

/**
 * Triggered on when an answer is changed on the questionnaire.
 * @param {html} ctrl - HTML element that the change was triggered on.
 * @return {void}
 */
function onQuestionChanged(ctrl) {
    var questionId;
    var questionValues = [];

    let isCheckboxList = $(ctrl).attr("type") === "checkbox";
    let isRadioList = $(ctrl).attr("type") === "radio";
    let isSearchInput = $(ctrl).attr("type") === "search";

    if (isCheckboxList || isRadioList || isSearchInput) {
        // this is a multi answer question
        
        /* Identify the questionId*/
        /* STEP 3a: Extract the QuestionID from the "name" attribute. */
        let questionIdName = $(ctrl).attr("name");
        questionId = parseInt(questionIdName.replace("Q", ""), 10);

        /* STEP 3b: Iterate through all of the checkboxes where [name = QuestionId]. */
        $(`[name=${questionIdName}]`).each(function (index, element) {
            if ($(element).prop("checked")) {
                let questionValue = $(element).val();
                questionValues.push(questionValue);
            }
        });

    } else {
        // this is a single answer question

        /* Grab the Id attribute, remove the "Q", then parse from a string to an integer (base 10)*/
        questionId = parseInt($(ctrl).attr("id").replace("Q", ""), 10); //HACK: only works for Ids on elements

        /*extract values from my control and pass it to my promise*/
        questionValues.push($(ctrl).val());
    }

    /* Makes an api call, submitting the answer to the specific question*/
    submitAnswer(questionId, questionValues);
}

/* API call returns questionnaire json */
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

/* API call returns information about each question type */
function returnQuestionnaireData() {
    try {
        /* Promise waits for both API calls to execute and then return both results*/
        Promise.all([Questionnaire(), lookupQuestionType()]).then(result => {
            console.info(result[0]); // results of Questionnaire(), notice it is index based
            console.info(result[1]); // results of lookupQuestionType()

            /* result[0] is a plain Javascript Object; ko.mapping automatically creates observable properties
            for each property in result*/
            viewModel = ko.mapping.fromJS(result[0]);

            /* onBindingComplete is a function, this line injects that function into our viewModel variable*/
            viewModel.onBindingComplete = onBindingComplete;

            /* Activate knockout.js so we can use 'data-bind' in out DOM*/
            ko.applyBindings(viewModel);

            /* in HTML, the line data-bind="childrenComplete: onBindingComplete calls our
            onBindingComplete() function after all the binding is completed*/
        });
    } catch (error) {
        console.error("error in returnQuestionnaireData");
    }
}

/* Below two functions are responsible for the scroll bar */
window.onscroll = function () {
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

/* This makes API call to save the question and answer */
function submitAnswer(questionId, questionValues) {
    let postData = {
        caseId: caseId,
        questionId: questionId,
        questionValues: questionValues
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: `${hostUrl}Questionnaire`,
            contentType: "application/json",
            headers: { "x-functions-key": accessKey, "chart-number": chartNumber },
            data: JSON.stringify(postData), // converting Javascript objects into a JSON string.
            beforeSend: () => console.log("Question Save - " + JSON.stringify(postData)),
            success: result =>  resolve(result) ,
            error: error => reject(error)
        });
    });
}
