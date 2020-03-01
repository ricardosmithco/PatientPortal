"use strict";
var pageAccountIndex;
(function (pageAccountIndex){
    var pageName = "/js/index2.js"
    var viewModel;
    // this method is executed onPageLoad() ?

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
            viewModel = ko.mapping.fromJS(profile);
            viewModel.onBindingComplete = onBindingComplete;

        } catch (error){
            ex.log(error, `${pageName}.initialize()`);
        }
    }
});

pageAccountIndex.initialize();

/**below method executes after KO binding has completed and before the DOM is rendered.
 * @return {void}
 */
function onBindingComplete(){
    $("#Loading").hide();
    $("PatientProfile").show()
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