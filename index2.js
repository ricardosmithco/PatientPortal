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
    var environment = sessionStorage.getItem("environment");
    var patientName = sessionStorage.getItem("patientName");
    function initialize(){
        // forcing environment to dev below:
        $("body").addClass(environment);
        $("#mnuPatient").html(patientName);
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
                console.log(profile);
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
    function onKnockoutError(error){
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
            modalElement.find(".modal-header").html("Demographics");
            modalElement.find(".modal-footer button").addClass(editorCss);
            modalElement.find(".modal-body").load("demographics.html", (responseText, textStatus, jqXHR) =>{  
                if(textStatus === "error"){
                        $(this).html(htmlError);
                        return;
                }
                pageAccountDemographicsInitialize(onSave);
                // Inject an html button (Update/Save) in to the modal-footer it is used to trigger form submission
                let htmlButton = `<button type='button' id='btnModalSubmit' class='btn btn-primary${editorCss}' totle='Click to Save Changes'>Update</button>`
                modalElement.find(".modal-footer").append(htmlButton);
                $("#btnModalSubmit").click((event) =>{
                    event.preventDefault();
                    $("#btnFormSubmit").click();
                });

            });
            
        }catch (error){
            console.error("error in showDemographics @ index2.js file");
        }
    }

    


    // ALL FUNCTIONS I HAVE TO REPLACE:
    
    // function goes in account/index.js NO, it goes in profile.js instead
    function profile(caseId){        
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${hostUrl}Profile/${caseId}`,
                headers: { "x-functions-key": accessKey , "chart-number": chartNumber},
                contentType: "application/json; charset=utf-8",
                success: (result) =>{ resolve(result);},
                error: (error) => console.error("error on function profile")
            });
        });
    }

    //function goes in account/index.js
    function profileLookups(caseId){
        return new Promise( (resolve, reject) =>{
            $.ajax({
                type: "GET",
                url: `${hostUrl}Profile/${caseId}/Lookups`,
                headers: {"x-functions-key": accessKey, "chart-number": chartNumber},
                contentType: "application/json; charset=utf-8",
                success: (result) => resolve(result),
                error: (error) => reject(error)
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
            $("#Demographics_PostalCode").inputmask({mask: "99999[-9999]", greedy: false});
            $("#Demographics_CellPhone").inputmask("(999) 999-9999");
            $("#Demographics_HomePhone").inputmask("(999) 999-9999");
            $("#Demographics_WorkPhone").inputmask("(999) 999-9999");
            $("#Demographics_Form").validate({
                errorClass: "is-invalid",
                validClass: null,
                rules:{
                    Demographics_Address1: { required: true, minlength: 5},
                    Demographics_City: {required: true, minLength: 3},
                    Demographics_CellPhone: { required: true, phoneUS: true}
                },
                submitHandler: () =>{
                    event.preventDefault();
                    save();
                }
            }) 

            Promise.all([profile(caseId), profileLookups(caseId)]).then((results)=>{
                /* STEP 4a: Create a new ViewModel based on the Profile and ProfileLookups*/
                viewModel = ko.mapping.fromJS(results[0].demographics);
                viewModel.caseId = results[0].caseId;
                viewModel.chartNumber = results[0].chartNumber;
                viewModel.lookups = ko.mapping.fromJS(results[1]);
                viewModel.onBindingComplete = () => $("#Demographics_Gender").focus();
                /* STEP 4b: Apply KO Bindings to the ViewModel. */
                ko.applyBindings(viewModel, $("#Demographics_Form")[0]);
                /* STEP 5: Set focus to FirstName */
                $("#Demographics_Gender").focus();
            });

        } catch (error){}
    }

    function save(){
        try{
            /*first let's validate the form*/
            let isValid = $("#Demographics_Form").validate().valid();
            if(!isValid){
                return;
            }
            /*Disable the editor*/
            enableDisableEditor(false);
            /* STEP 1a: Convert the KO ViewModel into JSON  */
            let postData = JSON.parse(ko.toJSON(viewModel));
            /* STEP 1b: Remove unneeded properties (arrays) */
            delete postData.lookups;
            /*show unimposing Successage Message*/
            toaster.success("Update Successful");
            /*Dismiss the modal dialog*/
            $("#Modal").modal("hide");
        }catch (error){
            console.error("error in save() method");
        }
    }




})(pageAccountIndex || (pageAccountIndex={}));  
pageAccountIndex.initialize();  