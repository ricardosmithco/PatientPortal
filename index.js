var hostUrl = "https://mobilea-patientportal-api.azurewebsites.net/api/";
var caseId = 228853; 

function getPatientName(accessKey, caseId, chartNumber, callback){
    $.ajax({
        type: "GET",
        url: hostUrl + "Profile/" + caseId + "/Name",
        headers: {"x-functions-key": accessKey , "chart-number": chartNumber},
        contentType: "application/json",
        success: function(result){
            sessionStorage.setItem("patientName", result.patientName);
            callback(result.patientName);
        },
        error: function(result){
            console.error("Failed to get the patient name");
        }
    });
}

function initialize(){
    isPreOp();
    setEnvironment();

    $("#DOB").datepicker({clearBtn: true, autoclose: true});
    $("#DOB").inputmask("99/99/9999");
    $("#mybutton").click(validateForm);    
} 

function isAuthorized (lastName, dob, callback){    
    var formattedDate = dob.format("YYYY-MM-DD");
    var formData = {"lastName": lastName, "dob": formattedDate};
    
    $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(formData),
        url: hostUrl + "CaseAuthorization/" + caseId,
        success: function (result){
            sessionStorage.setItem("accessKey", result.accessKey);
            sessionStorage.setItem("caseId", result.caseId);
            sessionStorage.setItem("hostUrl", hostUrl);
            sessionStorage.setItem("chartNumber", JSON.stringify(result.chartNumber));
            getPatientName(result.accessKey, result.caseId, result.chartNumber, function(patientName){
                callback(true);
            });
        },
        error: () => callback(false)
    });
}

function isPreOp(){
    $.ajax({
        type: "GET",
        url: hostUrl + "CaseIsPreOp/" +caseId,
        success: (result) => {
            $("#UserAuthorized").show();
            $("#LastName").focus();
        },
        error: (result) => $("#Expired").show(),
        complete: () => $("#Loading").hide()
    });
}

function setEnvironment(callback){
    try {
        $.ajax({
            type: 'GET',
            url: hostUrl+"Environment",
            contentType: "application/json; charset=utf-8",
            success: function(result){
                sessionStorage.setItem("environment", result);
                // setting the environment 
                $("body").addClass(result);
                // If a callback function was provided then use it.
                if(typeof callback === "function"){
                    callback(result);
                }
            }
        });
    } catch (error) {
        if (typeof callback === "function"){
            callback(null);
        }
    }
}

function validateForm(){
    console.info("inside validateForm method");
    //https://jqueryvalidation.org/documentation/
    
    try {

        $("#AccessDenied").hide();
        $("#UserAuthorized").validate({
        errorClass: "is-invalid",
        validClass: null,
        rules: {
            LastName: { required: true, minlength: 2},
            DOB: { required: true, date: true}
        },
        submitHandler: function(form){
            console.info("inside submit handler");
            // Validation Successful
            // STEP 1: Disable the Authorization form and display Loading .... message to user.
            $(".authorization").prop("disabled", true);
            $(".authorization").addClass("disabled");
            $("#Loading").show();

            // STEP 2: Extract the Patient's LastName and DOB from the form
            console.info("about to extract form info");
            var lastName = $("#LastName").val();
            var dob = moment($("#DOB").val());
            console.info("lastname is: "+lastName + " and dob is: " +DOB);

            // STEP 3: Check to see if this Case/LastName/DOB from the form
            isAuthorized(lastName, dob, function(authorized){
                $("#Loading").hide();
                if(authorized){
                    window.location.href = "patient.html";
                    return;
                }else{
                    $(".authorization").prop("disabled", false);
                    $(".authorization").removeClass("disabled");
                    $("#AccessDenied").show();
                }
            });
        }
    });
        
    } catch (error) {
        console.error(error + " in validate form");
    }

}

initialize();
