var hostUrl = sessionStorage.getItem("hostUrl");
var caseId = sessionStorage.getItem("caseId");
var accessKey = sessionStorage.getItem("accessKey");
var chartNumber = sessionStorage.getItem("chartNumber");
var patientName = sessionStorage.getItem("patientName");

function onInitialization(){
    $("#mnuPatient").html(patientName);
    $("#SiteNavigation").show();
    var environment = sessionStorage.getItem("environment");
    // forcing environment to dev below:
    $("body").addClass("MobileA_Dev");
    $.ajax({
            url: hostUrl+"CaseInformation/"+caseId,
            async: false,
            headers:{"x-functions-key" : accessKey, "chart-number": chartNumber},
            crossOrigin: true,
            success: function (result) {
                console.info(result);
                ko.applyBindings(result);
            },
            error: () => console.error("CaseInformation failed"),
            complete: () => $("#Loading").hide()
    });
}

onInitialization();

function signOut(){
    sessionStorage.clear();
    window.location.href="/Expired";
}