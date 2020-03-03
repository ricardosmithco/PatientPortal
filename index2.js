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
            let SubmitButtonId = "#Demographics_Submit";
            let editorCss = "demographics-editor";
            let modalElement = showModal("modal-lg", "PatientDemographics", "(Editor)", "fa fa-user-edit");
            modalElement.find(".modal-footer button").addClass(editorCss);
            modalElement.find(".modal-body").load("demographics.html", (responseText, textStatus, jqXHR) =>{  
                if(textStatus === "error"){
                        $(this).html(htmlError);
                        return;
                }
                //pageAccountDemographicsInitialize(onSave);

            });
            
        }catch (error){}
    }

    


    // ALL FUNCTIONS I HAVE TO REPLACE:
    
    // function goes in account/index.js
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

    //function goes in site.js
    function showModal(modalSize, modalTitle, modalSubTitle, modalIcon){
        const htmlLoading2 = "<h2 class='text-center text-secondary'><i class='fas fa-spinner fa-spin'></i> Loading...</h2>";
        try{
            let removalClasses = "modal-sm modal-md modal-lg".replace(modalSize, "");
            $("#Modal .modal-dialog").removeClass(removalClasses).addClass(modalSize);
            $("#Modal .modal-title").html(`<i class="${modalIcon}</i> ${modalTitle} <small>${modalSubTitle}</small>"`);
            $("#Modal .modal-body").html(htmlLoading2);
            $("#Modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>');
            $("#Modal").modal("show");
            return $("#Modal");

        } catch (error){
            console.log("error inside showModal()");
        }
    }

    //this is the initialize method that goes into pageAccountDemographics
    function pageAccountDemographicsInitialize(callback_onSaveSuccessful){
        try{
            $("#Demographics_PostalCode").inputmask({mask: "9999[-9999]", greedy: false});
            $("#Demographics_CellPhone").inputmask("(999) 999-999");
        } catch (error){}
    }

    function demographics(){
        try{
            $.ajax({
                type: "GET",
                url: "https://mobilea-patientportal.azurewebsites.net/Account/Demographics",
            });
        } catch(error){}
    }


})(pageAccountIndex || (pageAccountIndex={}));  
pageAccountIndex.initialize();  