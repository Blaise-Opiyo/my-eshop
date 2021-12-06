
$(document).ready(() =>{
    const formContainer = $('.createItem-form-container');
    const hidebtn = $('.createItem-form-container .createproduct-prompt .createform-cancel-btn');
    const createlink = $('.nav-bar ul .create-link');
    // const sideNavCreate = $('.side-nav .side-nav-create');
    const createOverlay = $('.sidenav-overlay');
    const body = $('body');
    
    const showCreateItemForm = () =>{
        formContainer.show();
        createOverlay.show();
    }
    const hideCreateItemForm = () =>{
        formContainer.hide();
        createOverlay.hide();
    }
    createlink.click(() =>{
        showCreateItemForm();
        body.css({"max-width": "100%",
                "max-width": "100%",
                 "overflow": "hidden"});
    });
    hidebtn.click(() =>{
        hideCreateItemForm();
        body.removeAttr("style");
    });
});