"use strict";
var pageAccountIndex;
(function (pageAccountIndex){
    var pageName = "index2.js"
    var viewModel;
    // this method is executed onPageLoad() ?
    var hostUrl = sessionStorage.getItem("hostUrl");
    var accessKey = sessionStorage.getItem("accessKey");
    var chartNumber = sessionStorage.getItem("chartNumber");
    var caseId = sessionStorage.getItem("caseId");
    function initialize(){
        try{
            /* STEP 1. Bind the edit buttons and links: */
            $("#lnkEditDemographics").click((event) =>{
                event.preventDefault();
                showDemographics();
            });

            $("#lnkEditPrimaryInsurance").click((event)=>{
                event.preventDefault();
                showInsurance(true);
            });

            $("#lnkEditSecondaryInsurance").click((event)=>{
                event.preventDefault();
                showInsurance(false);
            });

            /* STEP 2. Set the modal to clear injected HTML onClose/Hide */
            $("#Modal").on("hidden.bs.modal", ()=>$("#Modal .modal-body").empty());

            /* STEP 3. Get the Patient's Profile */
            profile(caseId)
            .then((profile) => {
                console.log("profile is: "+profile);
                /* STEP 4a: Create a new ViewModel based on the Profile.*/
                viewModel = ko.mapping.fromJS(profile);
                viewModel.onBindingComplete = onBindingComplete;
                /* Step 4b: Initialize Knockout and Bind the CaseInformation. */
                ko.applyBindings(viewModel, $("#PatientProfile")[0]);
                ko.onError = onKnockoutError;
            })
            
        } catch (error){
            ex.log(error, `${pageName}.initialize()`);
        }
    }


    pageAccountIndex.initialize = initialize;

    /**below method executes after KO binding has completed and before the DOM is rendered.
     * @return {void}
     */
    function onBindingComplete(){
        $("#Loading").hide();
        $("#PatientProfile").show()
    }

    /**
     * @param error
     * @return void
     */
    function onError(error){
        console.error("Knockout Error: ", error);
    }

    /**
     * This method is Trigger on a successful Profile save (by both demographic & insurance)
     * @param {IProfile} profile - The updated patient Profile JavaScirpt object.
     * @return void
     */
    function onSave(profile){
        ko.mapping.fromJS(profile, viewModel);
    }

    /** Display a Bootstrap Modal Dialog and inject the HTML needed to edit a Patient's demographics
     * @return {void}
     */

    function showDemographics(){
        try{

            
        }catch (error){}
    }

    


    // ALL FUNCTIONS I HAVE TO REPLACE:

    function profile(caseId){        
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${hostUrl}Profile/${caseId}`,
                headers: { "x-functions-key": accessKey , "chart-number": chartNumber},
                contentType: "application/json; charset=utf-8",
                success: (result) =>{ resolve(result); console.log(result);},
                error: (error) => console.error("error on function profile")
            });
        });
    }
})(pageAccountIndex || (pageAccountIndex={}));  
pageAccountIndex.initialize();  